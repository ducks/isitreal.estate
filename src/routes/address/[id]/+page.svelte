<script lang="ts">
  import type { PageData } from './$types';
  import Map from '$lib/components/Map.svelte';

  let { data }: { data: PageData } = $props();

  function accuracyColor(val: string) {
    if (val === 'yes') return 'var(--success)';
    if (val === 'partially') return 'var(--warning)';
    return 'var(--danger)';
  }

  function accuracyLabel(val: string) {
    if (val === 'yes') return 'Accurate';
    if (val === 'partially') return 'Partially';
    return 'Inaccurate';
  }

  let showAddListing = $state(false);
  let listingUrl = $state('');
  let listingPrice = $state('');
  let listingError = $state('');

  async function vote(reviewId: string, voteType: 'accurate' | 'not_accurate') {
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, vote: voteType })
    });
    location.reload();
  }

  let reportingReviewId = $state<string | null>(null);
  let reportReason = $state('');

  async function submitReport(reviewId: string) {
    if (!reportReason.trim()) return;
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, reason: reportReason })
    });
    reportingReviewId = null;
    reportReason = '';
    alert('Report submitted. Thank you.');
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
      listingError = 'Network error';
    }
  }

  async function deleteListing(id: string) {
    await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
    location.reload();
  }

  function sourceIcon(source: string) {
    const icons: Record<string, string> = {
      zillow: 'Z', redfin: 'R', realtor: 'R', trulia: 'T',
      apartments: 'A', craigslist: 'CL', facebook: 'FB', hotpads: 'HP'
    };
    return icons[source] || '🔗';
  }
</script>

<main>
  <div class="address-header">
    <h1>{data.address.street}</h1>
    <p class="address-detail">{data.address.city}{data.address.state ? `, ${data.address.state}` : ''} {data.address.zip}</p>

    {#if data.stats.totalReviews > 0}
      <div class="stats-row">
        <div class="stat">
          <span class="stat-value">{data.stats.totalReviews}</span>
          <span class="stat-label">reviews</span>
        </div>
        <div class="stat">
          <span class="stat-value">{data.stats.accuratePercent}%</span>
          <span class="stat-label">accurate</span>
        </div>
        <div class="stat">
          <span class="stat-value">{data.stats.avgRating}</span>
          <span class="stat-label">avg rating</span>
        </div>
      </div>
    {/if}
  </div>

  {#if data.address.lat && data.address.lng}
    <div class="address-map">
      <Map
        center={[data.address.lat, data.address.lng]}
        zoom={16}
        markers={[{ lat: data.address.lat, lng: data.address.lng, id: data.address.id, label: data.address.street }]}
        singlePin={true}
      />
    </div>
  {/if}

  {#if data.user}
    <a href="/address/{data.address.id}/review" class="review-button">Leave a Review</a>
  {:else}
    <a href="/login" class="review-button secondary">Log in to leave a review</a>
  {/if}

  <section class="listings">
    <div class="section-header">
      <h2>Listings</h2>
      {#if data.user}
        <button class="add-listing-btn" onclick={() => showAddListing = !showAddListing}>
          {showAddListing ? 'Cancel' : '+ Add Listing'}
        </button>
      {/if}
    </div>

    {#if showAddListing}
      <div class="add-listing-form">
        <input
          type="url"
          placeholder="Paste listing URL (Zillow, Redfin, Craigslist, etc.)"
          bind:value={listingUrl}
          class="listing-input"
        />
        <input
          type="text"
          placeholder="Price (optional, e.g., $2,400/mo)"
          bind:value={listingPrice}
          class="listing-input price-input"
        />
        {#if listingError}
          <div class="listing-error">{listingError}</div>
        {/if}
        <button class="submit-listing-btn" onclick={addListing} disabled={!listingUrl}>
          Add Listing
        </button>
      </div>
    {/if}

    {#if data.listings.length === 0 && !showAddListing}
      <p class="empty">No listings linked yet.</p>
    {:else}
      {#each data.listings as listing}
        <div class="listing-card">
          <span class="listing-source">{sourceIcon(listing.source)}</span>
          <div class="listing-info">
            <a href={listing.url} target="_blank" rel="noopener" class="listing-url">
              {listing.source !== 'other' ? listing.source.charAt(0).toUpperCase() + listing.source.slice(1) : listing.url}
            </a>
            {#if listing.price}
              <span class="listing-price">{listing.price}</span>
            {/if}
            <span class="listing-meta">added by {listing.username}</span>
          </div>
          {#if data.user?.id === listing.user_id}
            <button class="listing-delete" onclick={() => deleteListing(listing.id)}>×</button>
          {/if}
        </div>
      {/each}
    {/if}
  </section>

  <section class="reviews">
    <h2>Reviews</h2>
    {#if data.reviews.length === 0}
      <p class="empty">No reviews yet. Be the first to share what you found.</p>
    {:else}
      {#each data.reviews as review}
        <div class="review-card">
          <div class="review-header">
            <div>
              <a href="/user/{review.username}" class="review-author">{review.username}</a>
              <span class="review-date">
                {review.visited_at ? `Visited ${new Date(review.visited_at).toLocaleDateString()}` : ''}
              </span>
            </div>
            <div class="review-meta">
              <span class="accuracy-badge" style="color: {accuracyColor(review.listing_accurate)}">
                {accuracyLabel(review.listing_accurate)}
              </span>
              <span class="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            </div>
          </div>

          {#if review.body}
            <p class="review-body">{review.body}</p>
          {/if}

          {#if review.photos && review.photos.length > 0}
            <div class="review-photos">
              {#each review.photos as photo}
                <img src="/uploads/{photo.path}" alt="Review photo" class="review-photo" />
              {/each}
            </div>
          {/if}

          <div class="review-footer">
            {#if data.user}
              <button class="vote-btn" onclick={() => vote(review.id, 'accurate')}>
                Accurate ({review.accurate_count})
              </button>
              <button class="vote-btn" onclick={() => vote(review.id, 'not_accurate')}>
                Not Accurate ({review.not_accurate_count})
              </button>
              <button
                class="vote-btn report-btn"
                onclick={() => { reportingReviewId = reportingReviewId === review.id ? null : review.id; reportReason = ''; }}
              >
                Report
              </button>
              {#if data.user.is_admin}
                <button class="vote-btn admin-btn" onclick={() => adminDeleteReview(review.id)}>
                  Delete
                </button>
              {/if}
            {:else}
              <span class="vote-counts">
                {review.accurate_count} accurate / {review.not_accurate_count} not accurate
              </span>
            {/if}
          </div>
          {#if reportingReviewId === review.id}
            <div class="report-form">
              <input
                type="text"
                class="report-input"
                placeholder="Why are you reporting this review?"
                bind:value={reportReason}
              />
              <button
                class="report-submit"
                onclick={() => submitReport(review.id)}
                disabled={!reportReason.trim()}
              >Submit Report</button>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </section>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .address-header {
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 0.25rem;
  }

  .address-detail {
    color: var(--text-muted);
    font-size: 1.1rem;
    margin: 0 0 1rem;
  }

  .stats-row {
    display: flex;
    gap: 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .address-map {
    height: 250px;
    margin-bottom: 1.5rem;
    border-radius: 12px;
    overflow: hidden;
  }

  .review-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--accent);
    color: var(--text-inverse);
    border-radius: 8px;
    font-weight: 600;
    text-decoration: none;
    margin-bottom: 2rem;
  }

  .review-button:hover {
    background: var(--accent-hover);
    text-decoration: none;
  }

  .review-button.secondary {
    background: var(--bg-sunken);
    color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .reviews h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem;
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
    padding: 3rem 0;
  }

  .review-card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .review-author {
    font-weight: 600;
    color: var(--accent);
  }

  .review-date {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-left: 0.5rem;
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .accuracy-badge {
    font-weight: 700;
    font-size: 0.85rem;
  }

  .rating {
    color: var(--warning);
    font-size: 1rem;
  }

  .review-body {
    color: var(--text);
    margin: 0 0 0.75rem;
    line-height: 1.6;
  }

  .review-photos {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    margin-bottom: 0.75rem;
  }

  .review-photo {
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .review-footer {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .vote-btn {
    padding: 0.4rem 0.75rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .vote-btn:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }

  .vote-counts {
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .report-btn {
    margin-left: auto;
    color: var(--text-muted);
    border-color: transparent;
  }

  .report-btn:hover {
    color: var(--warning);
    border-color: var(--warning);
    background: none;
  }

  .admin-btn {
    color: var(--danger);
    border-color: var(--danger);
  }

  .admin-btn:hover {
    background: var(--danger);
    color: var(--text-inverse);
  }

  .report-form {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-subtle);
  }

  .report-input {
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-family);
    font-size: 0.85rem;
  }

  .report-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .report-submit {
    padding: 0.5rem 0.75rem;
    background: var(--warning);
    color: var(--text-inverse);
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
    white-space: nowrap;
  }

  .report-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .listings {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h2 {
    margin: 0;
  }

  .add-listing-btn {
    padding: 0.4rem 0.75rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .add-listing-btn:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }

  .add-listing-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .listing-input {
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-family);
    font-size: 0.95rem;
  }

  .listing-input:focus {
    outline: none;
    border-color: var(--accent);
  }

  .price-input {
    max-width: 200px;
  }

  .listing-error {
    color: var(--danger);
    font-size: 0.85rem;
  }

  .submit-listing-btn {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: var(--text-inverse);
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .submit-listing-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .submit-listing-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .listing-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .listing-source {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-sunken);
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .listing-info {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .listing-url {
    font-weight: 600;
  }

  .listing-price {
    color: var(--success);
    font-weight: 600;
    font-size: 0.9rem;
  }

  .listing-meta {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .listing-delete {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0 0.25rem;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .listing-card:hover .listing-delete {
    opacity: 1;
  }

  .listing-delete:hover {
    color: var(--danger);
  }
</style>
