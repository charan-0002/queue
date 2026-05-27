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
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayDepartments.map(dept => {
              const deptQueue = queue.filter(q => q.department === dept);
              const current = deptQueue.find(q => q.status === "in-consultation");
              const waiting = deptQueue.filter(q => q.status === "waiting");
              
              const dSettings = hospital.departmentSettings?.[dept] || { averageConsultationTime: hospital.averageConsultationTime || 15, isAccepting: true };
              const queueTime = waiting.length * dSettings.averageConsultationTime;
              
              return (
                <div key={dept} className={`bg-white hairline rounded-sm overflow-hidden flex flex-col h-[500px] ${!dSettings.isAccepting ? 'opacity-80 grayscale-[30%]' : ''}`}>
                  {/* Dept Header */}
                  <div className="bg-bone-muted/40 px-5 py-4 border-b border-olive/5 flex flex-col gap-3">
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
                    
                    {/* Dept Controls */}
                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-olive/10">
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
                  </div>

                  {/* Now Serving Block */}
                  {current ? (
                    <div className="bg-olive p-5 border-b border-olive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-bone/50 font-medium mb-0.5">Now Serving</p>
                          <p className="num font-display text-terracotta text-4xl leading-none">{current.token}</p>
                        </div>
                        <div className="border-l border-bone/15 pl-4">
                          <p className="text-bone font-medium text-[15px]">{current.patient_name}</p>
                          <p className="text-bone/60 text-[12px] truncate max-w-[150px]">{current.symptom || 'No reason'}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => handleAction(current.id, "complete")}
                          className="btn-terracotta text-[12px] py-1.5 px-3 inline-flex items-center justify-center gap-1.5"
                        >
                          {acting === current.id + "complete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Done
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(current.id, "skip")}
                            className="border border-bone/25 text-bone text-[12px] py-1.5 px-3 rounded-sm font-medium hover:bg-bone/10 inline-flex items-center justify-center gap-1.5 flex-1"
                          >
                            <SkipForward className="w-3 h-3" /> Skip
                          </button>
                          <button
                            onClick={() => handleAction(current.id, "delete")}
                            className="border border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-white text-[12px] px-2 rounded-sm inline-flex items-center justify-center transition-colors"
                            title="Delete Patient"
                          >
                            {acting === current.id + "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
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
                          const minsWait = Math.max(0, Math.round((Date.now() - new Date(q.created_at).getTime()) / 60000));
                          return (
                            <div key={q.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-bone-muted/20 transition-colors">
                              <div className="col-span-2 num text-olive font-medium text-[14px]">{q.token}</div>
                              <div className="col-span-5">
                                <p className="text-olive font-medium text-[13px] truncate">{q.patient_name}</p>
                                <p className="text-olive/50 text-[11px] truncate">{q.symptom || '—'}</p>
                              </div>
                              <div className="col-span-2 num text-olive/60 text-[12px]">{minsWait}m</div>
                              <div className="col-span-3 flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleAction(q.id, "call")}
                                  disabled={idx !== 0 && !current ? false : idx !== 0}
                                  className="text-terracotta border border-terracotta/25 hover:bg-terracotta hover:text-white text-[11px] px-2.5 py-1 rounded-sm font-medium disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-terracotta transition-all inline-flex items-center gap-1"
                                >
                                  {acting === q.id + "call" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Call"}
                                </button>
                                <button
                                  onClick={() => handleAction(q.id, "delete")}
                                  className="text-olive/40 border border-transparent hover:border-terracotta/30 hover:text-terracotta hover:bg-terracotta/5 text-[11px] px-1.5 py-1 rounded-sm transition-all inline-flex items-center"
                                  title="Delete Patient"
                                >
                                  {acting === q.id + "delete" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
