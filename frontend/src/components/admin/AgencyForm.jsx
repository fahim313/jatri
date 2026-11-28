import { useState } from "react";
import { Link } from "react-router-dom";
import {
  parseDate,
  toDateInput,
  toDateTimeLocal,
} from "../../utils/agency";

export const LICENSE_STATUSES = ["Active", "Suspended", "Expired", "Cancelled"];

export const emptyAgencyValues = {
  name: "",
  rl_number: "",
  license_status: "Active",
  license_expiry: "",
  source_url: "",
  last_verified_at: "",
};

export function agencyToFormValues(agency) {
  return {
    name: agency.name ?? "",
    rl_number: agency.rl_number ?? "",
    license_status: agency.license_status ?? "Active",
    license_expiry: toDateInput(agency.license_expiry),
    source_url: agency.source_url ?? "",
    last_verified_at: toDateTimeLocal(agency.last_verified_at),
  };
}

const inputClass =
  "w-full rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40 focus:ring-1 focus:ring-white/20 [color-scheme:dark]";

function isHttpUrl(text) {
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Agency name is required.";
  }

  if (!values.rl_number.trim()) {
    errors.rl_number = "RL number is required.";
  }

  if (!values.license_expiry) {
    errors.license_expiry = "License expiry date is required.";
  }

  const url = values.source_url.trim();
  if (url && !isHttpUrl(url)) {
    errors.source_url = "Enter a full link starting with http:// or https://.";
  }

  if (values.last_verified_at) {
    const checked = parseDate(values.last_verified_at);

    if (!checked) {
      errors.last_verified_at = "Enter a valid date and time.";
    } else if (checked.getTime() > Date.now() + 5 * 60 * 1000) {
      errors.last_verified_at = "The check date cannot be in the future.";
    }
  }

  return errors;
}

function toPayload(values) {
  const checked = parseDate(values.last_verified_at);

  return {
    name: values.name.trim(),
    rl_number: values.rl_number.trim(),
    license_status: values.license_status,
    license_expiry: values.license_expiry,
    source_url: values.source_url.trim() || null,
    last_verified_at: checked ? checked.toISOString() : null,
  };
}


function changedPayload(values, initial) {
  const next = toPayload(values);
  const prev = toPayload(initial);
  const changed = {};

  Object.keys(next).forEach((key) => {
    if (next[key] !== prev[key]) changed[key] = next[key];
  });

  return changed;
}

function Field({ label, htmlFor, required, hint, error, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-zinc-300"
      >
        {label}
        {required && <span className="ml-1 text-zinc-500">*</span>}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-zinc-500">{hint}</p>
      )}
    </div>
  );
}

function AgencyForm({
  mode = "create",
  initialValues = emptyAgencyValues,
  submitting = false,
  error = "",
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [noChanges, setNoChanges] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setNoChanges(false);
  };

  const setCheckedNow = () => {
    setValues((prev) => ({
      ...prev,
      last_verified_at: toDateTimeLocal(new Date()),
    }));
    setFieldErrors((prev) => ({ ...prev, last_verified_at: "" }));
    setNoChanges(false);
  };

  const clearChecked = () => {
    setValues((prev) => ({ ...prev, last_verified_at: "" }));
    setFieldErrors((prev) => ({ ...prev, last_verified_at: "" }));
    setNoChanges(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate(values);
    setFieldErrors(errors);
    setNoChanges(false);

    if (Object.keys(errors).length > 0) return;

    if (mode === "edit") {
      const changed = changedPayload(values, initialValues);

      if (Object.keys(changed).length === 0) {
        setNoChanges(true);
        return;
      }

      onSubmit(changed);
      return;
    }

    onSubmit(toPayload(values));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = parseDate(values.license_expiry);
  const expiryPassed =
    values.license_status === "Active" && expiry && expiry < today;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {noChanges && (
        <div
          role="status"
          className="rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-zinc-300"
        >
          Nothing has changed yet.
        </div>
      )}

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
          Agency and license
        </h2>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Agency name"
              htmlFor="name"
              required
              error={fieldErrors.name}
            >
              <input
                id="name"
                name="name"
                type="text"
                value={values.name}
                onChange={handleChange}
                placeholder="Enter the registered agency name"
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="RL number"
            htmlFor="rl_number"
            required
            error={fieldErrors.rl_number}
            hint="The license number issued to the agency, e.g. RL1234."
          >
            <input
              id="rl_number"
              name="rl_number"
              type="text"
              value={values.rl_number}
              onChange={handleChange}
              placeholder="RL1234"
              className={inputClass}
            />
          </Field>

          <Field label="License status" htmlFor="license_status" required>
            <select
              id="license_status"
              name="license_status"
              value={values.license_status}
              onChange={handleChange}
              className={inputClass}
            >
              {LICENSE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field
              label="License expiry"
              htmlFor="license_expiry"
              required
              error={fieldErrors.license_expiry}
            >
              <input
                id="license_expiry"
                name="license_expiry"
                type="date"
                value={values.license_expiry}
                onChange={handleChange}
                className={`${inputClass} md:max-w-xs`}
              />
            </Field>

            {expiryPassed && !fieldErrors.license_expiry && (
              <p className="mt-2 text-xs text-amber-400">
                This date has passed, so the website will show this license as
                Expired even though the status is Active. Update the status.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
          Official check
        </h2>

        <div className="space-y-5 p-6">
          <Field
            label="Source link"
            htmlFor="source_url"
            error={fieldErrors.source_url}
            hint="The official page where you checked this agency, e.g. https://raims.bmet.gov.bd/"
          >
            <input
              id="source_url"
              name="source_url"
              type="url"
              value={values.source_url}
              onChange={handleChange}
              placeholder="https://"
              className={inputClass}
            />
          </Field>

          <Field
            label="Last checked"
            htmlFor="last_verified_at"
            error={fieldErrors.last_verified_at}
            hint="Set this only after you have really compared the agency with the official source. Leave empty if it has not been checked."
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="last_verified_at"
                name="last_verified_at"
                type="datetime-local"
                value={values.last_verified_at}
                onChange={handleChange}
                className={`${inputClass} md:max-w-xs`}
              />

              <button
                type="button"
                onClick={setCheckedNow}
                className="rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Use current time
              </button>

              {values.last_verified_at && (
                <button
                  type="button"
                  onClick={clearChecked}
                  className="text-xs font-medium text-zinc-400 underline underline-offset-4 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          to="/admin/agencies"
          className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
            ? "Create agency"
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}

export default AgencyForm;