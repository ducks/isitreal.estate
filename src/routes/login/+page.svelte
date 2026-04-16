<script lang="ts">
  import { goto } from '$app/navigation';

  let username = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit() {
    loading = true;
    error = '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const data = await res.json();
        error = data.error || 'Login failed';
        return;
      }

      goto('/');
    } catch {
      error = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <div class="auth-card">
    <h1>Log in</h1>

    <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" type="text" bind:value={username} required />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} required />
      </div>

      {#if error}
        <div class="error">{error}</div>
      {/if}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log in'}
      </button>
    </form>

    <p class="alt">Don't have an account? <a href="/signup">Sign up</a></p>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    padding: 4rem 1.5rem;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 2rem;
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.5rem;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.4rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-family);
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: var(--accent);
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

  button {
    width: 100%;
    padding: 0.75rem;
    background: var(--accent);
    color: var(--text-inverse);
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: var(--font-family);
  }

  button:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .alt {
    text-align: center;
    margin: 1.5rem 0 0;
    font-size: 0.9rem;
    color: var(--text-muted);
  }
</style>
