import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import {
  getAdminJobs,
  deleteJob,
  publishJob,
  unpublishJob,
  expireJob,
} from "../../services/jobService";

const statusStyles = {
  Published: "text-emerald-300",
  Draft: "text-zinc-300",
  Expired: "text-red-300",
  Unpublished: "text-amber-300",
};

const actionText = {
  publish: { verb: "Publish", message: "will become visible to the public." },
  unpublish: { verb: "Unpublish", message: "will be hidden from the public." },
  expire: { verb: "Expire", message: "will be marked as expired." },
  delete: { verb: "Delete", message: "will be permanently deleted." },
};

const actionRequests = {
  publish: publishJob,
  unpublish: unpublishJob,
  expire: expireJob,
  delete: deleteJob,
};

async function fetchJobs() {
  const response = await getAdminJobs();

  if (!Array.isArray(response)) {
    throw new Error("Invalid jobs response");
  }

  return response;
}

function toDate(value) {
  if (!value) return null;

  
  const text = String(value);
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Not set";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isPast(value) {
  const date = toDate(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date < today;
}

function Jobs() {
  const location = useLocation();
  const navigate = useNavigate();

  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState({ key: null, jobs: [], error: "" });

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");

  const [confirm, setConfirm] = useState(null); // { job, action }
  const [busyId, setBusyId] = useState(null);

  
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  const loading = data.key !== reloadKey;
  const { jobs, error } = data;

  
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await fetchJobs();

        if (!ignore) {
          setData({ key: reloadKey, jobs: result, error: "" });
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);

        if (!ignore) {
          setData({
            key: reloadKey,
            jobs: [],
            error: "Unable to load jobs. Please try again.",
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const countries = useMemo(
    () => [...new Set(jobs.map((j) => j.country).filter(Boolean))].sort(),
    [jobs]
  );

  const counts = useMemo(
    () => ({
      published: jobs.filter((j) => j.status === "Published").length,
      draft: jobs.filter((j) => j.status === "Draft").length,
      expired: jobs.filter((j) => j.status === "Expired").length,
    }),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const text = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesText =
        !text || String(job.job_title || "").toLowerCase().includes(text);
      const matchesCountry = !country || job.country === country;
      const matchesStatus = !status || job.status === status;

      return matchesText && matchesCountry && matchesStatus;
    });
  }, [jobs, search, country, status]);

  const hasFilters = Boolean(search.trim() || country || status);

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setStatus("");
  };

  const runAction = async () => {
    if (!confirm) return;

    const { job, action } = confirm;

    setBusyId(job.id);
    setConfirm(null);
    setNotice(null);

    try {
      await actionRequests[action](job.id);

      const fresh = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: fresh }));

      setNotice({
        type: "success",
        text: `“${job.job_title}” — ${actionText[action].verb.toLowerCase()} done.`,
      });
    } catch (err) {
      console.error(`Failed to ${action} job:`, err);

      const detail = err.response?.data?.detail;

      setNotice({
        type: "error",
        text:
          typeof detail === "string"
            ? detail
            : `Unable to ${action} this job. Please try again.`,
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-zinc-500">ADMINISTRATION</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Job Management
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create and manage overseas job listings.
          </p>
        </div>

        <Link
          to="/admin/jobs/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus size={17} />
          Add new job
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total jobs" value={jobs.length} loading={loading} />
        <StatCard title="Published" value={counts.published} loading={loading} />
        <StatCard title="Drafts" value={counts.draft} loading={loading} />
        <StatCard title="Expired" value={counts.expired} loading={loading} />
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

      <section className="rounded-md border border-white/10 bg-zinc-900 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title"
              aria-label="Search job title"
              className="w-full rounded-md border border-white/10 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by country"
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">All countries</option>
            {countries.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            <option value="">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Unpublished">Unpublished</option>
            <option value="Expired">Expired</option>
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
          <h2 className="font-medium text-white">All jobs</h2>

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
                : `Showing ${filteredJobs.length} of ${jobs.length}`}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            Loading jobs…
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
        ) : filteredJobs.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            {jobs.length === 0
              ? "No jobs yet. Add the first one."
              : "No jobs match these filters."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Job</th>
                  <th className="px-5 py-3.5 font-medium">Salary</th>
                  <th className="px-5 py-3.5 font-medium">Vacancies</th>
                  <th className="px-5 py-3.5 font-medium">Deadline</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredJobs.map((job) => {
                  const busy = busyId === job.id;
                  const canPublish =
                    job.status === "Draft" || job.status === "Unpublished";
                  const deadlinePassed =
                    job.status === "Published" &&
                    isPast(job.application_deadline);

                  return (
                    <tr key={job.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {job.job_title}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                          <MapPin size={13} />
                          {job.country || "No country"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {job.salary || "Not set"}
                      </td>

                      <td className="px-5 py-4 text-zinc-300">
                        {job.vacancies ?? "Not set"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-zinc-300">
                          {formatDate(job.application_deadline)}
                        </p>
                        {deadlinePassed && (
                          <p className="mt-1 text-xs text-amber-400">
                            Deadline passed
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block text-xs font-medium ${
                            statusStyles[job.status] || "text-zinc-300"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {job.status === "Published" && (
                            <Link
                              to={`/jobs/${job.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="View on website"
                              title="View on website"
                              className="rounded p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}

                          <Link
                            to={`/admin/jobs/${job.id}/edit`}
                            aria-label="Edit job"
                            title="Edit job"
                            className="rounded p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={16} />
                          </Link>

                          {canPublish && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ job, action: "publish" })
                              }
                              className="rounded px-2 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50"
                            >
                              Publish
                            </button>
                          )}

                          {job.status === "Published" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ job, action: "unpublish" })
                              }
                              className="rounded px-2 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                          )}

                          {job.status !== "Expired" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ job, action: "expire" })
                              }
                              className="rounded px-2 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                            >
                              Expire
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({ job, action: "delete" })
                            }
                            aria-label="Delete job"
                            title="Delete job"
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
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-5"
          onClick={() => setConfirm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-md border border-white/10 bg-zinc-900 p-6"
          >
            <h2 id="confirm-title" className="font-semibold text-white">
              {actionText[confirm.action].verb} this job?
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              <span className="font-medium text-zinc-200">
                {confirm.job.job_title}
              </span>{" "}
              {actionText[confirm.action].message}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={runAction}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  confirm.action === "delete"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white text-zinc-950 hover:bg-zinc-200"
                }`}
              >
                {actionText[confirm.action].verb}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;