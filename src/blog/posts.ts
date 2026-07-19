import projectDefinitions from '../projects.json'

type PostSource = {
  project: string
  slug: string
  content: string
  title: string
}

const publishManifests = import.meta.glob('./*/publish.json', {
  eager: true,
  import: 'default',
}) as Record<string, string[]>

const markdownFiles = import.meta.glob('./*/**/post.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const titleFromMarkdown = (content: string): string => {
  const firstLine = content.split(/\r?\n/, 1)[0]
  return firstLine.replace(/^#\s+/, '')
}

const postFromPath = (filePath: string, content: string): PostSource => {
  const [, project, slug] = filePath.split('/')

  return {
    project,
    slug,
    content,
    title: titleFromMarkdown(content),
  }
}

const posts = Object.entries(markdownFiles).map(([filePath, content]) =>
  postFromPath(filePath, content),
)

const postKey = (project: string, slug: string): string => `${project}/${slug}`

const postsByKey = new Map(posts.map((post) => [postKey(post.project, post.slug), post]))

export const projects = projectDefinitions

export function getProject(project: string) {
  return projects.find((definition) => definition.slug === project)
}

export function getPostsForProject(project: string): PostSource[] {
  const manifestPath = `./${project}/publish.json`
  const slugs = publishManifests[manifestPath] ?? []

  return slugs
    .map((slug) => postsByKey.get(postKey(project, slug)))
    .filter((post): post is PostSource => post !== undefined)
}

export function getPost(project: string, slug: string): PostSource | undefined {
  return postsByKey.get(postKey(project, slug))
}

export function displayProjectName(project: string): string {
  return project.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
