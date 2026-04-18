<script lang="ts">
  type Verdict = 'yes' | 'partial' | 'partially' | 'no';
  let { value }: { value: Verdict } = $props();

  // Normalize: DB stores 'yes' | 'partially' | 'no'; spec uses 'partial'.
  const normalized = $derived(value === 'partially' ? 'partial' : value);

  const labels: Record<string, string> = {
    yes: 'Accurate',
    partial: 'Partially accurate',
    no: 'Not accurate'
  };
</script>

<span class="badge {normalized}">
  <span class="dot"></span>
  {labels[normalized]}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 6px;
    border: 1px solid currentColor;
    line-height: 1;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    display: inline-block;
  }
  .yes { color: var(--green); }
  .partial { color: var(--amber); }
  .no { color: var(--red); }
</style>
