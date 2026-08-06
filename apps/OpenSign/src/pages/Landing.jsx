import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ldfLogo from "../assets/images/legaldata-logo.png";
import "../styles/signature.css"; // bundled script fonts for the mockup

// Public marketing landing for LDF Sign at "/". Login is at "/login".
// Logged-in visitors are bounced to their dashboard. Self-contained (no
// external assets), theme-aware for the content sections; the hero and the
// security band are intentionally dark in both themes for drama. English v1.

const NAV = [
  ["Features", "features"],
  ["How it works", "how"],
  ["Security", "security"],
  ["Pricing", "pricing"],
  ["FAQ", "faq"]
];

const FEATURES = [
  { icon: "fa-pen-nib", title: "Legally binding signatures", body: "Draw, type, or upload your signature. Every completed document is sealed with a tamper-evident digital signature." },
  { icon: "fa-file-lines", title: "Reusable templates", body: "Turn any document into a template with pre-placed fields and signer roles — then send it in seconds, again and again." },
  { icon: "fa-paper-plane", title: "Bulk send", body: "Send one document to many recipients at once, each with their own fields, and track every one from a single view." },
  { icon: "fa-shield-halved", title: "Audit trail & certificate", body: "Every action is logged. Each finished document carries a Certificate of Completion with signer identity, time, and IP." },
  { icon: "fa-users", title: "Team collaboration", body: "Invite your team, share templates and contacts, and keep everyone's documents organized under one organization." },
  { icon: "fa-lock", title: "Private by default", body: "Your documents are yours. Files are kept private and never handed off to a third-party signing service." }
];

const STEPS = [
  { icon: "fa-arrow-up-from-bracket", title: "Upload", body: "Drop in a PDF or start from a saved template." },
  { icon: "fa-user-plus", title: "Add signers", body: "Place signature, date, and text fields, then choose who signs where." },
  { icon: "fa-circle-check", title: "Sign & track", body: "Recipients sign from any device. Watch progress and download the sealed copy." }
];

const PLANS = [
  { name: "Free", price: "₹0", cadence: "to get started", docs: "30 documents", highlight: false, features: ["Single user", "Signature templates", "Audit trail & certificate", "Email notifications"] },
  { name: "Pro", price: "Contact us", cadence: "for growing needs", docs: "300 documents", highlight: true, features: ["Everything in Free", "Higher document volume", "Bulk send", "Priority support"] },
  { name: "Org", price: "Contact us", cadence: "for teams", docs: "1,000 documents", highlight: false, features: ["Everything in Pro", "Multiple team members", "Shared templates & contacts", "Organization admin"] }
];

const FAQS = [
  { q: "Are documents signed with LDF Sign legally valid?", a: "Yes. Completed documents are sealed with a digital signature and accompanied by a Certificate of Completion recording each signer's identity, timestamp, and IP address — an auditable record of the signing event." },
  { q: "Do recipients need an account to sign?", a: "No. Signers receive a secure link and can sign from any device without creating an account. Only senders need an account." },
  { q: "Where are my documents stored?", a: "Documents are kept private and are never handed to a shared third-party signing service, so your data stays under your control." },
  { q: "Can I try it for free?", a: "Yes — create an account and start on the Free plan with 30 documents. Upgrade whenever you need more volume or team members." }
];

const Wordmark = ({ dark }) => (
  <span className="text-2xl font-extrabold tracking-tight">
    <span style={dark ? { color: "#E0645F" } : undefined} className={dark ? "" : "text-primary"}>
      LDF
    </span>{" "}
    <span className={dark ? "text-white" : "text-base-content"}>Sign</span>
  </span>
);

// The floating "signed document" mockup in the hero.
const DocMockup = () => (
  <div className="relative mx-auto w-full max-w-md">
    {/* back card for depth */}
    <div className="absolute inset-0 translate-x-4 translate-y-5 rotate-3 rounded-2xl bg-white/10" />
    {/* main document card */}
    <div className="relative -rotate-2 rounded-2xl bg-white p-5 shadow-2xl shadow-black/40 ring-1 ring-black/5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7A1A1A]/10">
            <i className="fa-solid fa-file-contract text-sm text-[#7A1A1A]"></i>
          </span>
          <span className="text-sm font-semibold text-slate-800">Service Agreement.pdf</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
          <i className="fa-solid fa-circle-check"></i> Completed
        </span>
      </div>
      <div className="space-y-2 py-4">
        <div className="h-2 w-full rounded bg-slate-100" />
        <div className="h-2 w-11/12 rounded bg-slate-100" />
        <div className="h-2 w-3/4 rounded bg-slate-100" />
      </div>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3">
        <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Signature
        </div>
        <div
          className="mt-1 text-3xl text-slate-800"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Aarav Sharma
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
          <i className="fa-solid fa-lock text-emerald-500"></i>
          Signed · {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
    {/* floating certificate seal */}
    <div className="absolute -bottom-5 -right-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-xl ring-1 ring-black/5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white">
        <i className="fa-solid fa-award"></i>
      </span>
      <div className="leading-tight">
        <div className="text-[11px] font-bold text-slate-800">Certificate</div>
        <div className="text-[9px] text-slate-400">of Completion</div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = "LDF Sign — Send, sign & seal documents";
    if (localStorage.getItem("accesstoken")) {
      const landing = localStorage.getItem("PageLanding");
      navigate(landing ? `/dashboard/${landing}` : "/dashboard/35KBoSgoAK", {
        replace: true
      });
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const year = new Date().getFullYear();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-base-100 text-base-content">
      <style>{`
        @keyframes ldfFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes ldfPulse { 0%,100%{opacity:.35} 50%{opacity:.6} }
        .ldf-float{ animation: ldfFloat 6s ease-in-out infinite; }
        .ldf-orb{ animation: ldfPulse 7s ease-in-out infinite; }
        .ldf-grid{ background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px); background-size:44px 44px; -webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000 40%,transparent 100%); mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000 40%,transparent 100%); }
      `}</style>

      {/* ---- Nav (transparent over hero, solid on scroll) ---- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-base-300/70 bg-base-100/90 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Legal Data Forensic Sign"
          >
            <img
              src={ldfLogo}
              alt="Legal Data Forensic Sign"
              className="h-20 w-auto object-contain"
            />
          </button>
          <div className="hidden items-center gap-7 md:flex">
            {NAV.map(([label, id]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-base-content/70 hover:text-base-content"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className={`op-btn op-btn-sm op-btn-ghost ${
                scrolled ? "" : "text-white hover:bg-white/10"
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="op-btn op-btn-sm op-btn-primary shadow-lg shadow-[#7A1A1A]/30"
            >
              Get started
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Hero (dark, dramatic) ---- */}
      <section className="relative overflow-hidden bg-[#100809] pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1c0a0b] via-[#100809] to-[#0a0710]" />
        <div className="ldf-orb absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#B23A3A]/40 blur-[130px]" />
        <div className="ldf-orb absolute -right-24 top-10 h-[26rem] w-[26rem] rounded-full bg-[#D4AF37]/20 blur-[130px]" style={{ animationDelay: "1.5s" }} />
        <div className="ldf-grid absolute inset-0" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-[#E8C874] backdrop-blur">
              <i className="fa-solid fa-shield-halved"></i>
              Secure e-signatures, on your own terms
            </div>
            <h1 className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
              Send, sign &amp;{" "}
              <span className="bg-gradient-to-r from-[#E0645F] via-[#E8A24E] to-[#D4AF37] bg-clip-text text-transparent">
                seal
              </span>{" "}
              documents in minutes
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/60 md:text-lg lg:mx-0">
              A secure e-signature platform for legally binding agreements —
              with templates, bulk send, a full audit trail, and a Certificate of
              Completion on every document.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <button
                onClick={() => navigate("/signup")}
                className="op-btn op-btn-primary op-btn-md w-full shadow-xl shadow-[#7A1A1A]/40 sm:w-auto"
              >
                Create your free account
                <i className="fa-solid fa-arrow-right ml-1"></i>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="op-btn op-btn-md w-full border border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                Log in
              </button>
            </div>
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-white/40 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-check text-emerald-400"></i> 30 free documents
              </span>
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-check text-emerald-400"></i> No card required
              </span>
            </div>
          </div>

          <div className="ldf-float">
            <DocMockup />
          </div>
        </div>
      </section>

      {/* ---- Value strip ---- */}
      <section className="border-b border-base-300 bg-base-200/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4">
          {[
            ["fa-bolt", "Sign in minutes"],
            ["fa-file-shield", "Tamper-evident"],
            ["fa-infinity", "No per-seat fees"],
            ["fa-mobile-screen", "Sign on any device"]
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center justify-center gap-2.5 text-sm font-medium">
              <i className={`fa-solid ${icon} text-primary`}></i>
              <span className="text-base-content/80">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Everything you need
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            A complete signing workflow
          </h2>
          <p className="mt-4 text-base-content/60">
            Without the per-seat pricing or your data leaving your control.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#a83232] text-white shadow-lg shadow-primary/20">
                <i className={`fa-solid ${f.icon} text-lg`}></i>
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-base-content/65">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How it works ---- */}
      <section id="how" className="scroll-mt-20 border-y border-base-300 bg-base-200/40">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
              How it works
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Three steps to a signed document
            </h2>
          </div>
          <div className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#5c1414] text-white shadow-xl shadow-primary/25">
                  <i className={`fa-solid ${s.icon} text-xl`}></i>
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4AF37] text-xs font-bold text-[#3a2a00] ring-4 ring-base-200">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-base-content/65">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Security (dark, bold) ---- */}
      <section id="security" className="relative scroll-mt-20 overflow-hidden bg-[#100809] py-20 md:py-28">
        <div className="ldf-orb absolute right-0 top-0 h-96 w-96 rounded-full bg-[#7A1A1A]/40 blur-[120px]" />
        <div className="ldf-orb absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[#D4AF37]/15 blur-[120px]" style={{ animationDelay: "2s" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-2">
          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-widest text-[#E8C874]">
              Built for trust
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Every signature, provable
            </h2>
            <p className="mt-4 text-white/55">
              Every signing event is recorded and every finished document is
              verifiable — so an agreement holds up long after it's signed.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Tamper-evident digital signature on every completed PDF",
                "Certificate of Completion with signer identity, time & IP",
                "Independent signature verification, built in",
                "Documents kept private, never shared with third parties"
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white shadow-lg">
                <i className="fa-solid fa-file-shield text-lg"></i>
              </span>
              <div>
                <div className="font-bold text-white">Certificate of Completion</div>
                <div className="text-xs text-white/40">Attached to every signed document</div>
              </div>
            </div>
            <div className="mt-5 space-y-3.5 text-sm">
              {[
                ["Document ID", "Unique reference"],
                ["Signers", "Name · email · IP"],
                ["Timestamps", "Viewed & signed"],
                ["Document hash", "SHA-256"]
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-white/40">{k}</span>
                  <span className="font-medium text-white/90">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Pricing ---- */}
      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            Pricing
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Simple, document-based plans
          </h2>
          <p className="mt-4 text-base-content/60">
            Start free. Upgrade for more volume or to bring your team along.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:items-center">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl p-7 ${
                p.highlight
                  ? "bg-[#140909] text-white shadow-2xl shadow-primary/20 md:scale-[1.05] md:py-9"
                  : "border border-base-300 bg-base-100"
              }`}
            >
              {p.highlight && (
                <>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#B23A3A]/25 to-[#D4AF37]/10" />
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-3 py-1 text-xs font-bold text-[#3a2a00]">
                    Most popular
                  </span>
                </>
              )}
              <div className="relative">
                <div className={`text-lg font-bold ${p.highlight ? "text-white" : ""}`}>{p.name}</div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className={`text-xs ${p.highlight ? "text-white/50" : "text-base-content/50"}`}>{p.cadence}</span>
                </div>
                <div className={`mt-1 text-sm font-semibold ${p.highlight ? "text-[#E8C874]" : "text-primary"}`}>
                  {p.docs}
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <i className={`fa-solid fa-check mt-0.5 ${p.highlight ? "text-[#E8C874]" : "text-emerald-500"}`}></i>
                      <span className={p.highlight ? "text-white/85" : "text-base-content/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/signup")}
                  className={`op-btn mt-7 w-full ${
                    p.highlight
                      ? "border-0 bg-white text-[#7A1A1A] hover:bg-white/90"
                      : "op-btn-outline"
                  }`}
                >
                  {p.name === "Free" ? "Get started" : "Start free, upgrade later"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 md:py-28">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-tight md:text-5xl">
          Questions, answered
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                openFaq === i ? "border-primary/40 bg-primary/[0.03]" : "border-base-300 bg-base-100"
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold">{f.q}</span>
                <i
                  className={`fa-solid fa-chevron-down shrink-0 text-primary transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                ></i>
              </button>
              {openFaq === i && (
                <p className="px-5 pb-5 text-sm text-base-content/70">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ---- Final CTA (dramatic) ---- */}
      <section className="px-5 pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#100809] px-6 py-16 text-center md:py-20">
          <div className="ldf-orb absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#B23A3A]/40 blur-[100px]" />
          <div className="ldf-orb absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-[100px]" style={{ animationDelay: "1s" }} />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Get your first document signed today
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/55">
              Create a free account and send your first signature request in minutes.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="op-btn op-btn-md mt-8 border-0 bg-white text-[#7A1A1A] shadow-xl hover:bg-white/90"
            >
              Create your free account
              <i className="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-base-300">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-base-content/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <Wordmark />
            <span className="hidden text-base-content/40 sm:inline">· Legal Data Forensic Sign</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/terms")} className="hover:text-base-content">Terms</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-base-content">Privacy</button>
            <button onClick={() => navigate("/login")} className="hover:text-base-content">Log in</button>
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
