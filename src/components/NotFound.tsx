import { Link } from 'react-router-dom'
import { SiteHeader } from './SiteHeader.tsx'

export function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main className="page">
        <h1>Page not found</h1>
        <Link to="/">Return home</Link>
      </main>
    </div>
  )
}
