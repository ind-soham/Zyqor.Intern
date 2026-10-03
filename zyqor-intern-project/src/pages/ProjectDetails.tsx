import { useParams, Link } from 'react-router-dom';
import { DEMO_PROJECTS } from '../data';
import { Button, Badge } from '../components/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const project = DEMO_PROJECTS.find(p => p.id === id) || DEMO_PROJECTS[0];

  return (
    <div className="bg-surface min-h-screen border-t border-border pb-24">
      {/* Header Banner */}
      <div className="bg-background border-b border-border py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8">
            <ArrowLeft size={16} /> Back to projects
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="accent">{project.category}</Badge>
            <span className="text-sm font-medium text-muted">{project.companyType}</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-4">{project.title}</h1>
        </div>
      </div>

      {/* Content Split */}
      <div className="max-w-5xl mx-auto px-6 mt-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <p className="text-muted leading-relaxed">{project.overview}</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Specific Deliverables</h2>
            <ul className="space-y-3">
              {project.deliverables.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Action Sidebar */}
        <aside className="w-full md:w-80 shrink-0">
          <div className="bg-background border border-border rounded-xl p-6 sticky top-24">
            <h3 className="font-semibold mb-6">Project Summary</h3>
            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted">Duration</span>
                <span className="font-medium">{project.duration}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted">Difficulty</span>
                <span className="font-medium">{project.difficulty}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-4">
                <span className="text-muted">Value</span>
                <span className="font-medium text-accent">{project.value}</span>
              </div>
            </div>
            <Button className="w-full mb-3">Apply for Project</Button>
            <p className="text-xs text-center text-muted">Applications close {project.deadline}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}