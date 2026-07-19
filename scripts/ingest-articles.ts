import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

const imageExtensions = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
])

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const cliArguments = process.argv.slice(2)
const force = cliArguments.includes('--force')

const getOption = (option: string): string | undefined => {
  const index = cliArguments.indexOf(option)
  if (index === -1) return undefined

  const value = cliArguments[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${option}`)
  }

  return value
}

const showHelp = cliArguments.includes('--help') || cliArguments.includes('-h')
const articlesPath = getOption('--articles-path')
const projectName = getOption('--project-name')

type ValidatedArticle = {
  slug: string
  articleRoot: string
  imageFiles: string[]
}

if (showHelp) {
  console.log(`Usage:
  npm run ingest:articles -- --articles-path /path/to/articles --project-name dishcraft [--force]`)
  process.exit(0)
}

if (!projectName || !articlesPath) {
  console.error(
    'Usage: npm run ingest:articles -- --articles-path /path/to/articles --project-name dishcraft [--force]',
  )
  process.exit(1)
}

if (!slugPattern.test(projectName)) {
  throw new Error(`PROJECT_NAME must be a lowercase kebab-case slug: ${projectName}`)
}

const sourceRoot = path.resolve(articlesPath)
const repoRoot = path.resolve(import.meta.dirname, '..')
const publishFile = path.join(sourceRoot, 'publish.json')
const outputRoot = path.join(repoRoot, 'src', 'blog', projectName)
const publicRoot = path.join(repoRoot, 'public', 'projects', projectName, 'blog')

const isImage = (fileName: string): boolean =>
  imageExtensions.has(path.extname(fileName).toLowerCase())

const isExternalReference = (reference: string): boolean =>
  reference.startsWith('/') ||
  reference.startsWith('#') ||
  reference.startsWith('//') ||
  /^[a-z][a-z\d+.-]*:/i.test(reference)

const extractLocalImageReferences = (markdown: string): string[] => {
  const references: string[] = []
  const imagePattern =
    /!\[[^\]]*\]\(\s*(<[^>\n]+>|[^)\s]+)(?:\s+(?:"[^"\n]*"|'[^'\n]*'|\([^)]*\)))?\s*\)/g

  for (const match of markdown.matchAll(imagePattern)) {
    const rawReference = match[1]
    const reference = rawReference.startsWith('<')
      ? rawReference.slice(1, -1)
      : rawReference
    const fileReference = reference.split(/[?#]/, 1)[0]

    if (!isExternalReference(fileReference)) {
      references.push(fileReference)
    }
  }

  return references
}

const assertFile = async (filePath: string, description: string): Promise<void> => {
  let fileStat

  try {
    fileStat = await stat(filePath)
  } catch {
    throw new Error(`${description} does not exist: ${filePath}`)
  }

  if (!fileStat.isFile()) {
    throw new Error(`${description} is not a file: ${filePath}`)
  }
}

const assertDirectory = async (
  directoryPath: string,
  description: string,
): Promise<void> => {
  let directoryStat

  try {
    directoryStat = await stat(directoryPath)
  } catch {
    throw new Error(`${description} does not exist: ${directoryPath}`)
  }

  if (!directoryStat.isDirectory()) {
    throw new Error(`${description} is not a directory: ${directoryPath}`)
  }
}

const assertDirectChild = (
  parent: string,
  candidate: string,
  description: string,
): void => {
  const relativePath = path.relative(parent, candidate)

  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`${description} must be inside ${parent}: ${candidate}`)
  }

  if (relativePath.includes(path.sep)) {
    throw new Error(`${description} must be directly inside ${parent}: ${candidate}`)
  }
}

const readPublishList = async (): Promise<string[]> => {
  await assertFile(publishFile, 'publish.json')

  let parsed: unknown
  try {
    parsed = JSON.parse(await readFile(publishFile, 'utf8'))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`publish.json is not valid JSON: ${message}`)
  }

  if (
    !Array.isArray(parsed) ||
    parsed.some((entry: unknown) => typeof entry !== 'string')
  ) {
    throw new Error('publish.json must contain an array of strings')
  }

  const publishList = parsed as string[]

  if (new Set(publishList).size !== publishList.length) {
    throw new Error('publish.json contains duplicate article slugs')
  }

  for (const slug of publishList) {
    if (!slugPattern.test(slug)) {
      throw new Error(`Invalid article slug in publish.json: ${slug}`)
    }
  }

  return publishList
}

const validateArticle = async (slug: string): Promise<ValidatedArticle> => {
  const articleRoot = path.join(sourceRoot, slug)
  await assertFile(path.join(articleRoot, 'post.md'), `${slug}/post.md`)

  const entries = await readdir(articleRoot, { withFileTypes: true })
  const imageFiles = []

  for (const entry of entries) {
    if (entry.name === 'post.md') continue

    if (!entry.isFile() || !isImage(entry.name)) {
      throw new Error(
        `${slug} may contain only post.md and image files; found ${entry.name}`,
      )
    }

    imageFiles.push(entry.name)
  }

  const markdown = await readFile(path.join(articleRoot, 'post.md'), 'utf8')
  const firstLine = markdown.split(/\r?\n/, 1)[0]

  if (!/^#\s+\S/.test(firstLine)) {
    throw new Error(`${slug}/post.md must begin with a level-one heading`)
  }

  const referencedImages = new Set()
  for (const reference of extractLocalImageReferences(markdown)) {
    const target = path.resolve(articleRoot, reference)
    assertDirectChild(articleRoot, target, `Local image reference in ${slug}/post.md`)

    if (!isImage(target)) {
      throw new Error(`Local image reference does not have an image extension: ${reference}`)
    }

    await assertFile(target, `Local image reference in ${slug}/post.md`)
    referencedImages.add(path.basename(target))
  }

  const unusedImages = imageFiles.filter((fileName) => !referencedImages.has(fileName))
  if (unusedImages.length > 0) {
    throw new Error(`${slug} contains unused image(s): ${unusedImages.join(', ')}`)
  }

  return { slug, articleRoot, imageFiles }
}

const assertOutputIsAvailable = async (
  validatedArticles: ValidatedArticle[],
): Promise<void> => {
  const outputFiles = [path.join(outputRoot, 'publish.json')]

  for (const { slug, imageFiles } of validatedArticles) {
    outputFiles.push(path.join(outputRoot, slug, 'post.md'))
    outputFiles.push(...imageFiles.map((fileName) => path.join(publicRoot, slug, fileName)))
  }

  if (force) return

  for (const outputFile of outputFiles) {
    try {
      await stat(outputFile)
      throw new Error(`Output already exists: ${outputFile}. Use --force to overwrite.`)
    } catch (error: unknown) {
      if (
        !error ||
        typeof error !== 'object' ||
        !('code' in error) ||
        error.code !== 'ENOENT'
      ) {
        throw error
      }
    }
  }
}

const ingest = async (): Promise<void> => {
  await assertDirectory(sourceRoot, 'ARTICLES_PATH')
  const publishList = await readPublishList()
  const sourceEntries = await readdir(sourceRoot, { withFileTypes: true })
  const sourceFolders = new Set(
    sourceEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
  )

  for (const slug of publishList) {
    if (!sourceFolders.has(slug)) {
      throw new Error(`publish.json lists a folder that does not exist: ${slug}`)
    }
  }

  const unlistedFolders = [...sourceFolders].filter((slug) => !publishList.includes(slug))
  if (unlistedFolders.length > 0) {
    console.warn(`Warning: ignoring unlisted article folder(s): ${unlistedFolders.join(', ')}`)
  }

  const validatedArticles: ValidatedArticle[] = []
  for (const slug of publishList) {
    validatedArticles.push(await validateArticle(slug))
  }

  await assertOutputIsAvailable(validatedArticles)

  await mkdir(outputRoot, { recursive: true })
  await mkdir(publicRoot, { recursive: true })
  await writeFile(path.join(outputRoot, 'publish.json'), `${JSON.stringify(publishList, null, 2)}\n`)

  for (const { slug, articleRoot, imageFiles } of validatedArticles) {
    const articleOutput = path.join(outputRoot, slug)
    const publicOutput = path.join(publicRoot, slug)
    await mkdir(articleOutput, { recursive: true })
    await mkdir(publicOutput, { recursive: true })
    await copyFile(path.join(articleRoot, 'post.md'), path.join(articleOutput, 'post.md'))

    for (const fileName of imageFiles) {
      await copyFile(path.join(articleRoot, fileName), path.join(publicOutput, fileName))
    }
  }

  console.log(`Ingested ${validatedArticles.length} ${projectName} article(s).`)
}

ingest().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Article ingest failed: ${message}`)
  process.exit(1)
})
