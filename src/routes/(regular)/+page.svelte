<script>
  import ExternalLink from '$lib/components/regular/ExternalLink.svelte'
  import FancyLink from '$lib/components/regular/FancyLink.svelte'
  import Header from '$lib/components/regular/Header.svelte'
  import Logo from '$lib/components/regular/Logo.svelte'
  import GithubLogo from '$lib/components/regular/social-media/GithubLogo.svelte'
  import LinkedinLogo from '$lib/components/regular/social-media/LinkedinLogo.svelte'
  import TaggedHtml from '$lib/components/regular/TaggedHtml.svelte'
  import { data_posts_summaries } from '$lib/content/posts/summaries'
  import { data_about } from '$lib/content/sections/about'
  import { formatDate } from '$lib/utils/format-date'
</script>

<Header></Header>

<main class="container">
  <div class="float-right hidden xl:block">
    <!-- This is a dumb placeholder so that this section aligns with the header nav. -->
    <div class="invisible flex h-[0.1px] gap-4">
      <FancyLink href="/" class="text-inherit">Blog</FancyLink>
      <FancyLink href="/about" class="text-inherit">About</FancyLink>
    </div>
    <div class="absolute w-96 hyphens-none">
      <img class="h-72 w-full object-cover" src="/me.jpg" alt="Me" />
      <h2 class="my-4 mt-6 text-4xl">What am I doing?</h2>
      <TaggedHtml content={data_about.what_am_i_doing}></TaggedHtml>
      <div class="flex gap-12">
        <div class="flex h-8 items-center gap-4">
          <GithubLogo></GithubLogo>
          <ExternalLink href={data_about.github_link}>GitHub</ExternalLink>
        </div>
        <div class="flex h-8 items-center gap-4">
          <LinkedinLogo></LinkedinLogo>
          <ExternalLink href={data_about.linkedin_link}>LinkedIn</ExternalLink>
        </div>
      </div>
      <div class="my-6">
        <a href="mailto:{data_about.email}">
          {data_about.email}
        </a>
      </div>
    </div>
  </div>
  <ul class="mt-4 xl:max-w-lg">
    {#each data_posts_summaries as post}
      <li class="my-16">
        <h2 class="my-2">
          <a class="text-4xl text-inherit" href="/posts/{post.slug}"
            >{post.title}</a>
        </h2>
        <time datetime={post.date}>{formatDate(post.date)}</time>
        <p>{post.description}</p>
        <a href="/posts/{post.slug}">Read more...</a>
      </li>
    {/each}
  </ul>
</main>
