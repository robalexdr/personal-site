import ReactMarkdown from 'react-markdown'
import { Link, Navigate, useParams } from 'react-router-dom'
import { displayProjectName, getPost } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

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
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>
      </main>
    </div>
  )
}
