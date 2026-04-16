<script lang="ts">
  import type { PageData } from './$types';

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

  async function vote(reviewId: string, voteType: 'accurate' | 'not_accurate') {
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, vote: voteType })
    });
    // Reload to get updated counts
    location.reload();
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

  {#if data.user}
    <a href="/address/{data.address.id}/review" class="review-button">Leave a Review</a>
  {:else}
    <a href="/login" class="review-button secondary">Log in to leave a review</a>
  {/if}

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
            {:else}
              <span class="vote-counts">
                {review.accurate_count} accurate / {review.not_accurate_count} not accurate
              </span>
            {/if}
          </div>
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
</style>
