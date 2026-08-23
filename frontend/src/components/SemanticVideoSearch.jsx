import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Layers, 
  Sparkles, 
  Filter, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

const SAMPLE_QUERIES = [
  "Unattended backpack left on perimeter bench",
  "Intruder tailgating into restricted research lab",
  "Forklift speeding in loading dock zone",
  "Worker operating without mandatory safety helmet",
  "Datacenter server rack high temperature anomaly"
];

export default function SemanticVideoSearch() {
  const [query, setQuery] = useState("Unattended backpack left on perimeter bench");
  const [threatFilter, setThreatFilter] = useState("ALL");
  const [cameraFilter, setCameraFilter] = useState("ALL");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeSec, setCurrentTimeSec] = useState(42.5);

  const executeSearch = async (searchQuery = query) => {
    setLoading(true);
    const data = await api.semanticSearch(searchQuery, threatFilter, cameraFilter);
    if (data && data.results) {
      setResults(data.results);
      if (data.results.length > 0 && !selectedEvent) {
        setSelectedEvent(data.results[0]);
        setCurrentTimeSec(data.results[0].video_time_sec || 42.5);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    executeSearch();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setCurrentTimeSec(event.video_time_sec || 0);
  };

  return (
    <div style={{ padding: '0 20px 24px' }}>
      
      {/* Search Header Bar */}
      <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>FAISS Dense Vector Temporal Video Search</h2>
          <span className="badge badge-cyan">Sub-5ms Semantic Index</span>
        </div>

        {/* Search Input Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '320px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input 
              type="text"
              className="input-glass"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              placeholder="Describe any scene, object, safety violation, or temporal event in plain English..."
              style={{ width: '100%', paddingLeft: '42px' }}
            />
          </div>

          {/* Filters */}
          <select 
            className="input-glass"
            value={threatFilter}
            onChange={(e) => setThreatFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="ALL">All Threat Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="ELEVATED">Elevated</option>
            <option value="NORMAL">Normal</option>
          </select>

          <select 
            className="input-glass"
            value={cameraFilter}
            onChange={(e) => setCameraFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Cameras</option>
            <option value="CAM-01">CAM-01 (Gate 1)</option>
            <option value="CAM-02">CAM-02 (Lab 4)</option>
            <option value="CAM-03">CAM-03 (Loading Bay)</option>
            <option value="CAM-04">CAM-04 (Datacenter)</option>
          </select>

          <button className="btn-primary" onClick={() => executeSearch()}>
            <Search size={16} />
            <span>Search Vectors</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try queries:</span>
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setQuery(q); executeSearch(q); }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Video Player + Ranked FAISS Match Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 1.2fr) minmax(360px, 1fr)', gap: '20px' }}>
        
        {/* Left: Interactive Video Player Scrubber */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Temporal Clip Inspector: {selectedEvent?.camera_id || 'CAM-01'}
              </span>
            </div>
            {selectedEvent && (
              <span className={`badge ${selectedEvent.threat_level === 'CRITICAL' || selectedEvent.threat_level === 'HIGH' ? 'badge-high' : 'badge-elevated'}`}>
                {selectedEvent.threat_level}
              </span>
            )}
          </div>

          {/* Video Preview Canvas / Mock Viewport */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            background: '#05070b',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px'
          }}>
            {/* Visual Simulated CCTV Feed */}
            <div style={{
              width: '100%',
              height: '100%',
              backgroundImage: 'radial-gradient(circle, #101622 0%, #06090e 100%)',
              position: 'relative'
            }}>
              {/* Scanlines */}
              <div className="scanline-overlay" />

              {/* Simulated Bounding Box for Selected Event */}
              {selectedEvent && (
                <div style={{
                  position: 'absolute',
                  top: '30%',
                  left: '35%',
                  width: '180px',
                  height: '140px',
                  border: `2px solid ${selectedEvent.thumbnail_color || '#ff0055'}`,
                  boxShadow: `0 0 16px ${selectedEvent.thumbnail_color || 'rgba(255, 0, 85, 0.4)'}`,
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '6px'
                }}>
                  <div style={{
                    background: selectedEvent.thumbnail_color || '#ff0055',
                    color: '#030712',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    alignSelf: 'flex-start'
                  }}>
                    {selectedEvent.objects?.[0] || 'TARGET'} • FAISS MATCH
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '2px 4px',
                    borderRadius: '2px'
                  }}>
                    LOC: [0.35, 0.30]
                  </div>
                </div>
              )}

              {/* HUD Timestamp */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan)',
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                PLAYBACK: {selectedEvent?.timestamp || '14:22:15'} | SEC: {currentTimeSec.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Video Scrubber & Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '8px 12px' }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button 
              className="btn-secondary" 
              style={{ padding: '8px 12px' }}
              onClick={() => setCurrentTimeSec(selectedEvent?.video_time_sec || 0)}
              title="Reset to Event Timestamp"
            >
              <RotateCcw size={16} />
            </button>

            <input 
              type="range"
              min="0"
              max="720"
              step="1"
              value={currentTimeSec}
              onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {Math.floor(currentTimeSec / 60)}:{(Math.floor(currentTimeSec) % 60).toString().padStart(2, '0')} / 12:00
            </span>
          </div>

          {/* Selected Event Details Card */}
          {selectedEvent && (
            <div style={{
              background: 'rgba(13, 17, 26, 0.7)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                {selectedEvent.title}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
                {selectedEvent.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedEvent.objects?.map((obj, i) => (
                  <span key={i} className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                    {obj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Ranked FAISS Semantic Search Results */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Ranked Semantic Matches ({results.length})
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Model: all-MiniLM-L6-v2
            </span>
          </div>

          {/* Results List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '560px', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Sparkles size={24} color="var(--accent-cyan)" className="animate-pulse-glow" style={{ margin: '0 auto 8px' }} />
                <p>Vectorizing query & querying FAISS index...</p>
              </div>
            ) : results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No matches found matching filter criteria.
              </div>
            ) : (
              results.map((res, idx) => {
                const isSelected = selectedEvent?.id === res.id;
                const similarityPct = Math.round((res.similarity_score || 0.85) * 100);

                return (
                  <div
                    key={res.id || idx}
                    onClick={() => handleSelectEvent(res)}
                    className="glass-panel"
                    style={{
                      padding: '14px',
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                      background: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'var(--bg-card)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                          #{idx + 1} {res.camera_id}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {res.timestamp}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: similarityPct > 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {similarityPct}% Sim
                        </span>
                      </div>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                      {res.title}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '8px' }}>
                      {res.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {res.objects?.slice(0, 3).map((obj, oIdx) => (
                          <span key={oIdx} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            {obj}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                        <span>Inspect Clip</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
