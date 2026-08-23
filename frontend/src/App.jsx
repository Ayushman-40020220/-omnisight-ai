import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiveStreamGrid from './components/LiveStreamGrid';
import SemanticVideoSearch from './components/SemanticVideoSearch';
import IncidentRAGCopilot from './components/IncidentRAGCopilot';
import VectorSpaceVisualizer from './components/VectorSpaceVisualizer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { api } from './utils/api';
import { AlertTriangle, Bell } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('streams');
  const [confidence, setConfidence] = useState(0.45);
  const [streamsData, setStreamsData] = useState(null);
  const [stats, setStats] = useState({
    active_cameras: 4,
    total_detections_logged: 142,
    indexed_vector_scenes: 7,
    generated_incident_reports: 3,
    inference_latency_ms: 28.4,
    vector_search_latency_ms: 4.2
  });

  // Poll streams for real-time telemetry animation
  useEffect(() => {
    let intervalId;
    const fetchStreams = async () => {
      const data = await api.getAllStreams(confidence);
      if (data) {
        setStreamsData(data);
      }
    };

    fetchStreams();
    intervalId = setInterval(fetchStreams, 1500);
    return () => clearInterval(intervalId);
  }, [confidence]);

  // Fetch stats periodically
  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getStats();
      if (data) {
        setStats(data);
      }
    };
    fetchStats();
  }, []);

  const systemStatus = streamsData?.system_threat_posture || 'NORMAL';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Threat Alert Marquee if High Threat */}
      {(systemStatus === 'CRITICAL' || systemStatus === 'HIGH') && (
        <div style={{
          background: 'linear-gradient(90deg, #ff0055 0%, #b5179e 100%)',
          color: '#fff',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 2px 14px rgba(255, 0, 85, 0.4)'
        }}>
          <AlertTriangle size={15} className="animate-pulse-glow" />
          <span>ALERT: ANOMALOUS TAILGATING ACTIVITY DETECTED IN ZONE B LAB 4 — DISPATCHING SECURITY COPILOT</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus}
        stats={stats}
      />

      {/* Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'streams' && (
          <LiveStreamGrid 
            streamsData={streamsData} 
            confidence={confidence} 
            setConfidence={setConfidence} 
          />
        )}

        {activeTab === 'search' && (
          <SemanticVideoSearch />
        )}

        {activeTab === 'rag' && (
          <IncidentRAGCopilot />
        )}

        {activeTab === 'vectors' && (
          <VectorSpaceVisualizer />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            stats={stats} 
            streamsData={streamsData} 
          />
        )}
      </main>

      {/* Footer Bar */}
      <footer style={{
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.8)',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>OmniSight AI</strong> • Real-Time Computer Vision & Temporal Video RAG Platform
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            Stack: React 18 • FastAPI • YOLOv8 • FAISS • Groq LLaMA-3.3 • PyJWT
          </div>
        </div>
      </footer>

    </div>
  );
}
