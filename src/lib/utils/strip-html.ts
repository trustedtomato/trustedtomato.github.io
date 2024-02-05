export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .replace(/\s\s+/g, ' ')
}
