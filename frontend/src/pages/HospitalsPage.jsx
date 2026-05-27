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
                <div className="mt-4 grid grid-cols-3 gap-2 num text-[12px]">
                  <div>
                    <p className="label-eyebrow text-olive/45 text-[10px]">Waiting</p>
                    <p className="text-olive font-display text-lg mt-0.5">{h.stats?.waiting}</p>
                  </div>
                  <div>
                    <p className="label-eyebrow text-olive/45 text-[10px]">Now</p>
                    <p className="text-terracotta font-display text-lg mt-0.5">{h.stats?.current_token || '—'}</p>
                  </div>
                  <div>
                    <p className="label-eyebrow text-olive/45 text-[10px]">Avg consult</p>
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
