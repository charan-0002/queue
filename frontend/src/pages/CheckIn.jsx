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
    axios.get('https://wild-llamas-juggle.loca.lt/api/hospitals')
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
      const res = await axios.post('https://wild-llamas-juggle.loca.lt/api/patients/checkin', formData);
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
