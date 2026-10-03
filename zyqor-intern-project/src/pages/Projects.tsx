import { Link } from 'react-router-dom';
import { DEMO_PROJECTS } from '../data';
import { Button, Badge } from '../components/ui';
import { Search, Clock } from 'lucide-react';

export default function Projects() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Explore Projects</h1>
          <p className="text-sm text-muted">Find short-term work that matches what you want to learn.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search skills..." 
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-md text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Category</h3>
          <div className="space-y-2 text-sm text-muted">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-accent" defaultChecked /> All Categories</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-accent" /> Frontend</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-accent" /> Design</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="accent-accent" /> Data</label>
          </div>
        </div>
      </aside>

      {/* Grid */}
      <div className="flex-1 grid gap-4">
        {DEMO_PROJECTS.map(project => (
          <Link key={project.id} to={`/projects/${project.id}`} className="group block bg-surface border border-border rounded-xl p-6 hover:border-accent/50 hover:shadow-subtle transition-all">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge>{project.category}</Badge>
                  <span className="text-xs text-muted font-medium">{project.companyType}</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">{project.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map(skill => <span key={skill} className="text-xs text-muted bg-background px-2 py-1 rounded-md border border-border">{skill}</span>)}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Clock size={16} className="text-muted" /> {project.duration}
                </div>
                <Button variant="secondary" className="w-full md:w-auto">View Details</Button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}