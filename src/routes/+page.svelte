<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state('');
  let suggestions = $state<any[]>([]);
  let searching = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput() {
    clearTimeout(debounceTimer);
    if (searchQuery.trim().length < 3) {
      suggestions = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      searching = true;
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          suggestions = await res.json();
        }
      } catch {
        // ignore
      } finally {
        searching = false;
      }
    }, 300);
  }

  async function selectAddress(suggestion: any) {
    // Create or find address, then navigate
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: suggestion.street || suggestion.display_name,
        city: suggestion.city || '',
        state: suggestion.state || '',
        zip: suggestion.zip || '',
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon || suggestion.lng)
      })
    });

    if (res.ok) {
      const address = await res.json();
      goto(`/address/${address.id}`);
    }
  }
</script>

<main>
  <div class="hero">
    <h1>Real reviews from real visitors.</h1>
    <p class="subtitle">Search any address to see what people actually found when they visited.</p>

    <div class="search-container">
      <input
        type="text"
        class="search-input"
        placeholder="Search an address..."
        bind:value={searchQuery}
        oninput={handleInput}
      />
      {#if suggestions.length > 0}
        <div class="suggestions">
          {#each suggestions as s}
            <button class="suggestion" onclick={() => selectAddress(s)}>
              {s.display_name}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <section class="recent">
    <h2>Recent Reviews</h2>
    <p class="empty">No reviews yet. Be the first to review an address.</p>
  </section>
</main>

<style>
  main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .hero {
    text-align: center;
    padding: 4rem 0 3rem;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 0.75rem;
  }

  .subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin: 0 0 2rem;
  }

  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: var(--bg-raised);
    color: var(--text);
    font-family: var(--font-family);
    outline: none;
    transition: border-color 0.15s;
  }

  .search-input:focus {
    border-color: var(--accent);
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-top: none;
    border-radius: 0 0 12px 12px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .suggestion {
    display: block;
    width: 100%;
    padding: 0.75rem 1.25rem;
    text-align: left;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border-subtle);
    color: var(--text);
    font-size: 0.95rem;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .suggestion:hover {
    background: var(--bg-sunken);
  }

  .suggestion:last-child {
    border-bottom: none;
  }

  .recent {
    padding: 2rem 0;
  }

  .recent h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 1rem;
  }

  .empty {
    color: var(--text-muted);
    text-align: center;
    padding: 3rem 0;
  }
</style>
