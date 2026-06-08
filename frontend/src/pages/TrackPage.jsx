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
        socket = io(import.meta.env.VITE_API_URL || 'https://wild-llamas-juggle.loca.lt');
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
                <p className="label-eyebrow text-bone/45">Estimated wait</p>
                <p className="num font-display text-bone text-4xl lg:text-5xl mt-2 tracking-tight">
                  {isYourTurn ? "Now" : isDone ? "—" : `${eta_minutes}m`}
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
                <p className="text-base">Sit tight. We'll buzz you when 5 tokens remain.</p>
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
