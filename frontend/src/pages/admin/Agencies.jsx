import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import StatCard from "../../components/admin/StatCard";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LicenseBadge from "../../components/agencies/LicenseBadge";
import { getAdminAgencies, deleteAgency } from "../../services/agencyService";
import {
  formatDate,
  getCheckState,
  getLicenseState,
} from "../../utils/agency";
import { readApiError } from "../../utils/apiError";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

async function fetchAgencies() {
  const response = await getAdminAgencies();

  if (!Array.isArray(response)) {
    throw new Error("Invalid agencies response");
  }

  return response;
}

function Agencies() {
  const location = useLocation();
  const navigate = useNavigate();

  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState({ key: null, agencies: [], error: "" });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [confirm, setConfirm] = useState(null); // agency
  const [busyId, setBusyId] = useState(null);

  
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  const loading = data.key !== reloadKey;
  const { agencies, error } = data;

  
  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await fetchAgencies();

        if (!ignore) {
          setData({ key: reloadKey, agencies: result, error: "" });
        }
      } catch (err) {
        console.error("Failed to load agencies:", err);

        if (!ignore) {
          setData({
            key: reloadKey,
            agencies: [],
            error: readApiError(err, "Unable to load agencies. Please try again."),
          });
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const rows = useMemo(
    () =>
      agencies.map((agency) => ({
        agency,
        license: getLicenseState(agency),
        check: getCheckState(agency),
      })),
    [agencies]
  );

  const counts = useMemo(() => {
    const active = rows.filter((r) => r.license.key === "active").length;
    const needsCheck = rows.filter((r) => r.check.key !== "recent").length;

    return {
      total: rows.length,
      active,
      notActive: rows.length - active,
      needsCheck,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const text = search.trim().toLowerCase();

    return rows.filter(({ agency, license }) => {
      const matchesText =
        !text ||
        String(agency.name || "").toLowerCase().includes(text) ||
        String(agency.rl_number || "").toLowerCase().includes(text);

      const matchesStatus = !status || license.key === status;

      return matchesText && matchesStatus;
    });
  }, [rows, search, status]);

  const hasFilters = Boolean(search.trim() || status);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
  };

  const runDelete = async () => {
    if (!confirm) return;

    const agency = confirm;

    setConfirm(null);
    setBusyId(agency.id);
    setNotice(null);

    try {
      await deleteAgency(agency.id);

      const fresh = await fetchAgencies();
      setData((prev) => ({ ...prev, agencies: fresh }));

      setNotice({ type: "success", text: `“${agency.name}” was deleted.` });
    } catch (err) {
      console.error("Failed to delete agency:", err);

      setNotice({
        type: "error",
        text: readApiError(err, "Unable to delete this agency. Please try again."),
      });
    } finally {
      setBusyId(null);
    }
  };

  const toneText = {
    warning: "text-amber-400",
    neutral: "text-zinc-300",
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-zinc-500">ADMINISTRATION</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Agency Management
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Keep recruitment agencies and their license information accurate.
            This is what the public checks before paying an agency.
          </p>
        </div>

        <Link
          to="/admin/agencies/create"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus size={17} />
          Add agency
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total agencies" value={counts.total} loading={loading} />
        <StatCard
          title="Active licenses"
          value={counts.active}
          loading={loading}
        />
        <StatCard
          title="Not active"
          value={counts.notActive}
          description="Suspended, expired or cancelled"
          loading={loading}
        />
        <StatCard
          title="Check overdue"
          value={counts.needsCheck}
          description="Never checked, or over 90 days ago"
          loading={loading}
        />
      </section>

      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`flex items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 text-xs font-medium underline underline-offset-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="rounded-md border border-white/10 bg-zinc-900 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agency name or RL number"
              aria-label="Search agencies"
              className="w-full rounded-md border border-white/10 bg-zinc-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by license status"
            className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-white/10 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-medium text-white">All agencies</h2>

          <div className="flex items-center gap-4 text-sm text-zinc-500">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                Clear filters
              </button>
            )}
            <span>
              {loading
                ? "Loading…"
                : `Showing ${filteredRows.length} of ${rows.length}`}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            Loading agencies…
          </p>
        ) : error ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 text-sm text-white underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : filteredRows.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-zinc-500">
            {rows.length === 0
              ? "No agencies yet. Add the first one."
              : "No agencies match these filters."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Agency</th>
                  <th className="px-5 py-3.5 font-medium">License</th>
                  <th className="px-5 py-3.5 font-medium">Expiry</th>
                  <th className="px-5 py-3.5 font-medium">Last checked</th>
                  <th className="px-5 py-3.5 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filteredRows.map(({ agency, license, check }) => (
                  <tr key={agency.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{agency.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {agency.rl_number || "No RL number"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <LicenseBadge license={license} />
                      {license.mismatch && (
                        <p className="mt-1.5 text-xs text-amber-400">
                          Listed as {license.listed}. Update the status.
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-zinc-300">
                      {formatDate(agency.license_expiry)}
                    </td>

                    <td className="px-5 py-4">
                      <p className={toneText[check.tone] || "text-zinc-300"}>
                        {check.label}
                      </p>
                      {agency.last_verified_at && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {formatDate(agency.last_verified_at)}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/agencies/${agency.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View on website"
                          title="View on website"
                          className="rounded p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                        >
                          <ExternalLink size={16} />
                        </Link>

                        <Link
                          to={`/admin/agencies/${agency.id}/edit`}
                          aria-label="Edit agency"
                          title="Edit agency"
                          className="rounded p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          disabled={busyId === agency.id}
                          onClick={() => setConfirm(agency)}
                          aria-label="Delete agency"
                          title="Delete agency"
                          className="rounded p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirm && (
        <ConfirmDialog
          title="Delete this agency?"
          confirmLabel="Delete"
          danger
          onConfirm={runDelete}
          onCancel={() => setConfirm(null)}
        >
          <span className="font-medium text-zinc-200">{confirm.name}</span> will
          be permanently deleted and will disappear from the public agency
          search.
        </ConfirmDialog>
      )}
    </div>
  );
}

export default Agencies;