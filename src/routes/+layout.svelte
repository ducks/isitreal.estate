<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  let theme = $state<'light' | 'dark'>('dark');

  onMount(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    theme = stored || 'dark';
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

  const currentPath = $derived($page.url.pathname);
</script>

<header class="topbar">
  <div class="topbar-inner">
    <a href="/" class="brand">
      isitreal<span class="brand-dot">.</span><span class="brand-tld">estate</span>
    </a>

    <nav class="nav">
      <a href="/" class="nav-link" class:active={currentPath === '/'}>search</a>
      <a href="/#feed" class="nav-link">recent</a>
      <a href="/about" class="nav-link" class:active={currentPath === '/about'}>about</a>
    </nav>

    <div class="right">
      <button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? '☀' : '☾'}
      </button>
      {#if data.user}
        {#if data.user.is_admin}
          <a href="/admin" class="nav-link">admin</a>
        {/if}
        <a href="/user/{data.user.username}" class="nav-link">@{data.user.username}</a>
        <span class="sep">·</span>
        <button class="linklike" onclick={handleLogout}>log out</button>
      {:else}
        <a href="/login" class="nav-link">log in</a>
        <span class="sep">·</span>
        <a href="/signup" class="nav-link accent">sign up</a>
      {/if}
    </div>
  </div>
</header>

<main>
  {@render children()}
</main>

<footer class="footer">
  a crowd-sourced real estate review ledger · v0.3 · no ads · no listings · no commission
</footer>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--bg);
    border-bottom: 1px solid var(--border-soft);
  }

  .topbar-inner {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 10px var(--content-pad-x);
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .brand {
    font-family: var(--serif);
    font-size: 15px;
    font-weight: 600;
    color: var(--fg);
    letter-spacing: -0.005em;
  }
  .brand:hover { color: var(--fg); }
  .brand-dot { color: var(--orange); }
  .brand-tld {
    color: var(--fg-mute);
    font-weight: 400;
  }

  .nav {
    display: flex;
    gap: 18px;
    margin-left: 8px;
  }

  .nav-link {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    letter-spacing: 0.02em;
  }
  .nav-link:hover,
  .nav-link.active {
    color: var(--amber);
  }
  .nav-link.accent {
    color: var(--amber);
  }
  .nav-link.accent:hover {
    color: var(--amber-dim);
  }

  .right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
  }

  .sep {
    color: var(--fg-faint);
  }

  .linklike {
    border: none;
    padding: 0;
    background: transparent;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    cursor: pointer;
  }
  .linklike:hover {
    background: transparent;
    color: var(--amber);
  }

  .theme-toggle {
    border: 1px solid var(--border);
    background: transparent;
    color: var(--fg-mute);
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1;
  }
  .theme-toggle:hover {
    background: var(--bg-2);
    color: var(--fg);
  }

  main {
    min-height: calc(100vh - 120px);
  }

  .footer {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-faint);
    text-align: center;
    padding: 14px 20px;
    border-top: 1px solid var(--border-soft);
    margin-top: 60px;
  }

  @media (max-width: 720px) {
    .topbar-inner {
      flex-wrap: wrap;
      gap: 12px;
    }
    .nav { gap: 14px; }
    .right {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
