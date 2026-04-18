<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let username = $state('');
  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  const returnTo = $derived($page.url.searchParams.get('returnTo') ?? '/');

  async function submit() {
    loading = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        errorMsg = data.error || 'signup failed';
        return;
      }
      goto(returnTo);
    } catch {
      errorMsg = 'network error';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign up — isitreal.estate</title>
</svelte:head>

<div class="wrap">
  <div class="card">
    <h1>Make an account.</h1>
    <p class="sub">a username, an email, a password. that's it. no social, no tracking.</p>

    <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
      <label class="lbl" for="username">Username</label>
      <input id="username" type="text" autocomplete="username" bind:value={username} required />

      <label class="lbl" for="email">Email</label>
      <input id="email" type="email" autocomplete="email" bind:value={email} required />

      <label class="lbl" for="password">Password</label>
      <input
        id="password"
        type="password"
        autocomplete="new-password"
        bind:value={password}
        required
        minlength="8"
      />

      {#if errorMsg}
        <div class="err">{errorMsg}</div>
      {/if}

      <button
        type="submit"
        class="btn-primary full"
        disabled={loading || !username || !email || !password}
      >
        {loading ? 'creating account…' : 'Create account →'}
      </button>
    </form>

    <div class="foot">
      already have an account? <a href="/login">log in</a>
    </div>
  </div>
</div>

<style>
  .wrap {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .card {
    width: 100%;
    max-width: 380px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    padding: 32px;
  }

  .card h1 {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.01em;
    margin: 0 0 8px 0;
  }

  .sub {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--fg-mute);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  .lbl {
    font-family: var(--mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--fg-mute);
    margin-bottom: 6px;
  }

  input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 10px 12px;
    margin-bottom: 18px;
    font-size: 14px;
    color: var(--fg);
  }
  input:focus {
    outline: none;
    border-color: var(--amber);
  }

  .err {
    font-family: var(--mono);
    font-size: 12px;
    color: var(--red);
    margin-bottom: 14px;
  }

  .btn-primary.full {
    width: 100%;
    padding: 12px;
    font-weight: 500;
  }

  .foot {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border-soft);
    font-family: var(--mono);
    font-size: 11px;
    color: var(--fg-mute);
    text-align: center;
  }
  .foot a {
    color: var(--amber);
  }

  @media (max-width: 420px) {
    .wrap {
      padding: 20px 12px;
    }
    .card {
      padding: 24px 20px;
    }
    .card h1 {
      font-size: 20px;
    }
  }
</style>
