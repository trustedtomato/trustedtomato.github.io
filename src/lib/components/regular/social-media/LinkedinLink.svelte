<script>
  import { twMerge } from 'tailwind-merge'
  import LinkedinLogo from './LinkedinLogo.svelte'

  let className = ''
  export { className as class }
</script>

<a
  class={twMerge('text-inherit transition-opacity hover:opacity-70', className)}
  href="https://www.linkedin.com/company/udvar-festival/"
  target="_blank"
  rel="noreferrer"
  aria-label="Az Udvar Fesztivál LinkedIn oldala">
  <LinkedinLogo />
</a>
