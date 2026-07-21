import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BlogPost } from './components/BlogPost.tsx'
import { ApiDocs } from './components/ApiDocs.tsx'
import { Home } from './components/Home.tsx'
import { NotFound } from './components/NotFound.tsx'
import { Project } from './components/Project.tsx'
import { ProjectBlog } from './components/ProjectBlog.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:project/" element={<Project />} />
        <Route path="/projects/:project/api/" element={<ApiDocs />} />
        <Route path="/projects/:project/blog/" element={<ProjectBlog />} />
        <Route path="/projects/:project/blog/:slug/" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
