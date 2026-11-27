export function parseDate(value) {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
  const key = String(agency.licenseStatus || "").trim().toLowerCase();
  const expiry = parseDate(agency.licenseExpiry);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (key === "active" && expiry && expiry < today) {
    return {
      key: "expired",
      label: "Expired",
      tone: "danger",
      note: "The API lists this agency as Active, but its license expiry date has passed.",
    };
  }

  switch (key) {
    case "active":
      return {
        key: "active",
        label: "Active",
        tone: "success",
        note: "",
      };

    case "suspended":
      return {
        key: "suspended",
        label: "Suspended",
        tone: "warning",
        note: "This agency's license is suspended.",
      };

    case "expired":
      return {
        key: "expired",
        label: "Expired",
        tone: "danger",
        note: "This agency's license has expired.",
      };

    case "cancelled":
      return {
        key: "cancelled",
        label: "Cancelled",
        tone: "danger",
        note: "This agency's license has been cancelled.",
      };

    default:
      return {
        key: "unknown",
        label: agency.licenseStatus || "Unknown",
        tone: "neutral",
        note: "The license status of this agency is unclear.",
      };
  }
}