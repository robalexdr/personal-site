import ReactMarkdown from 'react-markdown'
import { Link, Navigate, useParams } from 'react-router-dom'
import { displayProjectName, getPost } from '../blog/posts.ts'

export function BlogPost() {
  const { project, slug } = useParams()
  const post = project && slug ? getPost(project, slug) : undefined

  if (!project || !slug || !post) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="site">
      <p>
        <Link to={`/projects/${project}/blog/`}>
          Back to {displayProjectName(project)} blog
        </Link>
      </p>
      <article>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </main>
  )
}
