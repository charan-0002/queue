# DocQueue Frontend Source Code

This file contains a complete dump of the React frontend codebase.

## index.html

`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DocQueue - Real-Time Hospital Queue</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

`

## package.json

`json
{
  "name": "docqueue-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "leaflet": "^1.9.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.15.0",
    "socket.io-client": "^4.7.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@radix-ui/react-slot": "^1.2.4",
    "@tailwindcss/postcss": "^4.3.0",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.5.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "framer-motion": "^12.39.0",
    "lucide-react": "^1.16.0",
    "postcss": "^8.5.15",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tailwindcss": "^3.4.19",
    "vite": "^4.4.5"
  }
}

`

## postcss.config.js

`javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

`

## src\App.css

`css
.App { min-height: 100vh; }

`

## src\App.jsx

`jsx
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Landing from "./pages/Landing";
import HospitalsPage from "./pages/HospitalsPage";
import CheckinPage from "./pages/CheckinPage";
import TrackPage from "./pages/TrackPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/checkin/:hospitalId" element={<CheckinPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:token" element={<TrackPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/:hospitalId" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A3631",
            color: "#F7F6F3",
            border: "1px solid rgba(247, 246, 243, 0.15)",
            borderRadius: "4px",
            fontFamily: "IBM Plex Sans, sans-serif",
          },
        }}
      />
    </div>
  );
}

export default App;

`

## src\components\CongestionBadge.jsx

`jsx
const MAP = {
  low: { label: "Low traffic", dot: "bg-congestion-low", text: "text-congestion-low", bg: "bg-congestion-low/10" },
  medium: { label: "Moderate", dot: "bg-congestion-medium", text: "text-congestion-medium", bg: "bg-congestion-medium/10" },
  high: { label: "Crowded", dot: "bg-congestion-high", text: "text-congestion-high", bg: "bg-congestion-high/10" },
};

export const CongestionBadge = ({ level = "low", size = "md" }) => {
  const m = MAP[level] || MAP.low;
  const padding = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm font-medium tracking-tight ${m.bg} ${m.text} ${padding}`}
      data-testid={`congestion-${level}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

export default CongestionBadge;

`

## src\components\Footer.jsx

`jsx
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

`

## src\components\IndiaHeatmap.jsx

`jsx
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons if needed, but we'll use custom div icons
function MapUpdater({ selectedId, hospitals }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId && hospitals) {
      const selected = hospitals.find(h => h.id === selectedId);
      if (selected) {
        map.flyTo([selected.lat, selected.lng], 13, { duration: 1.5 });
      }
    } else if (hospitals.length > 0 && !selectedId) {
      // Fit all markers
      const group = L.featureGroup(
        hospitals.map(h => L.marker([h.lat, h.lng]))
      );
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [selectedId, hospitals, map]);
  return null;
}

const hospitalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // hospital pin icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const IndiaHeatmap = ({ hospitals, selectedId, onSelect }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="w-full h-full bg-bone-muted/40 animate-pulse rounded-sm" />;

  // Default center to roughly the center of India
  const center = [22.9, 78.9];

  return (
    <div className="w-full h-full min-h-[500px] lg:min-h-[640px] bg-white rounded-sm overflow-hidden border border-olive/10 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater selectedId={selectedId} hospitals={hospitals} />
        
        {hospitals.map((h) => (
          <Marker 
            key={h.id} 
            position={[h.lat, h.lng]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onSelect(h)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <p className="font-display font-medium text-[15px] text-olive leading-tight">🏥 {h.name}</p>
                <p className="text-[12px] text-olive/60 mt-0.5">📍 {h.address}</p>
                
                <div className="mt-3 p-2 bg-bone-muted/40 rounded-sm border border-olive/10 text-[11px] font-mono text-olive/80">
                  <div className="flex items-center gap-1.5"><span className="opacity-70">🔑 Login:</span> <strong>{h.loginId}</strong></div>
                  <div className="flex items-center gap-1.5 mt-0.5"><span className="opacity-70">🔒 Pass:</span> <strong>{h.passkey}</strong></div>
                </div>

                <div className="mt-3 pt-2 border-t border-olive/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-olive/50 uppercase tracking-wider block">Waiting</span>
                    <span className="font-medium text-olive text-[13px]">{h.stats?.waiting || 0}</span>
                  </div>
                  <div>
                    <span className="text-olive/50 uppercase tracking-wider block">Wait Time</span>
                    <span className="font-medium text-terracotta text-[13px]">{h.stats?.avg_wait_minutes || 0}m avg</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IndiaHeatmap;

`

## src\components\Navbar.jsx

`jsx
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

`

## src\components\ui\button.jsx

`jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow hover:bg-accent-hover",
        destructive:
          "bg-heatmap_status-high text-white shadow-sm hover:bg-heatmap_status-high/90",
        outline:
          "border border-accent bg-transparent text-accent shadow-sm hover:bg-accent hover:text-white",
        secondary:
          "bg-primary text-white shadow-sm hover:bg-primary-hover",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

`

## src\components\ui\card.jsx

`jsx
import * as React from "react"
import { cn } from "./button"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-surface text-text_main shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-8 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading font-medium leading-none tracking-tight text-primary", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text_muted", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-8 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

`

## src\index.css

`css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 50 20% 96%;        /* #F7F6F3 bone */
    --foreground: 150 15% 11%;       /* near olive ink */
    --card: 0 0% 100%;
    --card-foreground: 150 15% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 150 15% 11%;
    --primary: 168 36% 16%;          /* deep olive #1A3631 */
    --primary-foreground: 50 20% 96%;
    --secondary: 45 17% 92%;
    --secondary-foreground: 168 36% 16%;
    --muted: 45 17% 92%;
    --muted-foreground: 140 4% 40%;
    --accent: 14 67% 53%;            /* terracotta */
    --accent-foreground: 50 20% 96%;
    --destructive: 8 58% 50%;
    --destructive-foreground: 50 20% 96%;
    --border: 42 14% 87%;
    --input: 42 14% 87%;
    --ring: 14 67% 53%;
    --radius: 0.375rem;
  }
}

@layer base {
  * { @apply border-border; }
  html, body {
    background-color: #F5F0E8;
    color: hsl(var(--foreground));
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3, h4 { font-family: 'Outfit', system-ui, sans-serif; letter-spacing: -0.01em; }
  ::selection { background: #1B3A35; color: #F5F0E8; }
}

@layer components {
  .container-wide { @apply max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12; }
  .container-tight { @apply max-w-[1100px] mx-auto px-6 sm:px-8; }
  .label-eyebrow {
    @apply text-[11px] uppercase tracking-[0.22em] font-medium;
    color: #1C1F1E99;
    font-family: 'IBM Plex Mono', monospace;
  }
  .hairline {
    @apply border-[0.5px];
    border-color: #1B3A3526;
  }
  .num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
  .btn-terracotta {
    @apply px-5 py-3 rounded-sm font-medium tracking-tight transition-all;
    background-color: #C8442A;
    color: #ffffff;
  }
  .btn-terracotta:hover { background: #A63822; transform: translateY(-1px); }
  .btn-olive {
    @apply px-5 py-3 rounded-sm font-medium tracking-tight transition-all;
    background-color: #1B3A35;
    color: #F5F0E8;
  }
  .btn-olive:hover { background: #132724; }
  .btn-ghost-olive {
    @apply px-5 py-3 rounded-sm font-medium tracking-tight transition-all bg-transparent;
    color: #1B3A35;
    border: 1px solid #1B3A354D;
  }
  .btn-ghost-olive:hover { background: #EFECE7; }
}

@layer base {
  [data-debug-wrapper="true"] { display: contents !important; }
}

/* LEAFLET OVERRIDES */
.leaflet-container {
  font-family: inherit;
  background-color: #F5F0E8 !important;
}
.leaflet-popup-content-wrapper {
  border-radius: 4px;
  box-shadow: 0 10px 25px -5px rgba(27, 58, 53, 0.2);
  border: 1px solid rgba(27, 58, 53, 0.1);
}
.leaflet-popup-content {
  margin: 12px 14px;
}
.leaflet-popup-tip {
  background-color: white;
  box-shadow: none;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(200, 68, 42, 0.5);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(200, 68, 42, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(200, 68, 42, 0);
  }
}

`

## src\lib\api.js

`javascript
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://queue-24ej.onrender.com";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ 
  baseURL: API,
  headers: {
    'Bypass-Tunnel-Reminder': 'true' // In case localtunnel is used
  }
});

api.interceptors.request.use((config) => {
  const session = localStorage.getItem("docqueue_session");
  if (session) {
    const { token } = JSON.parse(session);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const listHospitals = (params) => api.get("/hospitals", { params }).then(r => r.data);
export const getHospital = (id) => api.get(`/hospitals/${id}`).then(r => r.data);
export const checkin = (id, payload) => api.post(`/patients/checkin`, { ...payload, hospitalId: id }).then(r => r.data);
export const trackToken = (token) => api.get(`/queue/${token}`).then(r => r.data);
export const adminQueue = (id) => api.get(`/hospitals/${id}/queue`).then(r => r.data);
export const callEntry = (entryId) => api.put(`/hospitals/advance`, { patientId: entryId, newStatus: 'in-consultation' }).then(r => r.data);
export const completeEntry = (entryId) => api.put(`/hospitals/advance`, { patientId: entryId, newStatus: 'completed' }).then(r => r.data);
export const skipEntry = (entryId) => api.delete(`/patients/${entryId}/leave`).then(r => r.data);
export const deleteEntry = (entryId) => api.delete(`/patients/${entryId}`).then(r => r.data);
export const updateHospitalSettings = (id, payload) => api.put(`/hospitals/${id}/settings`, payload).then(r => r.data);
export const listCities = () => api.get("/cities").then(r => r.data);
export const listSpecialties = () => api.get("/specialties").then(r => r.data);
export const login = (credentials) => api.post("/auth/login", credentials).then(r => r.data);
export const registerHospital = (hospitalData) => api.post("/hospitals/register", hospitalData).then(r => r.data);

`

## src\main.jsx

`jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

`

## src\pages\AdminDashboard.jsx

`jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem('hospitalId');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token || !hospitalId) {
      navigate('/admin/login');
      return;
    }

    const fetchQueue = async () => {
      try {
        const res = await axios.get(`https://queue-24ej.onrender.com/api/hospitals/${hospitalId}/queue`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQueue();

    const socket = io('https://queue-24ej.onrender.com');
    socket.emit('join_hospital_room', hospitalId);
    
    socket.on('queue_update', () => {
      fetchQueue();
    });

    return () => socket.disconnect();
  }, [hospitalId, token, navigate]);

  const advanceQueue = async (patientId, newStatus) => {
    try {
      await axios.put('https://queue-24ej.onrender.com/api/queue/advance', 
        { patientId, newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('hospitalId');
    navigate('/admin/login');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Hospital Queue Management</h2>
        <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        {patients.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No patients currently in queue.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Token</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Phone</th>
                <th style={{ padding: '1rem' }}>Department</th>
                <th style={{ padding: '1rem' }}>Time In</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem' }}><strong style={{ color: 'var(--accent)' }}>{p.tokenNumber}</strong></td>
                  <td style={{ padding: '1rem' }}>{p.name}</td>
                  <td style={{ padding: '1rem' }}>{p.phone}</td>
                  <td style={{ padding: '1rem' }}>{p.department}</td>
                  <td style={{ padding: '1rem' }}>{new Date(p.checkInTime).toLocaleTimeString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => advanceQueue(p._id, 'in-consultation')}>
                        Call In
                      </button>
                      <button className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => advanceQueue(p._id, 'completed')}>
                        Done
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

`

## src\pages\AdminLogin.jsx

`jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://queue-24ej.onrender.com/api/auth/login', formData);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('hospitalId', res.data.admin.hospital._id);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Hospital Admin</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" className="form-control" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Login</button>
        </form>
      </div>
    </div>
  );
}

`

## src\pages\AdminPage.jsx

`jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Search, ArrowRight, ShieldCheck, Activity, Users2, BarChart3, 
  CheckCircle2, SkipForward, BellRing, Loader2, RefreshCw,
  Lock, User, Hospital, Plus, LogOut, Key, Check, MapPin, Eye, EyeOff, Trash2
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CongestionBadge from "../components/CongestionBadge";
import { adminQueue, listHospitals, callEntry, completeEntry, skipEntry, deleteEntry, login, registerHospital, updateHospitalSettings } from "../lib/api";
import { toast } from "sonner";
import { io } from "socket.io-client";

const AdminPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("docqueue_session");
    return saved ? JSON.parse(saved) : null;
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Hospital states
  const [hospitals, setHospitals] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [editingDeptTime, setEditingDeptTime] = useState(null);
  const [newDeptTime, setNewDeptTime] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);

  // Register state
  const [registering, setRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regCity, setRegCity] = useState("Bengaluru");
  const [regState, setRegState] = useState("Karnataka");
  const [regAddress, setRegAddress] = useState("");
  const [regSpecialty, setRegSpecialty] = useState("General Medicine");
  const [regLat, setRegLat] = useState("");
  const [regLng, setRegLng] = useState("");
  const [regAvgMin, setRegAvgMin] = useState(15);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const refresh = async () => {
    if (!hospitalId) return;
    try {
      const d = await adminQueue(hospitalId);
      setData(d);
    } catch (err) {
      toast.error("Failed to load queue data");
    } finally {
      setLoading(false);
    }
  };

  // Check redirects based on login role and URL
  useEffect(() => {
    if (!user) return;
    
    if (!hospitalId) {
      // At chooser level
      if (user.role === "staff" && user.hospital_id) {
        navigate(`/admin/${user.hospital_id}`);
      }
    } else {
      // At hospital console level
      if (user.role === "staff" && user.hospital_id !== hospitalId) {
        // Access Denied: mismatch of hospital
        toast.error("Access denied. You do not have permission to manage this hospital.");
        navigate(`/admin/${user.hospital_id}`);
      }
    }
  }, [user, hospitalId, navigate]);

  // Load hospitals or console queue
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!hospitalId) {
      setLoading(true);
      listHospitals()
        .then(setHospitals)
        .catch(() => toast.error("Failed to fetch hospitals list"))
        .finally(() => setLoading(false));
      return;
    }
    
    // If hospital matches or is owner
    if (user.role === "owner" || (user.role === "staff" && user.hospital_id === hospitalId)) {
      setLoading(true);
      refresh();
      
      // Connect to Socket.io for real-time updates
      const socket = io(import.meta.env.VITE_API_URL || 'https://queue-24ej.onrender.com');
      socket.emit('join_hospital_room', hospitalId);
      
      socket.on('queue_update', () => {
        refresh();
      });

      return () => {
        socket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId, user]);

  // Keyboard shortcuts removed as requested to avoid cross-department collisions

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      toast.error("Please enter username and passkey");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await login({ username: usernameInput, password: passwordInput });
      localStorage.setItem("docqueue_session", JSON.stringify(res));
      setUser(res);
      toast.success("Signed in successfully!");
      if (res.role === "staff") {
        navigate(`/admin/${res.hospital_id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("docqueue_session");
    setUser(null);
    setData(null);
    toast("Signed out cleanly", { className: "bg-bone-muted" });
    navigate("/admin");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regAddress || !regLat || !regLng || !regUsername || !regPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await registerHospital({
        name: regName,
        city: regCity,
        state: regState,
        address: regAddress,
        specialty: regSpecialty,
        lat: parseFloat(regLat),
        lng: parseFloat(regLng),
        avg_consult_minutes: parseInt(regAvgMin),
        username: regUsername,
        password: regPassword,
      });
      toast.success("Hospital and staff credentials created successfully!");
      setRegistering(false);
      
      // Reload hospitals list
      const list = await listHospitals();
      setHospitals(list);
      
      // Reset registration form
      setRegName("");
      setRegAddress("");
      setRegLat("");
      setRegLng("");
      setRegUsername("");
      setRegPassword("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    }
  };

  const handleAction = async (id, action) => {
    setActing(id + action);
    try {
      if (action === "call") { await callEntry(id); toast.success("Patient called"); }
      else if (action === "complete") { await completeEntry(id); toast.success("Marked done"); }
      else if (action === "skip") { await skipEntry(id); toast("Skipped", { className: "bg-bone-muted" }); }
      else if (action === "delete") { await deleteEntry(id); toast("Deleted", { className: "bg-terracotta/20 text-terracotta border border-terracotta" }); }
      await refresh();
    } catch (e) {
      toast.error("Action failed");
    } finally { setActing(null); }
  };

  const handleUpdateDeptTime = async (dept) => {
    if (!newDeptTime || isNaN(newDeptTime)) {
      setEditingDeptTime(null);
      return;
    }
    try {
      await updateHospitalSettings(hospitalId, { department: dept, averageConsultationTime: parseInt(newDeptTime) });
      toast.success(`${dept} consultation time updated!`);
      setEditingDeptTime(null);
      refresh();
    } catch (err) {
      toast.error("Failed to update time");
    }
  };

  const handleToggleAccepting = async (dept, currentState) => {
    try {
      await updateHospitalSettings(hospitalId, { department: dept, isAccepting: !currentState });
      toast.success(`${dept} is now ${!currentState ? 'accepting' : 'not accepting'} applications.`);
      refresh();
    } catch (err) {
      toast.error("Failed to update department status");
    }
  };

  // Rendering logic
  if (!user) {
    return (
      <div className="min-h-screen bg-bone flex flex-col justify-between" data-testid="admin-auth">
        <Navbar />
        <section className="container-wide py-16 flex items-center justify-center flex-grow">
          <div className="bg-white hairline rounded-sm p-8 shadow-sm max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-8 h-8 text-terracotta" />
              <div>
                <p className="label-eyebrow text-terracotta leading-none">Console Secure Sign-In</p>
                <h2 className="font-display text-2xl text-olive tracking-tight mt-1">DocQueue Staff</h2>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-olive/40" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm py-2.5 pl-10 pr-4 text-olive font-display focus:outline-none focus:border-terracotta transition-colors text-[14px]"
                    placeholder="Enter staff username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Console Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-olive/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm py-2.5 pl-10 pr-10 text-olive font-display focus:outline-none focus:border-terracotta transition-colors text-[14px]"
                    placeholder="Enter passkey"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-olive/40 hover:text-olive/70"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full btn-olive flex items-center justify-center gap-2 mt-2"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Sign In to Console
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-olive/10 text-center text-[12px] text-olive/50">
              Authorized OPD staff access only. Activity is monitored.
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Chooser view (only accessed by owner, as staff gets redirected automatically)
  if (!hospitalId) {
    return (
      <div className="min-h-screen bg-bone" data-testid="admin-chooser">
        <Navbar />
        <section className="container-wide pt-12 pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-terracotta" />
              <p className="label-eyebrow text-terracotta">Global Admin Console</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-olive/60 hover:text-terracotta flex items-center gap-1 text-[13px] font-medium"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-display text-4xl lg:text-6xl text-olive tracking-tight leading-[1]">
                Pick your <em className="not-italic text-terracotta">OPD floor.</em>
              </h1>
              <p className="text-olive-ink/70 mt-4 max-w-xl">
                Select a hospital floor console to manage, or set up a newly commissioned branch below.
              </p>
            </div>
            
            {user.role === "owner" && (
              <button
                onClick={() => setRegistering(!registering)}
                className="btn-terracotta inline-flex items-center gap-2 text-[14px]"
              >
                <Plus className="w-4 h-4" />
                {registering ? "Cancel Setup" : "Register Branch"}
              </button>
            )}
          </div>

          {/* Registration Form */}
          {registering && (
            <div className="mt-8 bg-white hairline rounded-sm p-6 max-w-3xl border-l-4 border-l-terracotta shadow-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <Hospital className="w-5 h-5 text-terracotta" />
                <h3 className="font-display text-xl text-olive">New OPD Branch Registration</h3>
              </div>

              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Hospital/Branch Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    placeholder="e.g. Fortis Hospital (Nagarbhavi)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">City</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">State</label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Branch Address</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    placeholder="Complete street address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Specialty Department</label>
                  <input
                    type="text"
                    value={regSpecialty}
                    onChange={(e) => setRegSpecialty(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    placeholder="e.g. Cardiology, General Medicine"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Avg Consultation Minutes</label>
                  <input
                    type="number"
                    value={regAvgMin}
                    onChange={(e) => setRegAvgMin(parseInt(e.target.value))}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={regLat}
                    onChange={(e) => setRegLat(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    placeholder="e.g. 12.971598"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={regLng}
                    onChange={(e) => setRegLng(e.target.value)}
                    className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm p-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                    placeholder="e.g. 77.594562"
                    required
                  />
                </div>

                <div className="md:col-span-2 border-t border-olive/10 mt-2 pt-4">
                  <p className="font-display text-sm font-medium text-olive mb-3">Create Staff Access Credentials</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Staff Username</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-3 w-4 h-4 text-olive/40" />
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                      className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm py-2 pl-9 pr-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                      placeholder="e.g. apollo_hebbal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-olive/60 mb-1">Staff Passkey</label>
                  <div className="relative">
                    <Key className="absolute left-2.5 top-3 w-4 h-4 text-olive/40" />
                    <input
                      type="text"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-bone-muted/40 border border-olive/15 rounded-sm py-2 pl-9 pr-2 text-olive focus:outline-none focus:border-terracotta text-[14px]"
                      placeholder="e.g. pass2026"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <button type="submit" className="btn-olive w-full py-3 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Commission OPD Branch & Set Live
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? <Loader2 className="w-6 h-6 mt-10 animate-spin text-olive/50" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-12">
              {hospitals.map(h => (
                <button
                  key={h.id}
                  onClick={() => navigate(`/admin/${h.id}`)}
                  className="text-left bg-white hairline rounded-sm p-5 hover:border-olive/40 transition-all"
                  data-testid={`admin-choose-${h.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-olive text-lg leading-tight tracking-tight">{h.name}</p>
                      <p className="text-olive-ink/60 text-[13px] mt-1">{h.city} · {h.specialty}</p>
                    </div>
                    <CongestionBadge level={h.stats?.congestion} size="sm" />
                  </div>
                  <div className="mt-4 flex items-center justify-between num text-[12px] text-olive/65">
                    <span>{h.stats?.waiting} waiting</span>
                    <span className="text-terracotta flex items-center gap-1">Open <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
        <Footer />
      </div>
    );
  }

  // Detailed Hospital Queue Console
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bone">
        <Navbar />
        <div className="container-wide py-32 text-center text-olive/60">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const { hospital, queue, recent_done, stats } = data;
  
  // Get all departments for this hospital, fallback to active ones
  const displayDepartments = hospital.departments?.length > 0 
    ? hospital.departments 
    : [...new Set([...queue.map(q => q.department), hospital.specialty])];

  return (
    <div className="min-h-screen bg-bone" data-testid="admin-dashboard">
      <Navbar />

      <section className="container-wide pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {user.role === "owner" ? (
                <Link to="/admin" className="text-olive/55 text-[13px] hover:text-olive">← Change hospital</Link>
              ) : (
                <span className="text-olive/45 text-[13px]">OPD Control Console</span>
              )}
              <span className="text-olive/20">|</span>
              <button 
                onClick={handleSignOut} 
                className="text-terracotta/75 hover:text-terracotta text-[13px] font-medium flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-3">
              <h1 className="font-display text-3xl lg:text-4xl text-olive tracking-tight leading-none">{hospital.name}</h1>
              <CongestionBadge level={stats.congestion} />
            </div>
            <p className="text-olive-ink/65 mt-2 text-[14px]">{hospital.address} · <span className="text-olive font-medium">{hospital.specialty}</span></p>
          </div>
          <div className="flex items-center gap-4 num text-[12px] text-olive/65">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> live</span>
            <button onClick={refresh} className="hover:text-olive flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="container-wide pb-10 grid grid-cols-2 lg:grid-cols-3 gap-px bg-olive/10 border border-olive/10 rounded-sm overflow-hidden">
        <StatCell label="Total Waiting" value={stats.waiting} icon={Users2} />
        <StatCell label="Total Depts" value={displayDepartments.length} icon={Activity} accent />
        <StatCell label="Done today" value={recent_done.length} icon={CheckCircle2} />
      </section>

      {/* Department Queues Grid */}
      <section className="container-wide pb-12">
        {displayDepartments.length === 0 ? (
          <div className="bg-white hairline rounded-sm p-16 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-congestion-low opacity-50" />
            <h3 className="font-display text-2xl text-olive mb-2">OPD is completely caught up</h3>
            <p className="text-olive/60">No patients are currently waiting or in consultation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayDepartments.map(dept => {
              const deptQueue = queue.filter(q => q.department === dept);
              const current = deptQueue.find(q => q.status === "in-consultation");
              const waiting = deptQueue.filter(q => q.status === "waiting");
              
              const dSettings = hospital.departmentSettings?.[dept] || { averageConsultationTime: hospital.averageConsultationTime || 15, isAccepting: true };
              const queueTime = waiting.length * dSettings.averageConsultationTime;
              
              return (
                <div key={dept} className={`bg-white hairline rounded-sm overflow-hidden flex flex-col transition-all ${expandedDept === dept ? 'h-[500px]' : 'h-auto'} ${!dSettings.isAccepting ? 'opacity-80 grayscale-[30%]' : ''}`}>
                  {/* Dept Header */}
                  <div 
                    className="bg-bone-muted/40 px-5 py-4 border-b border-olive/5 flex flex-col gap-3 cursor-pointer hover:bg-bone-muted/60 transition-colors"
                    onClick={() => setExpandedDept(expandedDept === dept ? null : dept)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg text-olive flex items-center gap-2 truncate pr-2">
                        <span className={`w-2 h-2 rounded-full ${waiting.length > 0 || current ? 'bg-terracotta animate-pulse' : 'bg-olive/20'}`}></span>
                        {dept}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-[11px] text-olive-ink font-medium bg-white px-2 py-0.5 rounded-sm border border-olive/10 shadow-sm whitespace-nowrap">
                          {waiting.length} waiting
                        </div>
                        <div className="text-[10px] text-terracotta num font-medium whitespace-nowrap">
                          {queueTime > 0 ? `~${queueTime}m queue` : 'No wait'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedDept === dept && (
                    <>
                    {/* Dept Controls */}
                    <div className="bg-bone-muted/40 px-5 pb-3 flex items-center justify-between border-b border-olive/10">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] uppercase tracking-wider text-olive/50 font-medium">Avg Time:</p>
                        {editingDeptTime === dept ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              value={newDeptTime} 
                              onChange={(e) => setNewDeptTime(e.target.value)} 
                              className="w-12 border border-terracotta rounded px-1.5 py-0.5 text-sm font-display text-olive focus:outline-none"
                              autoFocus
                              onBlur={() => handleUpdateDeptTime(dept)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateDeptTime(dept); if (e.key === 'Escape') setEditingDeptTime(null); }}
                            />
                            <span className="text-olive/50 text-[10px]">m</span>
                          </div>
                        ) : (
                          <p 
                            className="num text-[12px] text-olive font-medium cursor-pointer hover:text-terracotta transition-colors px-1 py-0.5 hover:bg-olive/5 rounded" 
                            onClick={() => { setNewDeptTime(dSettings.averageConsultationTime); setEditingDeptTime(dept); }} 
                            title="Click to edit"
                          >
                            {dSettings.averageConsultationTime}m <span className="text-olive/40 font-sans ml-0.5">✎</span>
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleToggleAccepting(dept, dSettings.isAccepting)}
                        className={`text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-sm border transition-colors ${
                          dSettings.isAccepting 
                            ? 'text-olive border-olive/20 hover:border-olive/40 hover:bg-olive/5' 
                            : 'bg-terracotta/10 text-terracotta border-terracotta/30 hover:bg-terracotta/20'
                        }`}
                      >
                        {dSettings.isAccepting ? 'Pause Apps' : 'Apps Paused'}
                      </button>
                    </div>

                  {/* Now Serving Block */}
                  {current ? (
                    <div className="bg-olive p-5 border-b border-olive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-bone/50 font-medium mb-0.5">Now Serving</p>
                          <p className="num font-display text-terracotta text-4xl leading-none">{current.tokenNumber}</p>
                        </div>
                        <div className="border-l border-bone/15 pl-4">
                          <p className="text-bone font-medium text-[15px]">{current.name} <span className="text-bone/50 font-normal text-[13px]">({current.phone})</span></p>
                          <p className="text-bone/60 text-[12px] truncate max-w-[150px]">{current.symptom || 'No reason'}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => handleAction(current._id, "complete")}
                          className="btn-terracotta text-[12px] py-1.5 px-3 inline-flex items-center justify-center gap-1.5"
                        >
                          {acting === current._id + "complete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Done
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(current._id, "skip")}
                            className="border border-bone/25 text-bone text-[12px] py-1.5 px-3 rounded-sm font-medium hover:bg-bone/10 inline-flex items-center justify-center gap-1.5 flex-1"
                          >
                            <SkipForward className="w-3 h-3" /> Skip
                          </button>
                          <button
                            onClick={() => handleAction(current._id, "delete")}
                            className="border border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-white text-[12px] px-2 rounded-sm inline-flex items-center justify-center transition-colors"
                            title="Delete Patient"
                          >
                            {acting === current._id + "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-olive/5 p-5 border-b border-olive/10 flex items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-olive/40 font-medium mb-0.5">Now Serving</p>
                        <p className="num font-display text-olive/40 text-4xl leading-none">—</p>
                      </div>
                      <div className="border-l border-olive/15 pl-4 text-olive/50 text-[13px]">
                        Doctor is currently available.
                      </div>
                    </div>
                  )}

                  {/* Waiting Queue List */}
                  <div className="flex-1 max-h-[300px] overflow-y-auto">
                    {waiting.length === 0 ? (
                      <div className="p-6 text-center text-olive/40 text-[13px]">
                        No one waiting in this department.
                      </div>
                    ) : (
                      <div className="divide-y divide-olive/5">
                        {waiting.map((q, idx) => {
                          const minsWait = Math.max(0, Math.round((Date.now() - new Date(q.checkInTime).getTime()) / 60000));
                          return (
                            <div key={q._id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-bone-muted/20 transition-colors">
                              <div className="col-span-2 num text-olive font-medium text-[14px]">{q.tokenNumber}</div>
                              <div className="col-span-5">
                                <p className="text-olive font-medium text-[13px] truncate">{q.name} <span className="text-olive/50 font-normal">({q.phone})</span></p>
                                <p className="text-olive/50 text-[11px] truncate">{q.symptom || '—'}</p>
                              </div>
                              <div className="col-span-2 num text-olive/60 text-[12px]">{minsWait}m</div>
                              <div className="col-span-3 flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleAction(q._id, "call")}
                                  disabled={idx !== 0 && !current ? false : idx !== 0}
                                  className="text-terracotta border border-terracotta/25 hover:bg-terracotta hover:text-white text-[11px] px-2.5 py-1 rounded-sm font-medium disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-terracotta transition-all inline-flex items-center gap-1"
                                >
                                  {acting === q._id + "call" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Notify"}
                                </button>
                                <button
                                  onClick={() => handleAction(q._id, "delete")}
                                  className="text-olive/40 border border-transparent hover:border-terracotta/30 hover:text-terracotta hover:bg-terracotta/5 text-[11px] px-1.5 py-1 rounded-sm transition-all inline-flex items-center"
                                  title="Delete Patient"
                                >
                                  {acting === q._id + "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recently completed */}
      {recent_done.length > 0 && (
        <section className="container-wide pb-20">
          <h3 className="font-display text-xl text-olive tracking-tight mb-3">Recently completed</h3>
          <div className="bg-bone-muted/50 hairline rounded-sm divide-y divide-olive/5">
            {recent_done.slice(0, 8).map(q => (
              <div key={q.id} className="grid grid-cols-12 gap-3 px-5 py-2.5 items-center text-[13px]">
                <span className="col-span-2 num text-olive font-medium">{q.token}</span>
                <span className="col-span-3 text-olive-ink truncate">{q.patient_name}</span>
                <span className="col-span-3 text-olive/60 truncate">{q.department}</span>
                <span className="col-span-2 text-olive/55 num hidden md:block">{q.patient_phone}</span>
                <span className="col-span-2 text-congestion-low text-right text-[12px] flex items-center justify-end gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                  <button
                    onClick={() => handleAction(q.id, "delete")}
                    className="ml-2 text-olive/30 hover:text-terracotta transition-colors"
                    title="Delete Record"
                  >
                    {acting === q.id + "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

const StatCell = ({ label, value, icon: Icon, accent = false }) => (
  <div className="bg-white p-5 lg:p-6">
    <div className="flex items-center justify-between">
      <p className="label-eyebrow text-olive/55">{label}</p>
      <Icon className={`w-3.5 h-3.5 ${accent ? 'text-terracotta' : 'text-olive/40'}`} />
    </div>
    <p className={`num font-display ${accent ? 'text-terracotta' : 'text-olive'} text-3xl lg:text-4xl mt-2 tracking-tight`}>{value}</p>
  </div>
);

export default AdminPage;

`

## src\pages\CheckIn.jsx

`jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Smartphone, User, Phone, Building2, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CheckIn() {
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', hospitalId: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const navigate = useNavigate();

  // Derive departments from selected hospital
  const selectedHospital = hospitals.find(h => h._id === formData.hospitalId);
  const departments = selectedHospital?.departments || [];

  useEffect(() => {
    axios.get('https://queue-24ej.onrender.com/api/hospitals')
      .then(res => setHospitals(res.data))
      .catch(() => setFetchError(true));
  }, []);

  // Reset department when hospital changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'hospitalId' ? { department: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://queue-24ej.onrender.com/api/patients/checkin', formData);
      localStorage.setItem('patientId', res.data._id);
      navigate('/patient/status');
    } catch (error) {
      console.error(error);
      alert('Check-in failed. Please ensure the backend server is running.');
    }
    setLoading(false);
  };

  // Group hospitals by city
  const bangaloreHospitals = hospitals.filter(h => h.address.includes('Bangalore'));
  const otherHospitals = hospitals.filter(h => !h.address.includes('Bangalore'));

  return (
    <div className="page-wrapper page-section" style={{ display: 'flex', alignItems: 'flex-start', gap: '3rem', justifyContent: 'center' }}>

      {/* ─── Left info panel ─── */}
      <div style={{ maxWidth: 340, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', paddingTop: '1rem' }}>
        <div>
          <span className="section-label"><Smartphone size={13} /> Remote Check-In</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '0.8rem' }}>
            Join a queue <span className="gradient-text">from anywhere</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Skip the physical waiting room. Check in remotely and arrive only when your turn is near.
          </p>
        </div>

        {[
          { icon: CheckCircle2, color: '#6c63ff', text: 'Instant token generation' },
          { icon: Phone, color: '#10d98a', text: 'SMS alert when your turn is near' },
          { icon: Stethoscope, color: '#f59e0b', text: '15+ hospitals in Bangalore' },
        ].map(({ icon: Icon, color, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `${color}18`, border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={16} color={color} />
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* ─── Form panel ─── */}
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: 520 }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.4rem' }}>Get Your Token</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Fill in your details to secure your spot in the OPD queue.
        </p>

        {fetchError && (
          <div style={{
            padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1.5rem',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
            color: '#f43f5e', fontSize: '0.85rem',
          }}>
            ⚠️ Cannot reach backend. Start the server at <code>localhost:5000</code>.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="form-group">
            <label><User size={12} style={{ marginRight: 5 }} />Full Name</label>
            <input
              type="text" className="form-control" name="name"
              value={formData.name} onChange={handleChange}
              required placeholder="e.g. Rahul Sharma"
            />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label><Phone size={12} style={{ marginRight: 5 }} />Phone Number</label>
            <input
              type="tel" className="form-control" name="phone"
              value={formData.phone} onChange={handleChange}
              required placeholder="+91 98765 43210"
            />
          </div>

          {/* Hospital */}
          <div className="form-group">
            <label><Building2 size={12} style={{ marginRight: 5 }} />Hospital</label>
            <select
              className="form-control" name="hospitalId"
              value={formData.hospitalId} onChange={handleChange} required
            >
              <option value="">Select Hospital</option>
              {bangaloreHospitals.length > 0 && (
                <optgroup label="── Bangalore ──">
                  {bangaloreHospitals.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </optgroup>
              )}
              {otherHospitals.length > 0 && (
                <optgroup label="── Other Cities ──">
                  {otherHospitals.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </optgroup>
              )}
              {/* Fallback if API not available */}
              {hospitals.length === 0 && (
                <>
                  <optgroup label="── Bangalore ──">
                    <option value="manipal">Manipal Hospital, HAL Airport Road</option>
                    <option value="narayana">Narayana Health City, Bommasandra</option>
                    <option value="apollo_blr">Apollo Hospitals, Bannerghatta Road</option>
                    <option value="fortis_blr">Fortis Hospital, Cunningham Road</option>
                    <option value="sakra">Sakra World Hospital, Outer Ring Road</option>
                    <option value="columbia">Columbia Asia Hospital, Whitefield</option>
                    <option value="bgs">BGS Gleneagles Global Hospital, Kengeri</option>
                    <option value="vikram">Vikram Hospital, Millers Road</option>
                    <option value="msramaiah">M S Ramaiah Memorial Hospital</option>
                    <option value="stjohns">St. John's Medical College Hospital</option>
                    <option value="bowring">Bowring & Lady Curzon Hospital</option>
                    <option value="victoria">Victoria Hospital, Fort Road</option>
                    <option value="kidwai">Kidwai Memorial Institute of Oncology</option>
                    <option value="jayadeva">Jayadeva Institute of Cardiovascular Sciences</option>
                    <option value="aster">Aster CMI Hospital, Sahakara Nagar</option>
                    <option value="sparsh">Sparsh Hospital, Infantry Road</option>
                  </optgroup>
                  <optgroup label="── Other Cities ──">
                    <option value="aiims">AIIMS Delhi</option>
                    <option value="apollo_che">Apollo Hospitals, Chennai</option>
                    <option value="fortis_mum">Fortis Hospital, Mumbai</option>
                  </optgroup>
                </>
              )}
            </select>
          </div>

          {/* Department — dynamic based on selected hospital */}
          <div className="form-group">
            <label><Stethoscope size={12} style={{ marginRight: 5 }} />Department</label>
            <select
              className="form-control" name="department"
              value={formData.department} onChange={handleChange} required
              disabled={!formData.hospitalId}
            >
              <option value="">
                {formData.hospitalId ? 'Select Department' : 'Select a hospital first'}
              </option>
              {departments.length > 0
                ? departments.map(d => <option key={d} value={d}>{d}</option>)
                : formData.hospitalId && (
                  <>
                    <option value="General OPD">General OPD</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Dermatology">Dermatology</option>
                  </>
                )
              }
            </select>
          </div>

          {selectedHospital && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1rem',
              background: 'rgba(108,99,255,0.07)', border: '1px solid rgba(108,99,255,0.2)',
              fontSize: '0.82rem', color: 'var(--text-secondary)',
            }}>
              📍 {selectedHospital.address}
              {selectedHospital.contactInfo && (
                <span style={{ marginLeft: '0.8rem' }}>· 📞 {selectedHospital.contactInfo}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <><Smartphone size={17} /> Get My Token <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

`

## src\pages\CheckinPage.jsx

`jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, MessageSquare, Phone, User, Stethoscope, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CongestionBadge from "../components/CongestionBadge";
import { adminQueue, checkin } from "../lib/api";
import { toast } from "sonner";
import { io } from "socket.io-client";



const CheckinPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    symptom: "",
    department: "",
    notify_via: "whatsapp",
    notificationThreshold: 15,
  });

  useEffect(() => {
    let socket = null;
    if (!hospitalId) return;
    
    const fetchIt = () => {
      adminQueue(hospitalId).then((res) => {
        setHospital(res.hospital);
        setQueue(res.queue);
        setForm(f => {
          const availableDepts = (res.hospital.departments && res.hospital.departments.length > 0 ? res.hospital.departments : [res.hospital.specialty])
            .filter(dept => res.hospital.departmentSettings?.[dept]?.isAccepting !== false);
          return { ...f, department: f.department || availableDepts[0] || "" };
        });
      })
      .catch(() => setError("Could not load hospital details. Please try again."))
      .finally(() => setLoading(false));
    };
    
    fetchIt();
    
    socket = io(import.meta.env.VITE_API_URL || 'https://queue-24ej.onrender.com');
    socket.emit('join_hospital_room', hospitalId);
    socket.on('queue_update', () => {
      fetchIt();
    });
    
    return () => {
      if (socket) socket.disconnect();
    }
  }, [hospitalId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.patient_name || !form.patient_phone) {
      toast.error("Please add your name and phone");
      return;
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.patient_phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setSubmitting(true);
    try {
      const finalForm = { ...form, patient_phone: `+91${form.patient_phone}` };
      const entry = await checkin(hospitalId, finalForm);
      if (!entry?.token) {
        toast.error("Token not received. Please try again.");
        return;
      }
      toast.success(`Token ${entry.token} assigned`);
      navigate(`/track/${entry.token}`);
    } catch (err) {
      toast.error("Check-in failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (loading || !hospital || error) {
    return (
      <div className="min-h-screen bg-bone">
        <Navbar />
        <div className="container-wide py-32 text-center text-olive/60">
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : <p className="text-terracotta">{error}</p>}
        </div>
      </div>
    );
  }

  // Determine dynamic avg wait based on selected department
  const dSettings = hospital.departmentSettings?.[form.department];
  const displayAvgWait = dSettings?.averageConsultationTime || hospital.averageConsultationTime || 15;
  const deptQueue = queue.filter(q => q.department === form.department && q.status === "waiting");
  const deptWaitCount = deptQueue.length;
  const estimatedTime = deptWaitCount * displayAvgWait;
  
  const currentDeptServing = queue.find(q => q.department === form.department && q.status === "in-consultation");

  return (
    <div className="min-h-screen bg-bone" data-testid="checkin-page">
      <Navbar />

      <section className="container-wide pt-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Hospital summary */}
        <aside className="lg:col-span-5">
          <Link to="/hospitals" className="text-olive/55 text-[13px] hover:text-olive">← Back to hospitals</Link>
          <p className="label-eyebrow text-terracotta mt-6">You're checking in to</p>
          <h1 className="font-display text-4xl lg:text-5xl text-olive mt-3 leading-[1.02] tracking-tight">
            {hospital.name}
          </h1>
          <p className="text-olive-ink/70 mt-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-terracotta" /> {hospital.address}
          </p>

          <div className="mt-7 hairline rounded-sm bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="label-eyebrow text-olive/55">Current OPD status</p>
              <CongestionBadge level={hospital.stats?.congestion} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="label-eyebrow text-olive/45">Now serving</p>
                <p className="num font-display text-olive text-3xl mt-1">{currentDeptServing?.token || '—'}</p>
              </div>
              <div>
                <p className="label-eyebrow text-olive/45">Waiting</p>
                <p className="num font-display text-olive text-3xl mt-1">{deptWaitCount}</p>
              </div>
              <div>
                <p className="label-eyebrow text-olive/45">Est. Wait</p>
                <p className="num font-display text-olive text-3xl mt-1">{estimatedTime}m</p>
              </div>
            </div>
            <p className="mt-5 text-[13px] text-olive-ink/60">
              Department: <span className="text-olive font-medium">{form.department || 'Not selected'}</span>
            </p>
          </div>

          <div className="mt-6 bg-bone-muted/70 rounded-sm p-5 border border-olive/5">
            <p className="label-eyebrow text-olive/60">SMS Notifications</p>
            <p className="text-olive-ink/75 text-[13px] mt-2.5 leading-relaxed">
              We will send you an SMS notification directly to your phone the exact moment it is your turn to see the doctor. Please ensure your phone number is correct!
            </p>
          </div>
        </aside>

        {/* Form */}
        <div className="lg:col-span-7">
          <form onSubmit={submit} className="bg-white hairline rounded-sm p-7 lg:p-9 space-y-6" data-testid="checkin-form">
            <div className="flex items-center justify-between">
              <div>
                <p className="label-eyebrow text-olive/55">Remote check-in</p>
                <h2 className="font-display text-2xl lg:text-3xl text-olive mt-1 tracking-tight">Get your token</h2>
              </div>
              <Clock className="w-5 h-5 text-terracotta" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Full name" icon={User}>
                <input
                  type="text"
                  value={form.patient_name}
                  onChange={(e) => setForm(f => ({ ...f, patient_name: e.target.value }))}
                  placeholder="e.g. Ravi Kumar"
                  className="w-full bg-transparent px-3 py-3 text-[15px] text-olive-ink focus:outline-none"
                  data-testid="checkin-name"
                  required
                />
              </Field>
              <Field label="Phone number" icon={Phone}>
                <span className="text-olive/50 text-[15px] font-medium tracking-wide border-r border-olive/10 pr-2 pl-2">+91</span>
                <input
                  type="tel"
                  value={form.patient_phone}
                  onChange={(e) => setForm(f => ({ ...f, patient_phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="9876543210"
                  className="w-full bg-transparent px-2 py-3 text-[15px] text-olive-ink focus:outline-none num tracking-wide"
                  data-testid="checkin-phone"
                  required
                />
              </Field>
            </div>

            <Field label="Reason for visit" icon={Stethoscope}>
              <input
                type="text"
                value={form.symptom}
                onChange={(e) => setForm(f => ({ ...f, symptom: e.target.value }))}
                placeholder="e.g. Persistent cough, follow-up, routine check"
                className="w-full bg-transparent px-3 py-3 text-[15px] text-olive-ink focus:outline-none"
                data-testid="checkin-symptom"
              />
            </Field>

            <div>
              <p className="label-eyebrow text-olive/55 mb-2.5">Department</p>
              <select
                value={form.department}
                onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full bg-bone-muted/60 border border-olive/15 rounded-sm px-4 py-3 text-[15px] text-olive-ink focus:outline-none focus:border-terracotta appearance-none"
                data-testid="checkin-department"
                required
              >
                <option value="" disabled>Select department</option>
                {((hospital.departments && hospital.departments.length > 0) ? hospital.departments : [hospital.specialty])
                  .filter(dept => hospital.departmentSettings?.[dept]?.isAccepting !== false)
                  .map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {hospital.departmentSettings?.[form.department]?.isAccepting === false && (
                <p className="text-red-500 text-[13px] mt-2 font-medium bg-red-50 p-2.5 rounded-sm border border-red-100">
                  ⚠️ This department is currently paused by the hospital.
                </p>
              )}
            </div>

            <div>
              <p className="label-eyebrow text-olive/55 mb-2.5">Notify me via</p>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { v: "whatsapp", l: "SMS/WhatsApp", icon: MessageSquare },
                  { v: "sms", l: "SMS Only", icon: Phone },
                  { v: "none", l: "I'll check myself", icon: Clock },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, notify_via: opt.v }))}
                    data-testid={`notify-${opt.v}`}
                    className={`border rounded-sm px-3 py-3 text-[13px] font-medium flex items-center justify-center gap-2 transition-all ${
                      form.notify_via === opt.v
                        ? 'bg-olive text-bone border-olive'
                        : 'bg-transparent text-olive border-olive/20 hover:border-olive/50'
                    }`}
                  >
                    <opt.icon className="w-3.5 h-3.5" /> {opt.l}
                  </button>
                ))}
              </div>
            </div>

            {form.notify_via !== 'none' && (
              <div className="pt-2">
                <p className="label-eyebrow text-olive/55 mb-2.5">Notify me before my turn (in minutes)</p>
                <input
                  type="number"
                  min="0"
                  max={estimatedTime}
                  value={form.notificationThreshold}
                  onChange={(e) => setForm(f => ({ ...f, notificationThreshold: Number(e.target.value) }))}
                  className="w-full bg-bone-muted/60 border border-olive/15 rounded-sm px-4 py-3 text-[14px] text-olive-ink focus:outline-none focus:border-terracotta"
                  data-testid="notification-threshold"
                  placeholder={`Max: ${estimatedTime} mins`}
                />
              </div>
            )}

            <div className="border-t border-olive/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-[12px] text-olive-ink/55 max-w-sm leading-relaxed">
                By checking in you agree to receive queue updates. Your data stays with the hospital.
              </p>
              <button
                type="submit"
                disabled={submitting || hospital.departmentSettings?.[form.department]?.isAccepting === false}
                className="btn-terracotta inline-flex items-center gap-2 disabled:opacity-60"
                data-testid="checkin-submit"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generate my token <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Field = ({ label, icon: Icon, children }) => (
  <div>
    <p className="label-eyebrow text-olive/55 mb-2.5">{label}</p>
    <div className="flex items-center gap-2 border border-olive/15 rounded-sm focus-within:border-terracotta bg-white">
      {Icon ? <Icon className="w-4 h-4 text-olive/45 ml-3" /> : null}
      {children}
    </div>
  </div>
);

export default CheckinPage;

`

## src\pages\Heatmap.jsx

`jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { MapPin, Filter } from 'lucide-react';

// Simulated congestion so map markers show even without live data
function simulateCongestion(hospital) {
  const seed = hospital.name.charCodeAt(0) + hospital.name.charCodeAt(1);
  return (seed * 37) % 100;
}

const getColor = (c) => {
  if (c < 30) return '#10d98a';
  if (c < 70) return '#f59e0b';
  return '#f43f5e';
};

const getLabel = (c) => c < 30 ? 'Low' : c < 70 ? 'Medium' : 'High';
const getDotClass = (c) => c < 30 ? 'dot-green' : c < 70 ? 'dot-yellow' : 'dot-red';

export default function Heatmap() {
  const [hospitals, setHospitals] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'bangalore' | 'low' | 'medium' | 'high'

  useEffect(() => {
    axios.get('https://queue-24ej.onrender.com/api/hospitals')
      .then(res => setHospitals(res.data))
      .catch(() => {
        // Fallback: hardcoded Bangalore hospitals for UI preview
        setHospitals([
          { _id: '1', name: 'Manipal Hospital', address: '98, HAL Airport Road, Bangalore - 560017', coordinates: { lat: 12.9592, lng: 77.6479 }, departments: ['Cardiology','General OPD'] },
          { _id: '2', name: 'Narayana Health City', address: 'Bommasandra, Bangalore - 560099', coordinates: { lat: 12.8358, lng: 77.6756 }, departments: ['Cardiac Surgery','Oncology'] },
          { _id: '3', name: 'Apollo Hospitals, Bannerghatta', address: 'Bannerghatta Road, Bangalore - 560076', coordinates: { lat: 12.8916, lng: 77.5997 }, departments: ['General OPD','Gynecology'] },
          { _id: '4', name: 'Fortis Hospital', address: 'Cunningham Road, Bangalore - 560052', coordinates: { lat: 12.9802, lng: 77.5928 }, departments: ['Neurology','Orthopedics'] },
          { _id: '5', name: 'Sakra World Hospital', address: 'Outer Ring Road, Bangalore - 560103', coordinates: { lat: 12.9358, lng: 77.7013 }, departments: ['Emergency','Gastroenterology'] },
          { _id: '6', name: 'Columbia Asia, Whitefield', address: 'Whitefield Main Road, Bangalore - 560066', coordinates: { lat: 12.9699, lng: 77.7499 }, departments: ['Orthopedics','Pediatrics'] },
          { _id: '7', name: 'BGS Gleneagles Global Hospital', address: 'Kengeri, Bangalore - 560060', coordinates: { lat: 12.9085, lng: 77.4910 }, departments: ['Liver Transplant','Nephrology'] },
          { _id: '8', name: 'Vikram Hospital', address: 'Millers Road, Bangalore - 560052', coordinates: { lat: 12.9832, lng: 77.5902 }, departments: ['Cardiology','Neurology'] },
          { _id: '9', name: 'M S Ramaiah Memorial Hospital', address: 'Mathikere, Bangalore - 560054', coordinates: { lat: 13.0188, lng: 77.5586 }, departments: ['Cardiology','Neurosurgery'] },
          { _id: '10', name: "St. John's Medical College Hospital", address: 'Koramangala, Bangalore - 560034', coordinates: { lat: 12.9370, lng: 77.6218 }, departments: ['Emergency','Psychiatry'] },
          { _id: '11', name: 'Bowring & Lady Curzon Hospital', address: 'Shivaji Nagar, Bangalore - 560001', coordinates: { lat: 12.9778, lng: 77.6003 }, departments: ['General OPD','ENT'] },
          { _id: '12', name: 'Victoria Hospital', address: 'Ft. Road, Bangalore - 560002', coordinates: { lat: 12.9677, lng: 77.5740 }, departments: ['Emergency','Burns & Plastic Surgery'] },
          { _id: '13', name: 'Kidwai Memorial Institute of Oncology', address: 'Bangalore - 560029', coordinates: { lat: 12.9258, lng: 77.5960 }, departments: ['Oncology','Radiation Therapy'] },
          { _id: '14', name: 'Jayadeva Institute of Cardiovascular Sciences', address: 'Jayanagar, Bangalore - 560069', coordinates: { lat: 12.9065, lng: 77.5961 }, departments: ['Cardiology','Cardiac Surgery'] },
          { _id: '15', name: 'Aster CMI Hospital', address: 'Sahakara Nagar, Bangalore - 560092', coordinates: { lat: 13.0629, lng: 77.5979 }, departments: ['Cardiology','Oncology'] },
          { _id: '16', name: 'Sparsh Hospital', address: 'Infantry Road, Bangalore - 560001', coordinates: { lat: 12.9823, lng: 77.6053 }, departments: ['Orthopedics','Sports Medicine'] },
        ]);
      });
  }, []);

  // Enrich with simulated congestion if not from live API
  const enriched = hospitals.map(h => ({
    ...h,
    congestion: h.congestion ?? simulateCongestion(h),
    waitCount: h.waitCount ?? Math.floor(simulateCongestion(h) * 0.8),
  }));

  const filtered = enriched.filter(h => {
    if (filter === 'bangalore') return h.address.includes('Bangalore');
    if (filter === 'low') return h.congestion < 30;
    if (filter === 'medium') return h.congestion >= 30 && h.congestion < 70;
    if (filter === 'high') return h.congestion >= 70;
    return true;
  });

  // Center on Bangalore
  const center = [12.9716, 77.5946];

  return (
    <div className="page-wrapper page-section">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="section-label"><MapPin size={13} /> Live Map</span>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '0.6rem' }}>
          Hospital Congestion <span className="gradient-text">Heatmap</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time OPD crowd levels across Bangalore. Updated every minute.
        </p>
      </div>

      {/* Filters & Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Filter size={14} /> Filter:
        </div>
        {[
          { key: 'all', label: 'All Hospitals' },
          { key: 'bangalore', label: '📍 Bangalore' },
          { key: 'low', label: '🟢 Low' },
          { key: 'medium', label: '🟡 Medium' },
          { key: 'high', label: '🔴 High' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '0.35rem 0.9rem',
            borderRadius: 999,
            border: `1px solid ${filter === key ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: filter === key ? 'rgba(108,99,255,0.15)' : 'transparent',
            color: filter === key ? 'var(--accent-2)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {[['dot-green', 'Low (<30%)'], ['dot-yellow', 'Medium (30-70%)'], ['dot-red', 'High (>70%)']].map(([cls, lbl]) => (
            <div key={cls} className="status-indicator">
              <span className={`dot ${cls}`} />{lbl}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="heatmap-container" style={{ height: 480 }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {filtered.map(h => (
            h.coordinates?.lat && h.coordinates?.lng ? (
              <CircleMarker
                key={h._id}
                center={[h.coordinates.lat, h.coordinates.lng]}
                pathOptions={{
                  color: getColor(h.congestion),
                  fillColor: getColor(h.congestion),
                  fillOpacity: 0.65,
                  weight: 2,
                }}
                radius={10 + (h.congestion / 10)}
              >
                <Popup>
                  <div style={{ color: '#111', minWidth: 180 }}>
                    <strong style={{ fontSize: '0.95rem' }}>{h.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#555', marginTop: 4 }}>{h.address}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <span>🧑‍⚕️ Waiting: <strong>{h.waitCount}</strong></span>
                      <span>📊 {Math.round(h.congestion)}% full</span>
                    </div>
                    {h.departments?.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#444' }}>
                        OPDs: {h.departments.slice(0, 3).join(', ')}{h.departments.length > 3 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          ))}
        </MapContainer>
      </div>

      {/* Hospital Cards Grid */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.1rem' }}>
          {filtered.length} Hospital{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? `· ${filter.charAt(0).toUpperCase() + filter.slice(1)} filter` : 'listed'}
        </h3>
        <div className="card-grid">
          {filtered.map(h => (
            <div key={h._id} className="glass-panel hospital-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <h3 className="hospital-title" style={{ fontSize: '1rem', flex: 1, paddingRight: '0.5rem' }}>{h.name}</h3>
                <div className="status-indicator" style={{ flexShrink: 0 }}>
                  <span className={`dot ${getDotClass(h.congestion)}`} />
                  {getLabel(h.congestion)}
                </div>
              </div>
              <div className="hospital-meta">{h.address}</div>
              {h.departments?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {h.departments.slice(0, 4).map(d => (
                    <span key={d} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{d}</span>
                  ))}
                  {h.departments.length > 4 && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      +{h.departments.length - 4} more
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: getColor(h.congestion), lineHeight: 1 }}>{h.waitCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>patients waiting</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: getColor(h.congestion) }}>{Math.round(h.congestion)}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>congestion</div>
                </div>
              </div>
              {/* Congestion bar */}
              <div style={{ marginTop: '0.8rem', height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${h.congestion}%`,
                  background: getColor(h.congestion),
                  boxShadow: `0 0 8px ${getColor(h.congestion)}`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

`

## src\pages\Home.jsx

`jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Smartphone, ShieldCheck, Activity, Users, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text_main font-body selection:bg-accent/20">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://static.prod-images.emergentagent.com/jobs/8f442c6c-9759-432d-981b-e978b2819e7e/images/1e4a095a1e7f247ee7f4365c5e52c2af9a7d8a5431841c33808c3e1edb563e98.png")' }}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs tracking-[0.15em] uppercase text-text_muted font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-heatmap_status-low mr-2 animate-pulse"></span>
              Live Hospital Wayfinding
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none text-primary font-medium mb-6">
              Trust the Process.<br />
              <span className="text-accent">Skip the Waiting Room.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-text_muted mb-10 max-w-2xl leading-relaxed">
              Real-time OPD queue tracking, secure remote check-ins, and live hospital congestion heatmaps. 
              Designed to reduce cognitive load under stress.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-none bg-accent hover:bg-accent-hover text-white font-medium" data-testid="hero-checkin-btn">
                <Link to="/checkin">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Remote Check-In
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-none border-accent text-accent hover:bg-accent hover:text-white" data-testid="hero-heatmap-btn">
                <Link to="/heatmap">
                  <MapPin className="mr-2 h-5 w-5" />
                  View Live Heatmap
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION (BENTO GRID) ─── */}
      <section className="py-20 px-6 bg-surface_muted">
        <div className="container mx-auto">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-primary font-medium mb-4">
              A calmer healthcare experience
            </h2>
            <p className="text-text_muted text-lg">
              We replace chaotic waiting rooms with predictable, transparent digital queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Patient Focused Card (Large) */}
            <div className="md:col-span-8 group relative overflow-hidden bg-surface border border-border">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity group-hover:opacity-60"
                   style={{ backgroundImage: 'url("https://images.pexels.com/photos/26244207/pexels-photo-26244207.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940")' }}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent"></div>
              
              <div className="relative p-12 h-full flex flex-col justify-center">
                <Activity className="h-8 w-8 text-accent mb-6" />
                <h3 className="text-xl sm:text-2xl font-medium text-primary mb-4">Patient Check-in Flow</h3>
                <p className="text-text_muted mb-8 max-w-md leading-relaxed">
                  Join the queue from home using a simple SMS or WhatsApp message. 
                  Arrive exactly when it's your turn, reducing stress and exposure.
                </p>
                <Button asChild variant="link" className="p-0 h-auto justify-start font-medium" data-testid="patient-learn-more">
                  <Link to="/checkin">
                    Start flow <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Admin Focused Card */}
            <div className="md:col-span-4 bg-primary text-surface p-12 flex flex-col justify-between">
              <div>
                <ShieldCheck className="h-8 w-8 text-surface/80 mb-6" />
                <h3 className="text-xl sm:text-2xl font-medium mb-4">Admin Dashboard</h3>
                <p className="text-surface_muted/80 leading-relaxed">
                  Dense, high-contrast control room for hospital staff. 
                  Manage patient flow with precision.
                </p>
              </div>
              <div className="mt-12">
                <Button asChild variant="outline" className="w-full rounded-none border-surface/30 text-surface hover:bg-surface hover:text-primary" data-testid="admin-login-btn">
                  <Link to="/admin/login">
                    Staff Login
                  </Link>
                </Button>
              </div>
            </div>

            {/* Minor feature cards */}
            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <MapPin className="h-6 w-6 text-heatmap_status-medium mb-4" />
                <CardTitle className="text-xl">Live Heatmaps</CardTitle>
                <CardDescription className="text-base mt-2">
                  Visualize hospital congestion in real-time before you step out of the door.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <Clock className="h-6 w-6 text-heatmap_status-low mb-4" />
                <CardTitle className="text-xl">Zero Guesswork</CardTitle>
                <CardDescription className="text-base mt-2">
                  Track your exact position in the queue with down-to-the-minute accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="md:col-span-4 rounded-none border-border">
              <CardHeader className="p-8">
                <Users className="h-6 w-6 text-primary mb-4" />
                <CardTitle className="text-xl">Digital Wayfinding</CardTitle>
                <CardDescription className="text-base mt-2">
                  Clear, highly legible tracking screens inspired by airport departure boards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── STAFF PERSPECTIVE ─── */}
      <section className="py-24 px-6 border-t border-border bg-surface">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <div className="text-xs tracking-[0.15em] uppercase text-text_muted font-medium mb-4">
                Hospital Infrastructure
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight text-primary font-medium mb-6">
                Engineered for maximum screen real estate and efficiency.
              </h2>
              <p className="text-text_muted text-lg mb-8 leading-relaxed">
                Our admin tools ditch soft shadows and excessive padding in favor of a 
                dense "Control Room Grid" utilizing 1px solid borders. This allows staff 
                to see exactly what they need at a glance.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-mono text-primary font-medium mb-2">99%</div>
                  <div className="text-sm text-text_muted">Reduction in lobby congestion</div>
                </div>
                <div>
                  <div className="text-3xl font-mono text-primary font-medium mb-2">1px</div>
                  <div className="text-sm text-text_muted">Structured data layout</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="relative aspect-video border border-border bg-surface_muted overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-80"
                     style={{ backgroundImage: 'url("https://images.pexels.com/photos/33812023/pexels-photo-33812023.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940")' }}>
                </div>
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                {/* Mock UI Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-surface/95 backdrop-blur p-6 border border-border flex justify-between items-center">
                  <div>
                    <div className="text-xs tracking-wider uppercase text-text_muted font-medium mb-1">Queue Status</div>
                    <div className="text-xl font-heading text-primary font-medium">Cardiology OPD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-mono text-heatmap_status-low font-medium">Normal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-primary text-surface py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-heading text-xl font-medium tracking-wide">
            DocQueue
          </div>
          <div className="text-sm text-surface_muted/60">
            &copy; 2026 DocQueue Healthcare Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

`

## src\pages\HospitalsPage.jsx

`jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, MapPin, Clock, Users2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import IndiaHeatmap from "../components/IndiaHeatmap";
import CongestionBadge from "../components/CongestionBadge";
import { listHospitals, listCities, listSpecialties } from "../lib/api";

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [cities, setCities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await listHospitals();
      setHospitals(data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAll();
    listCities().then(setCities);
    listSpecialties().then(setSpecialties);
    const i = setInterval(fetchAll, 8000);
    return () => clearInterval(i);
  }, []);

  const filtered = useMemo(() => {
    return hospitals.filter(h => {
      const hCity = h.city || "";
      const hDepts = h.departments || [];
      const hName = h.name || "";
      
      if (city && hCity !== city) return false;
      if (spec && !hDepts.includes(spec)) return false;
      if (q) {
        const s = q.toLowerCase();
        const matchesDept = hDepts.some(d => d.toLowerCase().includes(s));
        return hName.toLowerCase().includes(s) || hCity.toLowerCase().includes(s) || matchesDept;
      }
      return true;
    });
  }, [hospitals, q, city, spec]);

  return (
    <div className="min-h-screen bg-bone" data-testid="hospitals-page">
      <Navbar />

      <section className="container-wide pt-12 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="label-eyebrow text-terracotta">Search & live map</p>
            <h1 className="font-display text-4xl lg:text-6xl text-olive mt-2 tracking-tight leading-[1]">
              Find a quieter <em className="not-italic text-terracotta">queue.</em>
            </h1>
            <p className="text-olive-ink/70 mt-4 max-w-2xl">
              All registered OPDs in your city, ranked by how crowded they are <span className="num">right now</span>.
            </p>
          </div>
          <div className="flex items-center gap-4 num text-[13px] text-olive/65">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> updating every 8s</span>
            <span>·</span>
            <span>{filtered.length} hospitals</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container-wide pb-6">
        <div className="bg-white hairline rounded-sm p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-olive/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by hospital, city or specialty"
              className="w-full bg-transparent pl-10 pr-3 py-3 text-[15px] text-olive-ink placeholder:text-olive/40 focus:outline-none border border-transparent focus:border-terracotta rounded-sm"
              data-testid="hospital-search-input"
            />
          </div>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="md:col-span-3 bg-transparent border border-olive/15 rounded-sm px-3 py-3 text-[14px] text-olive focus:outline-none focus:border-terracotta" data-testid="filter-city">
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={spec} onChange={(e) => setSpec(e.target.value)} className="md:col-span-3 bg-transparent border border-olive/15 rounded-sm px-3 py-3 text-[14px] text-olive focus:outline-none focus:border-terracotta" data-testid="filter-specialty">
            <option value="">All specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>

      <section className="container-wide pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <IndiaHeatmap hospitals={filtered} selectedId={selected?.id} onSelect={setSelected} />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <p className="label-eyebrow text-olive/60">Results</p>
            <p className="num text-[12px] text-olive/55">sorted by congestion</p>
          </div>
          <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1" data-testid="hospital-list">
            {loading && <p className="text-olive/55 text-sm py-8 text-center">Loading…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-olive/55 text-sm py-8 text-center">No hospitals match your filters.</p>
            )}
            {[...filtered].sort((a, b) => {
              const order = { low: 0, medium: 1, high: 2 };
              return order[a.stats?.congestion] - order[b.stats?.congestion];
            }).map(h => (
              <div
                key={h.id}
                onClick={() => setSelected(h)}
                className={`bg-white hairline rounded-sm p-5 cursor-pointer transition-all hover:border-olive/40 ${selected?.id === h.id ? 'border-terracotta shadow-[0_8px_24px_-12px_rgba(216,92,56,0.4)]' : ''}`}
                data-testid={`hospital-card-${h.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-olive text-lg leading-tight tracking-tight truncate">{h.name}</p>
                    <p className="text-olive-ink/60 text-[13px] mt-1 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" /> {h.city}, {h.state} · {h.departments?.slice(0, 3).join(', ')}{h.departments?.length > 3 ? '...' : ''}
                    </p>
                  </div>
                  <CongestionBadge level={h.stats?.congestion} />
                </div>
                <div className="mt-4 num text-[12px]">
                  <div>
                    <p className="label-eyebrow text-olive/45 text-[10px]">Avg consult time</p>
                    <p className="text-olive font-display text-lg mt-0.5">{h.stats?.avg_wait_minutes}m</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/checkin/${h.id}`}
                    className="text-terracotta text-[13px] font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all"
                    data-testid={`checkin-link-${h.id}`}
                  >
                    Check in remotely <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/admin/${h.id}`}
                    className="text-olive/55 text-[12px] hover:text-olive"
                    data-testid={`admin-link-${h.id}`}
                  >
                    Staff →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HospitalsPage;

`

## src\pages\Landing.jsx

`jsx
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
                  <p className="font-display text-olive text-[20px] leading-snug tracking-tight">
                    PAVAN KUMAR
                  </p>
                  <p className="text-terracotta text-[14px] font-medium mt-1 uppercase tracking-wider">Founder</p>
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

`

## src\pages\PatientDashboard.jsx

`jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStatus = async (id) => {
    try {
      const res = await axios.get(`https://queue-24ej.onrender.com/api/patients/${id}/status`);
      setPatient(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        localStorage.removeItem('patientId');
        setPatient(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      setLoading(false);
      return;
    }

    fetchStatus(patientId);

    // Initial setup ends, set up socket if patient exists
  }, []);

  useEffect(() => {
    if (patient && patient.hospital) {
      const socket = io('https://queue-24ej.onrender.com');
      socket.emit('join_hospital_room', patient.hospital._id);
      
      socket.on('queue_update', () => {
        fetchStatus(patient._id);
      });

      return () => socket.disconnect();
    }
  }, [patient?.hospital?._id]);

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave the queue?')) return;
    try {
      await axios.delete(`https://queue-24ej.onrender.com/api/patients/${patient._id}/leave`);
      localStorage.removeItem('patientId');
      setPatient(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem' }}>Loading...</div>;

  if (!patient || patient.status !== 'waiting') {
    return (
      <div className="queue-tracker glass-panel">
        <h2 style={{ marginBottom: '1rem' }}>No Active Queue</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You are not currently in any waiting queue.</p>
        <button className="btn btn-primary" onClick={() => navigate('/checkin')}>Join a Queue</button>
      </div>
    );
  }

  return (
    <div className="queue-tracker glass-panel">
      <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{patient.hospital?.name} • {patient.department}</div>
      <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'inline-block' }}>
        Token: <strong style={{ color: '#fff' }}>{patient.tokenNumber}</strong>
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Your Position</p>
        <div className="queue-number">{patient.queuePosition}</div>
        <p style={{ fontSize: '1.2rem' }}>Est. Wait: <strong style={{ color: 'var(--warning)' }}>{patient.expectedWaitTime} mins</strong></p>
      </div>

      <button className="btn btn-danger" style={{ marginTop: '3rem', width: '100%' }} onClick={handleLeave}>
        Leave Queue
      </button>
    </div>
  );
}

`

## src\pages\TrackPage.jsx

`jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, MessageSquare, Search, ArrowRight, Loader2, BellRing, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { trackToken } from "../lib/api";
import { io } from "socket.io-client";

const TrackPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const fetchStatus = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const d = await trackToken(token);
      setData(d);
      setError(null);
    } catch (e) {
      setError("Token not found. Double check the spelling.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let socket = null;

    const init = async () => {
      if (!token) return;
      
      try {
        const d = await trackToken(token);
        setData(d);
        setError(null);
        
        // Connect to Socket.io for real-time updates
        socket = io(import.meta.env.VITE_API_URL || 'https://queue-24ej.onrender.com');
        socket.emit('join_hospital_room', d.hospital.id || d.hospital._id);
        
        socket.on('queue_update', async () => {
          try {
            const updatedData = await trackToken(token);
            setData(updatedData);
          } catch (err) {
            console.error("Failed to refresh status", err);
          }
        });
        
      } catch (e) {
        setError("Token not found. Double check the spelling.");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    let interval;
    if (data && data.entry.targetTime && data.entry.status === 'waiting') {
      const target = new Date(data.entry.targetTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) {
          setTimeRemaining("Due now");
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
        }
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setTimeRemaining(null);
    }
    
    return () => clearInterval(interval);
  }, [data]);

  if (!token) {
    return (
      <div className="min-h-screen bg-bone" data-testid="track-search">
        <Navbar />
        <section className="container-tight pt-16 pb-24">
          <p className="label-eyebrow text-terracotta">Live tracking</p>
          <h1 className="font-display text-4xl lg:text-6xl text-olive mt-2 tracking-tight leading-[1]">
            Have a token? <em className="not-italic text-terracotta">Pull it up.</em>
          </h1>
          <p className="text-olive-ink/70 mt-4 max-w-xl">
            Enter the code from your check-in confirmation. We'll show your live position and ETA.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); if (search) navigate(`/track/${search.toUpperCase()}`); }} className="mt-10 bg-white hairline rounded-sm p-3 flex items-center gap-2 max-w-xl">
            <Search className="w-5 h-5 text-olive/45 ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. A-042"
              className="flex-1 bg-transparent py-3 px-2 text-olive-ink num text-lg uppercase placeholder:normal-case placeholder:text-olive/40 focus:outline-none"
              data-testid="track-input"
            />
            <button type="submit" className="btn-terracotta inline-flex items-center gap-1.5" data-testid="track-go">
              Track <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[13px] text-olive-ink/55 mt-6">
            Don't have a token yet? <Link to="/hospitals" className="text-terracotta font-medium">Find a hospital</Link> and check in.
          </p>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen bg-bone"><Navbar /><div className="container-wide py-32 text-center text-olive/60"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div></div>;
  }
  if (error) {
    return (
      <div className="min-h-screen bg-bone"><Navbar />
        <div className="container-tight py-32 text-center">
          <p className="font-display text-3xl text-olive">{error}</p>
          <Link to="/track" className="btn-ghost-olive mt-6 inline-flex">Try again</Link>
        </div>
      </div>
    );
  }

  const { entry, hospital, position, eta_minutes, current_token } = data;
  const isYourTurn = entry.status === "in_progress" || entry.status === "called";
  const isDone = entry.status === "done";

  return (
    <div className="min-h-screen bg-bone" data-testid="track-page">
      <Navbar />

      <section className="container-wide pt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <Link to="/track" className="text-olive/55 text-[13px] hover:text-olive">← Track another token</Link>
          <div className="flex items-center gap-2 num text-[12px] text-olive/60">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" /> live socket.io sync
          </div>
        </div>

        {/* Digital signage board */}
        <div className="bg-olive rounded-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-bone/10">
            <div>
              <p className="label-eyebrow text-bone/45">{hospital.name}</p>
              <p className="text-bone/85 font-display text-lg mt-0.5">{entry.department}</p>
            </div>
            <div className="flex items-center gap-2 bg-bone/10 px-3 py-1.5 rounded-sm">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isYourTurn ? 'bg-terracotta' : isDone ? 'bg-congestion-low' : 'bg-bone/70'}`} />
              <span className="text-[11px] text-bone num uppercase tracking-wider">
                {isYourTurn ? "Your turn" : isDone ? "Completed" : "Waiting"}
              </span>
            </div>
          </div>

          <div className="px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <p className="label-eyebrow text-bone/45">Your token</p>
              <p className="num text-bone font-display font-medium text-[120px] sm:text-[160px] lg:text-[200px] leading-[0.82] tracking-[-0.04em] mt-2" data-testid="token-display">
                {entry.token}
              </p>
              <div className="mt-6 flex items-center gap-3 text-bone/70 text-[13px]">
                <MessageSquare className="w-4 h-4" />
                Notifications {entry.notify_via === "none" ? "off" : `via ${entry.notify_via}`} · {entry.patient_phone}
              </div>
            </div>
            <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-bone/10">
              <div className="bg-olive p-6">
                <p className="label-eyebrow text-bone/45">Now serving</p>
                <p className="num font-display text-terracotta text-5xl lg:text-6xl mt-2 tracking-tight">{current_token || '—'}</p>
              </div>
              <div className="bg-olive p-6">
                <p className="label-eyebrow text-bone/45">Ahead of you</p>
                <p className="num font-display text-bone text-5xl lg:text-6xl mt-2 tracking-tight">{isDone ? 0 : Math.max(0, position - (isYourTurn ? 0 : 1))}</p>
              </div>
              <div className="bg-olive p-6 col-span-2">
                <p className="label-eyebrow text-bone/45">Timer Remaining</p>
                <p className="num font-display text-bone text-4xl lg:text-5xl mt-2 tracking-tight">
                  {isYourTurn ? "Now" : isDone ? "—" : (timeRemaining || `${eta_minutes}m`)}
                </p>
              </div>
            </div>
          </div>

          {/* Status strip */}
          <div className="border-t border-bone/10 px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {isYourTurn ? (
              <div className="flex items-center gap-3 text-bone">
                <BellRing className="w-5 h-5 text-terracotta animate-pulse" />
                <p className="text-base">Please proceed to <span className="font-medium text-terracotta">{entry.department}</span>. Doctor is ready.</p>
              </div>
            ) : isDone ? (
              <div className="flex items-center gap-3 text-bone">
                <CheckCircle2 className="w-5 h-5 text-congestion-low" />
                <p className="text-base">Consultation completed. Get well soon, {entry.patient_name.split(' ')[0]}.</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-bone/85">
                <Clock className="w-5 h-5 text-bone/55" />
                <p className="text-base">
                  {entry.notify_via === 'none' 
                    ? "Sit tight. Keep an eye on the timer."
                    : entry.notificationThreshold === 0
                      ? "Sit tight. We'll buzz you when it's exactly your turn."
                      : `Sit tight. We'll buzz you when the timer hits ${entry.notificationThreshold} minutes.`
                  }
                </p>
              </div>
            )}
            <Link to={`/hospitals`} className="text-bone/60 text-[13px] hover:text-bone">← Change hospital</Link>
          </div>
        </div>
      </section>

      {/* Hospital meta */}
      <section className="container-wide pb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white hairline rounded-sm p-6">
          <p className="label-eyebrow text-olive/55">Address</p>
          <p className="text-olive font-medium mt-2 flex items-start gap-2 leading-relaxed">
            <MapPin className="w-4 h-4 text-terracotta mt-0.5 shrink-0" /> {hospital.address}
          </p>
        </div>
        <div className="bg-white hairline rounded-sm p-6">
          <p className="label-eyebrow text-olive/55">Reason</p>
          <p className="text-olive mt-2 font-medium">{entry.symptom || "—"}</p>
        </div>
        <div className="bg-white hairline rounded-sm p-6">
          <p className="label-eyebrow text-olive/55">Checked in at</p>
          <p className="text-olive mt-2 num">{new Date(entry.created_at).toLocaleString()}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackPage;

`

## tailwind.config.js

`javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // DocQueue brand
        olive: {
          DEFAULT: '#1B3A35',
          dark: '#132724',
          ink: '#1C1F1E',
        },
        bone: {
          DEFAULT: '#F5F0E8',
          muted: '#EAE5DB',
        },
        terracotta: {
          DEFAULT: '#C8442A',
          hover: '#A63822',
        },
        congestion: {
          low: '#3E885B',
          medium: '#DE9B35',
          high: '#C74B36',
        },
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-ring': {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'marquee': 'marquee 45s linear infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

`

## vercel.json

`json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

`

## vite.config.js

`javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})

`

