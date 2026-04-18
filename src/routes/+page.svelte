<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import Map from '$lib/components/Map.svelte';
  import Stars from '$lib/components/Stars.svelte';
  import AccuracyBadge from '$lib/components/AccuracyBadge.svelte';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');
  let suggestions = $state<any[]>([]);
  let focused = $state(false);
  let selIdx = $state(0);
  let debounceTimer: ReturnType<typeof setTimeout>;
  let searchBoxRef: HTMLDivElement;

  function handleInput() {
    clearTimeout(debounceTimer);
    selIdx = 0;
    if (searchQuery.trim().length < 3) {
      suggestions = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          suggestions = await res.json();
        }
      } catch {
        // ignore
      }
    }, 300);
  }

  async function selectAddress(suggestion: any) {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: suggestion.street || suggestion.display_name,
        city: suggestion.city || '',
        state: suggestion.state || '',
        zip: suggestion.zip || '',
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon || suggestion.lng)
      })
    });
    if (res.ok) {
      const address = await res.json();
      goto(`/address/${address.id}`);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selIdx = Math.min(selIdx + 1, suggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selIdx = Math.max(selIdx - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[selIdx]) selectAddress(suggestions[selIdx]);
    } else if (e.key === 'Escape') {
      focused = false;
    }
  }

  function onBlur(e: FocusEvent) {
    if (!searchBoxRef?.contains(e.relatedTarget as Node)) focused = false;
  }

  const mapMarkers = $derived(
    data.mapAddresses.map((a: any) => {
      const yes = a.yes_count ?? 0;
      const no = a.no_count ?? 0;
      const mood = yes > no ? 'yes' : no > yes ? 'no' : 'partial';
      return {
        lat: a.lat,
        lng: a.lng,
        id: a.id,
        label: `${a.street}, ${a.city}${a.state ? `, ${a.state}` : ''}`,
        reviewCount: a.review_count,
        mood
      };
    })
  );

  function addressLine(s: any) {
    return s.street || s.display_name;
  }

  function bodyPreview(body: string | null): string {
    if (!body) return '';
    return body.length > 140 ? body.slice(0, 140) + '…' : body;
  }

  function verdictForReview(v: string): 'yes' | 'partial' | 'no' {
    if (v === 'yes') return 'yes';
    if (v === 'no') return 'no';
    return 'partial';
  }

  function relativeTime(d: string): string {
    const then = new Date(d).getTime();
    const now = Date.now();
    const s = Math.max(1, Math.floor((now - then) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d ago`;
    const w = Math.floor(days / 7);
    if (w < 5) return `${w}w ago`;
    const mo = Math.floor(days / 30);
    if (mo < 12) return `${mo}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }
</script>

<div class="main">
  <section class="hero">
    <h1 class="hero-title">Know what you're walking into.</h1>
    <div class="hero-sub">
      a crowd-sourced ledger of what real estate listings actually deliver —
      left by the people who showed up.
    </div>

    <div class="search-wrap" bind:this={searchBoxRef} onfocusout={onBlur}>
      <span class="search-icon" aria-hidden="true">⌕</span>
      <input
        class="search-input"
        type="text"
        placeholder="Search an address before you visit."
        bind:value={searchQuery}
        oninput={handleInput}
        onfocus={() => (focused = true)}
        onkeydown={onKeyDown}
      />
      {#if focused && suggestions.length > 0}
        <div class="autocomplete">
          {#each suggestions as s, i (s.place_id ?? i)}
            <button
              type="button"
              class="row"
              class:sel={i === selIdx}
              onmouseenter={() => (selIdx = i)}
              onmousedown={(e) => {
                e.preventDefault();
                selectAddress(s);
              }}
            >
              <span class="addr">{addressLine(s)}</span>
              <span class="row-meta">
                {#if s.city || s.state}{s.city}{s.state ? `, ${s.state}` : ''}{/if}
              </span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <div class="home-grid">
    <div>
      <div class="section-label">Nearby reviewed addresses</div>
      <div class="map-box">
        {#if mapMarkers.length > 0}
          <Map markers={mapMarkers} />
        {:else}
          <div class="map-empty">no reviewed addresses yet</div>
        {/if}
        <div class="map-legend">
          <span class="key"><span class="sw green"></span>mostly accurate</span>
          <span class="key"><span class="sw amber"></span>mixed</span>
          <span class="key"><span class="sw red"></span>mostly misleading</span>
        </div>
      </div>
    </div>

    <div id="feed">
      <div class="section-label">Recent reviews</div>
      <div class="feed">
        {#if data.recentReviews.length === 0}
          <div class="feed-empty">no reviews yet. be the first.</div>
        {:else}
          {#each data.recentReviews as r}
            <a class="feed-item" href="/address/{r.address_id}">
              <div class="thumb" class:empty={!r.first_photo}>
                {#if r.first_photo}
                  <img src="/uploads/{r.first_photo}" alt="" />
                {:else}
                  <span>no photo</span>
                {/if}
              </div>
              <div class="feed-body-wrap">
                <div class="feed-addr">{r.street}</div>
                <div class="feed-meta">
                  <span class="author">@{r.username}</span>
                  <Stars n={r.rating} />
                  <AccuracyBadge value={verdictForReview(r.listing_accurate)} />
                  <span class="posted">· {relativeTime(r.created_at)}</span>
                </div>
                {#if r.body}
                  <div class="feed-body">{bodyPreview(r.body)}</div>
                {/if}
              </div>
            </a>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <div class="ticker">
    <div><strong>{data.stats.addresses_reviewed.toLocaleString()}</strong> addresses reviewed</div>
    <div><strong>{data.stats.total_reviews.toLocaleString()}</strong> reviews</div>
    <div><strong>{data.stats.total_photos.toLocaleString()}</strong> photos of evidence</div>
    <div><strong>{data.stats.contributors.toLocaleString()}</strong> contributors</div>
  </div>
</div>

<style>
  .main {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--content-pad-y) var(--content-pad-x) 80px;
  }

  /* ---- Hero ---- */
  .hero {
    padding-bottom: 28px;
    border-bottom: 1px solid var(--border-soft);
    margin-bottom: 28px;
  }
  .hero-title {
    font-family: var(--serif);
    font-size: 44px;
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.05;
    max-width: 20ch;
    margin: 0 0 12px 0;
  }
  .hero-sub {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--fg-mute);
    max-width: 60ch;
    margin-bottom: 22px;
    line-height: 1.6;
  }

  /* ---- Search ---- */
  .search-wrap {
    position: relative;
    max-width: 820px;
  }
  .search-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    font-family: var(--mono);
    color: var(--fg-faint);
    pointer-events: none;
    font-size: 18px;
  }
  .search-input {
    width: 100%;
    font-family: var(--serif);
    font-size: 22px;
    font-weight: 400;
    background: var(--bg-1);
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 14px 16px 14px 40px;
    line-height: 1.2;
  }
  .search-input:focus {
    outline: none;
    border-color: var(--amber);
  }
  .search-input::placeholder {
    color: var(--fg-faint);
  }

  .autocomplete {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-top: none;
    z-index: 20;
    max-height: 320px;
    overflow-y: auto;
  }
  .row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 14px;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--border-soft);
    text-align: left;
    cursor: pointer;
  }
  .row:last-child { border-bottom: none; }
  .row.sel,
  .row:hover {
    background: var(--bg-2);
  }
  .addr {
    font-family: var(--serif);
    font-size: 16px;
    color: var(--fg);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-meta {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-mute);
    white-space: nowrap;
  }

  /* ---- Two-col grid ---- */
  .home-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 28px;
    margin-top: 28px;
  }
  @media (max-width: 880px) {
    .home-grid {
      grid-template-columns: 1fr;
    }
    .map-box {
      height: 340px;
    }
  }

  @media (max-width: 560px) {
    .main {
      padding: 20px 16px 60px;
    }
    .hero-title {
      font-size: 30px;
      letter-spacing: -0.01em;
    }
    .hero-sub {
      font-size: 12px;
    }
    .search-input {
      font-size: 17px;
      padding: 12px 14px 12px 36px;
    }
    .search-icon {
      left: 12px;
      font-size: 16px;
    }
    .map-box {
      height: 260px;
    }
    .map-legend {
      font-size: 9px;
      padding: 4px 6px;
    }
    .feed-item {
      grid-template-columns: 56px 1fr;
      gap: 10px;
      padding: 12px 0;
    }
    .thumb {
      width: 56px;
      height: 56px;
    }
    .feed-addr {
      font-size: 14px;
    }
    .feed-body {
      font-size: 12px;
    }
    .ticker {
      padding: 16px 0;
      gap: 12px;
      font-size: 10px;
    }
    .ticker strong {
      font-size: 16px;
    }
    .ticker > div {
      flex: 1 1 40%;
      text-align: center;
    }
  }

  /* ---- Map box ---- */
  .map-box {
    position: relative;
    height: 460px;
    background: var(--bg-1);
    border: 1px solid var(--border);
  }
  :global(.map-box .leaflet-container) {
    height: 100%;
  }
  :global(.map-box .leaflet-tile) {
    filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.95) saturate(0.6);
  }
  :global(:root[data-theme="light"] .map-box .leaflet-tile) {
    filter: none;
  }
  .map-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-faint);
  }
  .map-legend {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 500;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 6px 8px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--fg-mute);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .key {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sw {
    width: 8px;
    height: 8px;
    display: inline-block;
  }
  .sw.green { background: var(--green); }
  .sw.amber { background: var(--amber); }
  .sw.red { background: var(--red); }

  /* ---- Feed ---- */
  .feed-empty {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-faint);
    padding: 20px 0;
  }
  .feed {
    display: flex;
    flex-direction: column;
  }
  .feed-item {
    display: grid;
    grid-template-columns: 70px 1fr;
    gap: 14px;
    padding: 14px 0;
    border-top: 1px solid var(--border-soft);
    color: var(--fg);
    text-decoration: none;
  }
  .feed-item:first-child { border-top: none; padding-top: 0; }
  .feed-item:hover { background: transparent; color: var(--fg); }
  .feed-item:hover .feed-addr { color: var(--amber); }

  .thumb {
    width: 70px;
    height: 70px;
    overflow: hidden;
    background: var(--bg-2);
    border: 1px solid var(--border-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--fg-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .feed-body-wrap {
    min-width: 0;
  }
  .feed-addr {
    font-family: var(--serif);
    font-size: 15px;
    color: var(--fg);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 120ms ease;
  }
  .feed-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-mute);
    margin-bottom: 4px;
  }
  .feed-meta .author { color: var(--fg-mute); }
  .feed-meta .posted { color: var(--fg-faint); }
  .feed-body {
    font-family: var(--sans);
    font-size: 13px;
    color: var(--fg-dim);
    line-height: 1.5;
  }

  /* ---- Stats ticker ---- */
  .ticker {
    margin-top: 40px;
    padding: 20px 0;
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 20px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .ticker strong {
    display: block;
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 500;
    color: var(--fg);
    text-transform: none;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }
</style>
