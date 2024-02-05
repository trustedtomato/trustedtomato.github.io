<script lang="ts">
  import type { PageData } from './$types'
  import TaggedHtml from '$lib/components/regular/TaggedHtml.svelte'
  import Header from '$lib/components/regular/Header.svelte'
  import { formatDate } from '$lib/utils/format-date'

  export let data: PageData
</script>

<Header></Header>

<div class="container">
  <div class="my-16">
    <h1 class="text-6xl">
      {data.title}
    </h1>

    <div class="my-8 text-gray-500">
      <time datetime={data.date}>{formatDate(data.date)}</time>
    </div>
  </div>

  <div class="cms-content my-8 max-w-lg">
    <TaggedHtml content={data.body}></TaggedHtml>
  </div>
</div>
