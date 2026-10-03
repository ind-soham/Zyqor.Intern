import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Dashboard from './pages/Dashboard';
import { StaticPage } from './pages/StaticPages';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StaticPage type="students" />} />
          <Route path="companies" element={<StaticPage type="companies" />} />
          <Route path="about" element={<StaticPage type="about" />} />
          <Route path="contact" element={<StaticPage type="contact" />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);