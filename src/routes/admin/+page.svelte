<script>
  import { base } from '$app/paths'
  import styles from './styles.css?inline'

  if (typeof window === 'object') {
    Promise.all([
      import('decap-cms-app')
      // @ts-ignore
      // import('decap-cms-locales/dist/esm/en')
    ]).then(([cmsPackage, langPackage]) => {
      if (
        !cmsPackage
        // || !langPackage
      ) {
        return
      }
      const CMS = cmsPackage.default
      // CMS.registerLocale('en', langPackage.default)
      CMS.registerPreviewStyle(styles, { raw: true })
      CMS.init()
    })
  }
</script>

<svelte:head>
  <title>Content editor for Tamás Halasi's blog</title>
  <base href="{base}/admin/" />
</svelte:head>
