import { useEffect } from "react";

function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-5"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-md border border-white/10 bg-zinc-900 p-6"
      >
        <h2 id="confirm-title" className="font-semibold text-white">
          {title}
        </h2>

        <div className="mt-3 text-sm leading-6 text-zinc-400">{children}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-zinc-950 hover:bg-zinc-200"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;