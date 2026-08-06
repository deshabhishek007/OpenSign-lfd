import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Public marketing landing page for LDF Sign, served at "/". Login lives at
// "/login". Logged-in visitors are bounced to their dashboard so they never
// see marketing while authenticated. Theme-aware (light/dark) via DaisyUI
// tokens; copy is English v1 (not wired through i18next yet — the app UI
// stays localized, the public landing is a separate, later i18n concern).

const Wordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`}>
    <span className="text-primary">LDF</span> <span>Sign</span>
  </span>
);

const FEATURES = [
  {
    icon: "fa-pen-nib",
    title: "Legally binding signatures",
    body: "Draw, type, or upload your signature. Every completed document is sealed with a tamper-evident digital signature."
  },
  {
    icon: "fa-file-lines",
    title: "Reusable templates",
    body: "Turn any document into a template with pre-placed fields and signer roles — then send it in seconds, again and again."
  },
  {
    icon: "fa-paper-plane",
    title: "Bulk send",
    body: "Send the same document to many recipients at once, each with their own fields, and track every one from a single view."
  },
  {
    icon: "fa-shield-halved",
    title: "Audit trail & certificate",
    body: "Every action is logged. Each finished document carries a Certificate of Completion with signer identity, time, and IP."
  },
  {
    icon: "fa-users",
    title: "Team collaboration",
    body: "Invite your team, share templates and contacts, and keep everyone's documents organized under one organization."
  },
  {
    icon: "fa-lock",
    title: "Private by default",
    body: "Your documents are yours. Files are stored on your own infrastructure — not handed off to a third-party service."
  }
];

const STEPS = [
  {
    icon: "fa-arrow-up-from-bracket",
    title: "Upload",
    body: "Drop in a PDF or start from a saved template."
  },
  {
    icon: "fa-user-plus",
    title: "Add signers",
    body: "Place signature, date, and text fields, then choose who signs where."
  },
  {
    icon: "fa-circle-check",
    title: "Sign & track",
    body: "Recipients sign from any device. Watch progress and download the sealed copy."
  }
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    cadence: "to get started",
    docs: "30 documents",
    highlight: false,
    features: ["Single user", "Signature templates", "Audit trail & certificate", "Email notifications"]
  },
  {
    name: "Pro",
    price: "Contact us",
    cadence: "for growing needs",
    docs: "300 documents",
    highlight: true,
    features: ["Everything in Free", "Higher document volume", "Bulk send", "Priority support"]
  },
  {
    name: "Org",
    price: "Contact us",
    cadence: "for teams",
    docs: "1,000 documents",
    highlight: false,
    features: ["Everything in Pro", "Multiple team members", "Shared templates & contacts", "Organization admin"]
  }
];

const FAQS = [
  {
    q: "Are documents signed with LDF Sign legally valid?",
    a: "Yes. Completed documents are sealed with a digital signature and accompanied by a Certificate of Completion recording each signer's identity, timestamp, and IP address — an auditable record of the signing event."
  },
  {
    q: "Do recipients need an account to sign?",
    a: "No. Signers receive a secure link and can sign from any device without creating an account. Only senders need an account."
  },
  {
    q: "Where are my documents stored?",
    a: "Documents are stored on this deployment's own infrastructure rather than a shared third-party service, so your data stays under your control."
  },
  {
    q: "Can I try it for free?",
    a: "Yes — create an account and start on the Free plan with 30 documents. Upgrade whenever you need more volume or team members."
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  // Bounce authenticated visitors straight to their dashboard.
  useEffect(() => {
    document.title = "LDF Sign — Send, sign & seal documents";
    if (localStorage.getItem("accesstoken")) {
      const landing = localStorage.getItem("PageLanding");
      navigate(landing ? `/dashboard/${landing}` : "/dashboard/35KBoSgoAK", {
        replace: true
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      {/* ---- Nav ---- */}
      <header className="sticky top-0 z-40 border-b border-base-300/70 bg-base-100/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Wordmark className="text-2xl" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="op-btn op-btn-ghost op-btn-sm"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="op-btn op-btn-primary op-btn-sm"
            >
              Get started
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.07] to-transparent" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <i className="fa-solid fa-shield-halved"></i>
            Secure e-signatures, on your own terms
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Send, sign, and seal
            <br className="hidden md:block" /> documents in minutes
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-base-content/70 md:text-lg">
            <Wordmark /> is a self-hosted e-signature platform for legally
            binding agreements — with templates, bulk send, a full audit trail,
            and a Certificate of Completion on every document.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/signup")}
              className="op-btn op-btn-primary op-btn-md w-full sm:w-auto"
            >
              Create your free account
            </button>
            <button
              onClick={() => navigate("/login")}
              className="op-btn op-btn-outline op-btn-md w-full sm:w-auto"
            >
              Log in
            </button>
          </div>
          <p className="mt-4 text-xs text-base-content/50">
            Free plan includes 30 documents · No card required
          </p>
        </div>
      </section>

      {/* ---- Features ---- */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to close the deal
          </h2>
          <p className="mt-3 text-base-content/70">
            A complete signing workflow, without the per-seat pricing or the
            data leaving your control.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-box border border-base-300 bg-base-100 p-6 transition-colors hover:border-primary/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <i className={`fa-solid ${f.icon} text-lg text-primary`}></i>
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-base-content/70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section className="border-y border-base-300 bg-base-200/50">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Three steps to a signed document
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-content">
                  <i className={`fa-solid ${s.icon} text-xl`}></i>
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-base-300 bg-base-100 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-base-content/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Security band ---- */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built for trust
            </h2>
            <p className="mt-3 text-base-content/70">
              Every signing event is recorded and every finished document is
              verifiable — so an agreement holds up long after it's signed.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Tamper-evident digital signature on every completed PDF",
                "Certificate of Completion with signer identity, time & IP",
                "Independent signature verification, built in",
                "Documents stored on your own infrastructure"
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <i className="fa-solid fa-circle-check mt-0.5 text-success"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-box border border-base-300 bg-base-200/40 p-8">
            <div className="flex items-center gap-3 border-b border-base-300 pb-4">
              <i className="fa-solid fa-file-shield text-2xl text-primary"></i>
              <div>
                <div className="font-semibold">Certificate of Completion</div>
                <div className="text-xs text-base-content/60">
                  Attached to every signed document
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              {[
                ["Document ID", "Unique reference"],
                ["Signers", "Name · email · IP"],
                ["Timestamps", "Viewed & signed"],
                ["Document hash", "SHA-256"]
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-base-content/60">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section
        id="pricing"
        className="border-y border-base-300 bg-base-200/50"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple, document-based plans
            </h2>
            <p className="mt-3 text-base-content/70">
              Start free. Upgrade for more volume or to bring your team along.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-box border bg-base-100 p-6 ${
                  p.highlight
                    ? "border-primary shadow-lg"
                    : "border-base-300"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-content">
                    Most popular
                  </span>
                )}
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold">{p.price}</span>
                  <span className="text-xs text-base-content/60">
                    {p.cadence}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-primary">
                  {p.docs}
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <i className="fa-solid fa-check mt-0.5 text-success"></i>
                      <span className="text-base-content/80">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className={`op-btn op-btn-sm mt-6 ${
                    p.highlight ? "op-btn-primary" : "op-btn-outline"
                  }`}
                >
                  {p.name === "Free" ? "Get started" : "Start free, upgrade later"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mx-auto max-w-3xl px-5 py-16 md:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-base-300 border-y border-base-300">
          {FAQS.map((f, i) => (
            <div key={f.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-medium">{f.q}</span>
                <i
                  className={`fa-solid fa-chevron-down shrink-0 text-base-content/50 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                ></i>
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm text-base-content/70">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA band ---- */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-5xl rounded-box bg-primary px-6 py-14 text-center text-primary-content">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to get your first document signed?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-content/80">
            Create a free account and send your first signature request today.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="op-btn op-btn-md mt-7 border-0 bg-base-100 text-primary hover:bg-base-100/90"
          >
            Create your free account
          </button>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-base-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-base-content/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <Wordmark className="text-lg" />
            <span className="hidden sm:inline">· Legal Data Forensic Sign</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-base-content"
            >
              Terms
            </button>
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-base-content"
            >
              Privacy
            </button>
            <button
              onClick={() => navigate("/login")}
              className="hover:text-base-content"
            >
              Log in
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

export default Landing;
