import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowRight, MapPin, Clock, MessageSquare, Phone, User, Stethoscope, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CongestionBadge from "../components/CongestionBadge";
import { getHospital, checkin } from "../lib/api";
import { toast } from "sonner";
import { io } from "socket.io-client";

const SMS_SHORTCODE = import.meta.env.VITE_SMS_SHORTCODE || "9555-12-3000";

const CheckinPage = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    symptom: "",
    department: "",
    notify_via: "whatsapp",
  });

  useEffect(() => {
    let socket = null;
    if (!hospitalId) return;
    
    const fetchIt = () => {
      getHospital(hospitalId).then((h) => {
        setHospital(h);
        setForm(f => ({ ...f, department: f.department || h.departments?.[0] || h.specialty || "" }));
      })
      .catch(() => setError("Could not load hospital details. Please try again."))
      .finally(() => setLoading(false));
    };
    
    fetchIt();
    
    socket = io(import.meta.env.VITE_API_URL || 'https://wild-llamas-juggle.loca.lt');
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
    
    const phoneRegex = /^[+]?[\d\s\-]{10,13}$/;
    if (!phoneRegex.test(form.patient_phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSubmitting(true);
    try {
      const entry = await checkin(hospitalId, form);
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
  const displayAvgWait = dSettings?.averageConsultationTime || hospital.stats?.avg_wait_minutes || 15;

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
                <p className="num font-display text-olive text-3xl mt-1">{hospital.stats?.current_token || '—'}</p>
              </div>
              <div>
                <p className="label-eyebrow text-olive/45">Waiting</p>
                <p className="num font-display text-olive text-3xl mt-1">{hospital.stats?.waiting}</p>
              </div>
              <div>
                <p className="label-eyebrow text-olive/45">Avg consult</p>
                <p className="num font-display text-olive text-3xl mt-1">{displayAvgWait}m</p>
              </div>
            </div>
            <p className="mt-5 text-[13px] text-olive-ink/60">
              Department: <span className="text-olive font-medium">{form.department || 'Not selected'}</span>
            </p>
          </div>

          <div className="mt-6 bg-bone-muted/70 rounded-sm p-5">
            <p className="label-eyebrow text-olive/55">Prefer SMS?</p>
            <p className="text-olive-ink/75 text-[14px] mt-2 leading-relaxed">
              Send <span className="num text-olive font-medium">JOIN {hospital.name.split(' ')[0].toUpperCase()}</span> to <span className="num text-olive font-medium">{SMS_SHORTCODE}</span>. We'll reply with your token.
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
                <input
                  type="tel"
                  value={form.patient_phone}
                  onChange={(e) => setForm(f => ({ ...f, patient_phone: e.target.value }))}
                  placeholder="+91 98••• •••••"
                  className="w-full bg-transparent px-3 py-3 text-[15px] text-olive-ink focus:outline-none num"
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
                {(hospital.departments || [hospital.specialty]).map(dept => {
                  const dSettings = hospital.departmentSettings?.[dept] || { isAccepting: true };
                  if (!dSettings.isAccepting) return null;
                  return <option key={dept} value={dept}>{dept}</option>;
                })}
              </select>
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

            <div className="border-t border-olive/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-[12px] text-olive-ink/55 max-w-sm leading-relaxed">
                By checking in you agree to receive queue updates. Your data stays with the hospital.
              </p>
              <button
                type="submit"
                disabled={submitting}
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
