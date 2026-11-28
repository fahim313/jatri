import { useState } from "react";
import { Link } from "react-router-dom";

const COUNTRY_SUGGESTIONS = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Malaysia",
  "Singapore",
  "Jordan",
  "Maldives",
  "Brunei",
  "South Korea",
  "Japan",
  "Italy",
];
// eslint-disable-next-line react-refresh/only-export-components
export const emptyJobValues = {
  job_title: "",
  country: "",
  salary: "",
  vacancies: "",
  application_deadline: "",
  requirements: "",
};

const inputClass =
  "w-full rounded-md border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40 focus:ring-1 focus:ring-white/20";

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function validate(values, mode) {
  const errors = {};

  if (!values.job_title.trim()) {
    errors.job_title = "Job title is required.";
  }

  if (!values.country.trim()) {
    errors.country = "Country is required.";
  }

  if (values.vacancies !== "") {
    const number = Number(values.vacancies);

    if (!Number.isInteger(number) || number < 1) {
      errors.vacancies = "Enter a whole number of 1 or more.";
    }
  }

  if (
    mode === "create" &&
    values.application_deadline &&
    values.application_deadline < todayString()
  ) {
    errors.application_deadline = "The deadline cannot be in the past.";
  }

  return errors;
}


function buildPayload(values, initial, mode) {
  const fields = {
    job_title: values.job_title.trim(),
    country: values.country.trim(),
    salary: values.salary.trim(),
    vacancies: values.vacancies === "" ? "" : Number(values.vacancies),
    application_deadline: values.application_deadline,
    requirements: values.requirements.trim(),
  };

  const payload = {};

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== "") {
      payload[key] = value;
    } else if (mode === "edit" && initial[key] !== "") {
      payload[key] = null;
    }
  });

  return payload;
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

function JobForm({
  mode = "create",
  initialValues = emptyJobValues,
  submitting = false,
  error = "",
  onSubmit,
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const submit = (intent) => {
    const errors = validate(values, mode);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    onSubmit(buildPayload(values, initialValues, mode), intent);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    submit("draft");
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
          Job details
        </h2>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              label="Job title"
              htmlFor="job_title"
              required
              error={fieldErrors.job_title}
            >
              <input
                id="job_title"
                name="job_title"
                type="text"
                value={values.job_title}
                onChange={handleChange}
                placeholder="e.g. Construction Helper"
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Country"
            htmlFor="country"
            required
            error={fieldErrors.country}
          >
            <input
              id="country"
              name="country"
              type="text"
              list="country-suggestions"
              value={values.country}
              onChange={handleChange}
              placeholder="e.g. Saudi Arabia"
              className={inputClass}
            />
            <datalist id="country-suggestions">
              {COUNTRY_SUGGESTIONS.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </Field>

          <Field
            label="Monthly salary"
            htmlFor="salary"
            hint="Write the amount with its currency, e.g. SAR 1,200."
          >
            <input
              id="salary"
              name="salary"
              type="text"
              value={values.salary}
              onChange={handleChange}
              placeholder="e.g. SAR 1,200"
              className={inputClass}
            />
          </Field>

          <Field
            label="Vacancies"
            htmlFor="vacancies"
            error={fieldErrors.vacancies}
          >
            <input
              id="vacancies"
              name="vacancies"
              type="number"
              min="1"
              step="1"
              value={values.vacancies}
              onChange={handleChange}
              placeholder="e.g. 20"
              className={inputClass}
            />
          </Field>

          <Field
            label="Application deadline"
            htmlFor="application_deadline"
            error={fieldErrors.application_deadline}
          >
            <input
              id="application_deadline"
              name="application_deadline"
              type="date"
              min={mode === "create" ? todayString() : undefined}
              value={values.application_deadline}
              onChange={handleChange}
              className={`${inputClass} scheme-dark`}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
          Requirements
        </h2>

        <div className="p-6">
          <Field
            label="Requirements"
            htmlFor="requirements"
            hint="Skills, age, experience, documents. One point per line."
          >
            <textarea
              id="requirements"
              name="requirements"
              rows={8}
              value={values.requirements}
              onChange={handleChange}
              placeholder={"Age 21 to 40\nValid passport\nMinimum 1 year of experience"}
              className={`${inputClass} resize-y leading-6`}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          to="/admin/jobs"
          className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
        >
          Cancel
        </Link>

        {mode === "create" ? (
          <>
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit("draft")}
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save as draft"}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => submit("publish")}
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and publish
            </button>
          </>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>
    </form>
  );
}

export default JobForm;