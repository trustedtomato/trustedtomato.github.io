<script>
  const indexTitle = "Tamás Halasi's blog"
  export let title = ''
  export let description = ''
  let fullTitle = ''
  $: {
    if (title) {
      fullTitle = `${title} | ${indexTitle}`
    } else {
      fullTitle = indexTitle
    }
  }
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
</svelte:head>
