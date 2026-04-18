<script lang="ts">
  let { value = 0 }: { value?: number } = $props();
</script>

<span
  class="chip"
  title="credibility score — calculated from how often this reviewer's reviews align with subsequent community votes."
>
  <span class="label">cred</span>
  <span class="value">{value}</span>
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1;
    border: 1px solid var(--border);
    background: var(--bg-1);
    padding: 1px 5px;
  }
  .label {
    color: var(--fg-mute);
  }
  .value {
    color: var(--fg);
    font-weight: 500;
  }
</style>
