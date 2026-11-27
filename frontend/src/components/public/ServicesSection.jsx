
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  ShieldCheck,
  FileText,
  Bot,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "Find Overseas Jobs",
    description: "Explore genuine overseas job opportunities.",
    icon: BriefcaseBusiness,
    color: "bg-blue-100 text-blue-600",
    link: "/jobs",
  },
  {
    title: "Verify Agencies",
    description: "Check the authenticity of recruitment agencies.",
    icon: ShieldCheck,
    color: "bg-green-100 text-green-600",
    link: "/login",
  },
  {
    title: "Migration Guide",
    description: "Get essential information for your journey.",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
    link: "/guides",
  },
  {
    title: "AI Assistant",
    description: "Ask questions about jobs and migration.",
    icon: Bot,
    color: "bg-sky-100 text-sky-600",
    link: "/login",
  },
];

function ServicesSection() {
  return (
    <section id="services" className="bg-white px-6 py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <Link
              key={service.title}
              to={service.link}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${service.color}`}
              >
                <Icon size={28} />
              </div>

              <h3 className="text-lg font-bold text-blue-950">
                {service.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {service.description}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Explore More
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
  );
}

export default ServicesSection;
