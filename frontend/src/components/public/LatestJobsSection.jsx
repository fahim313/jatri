import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { getPublicJobs } from "../../services/jobService";

function LatestJobsSection() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ key: null, jobs: [], error: "" });

  const loading = state.key !== reloadKey;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getPublicJobs();

        if (!Array.isArray(response)) {
          throw new Error("Jobs response is not an array");
        }

        if (!ignore) {
          setState({ key: reloadKey, jobs: response.slice(0, 6), error: "" });
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        if (!ignore) {
          setState({
            key: reloadKey,
            jobs: [],
            error: "Unable to load jobs. Please try again.",
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const { jobs, error } = state;

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Latest overseas jobs
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Recently published openings. Ask Jatri AI if you are unsure about
              any of them.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition hover:text-zinc-300"
          >
            View all jobs
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-white/10 bg-zinc-900">
          {loading && (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              Loading jobs…
            </p>
          )}

          {!loading && error && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="mt-4 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No jobs are available right now.
            </p>
          )}

          {!loading && !error && jobs.length > 0 && (
            <ul className="divide-y divide-white/10">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {job.job_title || job.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
                        <MapPin size={14} />
                        {job.country || "Location not specified"}
                      </p>
                    </div>

                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-white">
                      Details
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default LatestJobsSection;