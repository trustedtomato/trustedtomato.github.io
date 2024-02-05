<script lang="ts">
  export let content: string = ''

  export let fillTags: Partial<{
    imgSizes: string
    imgClass: string
  }> = {}

  let transformedContent = ''
  $: {
    if (!content) {
      transformedContent = ''
    } else {
      let fillTagsFull: Required<typeof fillTags> = {
        imgSizes: '',
        imgClass: '',
        ...fillTags
      }

      transformedContent = content
      for (const [key, value] of Object.entries(fillTagsFull)) {
        transformedContent = transformedContent.replaceAll(
          `##${key}##`,
          value || ''
        )
      }
      if (transformedContent.includes('##CMS:')) {
        console.error('CMS: Tag not replaced', transformedContent)
      }
    }
  }
</script>

{@html transformedContent}
