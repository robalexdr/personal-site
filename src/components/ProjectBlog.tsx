import { Link, useParams } from 'react-router-dom'
import { displayProjectName, getPostsForProject } from '../blog/posts.ts'

export function ProjectBlog() {
  const { project } = useParams()
  const posts = project ? getPostsForProject(project) : []

  return (
    <main className="site">
      <p>
        <Link to="/">Robert Alexander</Link>
      </p>
      <h1>{project ? displayProjectName(project) : 'Project'} blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/projects/${post.project}/blog/${post.slug}/`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
