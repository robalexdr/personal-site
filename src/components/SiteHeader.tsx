import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="identity">
        <Link className="brand" to="/">
          Robert Alexander
        </Link>
        <span className="role">Software Engineer</span>
      </div>
      <nav className="site-nav" aria-label="Main navigation">
        <Link to="/">Projects</Link>
        <a href="/resume.pdf">Resume</a>
        <span className="social-links">
          <a
            className="social-link"
            href="https://www.linkedin.com/in/robalexdr"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6.5 8.5H3.25V20H6.5V8.5ZM4.88 3A1.88 1.88 0 1 0 4.88 6.75 1.88 1.88 0 0 0 4.88 3ZM20.75 13.4c0-3.47-1.85-5.09-4.32-5.09-1.99 0-2.88 1.1-3.38 1.87V8.5H9.8V20h3.25v-5.69c0-1.5.28-2.95 2.14-2.95 1.84 0 1.87 1.72 1.87 3.05V20h3.24l.45-6.6Z" />
            </svg>
            <span>LinkedIn</span>
          </a>
          <a
            className="social-link"
            href="https://github.com/robalexdr"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.51-3.8-1.51-.5-1.27-1.22-1.61-1.22-1.61-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.99 1.68 2.6 1.2 3.24.92.1-.72.39-1.2.7-1.48-2.51-.29-5.15-1.26-5.15-5.6 0-1.24.44-2.25 1.13-3.04-.11-.28-.49-1.44.11-3 0 0 .92-.3 3.1 1.16A10.8 10.8 0 0 1 12 5.97c.93 0 1.86.13 2.73.4 2.18-1.46 3.1-1.16 3.1-1.16.6 1.56.22 2.72.11 3 .7.79 1.13 1.8 1.13 3.04 0 4.35-2.65 5.3-5.17 5.59.4.35.75 1.04.75 2.1v3.1c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
            </svg>
            <span>GitHub</span>
          </a>
        </span>
      </nav>
    </header>
  )
}
