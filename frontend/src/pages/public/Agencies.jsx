import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

import { getPublicAgencies } from "../../services/agencyService";
import { useAuth } from "../../context/AuthContext";
import {
  formatDate,
  getLicenseState,
  readAgency,
} from "../../utils/agency";
import LicenseBadge from "../../components/agencies/LicenseBadge";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

function Agencies() {
  const { user } = useAuth();

  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [state, setState] = useState({
    key: null,
    agencies: [],
    error: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const requestKey = `${query}:${reloadKey}`;
  const loading = state.key !== requestKey;

  const { agencies, error } = state;

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getPublicAgencies(query);

        if (!Array.isArray(response)) {
          throw new Error("Agencies response is not an array");
        }

        if (!ignore) {
          setState({
            key: requestKey,
            agencies: response.map(readAgency),
            error: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch agencies:", err);

        if (!ignore) {
          setState({
            key: requestKey,
            agencies: [],
            error: "Unable to load agencies. Please try again.",
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [query, requestKey]);

  const rows = useMemo(() => {
    return agencies
      .map((agency) => ({
        agency,
        license: getLicenseState(agency),
      }))
      .filter(
        ({ license }) =>
          statusFilter === "all" || license.key === statusFilter
      );
  }, [agencies, statusFilter]);

  const chatPath = user ? "/chat" : "/login";
  const searching = query.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Check a recruitment agency
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-400">
            Search by agency name or license number before you pay anyone or
            hand over any documents.
          </p>

          <div className="mt-7 grid gap-3 md:grid-cols-[1fr_190px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Agency name or license number (e.g. RL1234)"
                aria-label="Search agencies"
                className="w-full rounded-md border border-white/10 bg-zinc-900 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/40"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by license status"
              className="rounded-md border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-white outline-none focus:border-white/40"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {!loading && !error && (
          <p className="mb-3 text-sm text-zinc-500">
            {rows.length} {rows.length === 1 ? "agency" : "agencies"}
            {searching && ` for "${query}"`}
          </p>
        )}

        <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
          {loading && (
            <p className="px-5 py-14 text-center text-sm text-zinc-500">
              Loading agencies...
            </p>
          )}

          {!loading && error && (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-red-400">{error}</p>

              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-4 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="px-5 py-14 text-center">
              <p className="font-medium text-white">No agency found</p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-400">
                Not finding an agency here does not mean it is safe or unsafe.
                Do not pay until you have checked its license with the
                relevant government office.
              </p>

              <Link
                to={chatPath}
                state={{
                  from: "/chat",
                  initialQuestion:
                    "How can I check whether a recruitment agency is legitimate?",
                }}
                className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4 hover:text-zinc-300"
              >
                Ask Jatri AI
              </Link>
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <ul className="divide-y divide-white/10">
              {rows.map(({ agency, license }) => (
                <li key={agency.id}>
                  <Link
                    to={`/agencies/${agency.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="truncate font-medium text-white">
                          {agency.name}
                        </p>

                        <LicenseBadge license={license} />
                      </div>

                      <p className="mt-1 text-sm text-zinc-400">
                        {agency.licenseNumber !== "Not available"
                          ? `License ${agency.licenseNumber}`
                          : "License number not listed"}

                        {agency.licenseExpiry &&
                          ` · Expires ${formatDate(agency.licenseExpiry)}`}
                      </p>
                    </div>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-zinc-500"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          An active license does not guarantee that a job offer is genuine.
          Always get a written contract before paying.
        </p>
      </main>
    </div>
  );
}

export default Agencies;