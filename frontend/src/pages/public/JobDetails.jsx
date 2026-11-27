import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { getPublicJob } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";

const suggestedQuestions = [
  "Am I eligible for this job?",
  "What documents will I need?",
  "How do I apply safely?",
  "What should I verify before paying anyone?",
];

function formatDate(date) {
  if (!date) return "Not specified";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not specified";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ key: null, job: null, error: "" });

  const requestKey = `${id}:${reloadKey}`;
  const loading = state.key !== requestKey;
  const { job, error } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getPublicJob(id);

        if (!ignore) {
          setState({ key: requestKey, job: response, error: "" });
        }
      } catch (err) {
        console.error("Failed to fetch job details:", err);

        if (!ignore) {
          setState({
            key: requestKey,
            job: null,
            error: "Unable to load job details. Please try again.",
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
        <p className="text-sm text-zinc-500">Loading job details…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <p className="text-sm text-red-400">{error || "Job not found."}</p>

        {error && (
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-4 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Try again
          </button>
        )}

        <Link
          to="/jobs"
          className="mt-4 text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  const title = job.job_title || job.title;

  const details = [
    { label: "Country", value: job.country || "Not specified" },
    { label: "Monthly salary", value: job.salary || "Not specified" },
    { label: "Vacancies", value: job.vacancies ?? "Not specified" },
    {
      label: "Application deadline",
      value: formatDate(job.application_deadline),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            All jobs
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
          <p className="mt-1 text-zinc-400">{job.country}</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-md border border-white/10 bg-zinc-900">
            <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
              Job overview
            </h2>

            <dl className="divide-y divide-white/10">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm"
                >
                  <dt className="text-zinc-500">{item.label}</dt>
                  <dd className="col-span-2 font-medium text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-md border border-white/10 bg-zinc-900">
            <h2 className="border-b border-white/10 px-6 py-4 font-semibold text-white">
              Requirements
            </h2>

            <p className="whitespace-pre-line px-6 py-5 text-sm leading-7 text-zinc-300">
              {job.requirements || "No requirements specified."}
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-md border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">
              Questions about this job?
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
                    jobId: job.id,
                    jobTitle: title,
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
              state={{ from: "/chat", jobId: job.id, jobTitle: title }}
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

export default JobDetails;