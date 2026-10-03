import { Link } from 'react-router-dom';
import { DEMO_STUDENT, DEMO_PROJECTS } from '../data';
import { Badge } from '../components/ui';
import { Briefcase, FileText, CheckSquare, LayoutGrid } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      {/* App Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-bold tracking-tight text-lg">ZYQOR</span>
            <span className="text-[10px] font-medium tracking-widest text-accent uppercase">Intern</span>
          </Link>
        </div>
        <nav className="p-4 flex flex-col gap-1 flex-1">
          <NavItem icon={<LayoutGrid size={18}/>} label="Overview" active />
          <NavItem icon={<Briefcase size={18}/>} label="Active Projects" />
          <NavItem icon={<FileText size={18}/>} label="Applications" />
          <NavItem icon={<CheckSquare size={18}/>} label="Portfolio Proof" />
        </nav>
        <div className="p-6 border-t border-border">
          <div className="text-sm font-medium">{DEMO_STUDENT.name}</div>
          <div className="text-xs text-muted mt-1">{DEMO_STUDENT.role}</div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <Badge className="mb-4" variant="default">Student Workspace Demo</Badge>
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Good afternoon, Soham.</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Active Projects" value="1" />
          <StatCard title="Pending Applications" value={DEMO_STUDENT.applications.toString()} />
          <StatCard title="Verified Portfolio" value={DEMO_STUDENT.verifiedProjects.toString()} />
        </div>

        <h2 className="text-xl font-semibold mb-6">Current Sprint</h2>
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-lg">{DEMO_PROJECTS[0].title}</h3>
              <p className="text-sm text-muted mt-1">{DEMO_PROJECTS[0].companyType}</p>
            </div>
            <Badge variant="accent">In Progress</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress</span>
              <span>75%</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-3/4 rounded-full"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-zinc-100 text-foreground' : 'text-muted hover:bg-zinc-50 hover:text-foreground'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, value }: { title: string, value: string }) => (
  <div className="bg-surface border border-border p-6 rounded-xl shadow-subtle">
    <div className="text-sm font-medium text-muted mb-2">{title}</div>
    <div className="text-3xl font-semibold">{value}</div>
  </div>
);