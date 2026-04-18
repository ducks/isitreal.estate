<script lang="ts">
  type Tone = 'green' | 'amber' | 'red' | undefined;
  let {
    value,
    label,
    tone
  }: { value: string | number; label: string; tone?: Tone } = $props();
</script>

<div class="pill" class:green={tone === 'green'} class:amber={tone === 'amber'} class:red={tone === 'red'}>
  <div class="value">{value}</div>
  <div class="label">{label}</div>
</div>

<style>
  .pill {
    flex: 1;
    padding: 16px 20px;
    text-align: center;
    min-width: 0;
  }
  .value {
    font-family: var(--serif);
    font-size: 26px;
    font-weight: 500;
    color: var(--fg);
    line-height: 1.1;
    margin-bottom: 6px;
  }
  .label {
    font-family: var(--mono);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--fg-mute);
  }
  .green .value { color: var(--green); }
  .amber .value { color: var(--amber); }
  .red   .value { color: var(--red); }
</style>
