<script lang="ts">
  import type { PageData } from './$types';
  import Map from '$lib/components/Map.svelte';
  import ReviewCard from '$lib/components/ReviewCard.svelte';
  import StatPill from '$lib/components/StatPill.svelte';
  import Lightbox from '$lib/components/Lightbox.svelte';

  let { data }: { data: PageData } = $props();

  let sortMode = $state<'helpful' | 'newest'>('helpful');
  let shareText = $state('share');

  // Reporting
  let reportingReviewId = $state<string | null>(null);
  let reportReason = $state('');

  // Listings
  let showAddListing = $state(false);
  let listingUrl = $state('');
  let listingPrice = $state('');
  let listingError = $state('');

  // Lightbox
  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  const allPhotos = $derived(data.allPhotos ?? []);

  function openLightbox(i: number) {
    lightboxIndex = i;
    lightboxOpen = true;
  }

  function copyShare() {
    navigator.clipboard.writeText(window.location.href);
    shareText = 'copied';
    setTimeout(() => (shareText = 'share'), 1500);
  }

  async function vote(reviewId: string, kind: 'accurate' | 'not_accurate') {
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, vote: kind })
    });
    location.reload();
  }

  async function submitReport(reviewId: string) {
    if (!reportReason.trim()) return;
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, reason: reportReason })
    });
    reportingReviewId = null;
    reportReason = '';
  }

  async function adminDeleteReview(reviewId: string) {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
    location.reload();
  }

  async function addListing() {
    listingError = '';
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: data.address.id,
          url: listingUrl,
          price: listingPrice || null
        })
      });
      if (!res.ok) {
        const d = await res.json();
        listingError = d.error || 'Failed to add listing';
        return;
      }
      location.reload();
    } catch {
      listingError = 'network error';
    }
  }

  async function deleteListing(id: string) {
    await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
    location.reload();
  }

  const sortedReviews = $derived(
    sortMode === 'helpful'
      ? [...data.reviews] // server already sorts by helpful
      : [...data.reviews].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
  );

  const accurateTone = $derived(
    data.stats.accuratePercent >= 60
      ? 'green'
      : data.stats.accuratePercent >= 40
        ? 'amber'
        : 'red'
  );
</script>

<svelte:head>
  <title
    >{data.address.street}, {data.address.city}{data.address.state
      ? `, ${data.address.state}`
      : ''} — isitreal.estate</title
  >
  <meta
    name="description"
    content="{data.stats.totalReviews} review{data.stats.totalReviews !== 1
      ? 's'
      : ''} for {data.address.street}, {data.address.city}. {data.stats
      .accuratePercent}% say listings are accurate."
  />
</svelte:head>

<div class="main">
  <!-- Crumbs -->
  <div class="crumbs">
    <a href="/">search</a>
    {#if data.address.state}<span class="sep">/</span><span>{data.address.state}</span>{/if}
    {#if data.address.city}<span class="sep">/</span><span>{data.address.city}</span>{/if}
    <span class="sep">/</span>
    <span>{data.address.street}</span>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <h1>{data.address.street}</h1>
      <div class="sub">
        {data.address.city}{data.address.state ? `, ${data.address.state}` : ''}
        {data.address.zip || ''}
      </div>
      <div class="sub-muted">
        <button type="button" class="share" onclick={copyShare}>{shareText}</button>
      </div>
    </div>

    {#if data.address.lat && data.address.lng}
      <div class="mini-map">
        <Map
          center={[data.address.lat, data.address.lng]}
          zoom={16}
          markers={[
            {
              lat: data.address.lat,
              lng: data.address.lng,
              id: data.address.id,
              label: data.address.street
            }
          ]}
          singlePin={true}
        />
        <div class="latlng">{data.address.lat.toFixed(4)}, {data.address.lng.toFixed(4)}</div>
      </div>
    {/if}
  </header>

  <!-- Stat pill bar -->
  <div class="statbar">
    <StatPill value={data.stats.totalReviews} label="reviews" />
    <StatPill
      value="{data.stats.accuratePercent}%"
      label="listing accurate"
      tone={accurateTone}
    />
    <StatPill value={data.stats.avgRating.toFixed(1)} label="avg rating" />
    <StatPill value={data.stats.photoCount} label="photos of evidence" />
  </div>

  <!-- Evidence photo strip -->
  {#if allPhotos.length > 0}
    <section class="evidence">
      <div class="section-label">
        Evidence · {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''} from visitors
      </div>
      <div class="strip">
        {#each allPhotos as p, i}
          <button
            type="button"
            class="tile"
            onclick={() => openLightbox(i)}
            aria-label="Open photo {i + 1}"
          >
            <img src="/uploads/{p.path}" alt="" loading="lazy" />
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Listings -->
  <section class="listings">
    <div class="actions-row">
      <div class="section-label inline">Listings · {data.listings.length}</div>
      {#if data.user}
        <button
          type="button"
          class="linklike amber"
          onclick={() => (showAddListing = !showAddListing)}
        >
          {showAddListing ? 'cancel' : '+ add listing'}
        </button>
      {/if}
    </div>

    {#if showAddListing}
      <div class="add-listing">
        <input
          type="url"
          placeholder="Paste listing URL"
          bind:value={listingUrl}
        />
        <input
          type="text"
          placeholder="Price (optional, e.g. $2,400/mo)"
          bind:value={listingPrice}
        />
        {#if listingError}
          <div class="err">{listingError}</div>
        {/if}
        <button
          type="button"
          class="btn-primary"
          onclick={addListing}
          disabled={!listingUrl}
        >
          Add listing
        </button>
      </div>
    {/if}

    {#if data.listings.length === 0 && !showAddListing}
      <p class="empty">no listings linked yet.</p>
    {:else}
      <div class="listing-list">
        {#each data.listings as listing}
          <div class="listing">
            <a href={listing.url} target="_blank" rel="noopener noreferrer">{listing.url}</a>
            {#if listing.price}<span class="price">{listing.price}</span>{/if}
            <span class="linking-user">· added by @{listing.username}</span>
            {#if data.user && (data.user.id === listing.user_id || data.user.is_admin)}
              <button
                type="button"
                class="linklike danger"
                onclick={() => deleteListing(listing.id)}
              >
                delete
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Actions row -->
  <div class="actions-row reviews-head">
    <div class="section-label inline">Reviews · {data.stats.totalReviews}</div>
    <div class="actions-right">
      <div class="sort">
        <button
          type="button"
          class:active={sortMode === 'helpful'}
          onclick={() => (sortMode = 'helpful')}
        >
          most helpful
        </button>
        <button
          type="button"
          class:active={sortMode === 'newest'}
          onclick={() => (sortMode = 'newest')}
        >
          newest
        </button>
      </div>
      {#if data.user}
        <a href="/address/{data.address.id}/review" class="btn-primary cta">＋ Leave a review</a>
      {:else}
        <a href="/login?returnTo=/address/{data.address.id}" class="btn-ghost cta">
          Log in to review
        </a>
      {/if}
    </div>
  </div>

  <!-- Reviews -->
  {#if sortedReviews.length === 0}
    <p class="empty">no reviews yet. be the first to leave one.</p>
  {:else}
    {#each sortedReviews as review}
      <div class="review-wrap">
        <ReviewCard
          {review}
          canVote={!!data.user}
          isAdmin={!!data.user?.is_admin}
          onvote={(kind) => vote(review.id, kind)}
          onreport={() => (reportingReviewId = review.id)}
          onadmindelete={() => adminDeleteReview(review.id)}
          onphoto={(i) => {
            // find the global index for this review's photo i
            const rev = review.photos?.[i];
            if (!rev) return;
            const idx = allPhotos.findIndex((p) => p.id === rev.id);
            if (idx >= 0) openLightbox(idx);
          }}
        />

        {#if reportingReviewId === review.id}
          <div class="report-box">
            <textarea
              bind:value={reportReason}
              placeholder="why are you reporting this review?"
              rows="2"
            ></textarea>
            <div class="report-actions">
              <button
                type="button"
                class="btn-ghost"
                onclick={() => (reportingReviewId = null)}>Cancel</button
              >
              <button
                type="button"
                class="btn-primary"
                disabled={!reportReason.trim()}
                onclick={() => submitReport(review.id)}>Submit report</button
              >
            </div>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

{#if lightboxOpen && allPhotos.length > 0}
  <Lightbox
    photos={allPhotos}
    startIndex={lightboxIndex}
    onclose={() => (lightboxOpen = false)}
  />
{/if}

<style>
  .main {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--content-pad-y) var(--content-pad-x) 80px;
  }

  /* Crumbs */
  .crumbs {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--fg-faint);
    margin-bottom: 20px;
  }
  .crumbs a {
    color: var(--fg-mute);
  }
  .crumbs a:hover { color: var(--amber); }
  .crumbs .sep {
    margin: 0 6px;
    color: var(--fg-faint);
  }

  /* Header */
  .header {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 28px;
    align-items: start;
    margin-bottom: 28px;
  }
  @media (max-width: 720px) {
    .header { grid-template-columns: 1fr; }
    .mini-map { height: 220px; }
  }
  .header h1 {
    font-family: var(--serif);
    font-size: 38px;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.1;
    margin: 0 0 6px 0;
  }
  .sub {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    margin-bottom: 4px;
  }
  .sub-muted {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
  }
  .share {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg-mute);
    font-family: var(--mono);
    font-size: 11px;
    padding: 3px 8px;
    cursor: pointer;
  }
  .share:hover { background: var(--bg-2); color: var(--fg); }

  .mini-map {
    position: relative;
    height: 160px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  :global(.mini-map .leaflet-container) { height: 100%; }
  :global(.mini-map .leaflet-tile) {
    filter: invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.95) saturate(0.6);
  }
  :global(:root[data-theme="light"] .mini-map .leaflet-tile) { filter: none; }
  .latlng {
    position: absolute;
    bottom: 6px;
    right: 8px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--fg-faint);
    background: var(--bg);
    padding: 2px 5px;
    z-index: 500;
  }

  /* Stat bar */
  .statbar {
    display: flex;
    border: 1px solid var(--border);
    margin-bottom: 28px;
  }
  .statbar :global(.pill) {
    border-right: 1px solid var(--border);
  }
  .statbar :global(.pill:last-child) {
    border-right: none;
  }
  @media (max-width: 720px) {
    .statbar { flex-wrap: wrap; }
    .statbar :global(.pill) {
      flex-basis: 50%;
      border-bottom: 1px solid var(--border);
    }
    .statbar :global(.pill:nth-last-child(-n+2)) { border-bottom: none; }
    .statbar :global(.pill:nth-child(2n)) { border-right: none; }
  }

  @media (max-width: 560px) {
    .main {
      padding: 20px 16px 60px;
    }
    .header h1 {
      font-size: 28px;
    }
    .header {
      gap: 16px;
      margin-bottom: 20px;
    }
    .statbar :global(.pill) {
      padding: 12px 10px;
    }
    .statbar :global(.pill .value) {
      font-size: 22px;
    }
    .statbar :global(.pill .label) {
      font-size: 10px;
    }
    .tile {
      width: 200px;
      height: 150px;
    }
    .actions-row {
      gap: 10px;
    }
    .actions-right {
      width: 100%;
      justify-content: space-between;
    }
    .sort button {
      padding: 5px 8px;
      font-size: 10px;
    }
    .cta {
      font-size: 11px;
      padding: 6px 10px;
    }
  }

  /* Evidence strip */
  .evidence { margin-bottom: 28px; }
  .strip {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .tile {
    flex: 0 0 auto;
    width: 240px;
    height: 180px;
    padding: 0;
    border: 1px solid var(--border-soft);
    background: var(--bg-1);
    cursor: pointer;
    overflow: hidden;
  }
  .tile:hover { border-color: var(--amber); }
  .tile img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Actions row */
  .actions-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 14px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .section-label.inline {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }
  .actions-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sort {
    display: flex;
    border: 1px solid var(--border);
  }
  .sort button {
    background: transparent;
    border: none;
    color: var(--fg-mute);
    font-family: var(--mono);
    font-size: 11px;
    padding: 6px 12px;
    cursor: pointer;
    text-transform: lowercase;
    letter-spacing: 0.04em;
  }
  .sort button + button {
    border-left: 1px solid var(--border);
  }
  .sort button:hover { color: var(--fg); }
  .sort button.active {
    background: var(--bg-2);
    color: var(--fg);
  }

  .cta {
    font-family: var(--mono);
    font-size: 12px;
    padding: 8px 14px;
    text-transform: lowercase;
    letter-spacing: 0.04em;
  }

  /* Reviews */
  .reviews-head {
    margin-bottom: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border-soft);
  }
  .review-wrap { position: relative; }

  /* Report box */
  .report-box {
    padding: 16px;
    border-left: 2px solid var(--amber);
    background: var(--bg-1);
    margin: -10px 0 20px 0;
  }
  .report-box textarea {
    width: 100%;
    font-family: var(--sans);
    font-size: 13px;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 8px;
    resize: vertical;
  }
  .report-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }

  /* Listings */
  .listings {
    margin-bottom: 28px;
  }
  .add-listing {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
    padding: 16px;
    background: var(--bg-1);
    border: 1px solid var(--border);
  }
  .add-listing input {
    flex: 1 1 240px;
    background: var(--bg);
  }
  .add-listing .btn-primary {
    padding: 8px 16px;
  }
  .err {
    color: var(--red);
    font-family: var(--mono);
    font-size: 12px;
    width: 100%;
  }

  .listing-list {
    margin-top: 10px;
  }
  .listing {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-top: 1px solid var(--border-soft);
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    flex-wrap: wrap;
  }
  .listing:first-of-type { border-top: none; }
  .listing a {
    color: var(--blue);
    word-break: break-all;
  }
  .listing .price {
    color: var(--fg);
  }
  .linking-user { color: var(--fg-faint); }

  /* Generic */
  .empty {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-faint);
    padding: 20px 0;
  }

  .linklike {
    background: transparent;
    border: none;
    padding: 0;
    color: var(--fg-mute);
    font-family: var(--mono);
    font-size: 12px;
    cursor: pointer;
  }
  .linklike:hover { color: var(--fg); }
  .linklike.amber { color: var(--amber); }
  .linklike.amber:hover { color: var(--amber-dim); }
  .linklike.danger:hover { color: var(--red); }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }
</style>
