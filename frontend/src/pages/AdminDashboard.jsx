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
        const res = await axios.get(`https://wild-llamas-juggle.loca.lt/api/hospitals/${hospitalId}/queue`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchQueue();

    const socket = io('https://wild-llamas-juggle.loca.lt');
    socket.emit('join_hospital_room', hospitalId);
    
    socket.on('queue_update', () => {
      fetchQueue();
    });

    return () => socket.disconnect();
  }, [hospitalId, token, navigate]);

  const advanceQueue = async (patientId, newStatus) => {
    try {
      await axios.put('https://wild-llamas-juggle.loca.lt/api/queue/advance', 
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
