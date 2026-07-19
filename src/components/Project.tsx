import { Link, Navigate, useParams } from 'react-router-dom'
import { getPostsForProject, getProject } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

export function Project() {
  const { project: projectSlug } = useParams()
  const project = projectSlug ? getProject(projectSlug) : undefined

  if (!project) {
    return <Navigate to="/" replace />
  }

  const posts = getPostsForProject(project.slug)

  return (
    <div className="site">
      <SiteHeader />
      <main className="page">
      <p className="eyebrow">Project</p>
      <h1>{project.name}</h1>
      <p className="lede">{project.description}</p>

      <section className="section">
        <h2>Blog</h2>
        {posts.length > 0 ? (
          <div className="post-list">
            {posts.map((post) => (
              <Link className="post-card" key={post.slug} to={`/projects/${project.slug}/blog/${post.slug}/`}>
                <span className="card-kicker">Article</span>
                <h3>
                  {post.title}
                </h3>
                <span className="card-link">Read article <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No blog posts yet.</p>
        )}
      </section>
      </main>
    </div>
  )
}
