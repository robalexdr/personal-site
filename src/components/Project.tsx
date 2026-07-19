import { Link, Navigate, useParams } from 'react-router-dom'
import { getPostsForProject, getProject } from '../blog/posts.ts'

export function Project() {
  const { project: projectSlug } = useParams()
  const project = projectSlug ? getProject(projectSlug) : undefined

  if (!project) {
    return <Navigate to="/" replace />
  }

  const posts = getPostsForProject(project.slug)

  return (
    <main className="site">
      <p>
        <Link to="/">Robert Alexander</Link>
      </p>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <section>
        <h2>Blog</h2>
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link to={`/projects/${project.slug}/blog/${post.slug}/`}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No blog posts yet.</p>
        )}
      </section>
    </main>
  )
}
