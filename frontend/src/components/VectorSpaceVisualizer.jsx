import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Layers, 
  Sparkles, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../utils/api';

export default function VectorSpaceVisualizer() {
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const canvasRef = useRef(null);

  const fetchVectors = async () => {
    const data = await api.getVectorProjections();
    if (data && data.projections) {
      setPoints(data.projections);
      if (data.projections.length > 0) {
        setSelectedPoint(data.projections[0]);
      }
    }
  };

  useEffect(() => {
    fetchVectors();
  }, []);

  // Draw 2D Vector Space Projection on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw coordinate radar grid
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 1;

    // Concentric circles
    for (let r = 50; r <= 250; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, height - 20);
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('PCA Component 1 (Primary Semantic Latent Dimension)', width - 290, centerY - 8);
    ctx.fillText('PCA Component 2', centerX + 8, 30);

    // Draw connecting similarity web between nearby vectors
    points.forEach((p1, i) => {
      points.slice(i + 1).forEach(p2 => {
        const x1 = centerX + p1.x * 2.2;
        const y1 = centerY + p1.y * 2.2;
        const x2 = centerX + p2.x * 2.2;
        const y2 = centerY + p2.y * 2.2;
        const dist = Math.hypot(x2 - x1, y2 - y1);

        if (dist < 140) {
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 - dist / 350})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      });
    });

    // Draw Vector Nodes
    points.forEach(p => {
      const px = centerX + p.x * 2.2;
      const py = centerY + p.y * 2.2;

      const isSelected = selectedPoint?.id === p.id;
      const isHovered = hoveredPoint?.id === p.id;

      const nodeColor = 
        p.threat === 'CRITICAL' || p.threat === 'HIGH' ? '#ff0055' :
        p.threat === 'ELEVATED' ? '#ffb703' : '#00e5ff';

      // Outer glow for selected/hovered
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor === '#ff0055' ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 229, 255, 0.3)';
        ctx.fill();
      }

      // Main Node Circle
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 8 : 6, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Node Text Label
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.font = isSelected ? 'bold 11px Outfit, sans-serif' : '10px Outfit, sans-serif';
      ctx.fillText(p.label.substring(0, 24) + '...', px + 12, py + 4);
    });

  }, [points, selectedPoint, hoveredPoint]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check hit radius
    for (const p of points) {
      const px = centerX + p.x * 2.2;
      const py = centerY + p.y * 2.2;
      if (Math.hypot(clickX - px, clickY - py) < 18) {
        setSelectedPoint(p);
        break;
      }
    }
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Network size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Interactive FAISS Vector Space & Semantic Cluster Topology</h2>
            <span className="badge badge-cyan">384-Dim → 2D Projection (PCA)</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Visually inspect how Sentence Transformer embeddings cluster related visual events (e.g. security threats, OSHA violations, and standard logistics).
          </p>
        </div>

        <button className="btn-secondary" onClick={fetchVectors}>
          <RefreshCw size={14} /> Refresh Vectors
        </button>
      </div>

      {/* Grid: Canvas Visualizer (Left) + Vector Node Inspector (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 1.4fr) minmax(340px, 1fr)', gap: '20px' }}>
        
        {/* Canvas Visualizer Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Click any vector node to inspect metadata & similarity links
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff0055' }}>
                ● Critical / Threat
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffb703' }}>
                ● Elevated / Safety
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00e5ff' }}>
                ● Normal / Verified
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '540px', background: '#05080e', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <canvas 
              ref={canvasRef}
              width={720}
              height={540}
              onClick={handleCanvasClick}
              style={{ width: '100%', height: '100%', cursor: 'crosshair', display: 'block' }}
            />
            <div className="scanline-overlay" />
          </div>
        </div>

        {/* Selected Vector Node Detail Card */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <Info size={18} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Vector Embedding Inspector</span>
          </div>

          {selectedPoint ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  FAISS INDEX #{selectedPoint.id} • {selectedPoint.camera_id} • {selectedPoint.timestamp}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '4px', color: 'var(--text-primary)' }}>
                  {selectedPoint.label}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`badge ${selectedPoint.threat === 'CRITICAL' || selectedPoint.threat === 'HIGH' ? 'badge-high' : 'badge-elevated'}`}>
                  THREAT: {selectedPoint.threat}
                </span>
                <span className="badge badge-cyan">
                  Coordinates: [{selectedPoint.x}, {selectedPoint.y}]
                </span>
              </div>

              <div style={{ background: 'rgba(13, 17, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                  RAW EVENT DESCRIPTION
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {selectedPoint.text}
                </p>
              </div>

              <div style={{ background: 'rgba(13, 17, 26, 0.7)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '6px' }}>
                  384-DIM EMBEDDING CHARACTERISTICS
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  • Architecture: SentenceTransformers (all-MiniLM-L6-v2)<br />
                  • Metric: Cosine Distance (L2-Normalized FlatIP)<br />
                  • Quantization: FP32 Native Index
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              Click any vector cluster node on the map to inspect its embeddings.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
