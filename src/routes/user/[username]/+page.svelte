<script lang="ts">
  import type { PageData } from './$types';
  import ReviewCard from '$lib/components/ReviewCard.svelte';

  let { data }: { data: PageData } = $props();

  const memberSince = $derived(
    new Date(data.profile.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  );
</script>

<svelte:head>
  <title>@{data.profile.username} — isitreal.estate</title>
  <meta
    name="description"
    content="{data.reviews.length} review{data.reviews.length !== 1
      ? 's'
      : ''} by @{data.profile.username}"
  />
</svelte:head>

<div class="main">
  <!-- Crumbs -->
  <div class="crumbs">
    <a href="/">search</a>
    <span class="sep">/</span>
    <span>user</span>
    <span class="sep">/</span>
    <span>@{data.profile.username}</span>
  </div>

  <!-- Header -->
  <header class="header">
    <div class="header-left">
      <h1>
        <span class="at">@</span>{data.profile.username}
      </h1>
      <div class="sub">
        member since {memberSince}
        · {data.stats.reviewCount} review{data.stats.reviewCount !== 1 ? 's' : ''}
        · {data.stats.photoCount} photo{data.stats.photoCount !== 1 ? 's' : ''} contributed
      </div>
    </div>

    <div class="cred-tile" title="calculated from how often this reviewer's reviews align with subsequent community votes. decays if a reviewer stops contributing.">
      <div class="cred-value">
        {data.credibility ?? '—'}<span class="cred-max">/100</span>
      </div>
      <div class="cred-label">credibility</div>
    </div>
  </header>

  <!-- Stats row -->
  <div class="stats-row">
    <div class="stat">
      <span class="val">{data.stats.calledAccurate}</span>
      <span class="lab">called accurate</span>
    </div>
    <div class="stat">
      <span class="val">{data.stats.calledPartial}</span>
      <span class="lab">called partial</span>
    </div>
    <div class="stat">
      <span class="val">{data.stats.calledMisleading}</span>
      <span class="lab">called misleading</span>
    </div>
  </div>

  <!-- Review history -->
  <div class="section-label">Review history · most recent first</div>

  {#if data.reviews.length === 0}
    <p class="empty">no reviews yet.</p>
  {:else}
    {#each data.reviews as review}
      <ReviewCard review={{ ...review, username: data.profile.username }} showAddress />
    {/each}
  {/if}
</div>

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
    grid-template-columns: 1fr auto;
    gap: 28px;
    align-items: end;
    margin-bottom: 28px;
  }
  @media (max-width: 560px) {
    .header {
      grid-template-columns: 1fr;
      align-items: start;
    }
  }

  .header h1 {
    font-family: var(--serif);
    font-size: 38px;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.1;
    color: var(--fg);
    margin: 0 0 6px 0;
  }
  .at {
    color: var(--fg-faint);
    font-weight: 400;
  }

  .sub {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }

  /* Credibility tile */
  .cred-tile {
    border: 1px solid var(--border);
    background: var(--bg-1);
    padding: 14px 22px;
    min-width: 160px;
    text-align: center;
  }
  .cred-value {
    font-family: var(--serif);
    font-size: 36px;
    color: var(--amber);
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .cred-max {
    color: var(--fg-faint);
    font-size: 16px;
  }
  .cred-label {
    font-family: var(--mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fg-mute);
  }

  /* Stats row */
  .stats-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    padding: 16px 0;
    border-top: 1px solid var(--border-soft);
    border-bottom: 1px solid var(--border-soft);
    margin-bottom: 28px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }
  .stat {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .val {
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 500;
    color: var(--fg);
  }

  .empty {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-faint);
    padding: 20px 0;
  }
</style>
