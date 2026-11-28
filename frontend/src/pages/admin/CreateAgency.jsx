import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AgencyForm from "../../components/admin/AgencyForm";
import { createAgency } from "../../services/agencyService";
import { readApiError } from "../../utils/apiError";

function CreateAgency() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError("");

    try {
      await createAgency(payload);

      navigate("/admin/agencies", {
        state: {
          notice: {
            type: "success",
            text: `“${payload.name}” was added.`,
          },
        },
      });
    } catch (err) {
      console.error("Failed to create agency:", err);

      setError(
        readApiError(err, "Unable to create the agency. Please try again.")
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <section>
        <Link
          to="/admin/agencies"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          All agencies
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-white">Add agency</h1>
        <p className="mt-2 text-sm text-zinc-400">
          The agency is visible on the public agency search as soon as you save
          it. Check the details against the official source first.
        </p>
      </section>

      <AgencyForm
        mode="create"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default CreateAgency;