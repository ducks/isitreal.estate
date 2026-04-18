<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let listingAccurate = $state<'yes' | 'partially' | 'no' | null>(null);
  let rating = $state(0);
  let hoverRating = $state(0);
  let body = $state('');
  const today = new Date().toISOString().slice(0, 10);
  let visitedAt = $state(today);
  let photos = $state<File[]>([]);
  let fileInput: HTMLInputElement | undefined;
  let dragOver = $state(false);
  let loading = $state(false);
  let errorMsg = $state('');

  const BODY_MAX = 500;
  const addressId = data.address.id;

  const canSubmit = $derived(
    !!listingAccurate && rating > 0 && !!visitedAt && !loading
  );

  function pickPhotos() {
    fileInput?.click();
  }

  function onFiles(e: Event) {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    addFiles(files);
    if (fileInput) fileInput.value = '';
  }

  function addFiles(files: File[]) {
    const imgs = files.filter((f) => f.type.startsWith('image/'));
    if (photos.length + imgs.length > 5) {
      errorMsg = 'maximum 5 photos per review';
      return;
    }
    photos = [...photos, ...imgs];
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files));
  }

  function removePhoto(i: number) {
    photos = photos.filter((_, idx) => idx !== i);
  }

  async function submit() {
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address_id: addressId,
          listing_accurate: listingAccurate,
          rating,
          body: body.trim() || null,
          visited_at: visitedAt || null
        })
      });

      if (!res.ok) {
        const d = await res.json();
        errorMsg = d.error || 'failed to submit review';
        return;
      }

      const review = await res.json();

      if (photos.length > 0) {
        const fd = new FormData();
        fd.append('review_id', review.id);
        for (const p of photos) fd.append('photos', p);
        await fetch('/api/photos', { method: 'POST', body: fd });
      }

      goto(`/address/${addressId}`);
    } catch {
      errorMsg = 'network error';
    } finally {
      loading = false;
    }
  }

  const ratingLabel = $derived(
    hoverRating > 0
      ? `${hoverRating}/5`
      : rating > 0
        ? `${rating}/5`
        : 'tap to rate'
  );
</script>

<svelte:head>
  <title>Leave a review — isitreal.estate</title>
</svelte:head>

<div class="wrap">
  <div class="card">
    <div class="crumbs">
      <a href="/">search</a>
      <span class="sep">/</span>
      <a href="/address/{addressId}">{data.address.street}</a>
      <span class="sep">/</span>
      <span>review</span>
    </div>

    <h1>Leave a review</h1>
    <p class="sub">
      {data.address.street}{data.address.city ? `, ${data.address.city}` : ''}{data.address.state ? `, ${data.address.state}` : ''}
    </p>

    <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <!-- Accuracy segmented control -->
      <div class="field">
        <label class="lbl">
          Was the listing accurate? <span class="req">*</span>
        </label>
        <div class="seg" role="radiogroup" aria-label="Listing accurate">
          {#each [
            { value: 'yes', label: 'Yes', color: 'green' },
            { value: 'partially', label: 'Partially', color: 'amber' },
            { value: 'no', label: 'No', color: 'red' }
          ] as opt}
            <button
              type="button"
              class="seg-btn {opt.color}"
              class:selected={listingAccurate === opt.value}
              onclick={() => (listingAccurate = opt.value as any)}
              role="radio"
              aria-checked={listingAccurate === opt.value}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Rating stars -->
      <div class="field">
        <label class="lbl">Overall rating <span class="req">*</span></label>
        <div class="rating">
          <div class="stars-input" onmouseleave={() => (hoverRating = 0)}>
            {#each [1, 2, 3, 4, 5] as n}
              <button
                type="button"
                class="star"
                class:on={n <= (hoverRating || rating)}
                onmouseenter={() => (hoverRating = n)}
                onclick={() => (rating = n)}
                aria-label="{n} star{n !== 1 ? 's' : ''}"
              >
                {n <= (hoverRating || rating) ? '★' : '☆'}
              </button>
            {/each}
          </div>
          <span class="readout">{ratingLabel}</span>
        </div>
      </div>

      <!-- Date -->
      <div class="field">
        <label class="lbl" for="visitedAt">
          When did you visit? <span class="req">*</span>
        </label>
        <input
          id="visitedAt"
          type="date"
          bind:value={visitedAt}
          max={today}
          required
        />
      </div>

      <!-- Body -->
      <div class="field">
        <label class="lbl" for="body">Tell us what you found</label>
        <textarea
          id="body"
          bind:value={body}
          placeholder="What matched the listing? What didn't? Be specific — other renters rely on this."
          rows="5"
          maxlength={BODY_MAX}
        ></textarea>
        <div class="counter">{body.length}/{BODY_MAX}</div>
      </div>

      <!-- Photos -->
      <div class="field">
        <label class="lbl">Add photos</label>
        <div
          class="drop"
          class:over={dragOver}
          ondragover={(e) => { e.preventDefault(); dragOver = true; }}
          ondragleave={() => (dragOver = false)}
          ondrop={onDrop}
          onclick={pickPhotos}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') pickPhotos(); }}
        >
          drop photos here · or click to browse
        </div>
        <input
          bind:this={fileInput}
          type="file"
          accept="image/*"
          multiple
          onchange={onFiles}
          hidden
        />

        {#if photos.length > 0}
          <div class="previews">
            {#each photos as p, i}
              <div class="preview">
                <img src={URL.createObjectURL(p)} alt="upload preview" />
                <button
                  type="button"
                  class="x"
                  onclick={() => removePhoto(i)}
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      {#if errorMsg}
        <div class="err">{errorMsg}</div>
      {/if}

      <div class="foot">
        <div class="hint">your review is permanent and public. credibility +1 on agreement.</div>
        <div class="actions">
          <a href="/address/{addressId}" class="btn-ghost cancel">Cancel</a>
          <button type="submit" class="btn-primary" disabled={!canSubmit}>
            {loading ? 'posting…' : 'Post review →'}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

<style>
  .wrap {
    min-height: 70vh;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
  }

  .card {
    width: 100%;
    max-width: 640px;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 32px;
  }

  .crumbs {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
    margin-bottom: 16px;
  }
  .crumbs a { color: var(--fg-mute); }
  .crumbs a:hover { color: var(--amber); }
  .crumbs .sep { margin: 0 6px; }

  .card h1 {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.01em;
    margin: 0 0 6px 0;
  }
  .sub {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    margin-bottom: 28px;
  }

  .field {
    margin-bottom: 20px;
  }

  .lbl {
    display: block;
    font-family: var(--mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fg-mute);
    margin-bottom: 8px;
  }
  .req { color: var(--red); }

  /* Segmented accuracy */
  .seg {
    display: flex;
    border: 1px solid var(--border);
  }
  .seg-btn {
    flex: 1;
    background: transparent;
    border: none;
    border-right: 1px solid var(--border);
    color: var(--fg-mute);
    font-family: var(--mono);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 10px 8px;
    cursor: pointer;
  }
  .seg-btn:last-child { border-right: none; }
  .seg-btn:hover:not(.selected) {
    background: var(--bg-2);
    color: var(--fg);
  }
  .seg-btn.selected.green { background: var(--green); color: var(--bg); }
  .seg-btn.selected.amber { background: var(--amber); color: var(--bg); }
  .seg-btn.selected.red { background: var(--red); color: var(--bg); }

  /* Rating */
  .rating {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .stars-input {
    display: inline-flex;
    gap: 2px;
  }
  .star {
    background: transparent;
    border: none;
    padding: 0 3px;
    font-family: var(--mono);
    font-size: 28px;
    line-height: 1;
    color: var(--fg-faint);
    cursor: pointer;
  }
  .star.on { color: var(--amber); }
  .readout {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }

  /* Inputs */
  input[type="date"] {
    font-family: var(--mono);
    font-size: 13px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 8px 10px;
  }
  input[type="date"]:focus {
    outline: none;
    border-color: var(--amber);
  }

  textarea {
    width: 100%;
    font-family: var(--sans);
    font-size: 14px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    color: var(--fg);
    padding: 10px 12px;
    min-height: 120px;
    resize: vertical;
  }
  textarea:focus {
    outline: none;
    border-color: var(--amber);
  }
  .counter {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
    text-align: right;
    margin-top: 4px;
  }

  /* Drop zone */
  .drop {
    padding: 22px;
    background: var(--bg-1);
    border: 1px dashed var(--border);
    text-align: center;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    cursor: pointer;
  }
  .drop:hover,
  .drop.over {
    border-color: var(--amber);
    color: var(--amber);
  }

  .previews {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .preview {
    position: relative;
    width: 96px;
    height: 72px;
    overflow: hidden;
    border: 1px solid var(--border-soft);
  }
  .preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .x {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    padding: 0;
    line-height: 16px;
    font-size: 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--fg);
  }
  .x:hover { background: var(--red); color: var(--bg); border-color: var(--red); }

  /* Foot */
  .err {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--red);
    margin-bottom: 12px;
  }
  .foot {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-soft);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .hint {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
    flex: 1;
    min-width: 240px;
  }
  .actions {
    display: flex;
    gap: 10px;
  }
  .cancel {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
  }

  @media (max-width: 560px) {
    .wrap {
      padding: 20px 12px;
    }
    .card {
      padding: 20px 16px;
    }
    .card h1 {
      font-size: 20px;
    }
    .sub {
      font-size: 11px;
      margin-bottom: 20px;
    }
    .seg-btn {
      font-size: 11px;
      padding: 9px 6px;
      letter-spacing: 0.04em;
    }
    .star {
      font-size: 24px;
      padding: 0 2px;
    }
    .rating {
      gap: 10px;
    }
    .drop {
      padding: 18px 12px;
      font-size: 11px;
    }
    .preview {
      width: 80px;
      height: 60px;
    }
    .foot {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .hint {
      min-width: 0;
      text-align: left;
    }
    .actions {
      justify-content: flex-end;
    }
  }
</style>
