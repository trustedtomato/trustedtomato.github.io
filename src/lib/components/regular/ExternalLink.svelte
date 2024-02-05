<script lang="ts">
  import { twMerge } from 'tailwind-merge'

  export let href = ''
  let className = ''
  export { className as class }
</script>

<a {href} class={twMerge(className)} target="_blank">
  <slot />
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    class="mb-0.5 ml-0.5 inline-block">
    <path
      d="M1.5 4.51807H7.482V10.5001H1.5V4.51807Z"
      fill="#FFFBF4"
      stroke="currentColor" />
    <path
      d="M5.76488 1H10.9999V6.39L9.42688 7.937L8.11688 6.627L5.39288 9.35L2.70288 6.662L5.51288 3.854L4.19988 2.544L5.76488 1Z"
      fill="currentColor" />
    <path
      d="M9.99509 2.00397L10.0171 6.88897L8.20009 5.06997L5.32009 7.94997L4.09009 6.72297L6.97209 3.84297L5.12209 1.99097L9.99509 2.00397Z"
      fill="#FFFBF4" />
  </svg>
</a>
