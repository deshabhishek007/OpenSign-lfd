import { useEffect } from "react";
import { useNavigate } from "react-router";

// Shared shell for the public Terms / Privacy pages — same nav + footer as
// the marketing landing so the three read as one site. Content is passed in
// as `sections` ([{ heading, body }]). Copy is boilerplate for LDF Sign and
// should be reviewed by counsel before relied upon.

const Wordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`}>
    <span className="text-primary">LDF</span> <span>Sign</span>
  </span>
);

const LegalPage = ({ title, updated, sections }) => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  useEffect(() => {
    document.title = `${title} · LDF Sign`;
  }, [title]);
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="border-b border-base-300/70 bg-base-100">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <button onClick={() => navigate("/")}>
            <Wordmark className="text-2xl" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="op-btn op-btn-ghost op-btn-sm"
          >
            <i className="fa-solid fa-arrow-left mr-1.5"></i> Home
          </button>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-base-content/50">Last updated: {updated}</p>

        <div className="mt-4 rounded-box border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-base-content/70">
          <i className="fa-solid fa-circle-info mr-1.5 text-warning"></i>
          This is a template. Review and adapt it with your legal counsel before
          relying on it.
        </div>

        <div className="mt-8 space-y-7">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-semibold">{`${i + 1}. ${s.heading}`}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-base-content/75">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-base-300">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-base-content/60 sm:flex-row">
          <Wordmark className="text-base" />
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/terms")} className="hover:text-base-content">
              Terms
            </button>
            <button onClick={() => navigate("/privacy")} className="hover:text-base-content">
              Privacy
            </button>
          </div>
        </div>
        <div className="pb-6 text-center text-xs text-base-content/40">
          © {year} Legal Data Forensic Sign. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
