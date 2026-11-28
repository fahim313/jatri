function StatCard({ title, value, description, icon: Icon, loading = false }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>

        {Icon && (
          <div className="rounded-md bg-white/5 p-2 text-zinc-300">
            <Icon size={18} />
          </div>
        )}
      </div>

      <p className="mt-4 text-2xl font-semibold text-white">
        {loading ? "—" : value}
      </p>

      {description && (
        <p className="mt-2 text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
}

export default StatCard;