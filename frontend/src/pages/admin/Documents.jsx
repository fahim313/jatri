import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, Trash2 } from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  getDocuments,
  uploadDocument,
  reviewDocument,
  deleteDocument,
} from "../../services/documentService";
import {
  PROCESSING_KEYS,
  formatDateTime,
  formatFileSize,
  readDocument,
} from "../../utils/document";
import { readApiError } from "../../utils/apiError";

const ALLOWED_EXTENSIONS = ["pdf"];
const MAX_FILE_MB = 20;

const toneClasses = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-300",
  neutral: "border-white/15 bg-white/5 text-zinc-300",
};

const actionText = {
  approve: {
    title: "Approve this document?",
    confirm: "Approve",
    danger: false,
    message:
      "Jatri AI will start answering questions from it. Approve it only after you have read it and are sure the content is correct.",
    done: "was approved.",
  },
  reject: {
    title: "Reject this document?",
    confirm: "Reject",
    danger: false,
    message:
      "Jatri AI will not use it. If it was approved before, AI will stop answering from it.",
    done: "was rejected.",
  },
  delete: {
    title: "Delete this document?",
    confirm: "Delete",
    danger: true,
    message:
      "It will be permanently deleted. If it was approved, AI will stop answering from it.",
    done: "was deleted.",
  },
};

async function fetchDocuments() {
  const response = await getDocuments();

  if (!Array.isArray(response)) {
    throw new Error("Invalid documents response");
  }

  return response;
}

function fileExtension(name) {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function Documents() {
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState({ key: null, raw: [], error: "" });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  const [confirm, setConfirm] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);

  const loading = data.key !== reloadKey;
  const { raw, error } = data;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await fetchDocuments();

        if (!ignore) {
          setData({ key: reloadKey, raw: result, error: "" });
        }
      } catch (err) {
        console.error("Failed to load documents:", err);

        if (!ignore) {
          setData({
            key: reloadKey,
            raw: [],
            error: readApiError(
              err,
              "Unable to load documents. Please try again."
            ),
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const documents = useMemo(() => raw.map(readDocument), [raw]);

  const hasProcessing = documents.some((d) =>
    PROCESSING_KEYS.includes(d.status.key)
  );

  useEffect(() => {
    if (!hasProcessing) return undefined;

    const timer = setInterval(async () => {
      try {
        const fresh = await fetchDocuments();
        setData((prev) => ({ ...prev, raw: fresh }));
      } catch {
        // Ignore temporary polling errors.
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [hasProcessing]);

  const counts = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((d) => d.status.key === "pending").length,
      approved: documents.filter((d) => d.status.key === "approved").length,
      rejected: documents.filter((d) => d.status.key === "rejected").length,
    }),
    [documents]
  );

  const statusOptions = useMemo(() => {
    const seen = new Map();
    documents.forEach((d) => seen.set(d.status.key, d.status.label));
    return [...seen.entries()];
  }, [documents]);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    return documents.filter((doc) => {
      const matchesText =
        !text ||
        doc.title.toLowerCase().includes(text) ||
        doc.fileName.toLowerCase().includes(text);

      const matchesStatus = !status || doc.status.key === status;

      return matchesText && matchesStatus;
    });
  }, [documents, search, status]);

  const hasFilters = Boolean(search.trim() || status);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");

    if (!file) {
      setUploadError("Choose a file to upload.");
      return;
    }

    if (!title.trim()) {
      setUploadError("Enter a document title.");
      return;
    }

    if (title.trim().length > 255) {
      setUploadError("Title cannot exceed 255 characters.");
      return;
    }

    if (!sourceType.trim()) {
      setUploadError("Enter the source type.");
      return;
    }

    if (sourceType.trim().length > 100) {
      setUploadError("Source type cannot exceed 100 characters.");
      return;
    }

    if (!ALLOWED_EXTENSIONS.includes(fileExtension(file.name))) {
      setUploadError(
        `This file type is not supported. Use ${ALLOWED_EXTENSIONS.join(", ")}.`
      );
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`The file is larger than ${MAX_FILE_MB} MB.`);
      return;
    }

    if (sourceUrl.trim().length > 500) {
      setUploadError("Source URL cannot exceed 500 characters.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setNotice(null);

    try {
      await uploadDocument(
        {
          file,
          title,
          sourceType,
          description,
          sourceUrl,
        },
        setProgress
      );
    } catch (err) {
      console.error("Failed to upload document:", err);

      setUploadError(
        readApiError(err, "Upload failed. Please try again.")
      );

      setUploading(false);
      return;
    }

    setFile(null);
    setTitle("");
    setSourceType("");
    setDescription("");
    setSourceUrl("");
    setFileInputKey((k) => k + 1);

    setNotice({
      type: "success",
      text: `“${file.name}” was uploaded. Review it before AI can use it.`,
    });

    try {
      const fresh = await fetchDocuments();
      setData((prev) => ({ ...prev, raw: fresh }));
    } catch {
      setReloadKey((k) => k + 1);
    }

    setUploading(false);
  };

  const runAction = async () => {
    if (!confirm) return;

    const { doc, action } = confirm;

    setConfirm(null);
    setBusyId(doc.id);
    setNotice(null);

    try {
      if (action === "approve") await reviewDocument(doc.id, "approved");
      if (action === "reject") await reviewDocument(doc.id, "rejected");
      if (action === "delete") await deleteDocument(doc.id);

      const fresh = await fetchDocuments();
      setData((prev) => ({ ...prev, raw: fresh }));

      setNotice({
        type: "success",
        text: `“${doc.title}” ${actionText[action].done}`,
      });
    } catch (err) {
      console.error(`Failed to ${action} document:`, err);

      setNotice({
        type: "error",
        text: readApiError(err, `Unable to ${action} this document.`),
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-zinc-500">ADMINISTRATION</p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          Document Management
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Jatri AI answers only from approved documents. Upload a document,
          read it, then approve it.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total documents"
          value={counts.total}
          loading={loading}
        />

        <StatCard
          title="Pending review"
          value={counts.pending}
          description="Not used by AI yet"
          loading={loading}
        />

        <StatCard
          title="Approved"
          value={counts.approved}
          description="Used by AI"
          loading={loading}
        />

        <StatCard
          title="Rejected"
          value={counts.rejected}
          loading={loading}
        />
      </section>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <span>{notice.text}</span>

          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 text-xs font-medium underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
          Upload a document
        </h2>

        <form onSubmit={handleUpload} className="space-y-4 p-6">
          {uploadError && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {uploadError}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="document-file"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                File *
              </label>

              <input
                key={fileInputKey}
                id="document-file"
                type="file"
                accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                onChange={handleFileChange}
                disabled={uploading}
                required
                className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-white/15 disabled:opacity-50"
              />

              <p className="mt-1.5 text-xs text-zinc-500">
                {ALLOWED_EXTENSIONS.join(", ").toUpperCase()}. Up to{" "}
                {MAX_FILE_MB} MB.
              </p>
            </div>

            <div>
              <label
                htmlFor="document-title"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Title *
              </label>

              <input
                id="document-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                disabled={uploading}
                required
                placeholder="e.g. Overseas Employment Act summary"
                className="w-full rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="document-source-type"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Source Type *
              </label>

              <input
                id="document-source-type"
                type="text"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                maxLength={100}
                disabled={uploading}
                required
                placeholder="e.g. Government Guideline"
                className="w-full rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="document-source-url"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Source URL
              </label>

              <input
                id="document-source-url"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                maxLength={500}
                disabled={uploading}
                placeholder="https://example.com"
                className="w-full rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40 disabled:opacity-50"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="document-description"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Description
              </label>

              <textarea
                id="document-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
                placeholder="Briefly describe what this document contains..."
                className="w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40 disabled:opacity-50"
              />
            </div>
          </div>

          {uploading && (
            <div>
              <div className="h-1.5 overflow-hidden rounded bg-white/10">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-zinc-400">
                {progress < 100
                  ? `Uploading… ${progress}%`
                  : "Upload finished. Processing the document…"}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !file}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-md border border-white/10 bg-zinc-900 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or file name"
              aria-label="Search documents"
              className="w-full rounded-md border border-white/10 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">All statuses</option>

            {statusOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-medium text-white">All documents</h2>

          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                Clear filters
              </button>
            )}

            <span>
              {loading
                ? "Loading…"
                : `Showing ${filtered.length} of ${documents.length}`}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            Loading documents…
          </p>
        ) : error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-red-400">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 text-sm text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            {documents.length === 0
              ? "No documents yet. Upload the first one above."
              : "No documents match these filters."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-205 text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Document</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Uploaded</th>
                  <th className="px-5 py-3.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filtered.map((doc) => {
                  const key = doc.status.key;
                  const busy = busyId === doc.id;

                  const canApprove =
                    key !== "approved" && !PROCESSING_KEYS.includes(key);

                  const canReject =
                    key !== "rejected" && !PROCESSING_KEYS.includes(key);

                  const meta = [doc.fileName, formatFileSize(doc.size)]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <tr
                      key={doc.id}
                      className="transition hover:bg-white/2"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{doc.title}</p>

                        {meta && (
                          <p className="mt-1 text-xs text-zinc-500">{meta}</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium ${
                            toneClasses[doc.status.tone]
                          }`}
                        >
                          {doc.status.label}
                        </span>

                        {doc.reviewedAt && (
                          <p className="mt-1.5 text-xs text-zinc-500">
                            Reviewed {formatDateTime(doc.reviewedAt)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {formatDateTime(doc.uploadedAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {canApprove && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ doc, action: "approve" })
                              }
                              className="rounded px-2 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}

                          {canReject && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ doc, action: "reject" })
                              }
                              className="rounded px-2 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({ doc, action: "delete" })
                            }
                            aria-label="Delete document"
                            title="Delete document"
                            className="rounded p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirm && (
        <ConfirmDialog
          title={actionText[confirm.action].title}
          confirmLabel={actionText[confirm.action].confirm}
          danger={actionText[confirm.action].danger}
          onConfirm={runAction}
          onCancel={() => setConfirm(null)}
        >
          <p>
            <span className="font-medium text-zinc-200">
              {confirm.doc.title}
            </span>
          </p>

          <p className="mt-2">{actionText[confirm.action].message}</p>
        </ConfirmDialog>
      )}
    </div>
  );
}

export default Documents;