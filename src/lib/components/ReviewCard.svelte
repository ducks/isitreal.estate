<script lang="ts">
  import Stars from './Stars.svelte';
  import AccuracyBadge from './AccuracyBadge.svelte';
  import CredChip from './CredChip.svelte';

  type Photo = { id: string; path: string };
  type Review = {
    id: string;
    username: string;
    user_credibility?: number;
    listing_accurate: string;
    rating: number;
    body: string | null;
    visited_at: string | null;
    created_at: string;
    accurate_count?: number;
    not_accurate_count?: number;
    photos?: Photo[];
    address_id?: string;
    street?: string;
    city?: string;
    state?: string;
  };

  let {
    review,
    showAddress = false,
    canVote = false,
    isAdmin = false,
    onvote,
    onreport,
    onphoto,
    onadmindelete
  }: {
    review: Review;
    showAddress?: boolean;
    canVote?: boolean;
    isAdmin?: boolean;
    onvote?: (kind: 'accurate' | 'not_accurate') => void;
    onreport?: () => void;
    onphoto?: (index: number) => void;
    onadmindelete?: () => void;
  } = $props();

  const verdict = $derived(
    review.listing_accurate === 'yes'
      ? 'yes'
      : review.listing_accurate === 'no'
        ? 'no'
        : 'partial'
  );

  function formatDate(d: string | null): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

<article class="card">
  {#if showAddress && review.street}
    <a class="addr" href="/address/{review.address_id}">
      {review.street}{#if review.city}, {review.city}{/if}{#if review.state}, {review.state}{/if}
    </a>
  {/if}

  <div class="head">
    <a class="author" href="/user/{review.username}">@{review.username}</a>
    <CredChip value={review.user_credibility ?? 0} />
    <AccuracyBadge value={verdict} />
    <Stars n={review.rating} />
    <span class="visited">Visited {formatDate(review.visited_at)}</span>
  </div>

  {#if review.body}
    <p class="body">{review.body}</p>
  {/if}

  {#if review.photos && review.photos.length > 0}
    <div class="photos">
      {#each review.photos as p, i}
        <button
          type="button"
          class="photo"
          onclick={() => onphoto?.(i)}
          aria-label="Open photo {i + 1}"
        >
          <img src="/uploads/{p.path}" alt="" loading="lazy" />
        </button>
      {/each}
    </div>
  {/if}

  <div class="foot">
    <button
      type="button"
      class="vote"
      disabled={!canVote}
      onclick={() => onvote?.('accurate')}
    >
      Accurate ({review.accurate_count ?? 0})
    </button>
    <button
      type="button"
      class="vote"
      disabled={!canVote}
      onclick={() => onvote?.('not_accurate')}
    >
      Not accurate ({review.not_accurate_count ?? 0})
    </button>

    <span class="foot-spacer"></span>

    {#if onreport}
      <button type="button" class="linklike" onclick={() => onreport?.()}>Report</button>
    {/if}
    {#if isAdmin && onadmindelete}
      <button type="button" class="linklike danger" onclick={() => onadmindelete?.()}>
        Delete
      </button>
    {/if}
    <span class="posted">Posted {relativeTime(review.created_at)}</span>
  </div>
</article>

<style>
  .card {
    border-top: 1px solid var(--border-soft);
    padding: 20px 0;
  }
  .card:last-child {
    border-bottom: 1px solid var(--border-soft);
  }

  .addr {
    display: block;
    font-family: var(--serif);
    font-size: 17px;
    color: var(--fg);
    margin-bottom: 10px;
  }
  .addr:hover { color: var(--amber); }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 10px;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-mute);
    margin-bottom: 10px;
  }
  .author {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--fg);
    border-bottom: 1px dotted var(--fg-mute);
    padding-bottom: 1px;
  }
  .author:hover { color: var(--amber); border-bottom-color: var(--amber); }
  .visited {
    margin-left: auto;
  }

  .body {
    font-family: var(--sans);
    font-size: 14px;
    line-height: 1.55;
    color: var(--fg-dim);
    max-width: 68ch;
    margin: 0 0 12px 0;
    text-wrap: pretty;
  }

  .photos {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .photo {
    padding: 0;
    border: 1px solid var(--border-soft);
    background: var(--bg-2);
    cursor: pointer;
    width: 92px;
    height: 70px;
    overflow: hidden;
  }
  .photo:hover {
    border-color: var(--amber);
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .foot {
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }
  .vote {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg-mute);
    padding: 4px 10px;
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1;
  }
  .vote:hover:not(:disabled) {
    color: var(--fg);
    border-color: var(--fg-mute);
  }
  .vote:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .foot-spacer { flex: 1; }

  .linklike {
    background: transparent;
    border: none;
    padding: 0;
    color: var(--fg-faint);
    font-family: var(--mono);
    font-size: 12px;
    cursor: pointer;
  }
  .linklike:hover { color: var(--fg); }
  .linklike.danger:hover { color: var(--red); }

  .posted {
    color: var(--fg-faint);
  }
</style>
