import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FileText,
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import { getAdminJobs } from "../../services/jobService";
import { getPublicAgencies } from "../../services/agencyService";
import { getLicenseState, parseDate } from "../../utils/agency";

const managementItems = [
  {
    title: "Job Management",
    description: "Create, update, publish and expire overseas job listings.",
    path: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "Agency Management",
    description: "Maintain recruitment agencies and their license information.",
    path: "/admin/agencies",
    icon: Building2,
  },
  {
    title: "Document Management",
    description: "Upload migration documents that Jatri AI answers from.",
    path: "/admin/documents",
    icon: FileText,
  },
];

const MAX_ATTENTION_ITEMS = 8;

function Dashboard() {
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({
    key: null,
    jobs: [],
    agencies: [],
    jobsFailed: false,
    agenciesFailed: false,
  });

  const loading = state.key !== reloadKey;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      const [jobsResult, agenciesResult] = await Promise.allSettled([
        getAdminJobs(),
        getPublicAgencies(),
      ]);

      if (ignore) return;

      const jobs =
        jobsResult.status === "fulfilled" && Array.isArray(jobsResult.value)
          ? jobsResult.value
          : [];

      const agencies =
        agenciesResult.status === "fulfilled" &&
        Array.isArray(agenciesResult.value)
          ? agenciesResult.value
          : [];

      setState({
        key: reloadKey,
        jobs,
        agencies,
        jobsFailed:
          jobsResult.status === "rejected" ||
          !Array.isArray(jobsResult.value),
        agenciesFailed:
          agenciesResult.status === "rejected" ||
          !Array.isArray(agenciesResult.value),
      });
    };

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const { jobs, agencies, jobsFailed, agenciesFailed } = state;

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.status === "Published").length;
    const drafts = jobs.filter((j) => j.status === "Draft").length;
    const activeAgencies = agencies.filter(
      (a) => getLicenseState(a).key === "active"
    ).length;

    return { published, drafts, activeAgencies };
  }, [jobs, agencies]);

  const attention = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = [];

    jobs.forEach((job) => {
      const deadline = parseDate(job.application_deadline);

      if (job.status === "Published" && deadline && deadline < today) {
        items.push({
          id: `job-${job.id}`,
          title: job.job_title,
          detail: "Application deadline has passed but the job is still published.",
          to: "/admin/jobs",
          tone: "warning",
        });
      }
    });

    agencies.forEach((agency) => {
      const license = getLicenseState(agency);

      if (license.key !== "active") {
        items.push({
          id: `agency-license-${agency.id}`,
          title: agency.name,
          detail: `License is ${license.label.toLowerCase()}.`,
          to: "/admin/agencies",
          tone: license.tone === "danger" ? "danger" : "warning",
        });
      } else if (!agency.last_verified_at && !agency.source_url) {
        items.push({
          id: `agency-check-${agency.id}`,
          title: agency.name,
          detail: "Never checked against an official source.",
          to: "/admin/agencies",
          tone: "neutral",
        });
      }
    });

    return items;
  }, [jobs, agencies]);

  const toneClass = {
    danger: "text-red-400",
    warning: "text-amber-400",
    neutral: "text-zinc-400",
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-zinc-500">ADMINISTRATION</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Overview
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Keep jobs, agency licenses and migration documents up to date.
          Jatri AI answers only from what is kept here.
        </p>
      </section>

      {(jobsFailed || agenciesFailed) && !loading && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          <span>
            Could not load {jobsFailed && "jobs"}
            {jobsFailed && agenciesFailed && " and "}
            {agenciesFailed && "agencies"}. Some numbers below may be missing.
          </span>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="font-medium text-white underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total jobs"
          value={jobs.length}
          icon={BriefcaseBusiness}
          loading={loading}
        />
        <StatCard
          title="Published jobs"
          value={stats.published}
          description={`${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`}
          loading={loading}
        />
        <StatCard
          title="Agencies"
          value={agencies.length}
          icon={Building2}
          loading={loading}
        />
        <StatCard
          title="Active licenses"
          value={stats.activeAgencies}
          description={`of ${agencies.length} agencies`}
          loading={loading}
        />
      </section>

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <AlertTriangle size={17} className="text-amber-400" />
          <h2 className="font-medium text-white">Needs attention</h2>
          {!loading && (
            <span className="ml-auto text-sm text-zinc-500">
              {attention.length} item{attention.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Loading…
          </p>
        ) : attention.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            Nothing needs attention right now.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-white/10">
              {attention.slice(0, MAX_ATTENTION_ITEMS).map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className={`mt-0.5 text-xs ${toneClass[item.tone]}`}>
                        {item.detail}
                      </p>
                    </div>

                    <ArrowRight size={15} className="shrink-0 text-zinc-500" />
                  </Link>
                </li>
              ))}
            </ul>

            {attention.length > MAX_ATTENTION_ITEMS && (
              <p className="border-t border-white/10 px-5 py-3 text-xs text-zinc-500">
                and {attention.length - MAX_ATTENTION_ITEMS} more
              </p>
            )}
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Management</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {managementItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="group rounded-md border border-white/10 bg-zinc-900 p-5 transition hover:border-white/25"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/5 text-zinc-300">
                  <Icon size={20} />
                </div>

                <h3 className="mt-5 font-semibold text-white">{item.title}</h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-zinc-300 transition group-hover:text-white">
                  Manage
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;