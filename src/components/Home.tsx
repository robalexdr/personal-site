import { Link } from 'react-router-dom'
import { projects } from '../blog/posts.ts'

export function Home() {
  return (
    <main className="site">
      <h1>Robert Alexander</h1>
      <p>
        <a href="/resume.pdf">Resume</a>
      </p>
      <section>
        <h2>Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.slug}>
              <Link to={`/projects/${project.slug}/`}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
