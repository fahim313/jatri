import { parseDate } from "./agency";

const STATUS_MAP = {
  pending: { label: "Pending review", tone: "warning" },
  processing: { label: "Processing", tone: "neutral" },
  indexing: { label: "Indexing", tone: "neutral" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  failed: { label: "Failed", tone: "danger" },
};

export const PROCESSING_KEYS = ["processing", "indexing"];

export function getDocumentStatus(doc) {
  let raw = doc.status ?? doc.review_status;

 
  if (raw == null && typeof doc.is_approved === "boolean") {
    raw = doc.is_approved ? "approved" : "pending";
  }

  const text = String(raw ?? "").trim();
  const key = text.toLowerCase().replace(/[\s-]+/g, "_");

  if (STATUS_MAP[key]) {
    return { key, ...STATUS_MAP[key] };
  }

  return { key: "unknown", label: text || "Unknown", tone: "neutral" };
}

export function readDocument(doc) {
  const fileName = doc.filename || doc.file_name || "";

  return {
    id: doc.id,
    title: doc.title || doc.name || fileName || `Document ${doc.id}`,
    fileName,
    size: doc.file_size ?? doc.size ?? null,
    uploadedAt: doc.uploaded_at || doc.created_at || null,
    reviewedAt: doc.reviewed_at || null,
    status: getDocumentStatus(doc),
  };
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return "";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "Not available";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}