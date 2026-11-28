import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AgencyForm, {
  agencyToFormValues,
} from "../../components/admin/AgencyForm";
import { getAdminAgency, updateAgency } from "../../services/agencyService";
import { readApiError } from "../../utils/apiError";

function EditAgency() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    key: null,
    agency: null,
    error: "",
    notFound: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const requestKey = `${id}:${reloadKey}`;
  const loading = state.key !== requestKey;
  const { agency, error, notFound } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getAdminAgency(id);

        if (!ignore) {
          setState({
            key: requestKey,
            agency: response,
            error: "",
            notFound: false,
          });
        }
      } catch (err) {
        console.error("Failed to load agency:", err);

        if (!ignore) {
          const is404 = err.response?.status === 404;

          setState({
            key: requestKey,
            agency: null,
            error: is404
              ? ""
              : readApiError(err, "Unable to load this agency. Please try again."),
            notFound: is404,
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
      await updateAgency(id, payload);

      navigate("/admin/agencies", {
        state: {
          notice: {
            type: "success",
            text: `“${payload.name || agency.name}” was updated.`,
          },
        },
      });
    } catch (err) {
      console.error("Failed to update agency:", err);

      setSaveError(
        readApiError(err, "Unable to save changes. Please try again.")
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-zinc-500">
        Loading agency…
      </p>
    );
  }

  if (error || notFound || !agency) {
    return (
      <div className="py-20 text-center">
        <p className={`text-sm ${error ? "text-red-400" : "text-zinc-300"}`}>
          {error || "This agency was not found. It may have been deleted."}
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
            to="/admin/agencies"
            className="text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
          >
            Back to agencies
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 className="mt-4 text-2xl font-semibold text-white">Edit agency</h1>
        <p className="mt-2 text-sm text-zinc-400">{agency.name}</p>
      </section>

      <AgencyForm
        mode="edit"
        initialValues={agencyToFormValues(agency)}
        submitting={submitting}
        error={saveError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default EditAgency;