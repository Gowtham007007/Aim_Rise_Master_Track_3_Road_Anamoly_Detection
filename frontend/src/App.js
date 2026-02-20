// src/App.jsx
import { useEffect, useRef, useCallback } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import './App.css';

// ─── Config ──────────────────────────────────────────────────────────────────
const MAPTILER_API_KEY = 'g2YV87F7VWFwyXst1Gnn'; // Replace with your key
const API_BASE = 'http://localhost:3001/api';
const DEBOUNCE_MS = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMarkerColor(count) {
  if (count >= 20) return '#ef4444';   // Red  — high severity
  if (count >= 10) return '#f59e0b';   // Yellow — medium severity
  return '#22c55e';                     // Green — low severity
}

function getSeverityLabel(count) {
  if (count >= 20) return 'HIGH';
  if (count >= 10) return 'MEDIUM';
  return 'LOW';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);      // Tracks all live markers for cleanup
  const debounceRef = useRef(null);   // Holds the debounce timer
  const statsRef = useRef({ total: 0, high: 0, medium: 0, low: 0 });
  const statsElRef = useRef(null);

  // ── Fetch anomalies within current viewport bounds ──────────────────────────
  const fetchAndRenderAnomalies = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Remove all existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // 2. Get current viewport bounding box
    const bounds = map.getBounds();
    const params = new URLSearchParams({
      minLng: bounds.getWest().toFixed(6),
      minLat: bounds.getSouth().toFixed(6),
      maxLng: bounds.getEast().toFixed(6),
      maxLat: bounds.getNorth().toFixed(6),
    });

    try {
      const res = await fetch(`${API_BASE}/anomalies?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const anomalies = await res.json();

      // 3. Tally stats
      const stats = { total: anomalies.length, high: 0, medium: 0, low: 0 };

      // 4. Create markers for each anomaly
      anomalies.forEach((anomaly) => {
        const { road_name, count } = anomaly.properties;
        const [lng, lat] = anomaly.geometry.coordinates; // GeoJSON: [lng, lat]
        const color = getMarkerColor(count);
        const severity = getSeverityLabel(count);

        if (count >= 20) stats.high++;
        else if (count >= 10) stats.medium++;
        else stats.low++;

        // Build popup HTML
        const popupHTML = `
          <div class="popup-content">
            <div class="popup-road">${road_name}</div>
            <div class="popup-row">
              <span class="popup-label">Anomalies</span>
              <span class="popup-count" style="color:${color}">${count}</span>
            </div>
            <div class="popup-row">
              <span class="popup-label">Severity</span>
              <span class="popup-severity" style="background:${color}">${severity}</span>
            </div>
          </div>
        `;

        const popup = new maptilersdk.Popup({ offset: 28, closeButton: true })
          .setHTML(popupHTML);

        const marker = new maptilersdk.Marker({ color })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      // 5. Update stats panel
      statsRef.current = stats;
      if (statsElRef.current) {
        statsElRef.current.querySelector('#stat-total').textContent = stats.total;
        statsElRef.current.querySelector('#stat-high').textContent = stats.high;
        statsElRef.current.querySelector('#stat-medium').textContent = stats.medium;
        statsElRef.current.querySelector('#stat-low').textContent = stats.low;
      }
    } catch (err) {
      console.error('Failed to fetch anomalies:', err.message);
    }
  }, []);

  // ── Debounced update function (fires 300ms after last moveend) ───────────────
  const updateMarkers = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchAndRenderAnomalies, DEBOUNCE_MS);
  }, [fetchAndRenderAnomalies]);

  // ── Initialize MapTiler Map ──────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return; // Prevent double init (React StrictMode)

    maptilersdk.config.apiKey = MAPTILER_API_KEY;

    const map = new maptilersdk.Map({
      container: mapContainerRef.current,
      style: maptilersdk.MapStyle.STREETS_DARK,
      center: [-87.6298, 41.8781], // Chicago, IL
      zoom: 13,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Initial load — fetch immediately without debounce
      fetchAndRenderAnomalies();
    });

    // Viewport Engine: update markers every time the map stops moving
    map.on('moveend', updateMarkers);

    return () => {
      clearTimeout(debounceRef.current);
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [fetchAndRenderAnomalies, updateMarkers]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="header-icon">⚠</div>
          <div>
            <h1 className="header-title">RoadScan</h1>
            <p className="header-subtitle">Road Anomaly Detection System</p>
          </div>
        </div>
        <div className="header-badge">LIVE</div>
      </header>

      {/* Map */}
      <div className="map-wrapper">
        <div ref={mapContainerRef} className="map-container" />

        {/* Stats panel */}
        <div className="stats-panel" ref={statsElRef}>
          <div className="stats-title">Viewport Summary</div>
          <div className="stat-row">
            <span className="stat-dot" style={{ background: '#94a3b8' }} />
            <span className="stat-label">Total</span>
            <span className="stat-value" id="stat-total">–</span>
          </div>
          <div className="stat-row">
            <span className="stat-dot" style={{ background: '#ef4444' }} />
            <span className="stat-label">High ≥20</span>
            <span className="stat-value" id="stat-high">–</span>
          </div>
          <div className="stat-row">
            <span className="stat-dot" style={{ background: '#f59e0b' }} />
            <span className="stat-label">Med 10–19</span>
            <span className="stat-value" id="stat-medium">–</span>
          </div>
          <div className="stat-row">
            <span className="stat-dot" style={{ background: '#22c55e' }} />
            <span className="stat-label">Low &lt;10</span>
            <span className="stat-value" id="stat-low">–</span>
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="legend-title">Anomaly Count</div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: '#ef4444' }} />
            <span>High (≥20)</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: '#f59e0b' }} />
            <span>Medium (10–19)</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: '#22c55e' }} />
            <span>Low (&lt;10)</span>
          </div>
        </div>
      </div>
    </div>
  );
}