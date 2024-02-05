<script lang="ts">
  let className = ''
  export { className as class }
  export let href = ''
  export let disabled = false
  export let targetBlank = false
</script>

{#if href}
  {#if disabled}
    <span class={className}>
      <slot />
    </span>
  {:else}
    <a
      {href}
      target={targetBlank ? '_blank' : null}
      rel={targetBlank ? 'noreferrer noopener' : null}
      on:click
      class={className}>
      <slot />
    </a>
  {/if}
{:else}
  <button on:click {disabled} class={className}>
    <slot />
  </button>
{/if}
