import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

import { getPublicAgency } from "../../services/agencyService";
import { useAuth } from "../../context/AuthContext";
import {
  formatDate,
  getLicenseState,
  readAgency,
} from "../../utils/agency";
import LicenseBadge from "../../components/agencies/LicenseBadge";

const suggestedQuestions = [
  "Is it safe to pay this agency?",
  "What is the official fee limit for workers?",
  "What should the agency give me in writing?",
  "What can I do if this agency cheats me?",
];

const checklist = [
  "Check that the license number matches the one on the official government source.",
  "Get a written contract before you pay anything.",
  "Ask for a receipt for every payment.",
  "Never hand over your original passport without a written record.",
];

function AgencyDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [reloadKey, setReloadKey] = useState(0);

  const [state, setState] = useState({
    key: null,
    agency: null,
    error: "",
    notFound: false,
  });

  const requestKey = `${id}:${reloadKey}`;
  const loading = state.key !== requestKey;

  const { agency, error, notFound } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getPublicAgency(id);

        if (!response || typeof response !== "object") {
          throw new Error("Invalid agency response");
        }

        if (!ignore) {
          setState({
            key: requestKey,
            agency: readAgency(response),
            error: "",
            notFound: false,
          });
        }
      } catch (err) {
        console.error("Failed to fetch agency:", err);

        if (!ignore) {
          const is404 = err.response?.status === 404;

          setState({
            key: requestKey,
            agency: null,
            error: is404
              ? ""
              : "Unable to load agency details. Please try again.",
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

  const chatPath = user ? "/chat" : "/login";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">
          Loading agency details...
        </p>
      </div>
    );
  }

  if (error || notFound || !agency) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <p
          className={`text-sm ${
            error ? "text-red-400" : "text-zinc-300"
          }`}
        >
          {error || "Agency not found."}
        </p>

        {error && (
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-4 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Try again
          </button>
        )}

        <Link
          to="/agencies"
          className="mt-4 text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
        >
          Back to agencies
        </Link>
      </div>
    );
  }

  const license = getLicenseState(agency);

  const neverChecked =
    !agency.lastVerifiedAt && !agency.sourceUrl;

  const notActive = license.key !== "active";

  const details = [
    {
      label: "License number",
      value: agency.licenseNumber,
    },
    {
      label: "License status",
      value: license.label,
    },
    {
      label: "License expiry",
      value: formatDate(agency.licenseExpiry),
    },
    {
      label: "Last checked on Jatri",
      value: agency.lastVerifiedAt
        ? formatDate(agency.lastVerifiedAt)
        : "Not recorded",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/agencies"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            All agencies
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-semibold text-white">
              {agency.name}
            </h1>

            <LicenseBadge license={license} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {notActive && (
            <div
              role="alert"
              className={`rounded-md border px-5 py-4 text-sm leading-6 ${
                license.tone === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-red-500/30 bg-red-500/10 text-red-200"
              }`}
            >
              <p className="font-medium">
                Do not pay this agency or hand over documents.
              </p>

              <p className="mt-1">
                {license.note} Confirm the current license status
                with the relevant government office before taking
                any action.
              </p>
            </div>
          )}

          {!notActive && neverChecked && (
            <div className="rounded-md border border-white/15 bg-white/5 px-5 py-4 text-sm leading-6 text-zinc-300">
              Jatri has not recorded a check of this agency against
              an official source. Confirm the license number
              yourself on the relevant government website before
              paying.
            </div>
          )}

          <section className="rounded-md border border-white/10 bg-zinc-900">
            <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
              License information
            </h2>

            <dl className="divide-y divide-white/10">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm"
                >
                  <dt className="text-zinc-500">
                    {item.label}
                  </dt>

                  <dd className="col-span-2 wrap-break-wor font-medium text-white">
                    {item.value}
                  </dd>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm">
                <dt className="text-zinc-500">
                  Reference source
                </dt>

                <dd className="col-span-2 font-medium">
                  {agency.sourceUrl ? (
                    <a
                      href={agency.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-white underline underline-offset-4 hover:text-zinc-300"
                    >
                      Open source
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-white">
                      Not available
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-white/10 bg-zinc-900">
            <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
              Before you pay anyone
            </h2>

            <ul className="space-y-3 px-6 py-5 text-sm leading-6 text-zinc-300">
              {checklist.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-zinc-600">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="h-fit rounded-md border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">
              Questions about this agency?
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Jatri AI answers from approved migration documents.
            </p>
          </div>

          <ul className="divide-y divide-white/10">
            {suggestedQuestions.map((question) => (
              <li key={question}>
                <Link
                  to={chatPath}
                  state={{
                    from: "/chat",
                    agencyId: agency.id,
                    agencyName: agency.name,
                    initialQuestion: question,
                  }}
                  className="block px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  {question}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 p-5">
            <Link
              to={chatPath}
              state={{
                from: "/chat",
                agencyId: agency.id,
                agencyName: agency.name,
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              <MessageCircle size={16} />
              Ask Jatri AI
            </Link>

            {!user && (
              <p className="mt-3 text-center text-xs text-zinc-500">
                You will be asked to log in first.
              </p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

export default AgencyDetails;