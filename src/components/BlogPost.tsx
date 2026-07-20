import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, type ImgHTMLAttributes } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { displayProjectName, getPost } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

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

  return (
    <div className="site">
      <SiteHeader />
      <main className="page article-page">
        <Link className="back-link" to={`/projects/${project}/`}>
          ← Back to {displayProjectName(project)}
        </Link>
        <article className="prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{ img: MarkdownImage }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
