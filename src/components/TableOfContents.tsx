import type { ArticleHeading } from '../blog/headings.ts'

type TableOfContentsProps = {
  headings: ArticleHeading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (headings.length === 0) return null

  return (
    <aside className="table-of-contents" aria-label="Table of contents">
      <p className="toc-title">On this page</p>
      <nav>
        <ul>
          {headings.map((heading) => (
            <li key={heading.id} className={`toc-level-${heading.level}`}>
              <a href={`#${heading.id}`}>{heading.text}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
