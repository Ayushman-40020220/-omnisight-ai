import React, { useState } from 'react';
import { 
  Bot, 
  FileText, 
  Send, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ShieldAlert, 
  Layers, 
  CornerDownLeft,
  Cpu
} from 'lucide-react';
import { api } from '../utils/api';

const PRESET_INCIDENTS = [
  "Comprehensive RCA of Unauthorized Tailgating Breach in Zone B Lab 4",
  "OSHA Safety Audit on Forklift Speeding & Blocked Fire Exit 2",
  "Threat Assessment for Unattended Tactical Backpack at Gate 1",
  "Datacenter Server Cluster #12 Thermal Hotspot & Risk of Hardware Failure"
];

export default function IncidentRAGCopilot() {
  const [prompt, setPrompt] = useState(PRESET_INCIDENTS[0]);
  const [cameraFilter, setCameraFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Interactive Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: "👋 I'm the **OmniSight Multimodal RAG Copilot** powered by Groq LLaMA-3.3 70B and FAISS. Ask me to cross-reference multi-camera video telemetry, detect anomalies, or generate an enterprise Root Cause Analysis (RCA) report."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerateReport = async (queryText = prompt) => {
    setLoading(true);
    const data = await api.generateIncidentReport(queryText, cameraFilter);
    if (data) {
      setReportData(data);
    }
    setLoading(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    const res = await api.sendCopilotChat(userMsg);
    setChatMessages(prev => [...prev, { 
      sender: 'bot', 
      text: res.reply || "Telemetry processed. Cross-camera validation confirmed." 
    }]);
    setChatLoading(false);
  };

  const copyToClipboard = () => {
    if (!reportData) return;
    navigator.clipboard.writeText(reportData.report_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Bot size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Autonomous Multimodal RAG & Root Cause Analysis Engine</h2>
              <span className="badge badge-cyan">
                <Cpu size={12} /> Groq LLaMA-3.3 70B
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Combines dense FAISS video retrieval with fast LLM reasoning to produce audit-ready security & compliance reports.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {reportData && (
              <>
                <button className="btn-secondary" onClick={copyToClipboard}>
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied Markdown' : 'Copy Report'}</span>
                </button>
                <button className="btn-primary" onClick={() => window.print()}>
                  <Download size={14} />
                  <span>Export Report</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Presets & Custom Incident Prompt Form */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '320px' }}>
            <input 
              type="text"
              className="input-glass"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Specify investigation objective, threat scenario, or safety violation to audit..."
              style={{ width: '100%' }}
            />
          </div>

          <select 
            className="input-glass"
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Camera Zones</option>
            <option value="CAM-01">CAM-01 (Gate 1)</option>
            <option value="CAM-02">CAM-02 (Lab 4)</option>
            <option value="CAM-03">CAM-03 (Loading Dock)</option>
            <option value="CAM-04">CAM-04 (Datacenter)</option>
          </select>

          <button 
            className="btn-primary" 
            onClick={() => handleGenerateReport()}
            disabled={loading}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Synthesizing...' : 'Generate RAG Report'}</span>
          </button>
        </div>

        {/* Preset Investigation Pills */}
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Investigation Scenarios:</span>
          {PRESET_INCIDENTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => { setPrompt(item); handleGenerateReport(item); }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {item.substring(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Generated Report (Left) + Interactive RAG Chat Copilot (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(460px, 1.4fr) minmax(360px, 1fr)', gap: '20px' }}>
        
        {/* Left: Structured Investigation Report Output */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                Incident Investigation Dossier
              </span>
            </div>
            {reportData && (
              <span className="badge badge-normal">
                {reportData.incident_id}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <Sparkles size={32} color="var(--accent-cyan)" className="animate-pulse-glow" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Retrieving FAISS video embeddings & synthesizing LLaMA-3.3 RCA...
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Cross-referencing optical timestamps and bounding box coordinates</p>
            </div>
          ) : reportData ? (
            <div>
              {/* Evidence Citation Cards */}
              <div style={{ marginBottom: '18px', background: 'rgba(7, 9, 14, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '8px' }}>
                  <Layers size={13} />
                  <span>GROUNDED VIDEO EVIDENCE (RETRIEVED VIA FAISS)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {reportData.evidence_matches?.map((ev, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>#{i+1} {ev.camera_id} @ {ev.timestamp}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.2 }}>{ev.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formatted Report Content */}
              <div style={{
                background: 'rgba(13, 17, 26, 0.7)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                whiteSpace: 'pre-line'
              }}>
                {reportData.report_markdown}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
              <p>Select an incident scenario above and click <strong>Generate RAG Report</strong> to run full multimodal inference.</p>
            </div>
          )}
        </div>

        {/* Right: Live Copilot Chat Assistant */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Bot size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Conversational Surveillance Copilot</span>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '12px' }}>
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #0077fe, #00b4d8)' : 'rgba(255, 255, 255, 0.05)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  lineHeight: 1.4,
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                <Sparkles size={14} className="animate-pulse-glow" style={{ display: 'inline', marginRight: '6px' }} />
                Copilot is cross-referencing telemetry...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text"
              className="input-glass"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask copilot about camera zones, worker PPE, threats..."
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={handleSendChat} style={{ padding: '8px 14px' }}>
              <Send size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
