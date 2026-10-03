import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Badge } from '../components/ui';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto flex flex-col items-center text-center">
        <Badge className="mb-8" variant="accent">Prototype Concept</Badge>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground mb-6 leading-[1.1]">
          Small Projects.<br />Big Opportunities.
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
          Real-world work for students. Focused execution for growing businesses. Bridge the experience gap, one short-term project at a time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/projects">
            <Button className="w-full sm:w-auto text-base px-8 py-6">Explore Projects</Button>
          </Link>
          <Link to="/companies">
            <Button variant="secondary" className="w-full sm:w-auto text-base px-8 py-6">Post a Project</Button>
          </Link>
        </div>
      </section>

      {/* The Problem Diagram */}
      <section className="bg-surface border-y border-border py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Experience shouldn't require experience.</h2>
            <p className="text-muted">The traditional internship loop is broken for early talent.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center bg-background p-8 border border-border rounded-xl">
            <div className="flex-1">
              <div className="font-medium mb-2">No Experience</div>
              <div className="text-sm text-muted">Hard to get hired</div>
            </div>
            <ArrowRight className="text-muted hidden md:block" />
            <div className="flex-1">
              <div className="font-medium mb-2">No Internships</div>
              <div className="text-sm text-muted">Filtered out by ATS</div>
            </div>
            <ArrowRight className="text-muted hidden md:block" />
            <div className="flex-1">
              <div className="font-medium mb-2">No Proof of Work</div>
              <div className="text-sm text-muted">Portfolio remains empty</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Gap Comparison */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-semibold mb-12 text-center">A new model for practical experience.</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-border bg-surface rounded-xl">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-300"></div> Traditional Internships
            </h3>
            <ul className="space-y-4 text-muted">
              <li className="flex items-start gap-3"><XIcon /> 3–6 month rigid commitment</li>
              <li className="flex items-start gap-3"><XIcon /> Often requires prior experience</li>
              <li className="flex items-start gap-3"><XIcon /> Broad, unstructured roles</li>
            </ul>
          </div>
          <div className="p-8 border border-accent bg-blue-50/30 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider rounded-bl-lg">Zyqor Intern</div>
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-foreground">
              <div className="w-2 h-2 rounded-full bg-accent"></div> Micro-Projects
            </h3>
            <ul className="space-y-4 text-foreground">
              <li className="flex items-start gap-3"><CheckCircle2 className="text-accent shrink-0" size={20} /> 1–4 week flexible sprints</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="text-accent shrink-0" size={20} /> Starter-friendly deliverables</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="text-accent shrink-0" size={20} /> Tangible portfolio proof</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background py-32 px-6 text-center mt-12">
        <h2 className="text-4xl font-semibold mb-6">Your first real project starts here.</h2>
        <Link to="/projects"><Button className="bg-white text-foreground hover:bg-zinc-100">Explore Marketplace</Button></Link>
      </section>
    </div>
  );
}

const XIcon = () => <div className="mt-1 text-zinc-400">×</div>;