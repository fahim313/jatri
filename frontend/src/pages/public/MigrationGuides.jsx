import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const topics = [
  {
    title: "Documents",
    description: "Passport, visa, medical and training papers you may need.",
    question: "What documents do I need before I travel abroad for work?",
  },
  {
    title: "Agencies",
    description: "How to tell whether a recruitment agency is legitimate.",
    question: "How can I check whether a recruitment agency is legitimate?",
  },
  {
    title: "Fees and contracts",
    description: "What you may be charged and what a contract should state.",
    question: "What should an overseas employment contract include?",
  },
  {
    title: "Your rights",
    description: "Where to turn if something goes wrong before or after you go.",
    question: "What can I do if an agent cheats me?",
  },
];

const steps = [
  {
    title: "You ask a question",
    description: "Write it in your own words, in Bangla or English.",
  },
  {
    title: "Approved documents are searched",
    description:
      "Jatri AI looks through documents that administrators have approved.",
  },
  {
    title: "You get an answer with its source",
    description: "You can see which document the answer came from.",
  },
];

function MigrationGuides() {
  const { user } = useAuth();
  const chatPath = user ? "/chat" : "/login";

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-white/10 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Migration guidance
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            Understand the process before you commit to anything. Choose a topic
            below, or ask your own question.
          </p>

          <Link
            to={chatPath}
            state={{ from: "/chat" }}
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Ask Jatri AI
            <ArrowRight size={18} />
          </Link>

          {!user && (
            <p className="mt-3 text-sm text-zinc-500">
              You will be asked to log in first.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-14">
        <section>
          <h2 className="text-xl font-semibold text-white">Start with a topic</h2>

          <ul className="mt-6 divide-y divide-white/10 rounded-md border border-white/10 bg-zinc-900">
            {topics.map((topic) => (
              <li key={topic.title}>
                <Link
                  to={chatPath}
                  state={{ from: "/chat", initialQuestion: topic.question }}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/5"
                >
                  <div>
                    <p className="font-medium text-white">{topic.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {topic.description}
                    </p>
                  </div>

                  <ArrowRight size={16} className="shrink-0 text-zinc-500" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-semibold text-white">
            How answers are produced
          </h2>

          <ol className="mt-6 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p className="text-sm font-medium text-zinc-600">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-sm text-zinc-500">
            Jatri AI gives general information, not legal advice. For serious
            disputes, contact the relevant government office.
          </p>
        </section>

        <section className="mt-14 border-t border-white/10 pt-8">
          <p className="text-zinc-300">
            Looking at a specific opening?{" "}
            <Link
              to="/jobs"
              className="font-medium text-white underline underline-offset-4 hover:text-zinc-300"
            >
              See published jobs
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default MigrationGuides;