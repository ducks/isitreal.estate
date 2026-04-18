<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type Marker = {
    lat: number;
    lng: number;
    id: string;
    label: string;
    reviewCount?: number;
    mood?: 'yes' | 'partial' | 'no';
  };

  let {
    center = [39.8283, -98.5795],
    zoom = 4,
    markers = [],
    singlePin = false
  }: {
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    singlePin?: boolean;
  } = $props();

  let mapElement: HTMLDivElement;
  let map: any;
  let L: any;

  onMount(async () => {
    L = await import('leaflet');

    // Leaflet CSS, once
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', '');
      document.head.appendChild(link);
    }

    map = L.map(mapElement, {
      zoomControl: true,
      attributionControl: true
    }).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM',
      maxZoom: 19
    }).addTo(map);

    addMarkers();
  });

  function addMarkers() {
    if (!map || !L || markers.length === 0) return;

    const bounds: any[] = [];

    for (const m of markers) {
      if (!m.lat || !m.lng) continue;

      const mood = m.mood ?? 'partial';
      const icon = L.divIcon({
        className: '',
        html: `<div class="ire-pin ire-pin--${mood}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

      if (singlePin) {
        marker.bindPopup(
          `<div class="ire-popup"><strong>${m.label}</strong></div>`
        );
      } else {
        const popup = `<div class="ire-popup">
          <div class="ire-popup__addr">${m.label}</div>
          ${m.reviewCount ? `<div class="ire-popup__meta">${m.reviewCount} review${m.reviewCount !== 1 ? 's' : ''}</div>` : ''}
          <a class="ire-popup__link" href="/address/${m.id}">open →</a>
        </div>`;
        marker.bindPopup(popup);
      }

      bounds.push([m.lat, m.lng]);
    }

    if (bounds.length > 1 && !singlePin) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    z-index: 0;
  }

  /* Custom pin shape + colors */
  :global(.ire-pin) {
    width: 14px;
    height: 14px;
    border: 2px solid var(--bg);
    box-sizing: border-box;
  }
  :global(.ire-pin--yes) { background: var(--green); }
  :global(.ire-pin--partial) { background: var(--amber); }
  :global(.ire-pin--no) { background: var(--red); }

  /* Sharp-cornered dark popups */
  :global(.leaflet-popup-content-wrapper),
  :global(.leaflet-popup-tip) {
    background: var(--bg-1);
    color: var(--fg);
    border: 1px solid var(--border);
    border-radius: 0;
    box-shadow: none;
  }
  :global(.leaflet-popup-content) {
    margin: 10px 12px;
    font-family: var(--sans);
    font-size: 12px;
    line-height: 1.4;
  }
  :global(.ire-popup__addr) {
    font-family: var(--serif);
    font-size: 14px;
    color: var(--fg);
    margin-bottom: 4px;
  }
  :global(.ire-popup__meta) {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-mute);
    margin-bottom: 6px;
  }
  :global(.ire-popup__link) {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--amber);
  }
  :global(.leaflet-popup-close-button) {
    color: var(--fg-mute) !important;
  }
</style>
