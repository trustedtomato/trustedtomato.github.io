<script lang="ts">
  import ButtonOrLink from './ButtonOrLink.svelte'
  import { twMerge } from 'tailwind-merge'

  export let href = ''
  let className = ''
  export { className as class }
  export let disabled = false
  export let targetBlank = false
</script>

<ButtonOrLink
  class={twMerge(
    'relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:content-[""] hover:after:scale-x-100',
    className
  )}
  {targetBlank}
  {href}
  {disabled}
  on:click>
  <slot />
</ButtonOrLink>
