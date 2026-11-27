import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  BriefcaseBusiness,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getPublicJobs } from "../../services/jobService";

function LatestJobsSection() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    const loadJobs = async () => {
      try {
        const response = await getPublicJobs();

        if (!Array.isArray(response)) {
          throw new Error("Jobs response is not an array");
        }

        if (!ignore) {
          setJobs(response.slice(0, 6));
          setError("");
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);

        if (!ignore) {
          setJobs([]);
          setError("Unable to load jobs. Please try again later.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  
  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  return (
    <section className="bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-600">OPPORTUNITIES</p>

            <h2 className="mt-2 text-3xl font-bold text-blue-950">
              Latest Overseas Jobs
            </h2>

            <p className="mt-2 text-gray-500">
              Explore available overseas job opportunities.
            </p>
          </div>

          <Link
            to="/jobs"
            className="flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
          >
            View All Jobs
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading && (
          <p className="py-10 text-center text-gray-500">Loading jobs...</p>
        )}

        {!loading && error && (
          <div className="py-10 text-center">
            <p className="text-red-500">{error}</p>

            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <p className="py-10 text-center text-gray-500">
            No jobs available right now.
          </p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <BriefcaseBusiness size={24} />
                </div>

                <h3 className="text-lg font-bold text-blue-950">
                  {job.title}
                </h3>

                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  {job.country}
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-800"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LatestJobsSection;