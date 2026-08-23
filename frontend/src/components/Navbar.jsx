import React from 'react';
import { 
  ShieldAlert, 
  Cctv, 
  Search, 
  FileText, 
  Network, 
  BarChart3, 
  Activity, 
  Zap, 
  UserCheck 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemStatus, stats }) {
  const threatClass = 
    systemStatus === 'CRITICAL' || systemStatus === 'HIGH' 
      ? 'badge-high' 
      : systemStatus === 'ELEVATED' 
      ? 'badge-elevated' 
      : 'badge-normal';

  return (
    <header className="glass-panel" style={{ margin: '16px 20px', padding: '12px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Live System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00e5ff 0%, #0077fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 229, 255, 0.4)'
            }}>
              <ShieldAlert size={22} color="#030712" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  OmniSight AI
                </span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(0, 229, 255, 0.3)' }}>
                  v1.0-RAG
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                YOLOv8 + FAISS Dense Vector Video Intelligence
              </p>
            </div>
          </div>

          <div style={{ height: '28px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Threat Posture Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge ${threatClass}`}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} className="animate-pulse-glow" />
              THREAT: {systemStatus || 'NORMAL'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(7, 9, 14, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button 
            className={`nav-tab ${activeTab === 'streams' ? 'active' : ''}`}
            onClick={() => setActiveTab('streams')}
          >
            <Cctv size={16} />
            <span>Live Streams</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search size={16} />
            <span>FAISS Video Search</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'rag' ? 'active' : ''}`}
            onClick={() => setActiveTab('rag')}
          >
            <FileText size={16} />
            <span>Incident RAG Copilot</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'vectors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vectors')}
          >
            <Network size={16} />
            <span>Vector Space 2D</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            <span>Threat Analytics</span>
          </button>
        </nav>

        {/* Telemetry & User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={13} color="var(--accent-cyan)" />
              <span>{stats.inference_latency_ms || 28.4}ms</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={13} color="var(--accent-emerald)" />
              <span>{stats.active_cameras || 4} CAMS @ 120 FPS</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <UserCheck size={14} color="var(--accent-emerald)" />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Chief Security Officer</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>JWT / Firebase Auth</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
