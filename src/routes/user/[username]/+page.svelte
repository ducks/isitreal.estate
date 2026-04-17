<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.profile.username} — Is It Real?</title>
  <meta name="description" content="{data.reviews.length} review{data.reviews.length !== 1 ? 's' : ''} by {data.profile.username} on isitreal.estate." />
</svelte:head>

<main>
  <div class="profile-header">
    <h1>{data.profile.username}</h1>
    <div class="meta">
      Member since {new Date(data.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      {#if data.credibility !== null}
        <span class="credibility">{data.credibility}% credibility</span>
      {/if}
    </div>
  </div>

  <section>
    <h2>{data.reviews.length} Review{data.reviews.length !== 1 ? 's' : ''}</h2>

    {#if data.reviews.length === 0}
      <p class="empty">No reviews yet.</p>
    {:else}
      {#each data.reviews as review}
        <a href="/address/{review.address_id}" class="review-card">
          <div class="review-address">{review.street}, {review.city}{review.state ? `, ${review.state}` : ''}</div>
          <div class="review-meta">
            <span class="rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
            <span class="accuracy" class:accurate={review.listing_accurate === 'yes'} class:partial={review.listing_accurate === 'partially'} class:inaccurate={review.listing_accurate === 'no'}>
              {review.listing_accurate === 'yes' ? 'Accurate' : review.listing_accurate === 'partially' ? 'Partially' : 'Inaccurate'}
            </span>
            <span class="votes">{review.accurate_count} accurate / {review.not_accurate_count} not</span>
          </div>
          {#if review.body}
            <p class="review-body">{review.body.slice(0, 200)}{review.body.length > 200 ? '...' : ''}</p>
          {/if}
        </a>
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

  .profile-header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .meta {
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .credibility {
    display: inline-block;
    margin-left: 1rem;
    padding: 0.2rem 0.5rem;
    background: var(--success-bg);
    color: var(--success-text);
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 1rem;
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
    padding: 2rem 0;
  }

  .review-card {
    display: block;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s;
  }

  .review-card:hover {
    border-color: var(--accent);
    text-decoration: none;
  }

  .review-address {
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.25rem;
  }

  .review-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .rating {
    color: var(--warning);
  }

  .accuracy {
    font-weight: 600;
  }

  .accuracy.accurate { color: var(--success); }
  .accuracy.partial { color: var(--warning); }
  .accuracy.inaccurate { color: var(--danger); }

  .votes {
    color: var(--text-muted);
  }

  .review-body {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }
</style>
