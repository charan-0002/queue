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
      const res = await axios.get(`https://docqueue-api-production.up.railway.app/api/patients/${id}/status`);
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
      const socket = io('https://docqueue-api-production.up.railway.app');
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
      await axios.delete(`https://docqueue-api-production.up.railway.app/api/patients/${patient._id}/leave`);
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
