import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const sampleQuestions = [
  "Is this recruitment agency verified?",
  "What documents do I need before I travel?",
  "What should I check before paying an agent?",
];

function HeroSection() {
  const { user } = useAuth();
  const chatPath = user ? "/chat" : "/agencies";

  return (
    <section className="border-b border-white/10 bg-zinc-950 px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            Information for Bangladeshi migrant workers
          </p>

          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white md:text-5xl">
            Ask before you go abroad.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-400">
            Jatri AI answers your questions about agencies, jobs and migration
            rules, using documents approved by administrators.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              to={chatPath}
              state={{ from: "/chat" }}
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              Ask Jatri AI
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/jobs"
              className="font-medium text-zinc-300 transition hover:text-white"
            >
              Browse published jobs
            </Link>
          </div>

          {!user && (
            <p className="mt-4 text-sm text-zinc-500">
              A free account is required to use the AI assistant.
            </p>
          )}

          <div className="mt-10">
            <p className="text-sm font-medium text-white">Questions people ask</p>

            <ul className="mt-3 space-y-2">
              {sampleQuestions.map((question) => (
                <li key={question}>
                  <Link
                    to={chatPath}
                    state={{ from: "/chat", initialQuestion: question }}
                    className="text-sm text-zinc-400 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    {question}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      
        <div className="rounded-md border border-white/10 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="text-sm font-medium text-white">Jatri AI</span>
            <span className="text-xs text-zinc-500">Example conversation</span>
          </div>

          <div className="space-y-4 p-5">
            <div className="ml-auto max-w-[85%] rounded-md bg-white px-4 py-3 text-sm text-zinc-950">
              What should I check before paying an agent?
            </div>

            <div className="max-w-[90%] rounded-md border border-white/10 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-300">
              <p>
                Confirm that the agency holds a valid license, ask for a written
                contract, and compare any fee with the official limit before you
                pay.
              </p>

              <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-500">
                Source: approved migration documents
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-3 text-xs text-zinc-500">
            Answers come from approved documents, not guesses.
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;