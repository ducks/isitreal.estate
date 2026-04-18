<svelte:head>
  <title>About — isitreal.estate</title>
  <meta
    name="description"
    content="A public real estate listing ledger, kept by the people who showed up."
  />
</svelte:head>

<div class="main">
  <div class="crumbs">
    <a href="/">search</a>
    <span class="sep">/</span>
    <span>about</span>
  </div>

  <div class="content">
    <h1>About isitreal.estate</h1>
    <p class="lead">a public ledger, kept by the people who showed up.</p>

    <p class="body">
      Listings disappear. Addresses don't. This is a place to record what a unit
      was actually like — so the next person who shows up isn't surprised. No
      broker owns an address page. No listing can be taken down. If an agent
      relists the same unit with fresh photos, the history comes with it.
    </p>

    <div class="section-label">How it works</div>
    <ol class="list">
      <li>Search an address before you visit.</li>
      <li>Read reviews from people who've been inside.</li>
      <li>
        After you visit, leave your own — photos of what was actually there beat
        any opinion.
      </li>
      <li>
        Vote on whether other reviews match what you saw. Consistent voters
        build credibility.
      </li>
    </ol>

    <div class="section-label">What this isn't</div>
    <ul class="list">
      <li>A listing site. We don't carry inventory or collect referral fees.</li>
      <li>
        A review site for brokers. We review <em>listings</em> — the gap
        between what was promised and what was there.
      </li>
      <li>Anonymous. You need an account to post. Usernames are permanent.</li>
    </ul>
  </div>
</div>

<style>
  .main {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: var(--content-pad-y) var(--content-pad-x) 80px;
  }

  .crumbs {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--fg-faint);
    margin-bottom: 24px;
  }
  .crumbs a { color: var(--fg-mute); }
  .crumbs a:hover { color: var(--amber); }
  .crumbs .sep {
    margin: 0 6px;
    color: var(--fg-faint);
  }

  .content {
    max-width: 64ch;
  }

  h1 {
    font-family: var(--serif);
    font-size: 32px;
    font-weight: 500;
    letter-spacing: -0.01em;
    margin: 0 0 10px 0;
  }

  .lead {
    font-family: var(--mono);
    font-size: 13px;
    color: var(--fg-mute);
    margin: 0 0 22px 0;
  }

  .body {
    color: var(--fg-dim);
    font-size: 15px;
    line-height: 1.65;
    margin: 0 0 10px 0;
    text-wrap: pretty;
  }

  .section-label {
    font-family: var(--mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--fg-faint);
    border-bottom: 1px solid var(--border-soft);
    padding-bottom: 8px;
    margin-top: 32px;
    margin-bottom: 14px;
  }

  .list {
    color: var(--fg-dim);
    font-family: var(--sans);
    font-size: 15px;
    line-height: 1.8;
    padding-left: 20px;
    margin: 0;
  }
  .list em {
    color: var(--fg);
    font-style: italic;
  }
</style>
