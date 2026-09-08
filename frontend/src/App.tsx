import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, ChevronDown, X, Shield, Clock, IndianRupee, Building, Zap, Menu } from 'lucide-react';

const FALLBACK_PROJECTS = [
  { _id: '1', title: "Build a Landing Page", company: "Nova Labs", budget: 5000, duration: "7 days", type: "Remote", category: "Development", skills: ["HTML", "CSS", "React"], match: 94 },
  { _id: '2', title: "Instagram Content Strategy", company: "Bloom Co.", budget: 3000, duration: "5 days", type: "Remote", category: "Marketing", skills: ["Marketing", "Canva", "Social Media"], match: 89 },
];

const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };
  return (
    <button className={`px-5 py-2.5 rounded-full font-medium transition-all text-sm cursor-pointer ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function App() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>(FALLBACK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then(res => res.json())
      .then(data => { if (data.length > 0) setProjects(data); })
      .catch(() => console.log("Using local data"));
  }, []);

  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newProject = {
      title: formData.get('title'),
      company: formData.get('company'),
      budget: Number(formData.get('budget')),
      duration: formData.get('duration'),
      category: "Development",
      skills: (formData.get('skills') as string).split(',').map(s => s.trim())
    };

    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      if (res.ok) {
        const saved = await res.json();
        setProjects([saved, ...projects]);
      }
    } catch (err) {
      setProjects([{...newProject, _id: Date.now().toString(), match: 99}, ...projects]);
    }
    setActiveModal(null);
    alert("Project Posted!");
  };

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl"><div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">M</div> MicroIntern</div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setActiveModal('login')}>Log In</Button>
            <Button onClick={() => setActiveModal('post')}>Post Project</Button>
          </div>
        </div>
      </nav>

      <section className="py-20 text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold mb-6">Real Work. <span className="text-blue-600">Real Experience.</span></h1>
        <p className="text-lg text-slate-600 mb-8">Connect with startups for short-term projects and build your portfolio.</p>
        <input 
          type="text" placeholder="Search projects..." 
          className="w-full max-w-md px-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
      </section>

      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filteredProjects.map((p) => (
          <div key={p._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
               <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center font-bold">{p.company.charAt(0)}</div>
               <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">Open</span>
            </div>
            <h3 className="font-bold text-lg mb-1">{p.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{p.company}</p>
            <div className="flex gap-4 text-sm mb-4">
              <span>₹{p.budget}</span>
              <span>{p.duration}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.skills?.map((s: string) => <span key={s} className="text-xs bg-slate-100 px-2 py-1 rounded">{s}</span>)}
            </div>
          </div>
        ))}
      </section>

      {/* Post Project Modal */}
      {activeModal === 'post' && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Post a Project</h3>
              <button onClick={() => setActiveModal(null)}><X size={20}/></button>
            </div>
            <form onSubmit={handlePostProject} className="space-y-4">
              <input name="title" required placeholder="Project Title" className="w-full p-2 border rounded" />
              <input name="company" required placeholder="Company Name" className="w-full p-2 border rounded" />
              <div className="flex gap-4">
                <input name="budget" type="number" required placeholder="Budget (₹)" className="w-full p-2 border rounded" />
                <input name="duration" required placeholder="Duration (e.g. 5 days)" className="w-full p-2 border rounded" />
              </div>
              <input name="skills" placeholder="Skills (comma separated)" className="w-full p-2 border rounded" />
              <Button className="w-full mt-2" type="submit">Post Now</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

