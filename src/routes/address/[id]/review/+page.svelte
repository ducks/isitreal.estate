<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let listingAccurate = $state<'yes' | 'partially' | 'no'>('yes');
  let rating = $state(3);
  let body = $state('');
  let visitedAt = $state(new Date().toISOString().slice(0, 10));
  let photos = $state<File[]>([]);
  let fileInput = $state<HTMLInputElement>();
  let loading = $state(false);
  let error = $state('');

  const addressId = $derived($page.params.id);

  function addPhotos(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (photos.length + files.length > 5) {
      error = 'Maximum 5 photos per review';
      return;
    }
    photos = [...photos, ...files];
  }

  function removePhoto(index: number) {
    photos = photos.filter((_, i) => i !== index);
  }

  async function submit() {
    loading = true;
    error = '';

    try {
      // Create the review
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
        const data = await res.json();
        error = data.error || 'Failed to submit review';
        return;
      }

      const review = await res.json();

      // Upload photos if any
      if (photos.length > 0) {
        const formData = new FormData();
        formData.append('review_id', review.id);
        for (const photo of photos) {
          formData.append('photos', photo);
        }

        const photoRes = await fetch('/api/photos', {
          method: 'POST',
          body: formData
        });

        if (!photoRes.ok) {
          // Review was created but photos failed — still navigate
          console.error('Photo upload failed:', await photoRes.text());
        }
      }

      goto(`/address/${addressId}`);
    } catch {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <h1>Leave a Review</h1>

  <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
    <div class="form-group">
      <label>Did the listing match reality?</label>
      <div class="accuracy-options">
        <label class="option" class:selected={listingAccurate === 'yes'}>
          <input type="radio" name="accuracy" value="yes" bind:group={listingAccurate} />
          Yes, accurate
        </label>
        <label class="option" class:selected={listingAccurate === 'partially'}>
          <input type="radio" name="accuracy" value="partially" bind:group={listingAccurate} />
          Partially
        </label>
        <label class="option" class:selected={listingAccurate === 'no'}>
          <input type="radio" name="accuracy" value="no" bind:group={listingAccurate} />
          No, inaccurate
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>Overall rating</label>
      <div class="star-rating">
        {#each [1, 2, 3, 4, 5] as star}
          <button
            type="button"
            class="star"
            class:filled={star <= rating}
            onclick={() => rating = star}
          >★</button>
        {/each}
      </div>
    </div>

    <div class="form-group">
      <label for="body">Your experience</label>
      <textarea
        id="body"
        bind:value={body}
        rows="5"
        placeholder="What did you find? How did it compare to the listing?"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="visited">Date visited</label>
      <input type="date" id="visited" bind:value={visitedAt} />
    </div>

    <div class="form-group">
      <label>Photos (up to 5)</label>
      <div class="photo-upload">
        {#if photos.length > 0}
          <div class="photo-previews">
            {#each photos as photo, i}
              <div class="photo-preview">
                <img src={URL.createObjectURL(photo)} alt="Preview" />
                <button type="button" class="remove-photo" onclick={() => removePhoto(i)}>×</button>
              </div>
            {/each}
          </div>
        {/if}
        {#if photos.length < 5}
          <button
            type="button"
            class="add-photo-btn"
            onclick={() => fileInput?.click()}
          >
            + Add Photos
          </button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            bind:this={fileInput}
            onchange={addPhotos}
            style="display: none;"
          />
        {/if}
      </div>
    </div>

    {#if error}
      <div class="error">{error}</div>
    {/if}

    <div class="form-actions">
      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
      <a href="/address/{addressId}" class="cancel-link">Cancel</a>
    </div>
  </form>
</main>

<style>
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group > label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .accuracy-options {
    display: flex;
    gap: 0.5rem;
  }

  .option {
    flex: 1;
    padding: 0.75rem;
    background: var(--bg-raised);
    border: 2px solid var(--border);
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-muted);
    transition: border-color 0.15s, color 0.15s;
  }

  .option input {
    display: none;
  }

  .option.selected {
    border-color: var(--accent);
    color: var(--text);
    font-weight: 600;
  }

  .star-rating {
    display: flex;
    gap: 0.25rem;
  }

  .star {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--border);
    padding: 0;
    line-height: 1;
  }

  .star.filled {
    color: var(--warning);
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-raised);
    color: var(--text);
    font-family: var(--font-family);
    font-size: 1rem;
    resize: vertical;
  }

  textarea::placeholder {
    color: var(--text-muted);
  }

  input[type="date"] {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg-raised);
    color: var(--text);
    font-family: var(--font-family);
    font-size: 1rem;
  }

  .error {
    padding: 0.75rem;
    background: var(--danger-bg);
    color: var(--danger);
    border: 1px solid var(--danger-border);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .submit-btn {
    padding: 0.75rem 2rem;
    background: var(--accent);
    color: var(--text-inverse);
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-link {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .photo-upload {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .photo-previews {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .photo-preview {
    position: relative;
    width: 100px;
    height: 75px;
  }

  .photo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .remove-photo {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    background: var(--danger);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .add-photo-btn {
    padding: 0.75rem 1rem;
    background: none;
    border: 2px dashed var(--border);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 0.9rem;
    cursor: pointer;
    font-family: var(--font-family);
    transition: border-color 0.15s, color 0.15s;
  }

  .add-photo-btn:hover {
    border-color: var(--accent);
    color: var(--text);
  }
</style>
