import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="site">
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </main>
  )
}
