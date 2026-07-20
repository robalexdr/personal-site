export type ArticleHeading = {
  level: 2 | 3
  text: string
  id: string
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function extractHeadings(markdown: string): ArticleHeading[] {
  return [...markdown.matchAll(/^(#{2,3})\s+(.+?)\s*#?\s*$/gm)].map((match) => {
    const level = match[1].length as 2 | 3
    const text = match[2].trim()

    return {
      level,
      text,
      id: slugifyHeading(text),
    }
  })
}
