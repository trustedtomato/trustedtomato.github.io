<script>
  import Logo from './Logo.svelte'
</script>

<header class="bg-theme-dark text-theme-light">
  <div class="container">
    <div class="flex h-16 items-center gap-8">
      <a href="/" class="flex grow items-center gap-8 text-inherit">
        <div class="h-8">
          <Logo></Logo>
        </div>
        Tamás Halasi’s blog
      </a>
      <div class="flex gap-4">
        <a href="/" class="text-inherit hover:underline">Blog</a>
        <a href="/about" class="text-inherit hover:underline">About</a>
      </div>
    </div>
  </div>
</header>
