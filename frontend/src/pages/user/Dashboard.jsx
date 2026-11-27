import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const quickQuestions = [
  "How can I check an agency's license status?",
  "What documents do I need before I travel?",
  "What should I check before paying an agent?",
];

const links = [
  {
    title: "Check an agency",
    description: "Look up an agency's license status and expiry date.",
    path: "/agencies",
  },
  {
    title: "Migration guidance",
    description: "Documents, procedures and your rights.",
    path: "/guides",
  },
  {
    title: "Published jobs",
    description: "See openings, then ask Jatri AI about them.",
    path: "/jobs",
  },
];

function Dashboard() {
  const { user } = useAuth();

  const profile = [
    { label: "Full name", value: user?.name || "Not available" },
    { label: "Email address", value: user?.email || "Not available" },
    { label: "Account role", value: user?.role || "User" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section>
        <h1 className="text-3xl font-semibold text-white">
          Welcome, {user?.name || "User"}
        </h1>
        <p className="mt-2 text-zinc-400">
          Ask Jatri AI before you decide anything about going abroad.
        </p>
      </section>

      <section className="rounded-md border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="font-semibold text-white">Ask Jatri AI</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Answers come from documents approved by administrators.
          </p>
        </div>

        <ul className="divide-y divide-white/10">
          {quickQuestions.map((question) => (
            <li key={question}>
              <Link
                to="/chat"
                state={{ from: "/chat", initialQuestion: question }}
                className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {question}
                <ArrowRight size={15} className="shrink-0 text-zinc-500" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/10 p-6">
          <Link
            to="/chat"
            state={{ from: "/chat" }}
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Start a conversation
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick access</h2>

        <ul className="divide-y divide-white/10 rounded-md border border-white/10 bg-zinc-900">
          {links.map((item) => (
            <li key={item.title}>
              <Link
                to={item.path}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-white/5"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {item.description}
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-zinc-500" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Your profile</h2>

        <dl className="divide-y divide-white/10 rounded-md border border-white/10 bg-zinc-900">
          {profile.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-3 gap-4 px-6 py-3.5 text-sm"
            >
              <dt className="text-zinc-500">{item.label}</dt>
              <dd className="col-span-2 font-medium capitalize text-white">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default Dashboard;