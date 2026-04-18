<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  type Photo = { id: string; path: string; caption?: string };
  let {
    photos,
    startIndex = 0,
    onclose
  }: { photos: Photo[]; startIndex?: number; onclose: () => void } = $props();

  let index = $state(startIndex);

  function prev() { index = Math.max(0, index - 1); }
  function next() { index = Math.min(photos.length - 1, index + 1); }

  function onkey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  }

  onMount(() => window.addEventListener('keydown', onkey));
  onDestroy(() => window.removeEventListener('keydown', onkey));
</script>

<div class="backdrop" onclick={onclose} onkeydown={onkey} role="dialog" aria-modal="true" tabindex="-1">
  <div class="inner" onclick={(e) => e.stopPropagation()} role="presentation">
    <div class="top">
      <span class="counter">photo {index + 1} of {photos.length}</span>
      <button type="button" class="close" onclick={onclose} aria-label="Close">esc ×</button>
    </div>

    <div class="stage">
      <button
        type="button"
        class="nav prev"
        onclick={prev}
        disabled={index === 0}
        aria-label="Previous photo"
      >
        ‹
      </button>
      <img src="/uploads/{photos[index].path}" alt="" />
      <button
        type="button"
        class="nav next"
        onclick={next}
        disabled={index === photos.length - 1}
        aria-label="Next photo"
      >
        ›
      </button>
    </div>

    <div class="caption">← → to navigate · esc to close</div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.92);
    z-index: 100;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }
  .inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px 24px;
    color: var(--fg);
  }
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }
  .close {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg-mute);
    padding: 4px 10px;
    font-family: var(--mono);
    font-size: 12px;
    cursor: pointer;
  }
  .close:hover { color: var(--fg); border-color: var(--fg-mute); }

  .stage {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 20px 0;
  }
  .stage img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }
  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--fg-mute);
    font-family: var(--serif);
    font-size: 32px;
    width: 48px;
    height: 48px;
    line-height: 1;
    cursor: pointer;
  }
  .nav:hover:not(:disabled) { color: var(--fg); border-color: var(--fg-mute); }
  .nav:disabled { opacity: 0.3; cursor: not-allowed; }
  .prev { left: 16px; }
  .next { right: 16px; }

  .caption {
    text-align: center;
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
  }
</style>
