import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function ServicesSection() {
  const { user } = useAuth();
  const chatPath = user ? "/chat" : "/login";

  const services = [
    {
      title: "Ask Jatri AI",
      description:
        "Ask about migration rules, documents and costs in your own words. Answers come with their source.",
      link: chatPath,
      state: { from: "/chat" },
      action: "Start a conversation",
    },
    {
      title: "Check an agency",
      description:
        "Look up a recruitment agency by name or license number and see its license status before you give it any money or documents.",
      link: "/agencies",
      action: "Check an agency",
    },
    {
      title: "Migration guidance",
      description:
        "Read what the approved documents say about required papers, procedures and your rights.",
      link: "/guides",
      action: "Read guidance",
    },
    {
      title: "Published jobs",
      description:
        "See the openings that have been published, then ask Jatri AI about any of them.",
      link: "/jobs",
      action: "See jobs",
    },
  ];

  return (
    <section
      id="services"
      className="border-b border-white/10 bg-zinc-900/50 px-6 py-16"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl font-semibold text-white">
          What you can do here
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Start with a question. Jobs and agency details support your decision,
          they are not the whole service.
        </p>

        <ol className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {services.map((service, index) => (
            <li key={service.title} className="flex gap-5">
              <span className="text-sm font-medium text-zinc-600">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <h3 className="font-semibold text-white">{service.title}</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {service.description}
                </p>

                <Link
                  to={service.link}
                  state={service.state}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white transition hover:text-zinc-300"
                >
                  {service.action}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ServicesSection;