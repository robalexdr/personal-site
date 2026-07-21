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

      {project.slug === 'dishcraft' && (
        <div className="project-links">
          <a
            className="social-link"
            href="https://github.com/robalexdr/dishcraft"
            target="_blank"
            rel="noreferrer"
            aria-label="Dishcraft on GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.51-3.8-1.51-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.99 1.68 2.6 1.2 3.24.92.1-.72.39-1.2.7-1.48-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.13-3.04-.11-.28-.49-1.44.11-3 0 0 .92-.3 3.1 1.16A10.8 10.8 0 0 1 12 5.97c.93 0 1.86.13 2.73.4 2.18-1.46 3.1-1.16 3.1-1.16.6 1.56.22 2.72.11 3 .7.79 1.13 1.8 1.13 3.04 0 4.35-2.65 5.3-5.17 5.59.4.35.75 1.04.75 2.1v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
            </svg>
            <span>View on GitHub</span>
          </a>
        </div>
      )}

      {project.slug === 'dishcraft' && (
        <section className="section signup-section">
          <h2>Request demo access</h2>
          <p className="muted">Enter your company email to request access to a Dishcraft demo.</p>
          <div className="signup-form">
            <iframe
              title="Dishcraft signup form"
              src="https://tally.so/embed/QKa0ll?alignLeft=1&hideTitle=1&transparentBackground=1"
              loading="lazy"
            />
          </div>
          <p className="signup-fallback">
            Having trouble with the form?{' '}
            <a href="https://tally.so/r/QKa0ll" target="_blank" rel="noreferrer">
              Open it in a new tab
            </a>.
          </p>
        </section>
      )}

      {project.slug === 'dishcraft' && (
        <section className="section">
          <h2>API</h2>
          <p className="muted">Browse the interactive OpenAPI reference for Dishcraft.</p>
          <Link className="card-link" to={`/projects/${project.slug}/api/`}>
            Explore API docs <span aria-hidden="true">→</span>
          </Link>
        </section>
      )}

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
