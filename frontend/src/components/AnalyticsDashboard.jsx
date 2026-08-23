import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  Cpu, 
  HardDrive, 
  Layers 
} from 'lucide-react';

export default function AnalyticsDashboard({ stats, streamsData }) {
  const detections = [
    { time: '15:45:19', cam: 'CAM-03', event: 'Warehouse worker missing mandatory helmet', threat: 'ELEVATED', conf: '91%' },
    { time: '15:30:05', cam: 'CAM-01', event: 'FedEx delivery truck entered Gate 1', threat: 'NORMAL', conf: '96%' },
    { time: '15:18:22', cam: 'CAM-04', event: 'Datacenter thermal spike (46.2°C)', threat: 'HIGH', conf: '88%' },
    { time: '15:04:10', cam: 'CAM-03', event: 'Forklift speeding violation (14 mph in 5 mph zone)', threat: 'ELEVATED', conf: '94%' },
    { time: '14:35:40', cam: 'CAM-02', event: 'Unauthorized tailgating breach into Research Lab 4', threat: 'CRITICAL', conf: '97%' },
    { time: '14:22:15', cam: 'CAM-01', event: 'Unattended tactical backpack on perimeter bench', threat: 'HIGH', conf: '95%' }
  ];

  return (
    <div style={{ padding: '0 20px 24px' }}>
      
      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>YOLO INFERENCE SPEED</span>
            <Cpu size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            28.4 ms
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            GPU / CPU Optimized Pipeline
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>FAISS VECTOR SEARCH LATENCY</span>
            <Layers size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
            4.2 ms
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            384-Dim Inner Product ANN
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>INDEXED VIDEO EPISODES</span>
            <HardDrive size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
            1,420
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cross-Camera Temporal Archive
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SECTOR COMPLIANCE RATE</span>
            <ShieldCheck size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00ff88' }}>
            94.8%
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            OSHA / Security Policy Verified
          </p>
        </div>

      </div>

      {/* Middle Row: Zone Threat Radar & Class Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1fr) minmax(460px, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
        
        {/* Zone Threat Distribution */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertOctagon size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Zone Threat Level Posture</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { zone: 'Zone A - Perimeter & Gate 1', level: 'NORMAL', pct: 95, color: '#00ff88' },
              { zone: 'Zone B - Restricted Research Lab 4', level: 'CRITICAL', pct: 28, color: '#ff0055' },
              { zone: 'Zone C - Loading Bay & Dock 2', level: 'ELEVATED', pct: 64, color: '#ffb703' },
              { zone: 'Zone D - Core Datacenter Vault', level: 'NORMAL', pct: 98, color: '#00ff88' }
            ].map((z, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span>{z.zone}</span>
                  <span style={{ fontWeight: 700, color: z.color, fontFamily: 'var(--font-mono)' }}>{z.level} ({z.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${z.pct}%`, height: '100%', background: z.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Object Class Frequencies */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BarChart3 size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>YOLO Object Class Detection Breakdown</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Personnel', count: 482, color: 'var(--accent-cyan)' },
              { label: 'Vehicles / Trucks', count: 124, color: 'var(--accent-emerald)' },
              { label: 'Forklifts', count: 68, color: 'var(--accent-amber)' },
              { label: 'Unattended Bags', count: 14, color: 'var(--accent-crimson)' },
              { label: 'Safety Violations', count: 32, color: '#d90429' },
              { label: 'Thermal Sensors', count: 56, color: '#7209b7' }
            ].map((c, i) => (
              <div key={i} style={{ background: 'rgba(7,9,14,0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: c.color }}>
                  {c.count}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Detection Audit Trail Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Clock size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Real-Time Detection & Audit Event Log</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>TIMESTAMP</th>
                <th style={{ padding: '10px 12px' }}>CAMERA</th>
                <th style={{ padding: '10px 12px' }}>EVENT DESCRIPTION</th>
                <th style={{ padding: '10px 12px' }}>THREAT LEVEL</th>
                <th style={{ padding: '10px 12px' }}>CONFIDENCE</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{d.time}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{d.cam}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{d.event}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`badge ${d.threat === 'CRITICAL' || d.threat === 'HIGH' ? 'badge-high' : d.threat === 'ELEVATED' ? 'badge-elevated' : 'badge-normal'}`}>
                      {d.threat}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{d.conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
