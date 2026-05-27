import { Link, NavLink, useLocation } from "react-router-dom";
import { Activity, MapPin, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const navItems = [
    { to: "/hospitals", label: "Find Hospital", icon: MapPin },
    { to: "/track", label: "Track Token", icon: Activity },
    { to: "/admin", label: "Hospital Staff", icon: ShieldCheck },
  ];
  return (
    <header className="sticky top-0 z-40 bg-bone/85 backdrop-blur border-b border-olive/10" data-testid="navbar">
      <div className="container-wide flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <div className="relative w-8 h-8 grid place-items-center">
            <span className="absolute inset-0 bg-olive rounded-sm"></span>
            <span className="relative font-display font-semibold text-bone text-[15px] leading-none">D</span>
            <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[18px] font-semibold text-olive tracking-tight">DocQueue</span>
            <span className="label-eyebrow hidden sm:inline">/ India</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-sm text-[14px] font-medium tracking-tight transition-colors flex items-center gap-1.5
                ${isActive || loc.pathname.startsWith(n.to)
                  ? 'text-olive bg-bone-muted'
                  : 'text-olive/70 hover:text-olive hover:bg-bone-muted/60'}`
              }
            >
              <n.icon className="w-3.5 h-3.5" strokeWidth={2} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/hospitals" className="btn-terracotta text-[13px] py-2.5 px-4" data-testid="nav-cta-checkin">
            Check in now
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-olive"
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-olive/10 bg-bone">
          <div className="container-wide py-3 flex flex-col gap-1">
            {navItems.map(n => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2.5 text-olive font-medium flex items-center gap-2"
                data-testid={`nav-mobile-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <n.icon className="w-4 h-4" /> {n.label}
              </Link>
            ))}
            <Link to="/hospitals" onClick={() => setOpen(false)} className="btn-terracotta text-center mt-2" data-testid="nav-mobile-cta">
              Check in now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
