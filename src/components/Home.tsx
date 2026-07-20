import { Link } from 'react-router-dom'
import { projects } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

export function Home() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="page">
        <p className="eyebrow">Software engineer</p>
        <h1 className="hero-title">Selected projects</h1>
      <section className="section">
        <div className="project-grid">
          {projects.map((project) => (
            <Link className="project-card" key={project.slug} to={`/projects/${project.slug}/`}>
              <span className="card-kicker">Project</span>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <span className="card-link">View project <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
      </main>
    </div>
  )
}
