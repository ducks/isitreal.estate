<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  async function deleteReview(reviewId: string) {
    if (!confirm('Delete this review?')) return;
    await fetch(`/api/reviews?id=${reviewId}`, { method: 'DELETE' });
    location.reload();
  }

  async function dismissReports(reviewId: string) {
    // Delete the reports but keep the review
    await fetch(`/api/reports?review_id=${reviewId}`, { method: 'DELETE' });
    location.reload();
  }
</script>

<main>
  <h1>Admin</h1>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{data.stats.user_count}</div>
      <div class="stat-label">Users</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{data.stats.review_count}</div>
      <div class="stat-label">Reviews</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{data.stats.address_count}</div>
      <div class="stat-label">Addresses</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{data.stats.report_count}</div>
      <div class="stat-label">Reports</div>
    </div>
  </div>

  <section>
    <h2>Reported Reviews</h2>
    {#if data.reported.length === 0}
      <p class="empty">No reported reviews.</p>
    {:else}
      {#each data.reported as item}
        <div class="reported-card">
          <div class="reported-header">
            <a href="/address/{item.address_id}">{item.street}, {item.city}{item.state ? `, ${item.state}` : ''}</a>
            <span class="report-badge">{item.report_count} report{item.report_count !== 1 ? 's' : ''}</span>
          </div>
          <div class="reported-meta">
            by {item.reviewer} — {item.listing_accurate} — {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
          </div>
          {#if item.body}
            <p class="reported-body">{item.body}</p>
          {/if}
          <div class="reported-reasons">
            <strong>Reasons:</strong>
            {#each item.reasons as reason}
              <span class="reason-tag">{reason}</span>
            {/each}
          </div>
          <div class="reported-actions">
            <button class="action-delete" onclick={() => deleteReview(item.review_id)}>Delete Review</button>
            <button class="action-dismiss" onclick={() => dismissReports(item.review_id)}>Dismiss Reports</button>
          </div>
        </div>
      {/each}
    {/if}
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem;
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
    padding: 2rem;
  }

  .reported-card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .reported-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .reported-header a {
    font-weight: 600;
  }

  .report-badge {
    background: var(--danger-bg);
    color: var(--danger);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .reported-meta {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }

  .reported-body {
    color: var(--text);
    font-size: 0.9rem;
    margin: 0 0 0.75rem;
    line-height: 1.5;
  }

  .reported-reasons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
  }

  .reason-tag {
    background: var(--warning-bg);
    color: var(--warning);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .reported-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-delete {
    padding: 0.4rem 0.75rem;
    background: var(--danger);
    color: var(--text-inverse);
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .action-delete:hover {
    background: var(--danger-hover);
  }

  .action-dismiss {
    padding: 0.4rem 0.75rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 0.85rem;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .action-dismiss:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }
</style>
