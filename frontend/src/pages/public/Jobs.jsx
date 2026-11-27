import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { getPublicJobs } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";

function Jobs() {
  const { user } = useAuth();

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ key: null, jobs: [], error: "" });
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const loading = state.key !== reloadKey;
  const { jobs, error } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getPublicJobs();

        if (!Array.isArray(response)) {
          throw new Error("Jobs response is not an array");
        }

        if (!ignore) {
          setState({ key: reloadKey, jobs: response, error: "" });
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

  const countries = useMemo(
    () => ["All", ...new Set(jobs.map((j) => j.country).filter(Boolean))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    const text = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = String(job.job_title || job.title || "").toLowerCase();
      const matchesSearch = !text || title.includes(text);
      const matchesCountry =
        selectedCountry === "All" || job.country === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [jobs, search, selectedCountry]);

  const chatPath = user ? "/chat" : "/login";

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-semibold text-white">Overseas jobs</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Browse published openings. Before you apply to any of them, you can
            check the details, required documents and the recruiting agency with
            Jatri AI.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title"
              className="w-full rounded-md border border-white/10 bg-zinc-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country === "All" ? "All countries" : country}
              </option>
            ))}
          </select>
        </div>

        {!loading && !error && (
          <p className="mb-3 text-sm text-zinc-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
          {loading && (
            <p className="px-5 py-14 text-center text-sm text-zinc-500">
              Loading jobs…
            </p>
          )}

          {!loading && error && (
            <div className="px-5 py-14 text-center">
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

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="font-medium text-white">No jobs found</p>
              <p className="mt-1 text-sm text-zinc-400">
                Try a different title or country. You can also describe what you
                are looking for to Jatri AI.
              </p>
              <Link
                to={chatPath}
                state={{ from: "/chat" }}
                className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
              >
                Ask Jatri AI
              </Link>
            </div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
            <ul className="divide-y divide-white/10">
              {filteredJobs.map((job) => (
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
                      View details
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-sm text-zinc-400">
          Not sure which job or agency to trust?{" "}
          <Link
            to={chatPath}
            state={{ from: "/chat" }}
            className="font-medium text-white underline underline-offset-4 hover:text-zinc-300"
          >
            Ask Jatri AI
          </Link>
          {!user && " (login required)"}
        </p>
      </main>
    </div>
  );
}

export default Jobs;