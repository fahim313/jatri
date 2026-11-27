const toneClasses = {
  success: "text-green-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  neutral: "text-gray-600",
};

function LicenseBadge({ license }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        toneClasses[license?.tone] || toneClasses.neutral
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {license?.label || "Unknown"}
    </span>
  );
}

export default LicenseBadge;