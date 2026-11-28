import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import JobForm from "../../components/admin/JobForm";
import { createJob, publishJob } from "../../services/jobService";
import { readApiError } from "../../utils/apiError";

function CreateJob() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (payload, intent) => {
    setSubmitting(true);
    setError("");

    let created;

    try {
      created = await createJob(payload);
    } catch (err) {
      console.error("Failed to create job:", err);
      setError(readApiError(err, "Unable to save the job. Please try again."));
      setSubmitting(false);
      return;
    }

    
    if (intent === "publish") {
      try {
        if (!created?.id) throw new Error("Missing job id in response");
        await publishJob(created.id);
      } catch (err) {
        console.error("Failed to publish new job:", err);

        navigate("/admin/jobs", {
          state: {
            notice: {
              type: "error",
              text: `“${payload.job_title}” was saved as a draft, but could not be published. Publish it from the list below.`,
            },
          },
        });
        return;
      }
    }

    navigate("/admin/jobs", {
      state: {
        notice: {
          type: "success",
          text:
            intent === "publish"
              ? `“${payload.job_title}” was saved and published.`
              : `“${payload.job_title}” was saved as a draft.`,
        },
      },
    });
  };

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

        <h1 className="mt-4 text-2xl font-semibold text-white">Add new job</h1>
        <p className="mt-2 text-sm text-zinc-400">
          A draft is not visible on the website. Publish it when you are ready.
        </p>
      </section>

      <JobForm
        mode="create"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CreateJob;