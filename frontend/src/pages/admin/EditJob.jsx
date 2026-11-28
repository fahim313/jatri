import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import JobForm from "../../components/admin/JobForm";
import { getAdminJobs, updateJob } from "../../services/jobService";
import { readApiError } from "../../utils/apiError";

function toFormValues(job) {
  return {
    job_title: job.job_title ?? "",
    country: job.country ?? "",
    salary: job.salary != null ? String(job.salary) : "",
    vacancies: job.vacancies != null ? String(job.vacancies) : "",
    application_deadline: job.application_deadline
      ? String(job.application_deadline).slice(0, 10)
      : "",
    requirements: job.requirements ?? "",
  };
}

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    key: null,
    job: null,
    error: "",
    notFound: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const requestKey = `${id}:${reloadKey}`;
  const loading = state.key !== requestKey;
  const { job, error, notFound } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const list = await getAdminJobs();

        if (!Array.isArray(list)) {
          throw new Error("Invalid jobs response");
        }

        const found = list.find((item) => String(item.id) === String(id));

        if (!ignore) {
          setState({
            key: requestKey,
            job: found || null,
            error: "",
            notFound: !found,
          });
        }
      } catch (err) {
        console.error("Failed to load job:", err);

        if (!ignore) {
          setState({
            key: requestKey,
            job: null,
            error: "Unable to load this job. Please try again.",
            notFound: false,
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [id, requestKey]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setSaveError("");

    try {
      await updateJob(id, payload);

      navigate("/admin/jobs", {
        state: {
          notice: {
            type: "success",
            text: `“${job.job_title}” was updated.`,
          },
        },
      });
    } catch (err) {
      console.error("Failed to update job:", err);
      setSaveError(readApiError(err, "Unable to save changes. Please try again."));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-zinc-500">Loading job…</p>
    );
  }

  if (error || notFound || !job) {
    return (
      <div className="py-20 text-center">
        <p className={`text-sm ${error ? "text-red-400" : "text-zinc-300"}`}>
          {error || "This job was not found. It may have been deleted."}
        </p>

        {error && (
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-4 text-sm text-white underline underline-offset-4"
          >
            Try again
          </button>
        )}

        <div className="mt-4">
          <Link
            to="/admin/jobs"
            className="text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
          >
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <section>
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          All jobs
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-white">Edit job</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Current status: <span className="text-zinc-200">{job.status}</span>.
          To publish, unpublish or expire a job, use the job list.
        </p>
      </section>

      <JobForm
        mode="edit"
        initialValues={toFormValues(job)}
        submitting={submitting}
        error={saveError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default EditJob;