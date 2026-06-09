import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, Activity, ShieldCheck, MessageSquare, BarChart3, Hospital, Zap, Users2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const stats = [
  { kpi: "62 min", label: "Avg wait skipped per visit" },
  { kpi: "14", label: "Hospitals in pilot · India" },
  { kpi: "98.4%", label: "On-time token accuracy" },
  { kpi: "2.4M", label: "Hours of corridor time saved" },
];

const cities = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune", "Jaipur", "Lucknow", "Chandigarh", "Vellore", "Gurugram"];

const Landing = () => {
  return (
    <div className="min-h-screen bg-bone" data-testid="landing-page">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-wide pt-16 pb-20 lg:pt-24 lg:pb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-7 animate-fade-up">
              <div className="flex items-center gap-2 mb-7">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                <span className="label-eyebrow text-olive/70">Live in 14 hospitals across India</span>
              </div>

              <h1 className="font-display text-[44px] sm:text-[64px] lg:text-[84px] leading-[0.95] text-olive font-medium tracking-[-0.025em]">
                Stop waiting <br/>
                in <span className="relative inline-block">
                  <span className="relative z-10">corridors.</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-terracotta/30" />
                </span><br/>
                Wait <em className="not-italic text-terracotta font-bold">where you live.</em>
              </h1>

              <p className="mt-8 text-[17px] lg:text-[19px] text-olive-ink/75 leading-relaxed max-w-2xl">
                DocQueue is real-time OPD queue management for Indian hospitals. Check in by SMS or
                WhatsApp, get a live token, and arrive only when your turn is near &mdash; not 3 hours earlier.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/hospitals" className="btn-terracotta inline-flex items-center gap-2 group" data-testid="hero-cta-primary">
                  Find a hospital near you
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/admin" className="btn-ghost-olive inline-flex items-center gap-2" data-testid="hero-cta-secondary">
                  <ShieldCheck className="w-4 h-4" /> I'm hospital staff
                </Link>
              </div>


            </div>

            {/* Founder Image */}
            <div className="lg:col-span-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="relative rounded-sm overflow-hidden shadow-2xl bg-white border border-olive/10">
                <img src="/founder.png" alt="PAVAN KUMAR - Founder of DocQueue" className="w-full h-[400px] object-cover" />
                <div className="p-6">
                  <p className="font-display text-olive text-[22px] leading-snug tracking-tight">
                    "Transforming healthcare, one queue at a time."
                  </p>
                  <p className="text-terracotta text-[14px] font-medium mt-3 uppercase tracking-wider">— PAVAN KUMAR, Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* City marquee */}
        <div className="border-y border-olive/10 bg-bone-muted/40 overflow-hidden">
          <div className="flex gap-12 py-4 animate-marquee whitespace-nowrap">
            {[...cities, ...cities].map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-olive/55 text-[13px] num tracking-wider">
                <MapPin className="w-3 h-3" /> {c.toUpperCase()}
                <span className="text-terracotta">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-wide py-24 lg:py-32" id="how">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="label-eyebrow text-terracotta">01 — The flow</p>
            <h2 className="font-display text-4xl lg:text-5xl text-olive mt-3 tracking-tight leading-[1.05]">
              From "is my number called?"<br />
              <span className="text-terracotta italic">to "I'm next."</span>
            </h2>
            <p className="text-olive-ink/70 mt-6 leading-relaxed max-w-md">
              Three steps. No app install required. Works on the simplest of Android phones with just SMS.
            </p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "Pick a hospital", d: "Browse a live congestion map of OPDs in your city. Tap a green one to skip the crowd.", icon: Hospital },
              { n: "02", t: "Check in remotely", d: "Send an SMS or use the web form. Get your token instantly with estimated wait time.", icon: MessageSquare },
              { n: "03", t: "Arrive on cue", d: "We ping you when 5 tokens remain. Walk in, get seen, walk out. No corridor sitting.", icon: Clock },
            ].map((s) => (
              <div key={s.n} className="bg-white hairline rounded-sm p-7 flex flex-col" data-testid={`step-${s.n}`}>
                <div className="flex items-center justify-between">
                  <span className="label-eyebrow text-olive/50">{s.n}</span>
                  <s.icon className="w-4 h-4 text-terracotta" strokeWidth={1.5} />
                </div>
                <p className="font-display text-olive text-2xl mt-6 leading-tight tracking-tight">{s.t}</p>
                <p className="text-olive-ink/70 text-[14.5px] mt-3 leading-relaxed flex-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROL ROOM PREVIEW */}
      <section className="container-wide pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <p className="label-eyebrow text-terracotta">02 — Built for staff</p>
            <h2 className="font-display text-4xl lg:text-5xl text-olive mt-3 tracking-tight leading-[1.05]">
              A control room for<br /> the OPD floor.
            </h2>
            <p className="text-olive-ink/70 mt-6 leading-relaxed">
              Front-desk staff and doctors get a dense, fast console. Call next. Skip. Mark done.
              Watch the live queue shrink. Pull daily stats without lifting a register.
            </p>
            <ul className="mt-8 space-y-3 text-[15px]">
              {[
                ["One-key actions", "Press space to call next, D to mark done."],
                ["Departments", "Multi-counter OPDs with shared waiting room."],
                ["Stats that matter", "Wait time P95, abandonment, throughput."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="num text-terracotta mt-1">→</span>
                  <div>
                    <p className="text-olive font-medium">{t}</p>
                    <p className="text-olive-ink/65 text-[14px]">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/admin" className="btn-olive mt-9 inline-flex items-center gap-2" data-testid="staff-console-cta">
              Open staff console <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-olive rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-bone/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-terracotta" />
                  <span className="text-bone/70 text-[12px] num">DOCQUEUE · ADMIN · AIIMS DELHI</span>
                </div>
                <span className="text-bone/50 text-[11px] num">14:32:08 IST</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-bone/10">
                {[
                  ["Waiting", "12", BarChart3, "text-bone"],
                  ["Now serving", "A-042", Activity, "text-terracotta"],
                  ["Done today", "087", Users2, "text-congestion-low"],
                ].map(([l, v, Icon, c]) => (
                  <div key={l} className="bg-olive px-5 py-5">
                    <div className="flex items-center justify-between">
                      <p className="label-eyebrow text-bone/45">{l}</p>
                      <Icon className="w-3.5 h-3.5 text-bone/40" />
                    </div>
                    <p className={`num font-display ${c} text-3xl mt-2 tracking-tight`}>{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-olive">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-bone/10 label-eyebrow text-bone/40 text-[10px]">
                  <span className="col-span-2">Token</span>
                  <span className="col-span-4">Patient</span>
                  <span className="col-span-3">Dept</span>
                  <span className="col-span-2">Wait</span>
                  <span className="col-span-1">Status</span>
                </div>
                {[
                  ["A-043", "Ravi K.", "General OPD", "00:02", "next", "text-terracotta"],
                  ["A-044", "Anita S.", "General OPD", "00:09", "wait", "text-bone/70"],
                  ["A-045", "Priya M.", "General OPD", "00:17", "wait", "text-bone/70"],
                  ["A-046", "Arjun P.", "General OPD", "00:24", "wait", "text-bone/70"],
                  ["A-047", "Neha G.", "General OPD", "00:32", "wait", "text-bone/70"],
                ].map((r) => (
                  <div key={r[0]} className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-bone/5 num text-[13px]">
                    <span className="col-span-2 text-bone font-medium">{r[0]}</span>
                    <span className="col-span-4 text-bone/85">{r[1]}</span>
                    <span className="col-span-3 text-bone/55">{r[2]}</span>
                    <span className="col-span-2 text-bone/70">{r[3]}</span>
                    <span className={`col-span-1 ${r[5]} text-[11px] uppercase tracking-wider`}>{r[4]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="container-wide pb-24">
        <div className="bg-olive rounded-sm overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-terracotta/15 blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-12 items-center p-10 lg:p-16 gap-10">
            <div className="md:col-span-8">
              <p className="label-eyebrow text-bone/55">Ready when you are</p>
              <h3 className="font-display text-bone text-4xl lg:text-5xl mt-3 leading-[1.05] tracking-tight">
                Your next hospital visit<br />doesn't have to start at 6 a.m.
              </h3>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <Link to="/hospitals" className="btn-terracotta text-base inline-flex items-center gap-2" data-testid="bottom-cta">
                Find your queue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
