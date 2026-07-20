import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, type ImgHTMLAttributes } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { extractHeadings, slugifyHeading } from '../blog/headings.ts'
import { displayProjectName, getPost } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'
import { TableOfContents } from './TableOfContents.tsx'

function MarkdownImage({ src, alt, title }: ImgHTMLAttributes<HTMLImageElement>) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return null

  return (
    <>
      <button
        className="image-button"
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Enlarge image${alt ? `: ${alt}` : ''}`}
      >
        <img src={src} alt={alt ?? ''} title={title} />
      </button>
      {isOpen && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-label={alt ?? 'Enlarged image'}
          onClick={() => setIsOpen(false)}
        >
          <img src={src} alt={alt ?? ''} title={title} />
        </div>
      )}
    </>
  )
}

export function BlogPost() {
  const { project, slug } = useParams()
  const post = project && slug ? getPost(project, slug) : undefined

  if (!project || !slug || !post) {
    return <Navigate to="/" replace />
  }

  const headings = extractHeadings(post.content)

  const headingComponents = {
    h2: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h2 id={slugifyHeading(String(children ?? ''))} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h3 id={slugifyHeading(String(children ?? ''))} {...props}>
        {children}
      </h3>
    ),
  }

  return (
    <div className="site">
      <SiteHeader />
      <main className="page article-page">
        <Link className="back-link" to={`/projects/${project}/`}>
          ← Back to {displayProjectName(project)}
        </Link>
        <div className="article-layout">
          <TableOfContents headings={headings} />
          <article className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{ ...headingComponents, img: MarkdownImage }}
            >
              {post.content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  )
}
