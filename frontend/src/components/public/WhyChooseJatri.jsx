import {
  ShieldCheck,
  BadgeCheck,
  BookOpenCheck,
  Bot,
  Headset,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Trusted Information",
    description:
      "Get reliable information and guidance to make informed decisions throughout your migration journey.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Agencies",
    description:
      "Check agency information and make safer choices before starting your overseas migration process.",
  },
  {
    icon: BookOpenCheck,
    title: "Easy Migration Guides",
    description:
      "Understand migration procedures, required documents, and important guidelines in one place.",
  },
  {
    icon: Bot,
    title: "AI-Powered Assistance",
    description:
      "Get quick answers to your migration-related questions with our AI-powered assistant.",
  },
  {
    icon: Headset,
    title: "Accessible Support",
    description:
      "Find helpful resources and support to make your overseas journey easier.",
  },
];

function WhyChooseJatri() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-semibold uppercase tracking-wider text-blue-600">
            Why Choose Us
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
            Why Choose Jatri?
          </h2>

          <p className="mt-4 leading-relaxed text-gray-500">
            We make your overseas migration journey easier with reliable
            information, helpful tools, and accessible guidance.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Icon size={28} />
                </div>

                <h3 className="text-lg font-bold text-blue-950">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseJatri;
