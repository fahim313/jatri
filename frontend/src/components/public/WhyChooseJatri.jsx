const features = [
  {
    title: "Answers with sources",
    description:
      "Every answer comes from documents approved by administrators, and you can see which document it came from.",
  },
  {
    title: "Agency checks",
    description:
      "Look up a recruitment agency and see whether it is verified before you pay or hand over papers.",
  },
  {
    title: "Plain migration guidance",
    description:
      "Required documents, procedures and your rights, explained in simple language.",
  },
  {
    title: "Ask in your own words",
    description:
      "No forms and no filters. Write your question the way you would ask a person.",
  },
];

function WhyChooseJatri() {
  return (
    <section className="bg-zinc-900/50 px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-semibold text-white">Why Jatri</h2>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Built to help you make safer decisions before you commit to an
          overseas job.
        </p>

        <dl className="mt-10 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="bg-zinc-950 p-6">
              <dt className="font-semibold text-white">{feature.title}</dt>
              <dd className="mt-2 text-sm leading-6 text-zinc-400">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default WhyChooseJatri;