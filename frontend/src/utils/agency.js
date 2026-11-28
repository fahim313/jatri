export const STALE_AFTER_DAYS = 90;

export function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value);

  // "YYYY-MM-DD" স্থানীয় সময়ের মধ্যরাত ধরা হয়, নইলে কোনো দেশে এক দিন আগে দেখায়
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) return "Not available";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function pad(number) {
  return String(number).padStart(2, "0");
}

// <input type="datetime-local"> এর মান: "YYYY-MM-DDTHH:mm"
export function toDateTimeLocal(value) {
  const date = parseDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// <input type="date"> এর মান: "YYYY-MM-DD"
export function toDateInput(value) {
  if (!value) return "";

  const text = String(value);
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : "";
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// কাঁচা API object (snake_case) বা readAgency-এর object (camelCase), দুটোই চলে
function pick(agency, snake, camel) {
  return agency?.[snake] ?? agency?.[camel];
}

export function readAgency(agency) {
  return {
    id: agency.id,
    name: agency.name || "Unnamed Agency",
    licenseNumber: agency.rl_number || "Not available",
    licenseStatus: agency.license_status || "Unknown",
    licenseExpiry: agency.license_expiry,
    sourceUrl: agency.source_url,
    lastVerifiedAt: agency.last_verified_at,
  };
}

export function getLicenseState(agency) {
  const listed = String(
    pick(agency, "license_status", "licenseStatus") || ""
  ).trim();
  const key = listed.toLowerCase();
  const expiry = parseDate(pick(agency, "license_expiry", "licenseExpiry"));

  if (key === "active" && expiry && expiry < startOfToday()) {
    return {
      key: "expired",
      label: "Expired",
      tone: "danger",
      listed,
      mismatch: true,
      note: "The API lists this agency as Active, but its license expiry date has passed.",
    };
  }

  switch (key) {
    case "active":
      return {
        key: "active",
        label: "Active",
        tone: "success",
        listed,
        mismatch: false,
        note: "",
      };

    case "suspended":
      return {
        key: "suspended",
        label: "Suspended",
        tone: "warning",
        listed,
        mismatch: false,
        note: "This agency's license is suspended. It should not be recruiting workers.",
      };

    case "expired":
      return {
        key: "expired",
        label: "Expired",
        tone: "danger",
        listed,
        mismatch: false,
        note: "This agency's license has expired.",
      };

    case "cancelled":
      return {
        key: "cancelled",
        label: "Cancelled",
        tone: "danger",
        listed,
        mismatch: false,
        note: "This agency's license has been cancelled.",
      };

    default:
      return {
        key: "unknown",
        label: listed || "Unknown",
        tone: "neutral",
        listed,
        mismatch: false,
        note: "The license status of this agency is unclear.",
      };
  }
}

// সরকারি সূত্রে সর্বশেষ কবে মেলানো হয়েছে
export function getCheckState(agency) {
  const checked = parseDate(
    pick(agency, "last_verified_at", "lastVerifiedAt")
  );

  if (!checked) {
    return { key: "never", label: "Never checked", tone: "warning", days: null };
  }

  const days = Math.max(
    0,
    Math.floor((Date.now() - checked.getTime()) / 86400000)
  );

  if (days > STALE_AFTER_DAYS) {
    return { key: "stale", label: `${days} days ago`, tone: "warning", days };
  }

  return {
    key: "recent",
    label: days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"} ago`,
    tone: "neutral",
    days,
  };
}