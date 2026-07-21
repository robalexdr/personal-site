import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { displayProjectName, getProject } from '../blog/posts.ts'
import { SiteHeader } from './SiteHeader.tsx'

declare global {
  interface Window {
    Redoc?: {
      init: (
        specUrl: string,
        options: Record<string, unknown>,
        element: HTMLElement,
        callback?: (error?: Error) => void,
      ) => void
    }
  }
}

export function ApiDocs() {
  const { project: projectSlug } = useParams()
  const project = projectSlug ? getProject(projectSlug) : undefined
  const docsRef = useRef<HTMLDivElement>(null)
  const initializedProjectRef = useRef<string | undefined>(undefined)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!docsRef.current || !project || initializedProjectRef.current === project.slug) return

    initializedProjectRef.current = project.slug

    if (!window.Redoc) {
      setError('The API documentation viewer could not be loaded.')
      return
    }

    setError(undefined)
    docsRef.current.replaceChildren()

    const styleResponseTabs = () => {
      docsRef.current?.querySelectorAll<HTMLElement>('[role="tab"], .react-tabs__tab').forEach((tab) => {
        const status = tab.textContent?.trim().match(/^(\d{3})$/)?.[1]
        const color = status?.startsWith('2')
          ? '#166534'
          : status?.startsWith('3')
            ? '#92400e'
            : status?.startsWith('4') || status?.startsWith('5')
              ? '#7f1d1d'
              : undefined

        if (color) {
          tab.style.setProperty('background', color, 'important')
          tab.style.setProperty('background-color', color, 'important')
          tab.style.setProperty('color', '#ffffff', 'important')
        }
      })
    }

    const tabObserver = new MutationObserver(styleResponseTabs)
    tabObserver.observe(docsRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    window.Redoc.init(
      `/projects/${project.slug}/openapi.json`,
      {
        nativeScrollbars: true,
        theme: {
          colors: {
            primary: {
              main: '#a5b4fc',
            },
              text: {
                primary: '#e5e7eb',
                secondary: '#94a3b8',
              },
              gray: {
                50: '#111827',
                100: '#182235',
              },
              border: {
                light: '#334155',
                dark: '#475569',
              },
              responses: {
                success: {
                  color: '#86efac',
                  backgroundColor: '#166534',
                  tabTextColor: '#ffffff',
                },
                error: {
                  color: '#fca5a5',
                  backgroundColor: '#450a0a',
                  tabTextColor: '#ffffff',
                },
                redirect: {
                  color: '#fcd34d',
                  backgroundColor: '#451a03',
                  tabTextColor: '#ffffff',
                },
                info: {
                  color: '#93c5fd',
                  backgroundColor: '#172554',
                  tabTextColor: '#ffffff',
                },
              },
            },
            schema: {
              nestedBackground: '#182235',
              linesColor: '#475569',
            },
            sidebar: {
              backgroundColor: '#111827',
              textColor: '#d1d5db',
          },
          rightPanel: {
            backgroundColor: '#0f172a',
            textColor: '#166534',
          },
            codeBlock: {
              backgroundColor: '#020617',
            },
          },
      },
      docsRef.current,
      (loadError) => {
        if (loadError) setError(loadError.message)
      },
    )
    styleResponseTabs()
  }, [project])

  if (!project) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="site">
      <SiteHeader />
      <main className="page api-docs-page">
        <Link className="back-link" to={`/projects/${project.slug}/`}>
          ← Back to {displayProjectName(project.slug)}
        </Link>
        <p className="eyebrow">API reference</p>
        <h1>{project.name} API</h1>
        <div id="redoc-container" className="api-docs" ref={docsRef} />
        {error && <p className="api-docs-error">{error}</p>}
      </main>
    </div>
  )
}
