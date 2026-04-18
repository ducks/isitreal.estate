<script lang="ts">
  type Size = 'sm' | 'lg';
  let { n = 0, size = 'sm' }: { n?: number; size?: Size } = $props();

  const clamped = $derived(Math.max(0, Math.min(5, Math.round(n))));
</script>

<span class="stars {size}">
  {#each Array(5) as _, i}
    <span class:filled={i < clamped}>{i < clamped ? '★' : '☆'}</span>
  {/each}
</span>

<style>
  .stars {
    font-family: var(--mono);
    display: inline-flex;
    color: var(--fg-faint);
    line-height: 1;
  }
  .stars.sm {
    font-size: 13px;
    letter-spacing: 1px;
  }
  .stars.lg {
    font-size: 20px;
    letter-spacing: 2px;
  }
  .filled {
    color: var(--amber);
  }
</style>
