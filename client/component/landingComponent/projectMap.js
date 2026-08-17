import { $ } from '../../lib/lib.js';

// 1. Define your pins with Latitude and Longitude (Coordinates for Capiz municipalities)
const pins = [
  { lat: 11.4833, lng: 122.8833, label: 'Roxas City', project: 'Urban Gardening Initiative' },
  { lat: 11.5000, lng: 122.8833, label: 'Pontevedra', project: 'Sustainable Rice Farming' },
  { lat: 11.5167, lng: 122.9167, label: 'Burias', project: 'Mangrove Conservation' },
  { lat: 11.2667, lng: 122.5333, label: 'Tapaz', project: 'Highland Vegetable Production' }
];

export const ProjectMap = () => {
  let containerEl;

  const initMap = (container) => {
    // Ensure Leaflet CSS and JS are loaded only once
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);

      // Wait for Leaflet to load, then init
      script.onload = () => { createMap(container); };
    } else {
      // If already loaded, init immediately
      createMap(container);
    }
  };

  const createMap = (container) => {
    if (!container || typeof L === 'undefined') return;

    // Center the map on Capiz, Philippines
    const map = L.map(container).setView([11.42, 122.85], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers with popups
    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng]).addTo(map);
      marker.bindPopup(`
        <strong>${pin.label}</strong><br>
        <span style="font-size: 0.9rem; color: #475569;">${pin.project}</span>
      `);
    });

    // Force a redraw after the map mounts
    setTimeout(() => { map.invalidateSize(); }, 100);
  };

  return $({
    tag: 'section',
    style: { padding: '80px 0', backgroundColor: 'var(--white)' },
    child: [
      $({
        tag: 'div',
        att: { className: 'container' },
        child: [
          $({
            tag: 'div',
            att: { className: 'section-header' },
            child: [
              $({ tag: 'h2', text: 'Where We Extend', att: { className: 'section-title' } }),
              $({ tag: 'p', text: 'Research Development & Extension initiatives spread across Panay and beyond', style: { color: 'var(--text-gray)', marginTop: '15px' } })
            ]
          }),
          $({
            tag: 'div',
            att: { id: 'project-map-container' },
            style: {
              width: '100%',
              height: '600px',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)',
              overflow: 'hidden',
              position: 'relative',
              zIndex: '0' // Leaflet requires a low z-index
            },
            elementHandler: (el) => {
              containerEl = el;
              // Initialize the map after the element is in the DOM
              setTimeout(() => initMap(el), 200);
            }
          })
        ]
      })
    ]
  });
};