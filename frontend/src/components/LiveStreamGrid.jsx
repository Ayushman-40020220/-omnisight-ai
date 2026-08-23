import React, { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Sliders, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  Activity, 
  CheckCircle2,
  Radio
} from 'lucide-react';
import { api } from '../utils/api';

export default function LiveStreamGrid({ streamsData, confidence, setConfidence }) {
  const [selectedCam, setSelectedCam] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null);
  const [activeTabSub, setActiveTabSub] = useState('grid');
  const canvasRefs = useRef({});

  const streams = streamsData?.streams || [];

  // Draw real-time YOLO bounding boxes on HTML5 canvas for each camera
  useEffect(() => {
    streams.forEach(stream => {
      const canvas = canvasRefs.current[stream.camera_id];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Render camera background environment (high-tech surveillance aesthetic)
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw camera crosshairs & zone text
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Draw optical tracking detections
      stream.detections.forEach(det => {
        const [ymin, xmin, ymax, xmax] = det.bbox;
        const boxX = xmin * width;
        const boxY = ymin * height;
        const boxW = (xmax - xmin) * width;
        const boxH = (ymax - ymin) * height;

        const isCritical = det.threat === 'CRITICAL' || det.threat === 'HIGH';
        const color = det.color || (isCritical ? '#ff0055' : '#00e5ff');

        // Bounding Box
        ctx.strokeStyle = color;
        ctx.lineWidth = isCritical ? 2.5 : 1.5;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Corner brackets
        const cornerLen = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + cornerLen);
        ctx.lineTo(boxX, boxY);
        ctx.lineTo(boxX + cornerLen, boxY);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH);
        ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
        ctx.stroke();

        // Label Tag Background
        ctx.fillStyle = color;
        const labelText = `${det.label} (${Math.round(det.confidence * 100)}%)`;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillRect(boxX, Math.max(0, boxY - 18), textWidth + 10, 18);

        // Label Text
        ctx.fillStyle = '#030712';
        ctx.fillText(labelText, boxX + 5, Math.max(13, boxY - 5));

        // Velocity & Velocity vector trail
        if (det.velocity_mps > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`v: ${det.velocity_mps} m/s`, boxX, boxY + boxH + 14);
        }
      });
    });
  }, [streams]);

  const handleTriggerLockdown = async (camId) => {
    const res = await api.triggerAlert(camId, 'EMERGENCY_LOCKDOWN');
    setAlertStatus(`🚨 ${res.protocol} on ${camId}`);
    setTimeout(() => setAlertStatus(null), 4000);
  };

  const displayedStreams = selectedCam 
    ? streams.filter(s => s.camera_id === selectedCam) 
    : streams;

  return (
    <div style={{ padding: '0 20px 24px' }}>
      
      {/* Top Controls Bar */}
      <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="var(--accent-cyan)" className="animate-pulse-glow" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Optical Feeds</span>
            <span className="badge badge-cyan">{streams.length} Online</span>
          </div>

          {selectedCam && (
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
              onClick={() => setSelectedCam(null)}
            >
              <Minimize2 size={14} /> Exit Focused View
            </button>
          )}
        </div>

        {/* Confidence Threshold Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Sliders size={15} color="var(--accent-cyan)" />
            <span>YOLO Confidence Threshold:</span>
            <input 
              type="range" 
              min="0.10" 
              max="0.95" 
              step="0.05"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              style={{ width: '110px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)', width: '36px' }}>
              {Math.round(confidence * 100)}%
            </span>
          </div>

          {alertStatus && (
            <div className="badge badge-critical animate-pulse-glow" style={{ padding: '6px 12px' }}>
              {alertStatus}
            </div>
          )}
        </div>
      </div>

      {/* Camera Video Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedCam ? '1fr' : 'repeat(auto-fit, minmax(520px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {displayedStreams.map(stream => {
          const isHighThreat = stream.threat_level === 'CRITICAL' || stream.threat_level === 'HIGH';
          const badgeStyle = isHighThreat ? 'badge-high' : stream.threat_level === 'ELEVATED' ? 'badge-elevated' : 'badge-normal';

          return (
            <div 
              key={stream.camera_id} 
              className={`glass-panel ${isHighThreat ? 'glass-panel-glow' : ''}`}
              style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
            >
              {/* Camera Header Bar */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(7, 9, 14, 0.85)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isHighThreat ? '#ff0055' : '#00ff88' }} />
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{stream.camera_id}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>• {stream.camera_name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${badgeStyle}`}>
                    {stream.threat_level}
                  </span>
                  <button 
                    onClick={() => setSelectedCam(selectedCam === stream.camera_id ? null : stream.camera_id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                    title="Toggle Full View"
                  >
                    {selectedCam ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Video Viewport / Canvas Overlay */}
              <div style={{ position: 'relative', width: '100%', height: selectedCam ? '520px' : '320px', background: '#05070b' }}>
                <canvas 
                  ref={el => canvasRefs.current[stream.camera_id] = el}
                  width={640}
                  height={selectedCam ? 520 : 320}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
                
                {/* HUD Scanline Effect */}
                <div className="scanline-overlay" />

                {/* HUD Overlay Info */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'rgba(0, 229, 255, 0.8)',
                  background: 'rgba(0, 0, 0, 0.65)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  pointerEvents: 'none'
                }}>
                  REC [●] {stream.timestamp} | {stream.zone}
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(0, 0, 0, 0.65)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}>
                  YOLOv8 DETECTED: {stream.object_count} ENTITIES
                </div>
              </div>

              {/* Camera Footer & Actions */}
              <div style={{
                padding: '10px 14px',
                background: 'rgba(13, 17, 26, 0.6)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stream.scene_summary}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="btn-danger" 
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => handleTriggerLockdown(stream.camera_id)}
                  >
                    <ShieldAlert size={13} /> Lockdown
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
