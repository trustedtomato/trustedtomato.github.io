<script lang="ts">
  import './styles.css'
  import { page } from '$app/stores'
</script>

{#if $page.data.disableLayout}
  <slot />
{:else}
  <slot />
{/if}
