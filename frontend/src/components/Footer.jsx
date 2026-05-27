import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-olive/10 mt-24 bg-bone-muted/40" data-testid="footer">
      <div className="container-wide py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 grid place-items-center bg-olive rounded-sm">
              <span className="text-bone font-display font-semibold text-sm">D</span>
            </div>
            <span className="font-display text-[17px] font-semibold text-olive">DocQueue</span>
          </div>
          <p className="mt-4 text-olive-ink/70 max-w-md leading-relaxed text-[15px]">
            Wayfinding for India's healthcare. Skip the corridor wait, track your OPD turn in real time,
            and arrive exactly when you're needed.
          </p>
          <p className="mt-6 label-eyebrow">Civic-tech for hospitals · Est. 2026</p>
        </div>

        <div className="md:col-span-2">
          <p className="label-eyebrow mb-4">For Patients</p>
          <ul className="space-y-2.5 text-[14px] text-olive-ink/80">
            <li><Link to="/hospitals" className="hover:text-terracotta">Find Hospital</Link></li>
            <li><Link to="/track" className="hover:text-terracotta">Track Token</Link></li>
            <li><a href="#" className="hover:text-terracotta">SMS Check-in</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="label-eyebrow mb-4">For Hospitals</p>
          <ul className="space-y-2.5 text-[14px] text-olive-ink/80">
            <li><Link to="/admin" className="hover:text-terracotta">Staff Console</Link></li>
            <li><a href="#" className="hover:text-terracotta">API Docs</a></li>
            <li><a href="#" className="hover:text-terracotta">Onboarding</a></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label-eyebrow mb-4">Reach us</p>
          <p className="text-[14px] text-olive-ink/80">hello@docqueue.in</p>
          <p className="text-[14px] text-olive-ink/80">+91 80 4567 8910</p>
          <p className="mt-6 text-[12px] text-olive-ink/50 num">
            © 2026 DocQueue · v1.0 · made in Bengaluru
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
