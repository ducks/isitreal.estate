<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let {
    center = [39.8283, -98.5795],
    zoom = 4,
    markers = [],
    singlePin = false
  }: {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{ lat: number; lng: number; id: string; label: string; reviewCount?: number }>;
    singlePin?: boolean;
  } = $props();

  let mapElement: HTMLDivElement;
  let map: any;
  let L: any;

  onMount(async () => {
    L = await import('leaflet');

    // Import leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    map = L.map(mapElement).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    addMarkers();
  });

  function addMarkers() {
    if (!map || !L || markers.length === 0) return;

    const bounds: any[] = [];

    for (const m of markers) {
      if (!m.lat || !m.lng) continue;

      const marker = L.marker([m.lat, m.lng]).addTo(map);

      if (singlePin) {
        marker.bindPopup(`<strong>${m.label}</strong>`);
      } else {
        const popup = `<a href="/address/${m.id}" style="text-decoration:none;color:inherit;">
          <strong>${m.label}</strong>
          ${m.reviewCount ? `<br><small>${m.reviewCount} review${m.reviewCount !== 1 ? 's' : ''}</small>` : ''}
        </a>`;
        marker.bindPopup(popup);
      }

      bounds.push([m.lat, m.lng]);
    }

    if (bounds.length > 1 && !singlePin) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div class="map-container" bind:this={mapElement}></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border-radius: 8px;
    border: 1px solid var(--border);
    z-index: 0;
  }
</style>
