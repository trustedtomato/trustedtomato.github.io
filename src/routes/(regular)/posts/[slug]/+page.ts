import type { PageLoad } from './$types'
import type { InstanceOf_posts } from '$lib/content/posts/sample'

export const load: PageLoad = async ({ params }) => {
  const post = await import(`../../../../lib/content/posts/${params.slug}.ts`)
  return post.data as InstanceOf_posts
}
