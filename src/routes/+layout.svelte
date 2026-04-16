<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  let theme = $state<'light' | 'dark'>('light');

  onMount(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) {
      theme = stored;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    goto('/login');
  }
</script>

<header>
  <div class="container">
    <a href="/" class="brand">Curbside</a>
    <nav>
      {#if data.user}
        <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        {#if data.user.is_admin}
          <a href="/admin" class="nav-link">Admin</a>
        {/if}
        <a href="/user/{data.user.username}" class="nav-link">{data.user.username}</a>
        <button class="nav-button" onclick={handleLogout}>Log out</button>
      {:else}
        <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <a href="/login" class="nav-link">Log in</a>
        <a href="/signup" class="nav-link cta">Sign up</a>
      {/if}
    </nav>
  </div>
</header>

{@render children()}

<style>
  :global(:root) {
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

    --bg: #fafaf9;
    --bg-raised: #ffffff;
    --bg-sunken: #f0efed;
    --bg-accent: #f5f0e8;

    --border: #e2e0db;
    --border-subtle: #ebebeb;

    --text: #1a1a1a;
    --text-muted: #6b6b6b;
    --text-inverse: #ffffff;

    --accent: #2563eb;
    --accent-hover: #1d4ed8;

    --danger: #dc2626;
    --danger-hover: #b91c1c;
    --danger-bg: #fef2f2;
    --danger-border: #fecaca;

    --success: #16a34a;
    --success-bg: #f0fdf4;
    --success-text: #166534;

    --warning: #d97706;
    --warning-bg: #fffbeb;

    --neutral-bg: #f3f4f6;
    --neutral-text: #4b5563;

    color-scheme: light;
  }

  :global(:root[data-theme="dark"]) {
    --bg: #0f0f0f;
    --bg-raised: #1a1a1a;
    --bg-sunken: #0a0a0a;
    --bg-accent: #1f1b14;

    --border: #2a2a2a;
    --border-subtle: #222222;

    --text: #e5e5e5;
    --text-muted: #8b8b8b;
    --text-inverse: #0f0f0f;

    --accent: #3b82f6;
    --accent-hover: #60a5fa;

    --danger: #f87171;
    --danger-hover: #fca5a5;
    --danger-bg: #1c1111;
    --danger-border: #3b1515;

    --success: #4ade80;
    --success-bg: #0f1f15;
    --success-text: #86efac;

    --warning: #fbbf24;
    --warning-bg: #1f1a0f;

    --neutral-bg: #1f1f1f;
    --neutral-text: #a1a1a1;

    color-scheme: dark;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme="light"])) {
      --bg: #0f0f0f;
      --bg-raised: #1a1a1a;
      --bg-sunken: #0a0a0a;
      --bg-accent: #1f1b14;
      --border: #2a2a2a;
      --border-subtle: #222222;
      --text: #e5e5e5;
      --text-muted: #8b8b8b;
      --text-inverse: #0f0f0f;
      --accent: #3b82f6;
      --accent-hover: #60a5fa;
      --danger: #f87171;
      --danger-hover: #fca5a5;
      --danger-bg: #1c1111;
      --danger-border: #3b1515;
      --success: #4ade80;
      --success-bg: #0f1f15;
      --success-text: #86efac;
      --warning: #fbbf24;
      --warning-bg: #1f1a0f;
      --neutral-bg: #1f1f1f;
      --neutral-text: #a1a1a1;
      color-scheme: dark;
    }
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    background: var(--bg);
    color: var(--text);
    line-height: 1.5;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(a) {
    color: var(--accent);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
  }

  header {
    background: var(--bg-raised);
    border-bottom: 1px solid var(--border);
    padding: 0.75rem 0;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
  }

  .brand:hover {
    text-decoration: none;
    opacity: 0.8;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .nav-link:hover {
    color: var(--text);
    text-decoration: none;
  }

  .nav-link.cta {
    background: var(--accent);
    color: var(--text-inverse);
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-weight: 600;
  }

  .nav-link.cta:hover {
    background: var(--accent-hover);
  }

  .nav-button {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: var(--font-family);
  }

  .nav-button:hover {
    background: var(--bg-sunken);
    color: var(--text);
  }

  .theme-toggle {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }

  .theme-toggle:hover {
    background: var(--bg-sunken);
  }
</style>
