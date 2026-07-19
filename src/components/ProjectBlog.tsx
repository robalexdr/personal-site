import { Link, useParams } from 'react-router-dom'
import { displayProjectName, getPostsForProject } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

export function ProjectBlog() {
  const { project } = useParams()
  const posts = project ? getPostsForProject(project) : []

  return (
    <div className="site">
      <SiteHeader />
      <main className="page">
      <p className="eyebrow">Project blog</p>
      <h1>{project ? displayProjectName(project) : 'Project'}</h1>
      <div className="post-list">
        {posts.map((post) => (
          <Link className="post-card" key={post.slug} to={`/projects/${post.project}/blog/${post.slug}/`}>
            <span className="card-kicker">Article</span>
            <h3>
              {post.title}
            </h3>
            <span className="card-link">Read article <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
      </main>
    </div>
  )
}
