import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, GraduationCap, ChevronDown, X, Shield, Clock, IndianRupee, 
  Building, Zap, User, Heart, CheckCircle2, Star, ArrowRight, 
  BarChart3, LayoutDashboard, Plus, Check, Filter, Briefcase, 
  Send, AlertCircle, Sparkles, TrendingUp, Bookmark, ExternalLink,
  Laptop, Compass, Layers, Award, FileText, CheckCircle, HelpCircle,
  FolderPlus, Users, DollarSign, Target, Settings, LogOut, PackageCheck,
  CreditCard, Truck, LifeBuoy, ShoppingCart, Bell, Megaphone, UploadCloud,
  FileCheck2, RefreshCw, Eye, MessageSquare, AlertTriangle, ArrowUpRight
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUZTle5J7FSu_Af6xLebmtN8M9g69DIxw",
  authDomain: "zyqor-intern.firebaseapp.com",
  projectId: "zyqor-intern",
  storageBucket: "zyqor-intern.firebasestorage.app",
  messagingSenderId: "209139233286",
  appId: "1:209139233286:web:308e9ac0462d5e15c24987",
  measurementId: "G-1GTDNLXQSV"
};

let firestoreDb: any = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  firestoreDb = getFirestore(app);
} catch (err) {
  console.warn("Operating with local state memory engine:", err);
}

const INITIAL_CATALOG = [
  {
    id: "opp-101",
    title: "React Native Performance Optimization",
    company: "Nova Labs",
    companyLogo: "N",
    category: "Technology",
    budget: 12000,
    escrowLocked: true,
    duration: "3 Weeks",
    type: "Remote",
    skills: ["React Native", "TypeScript", "Performance", "Redux"],
    experience: "Intermediate",
    description: "Profile rendering bottlenecks, eliminate redundant bridge calls, and boost FPS to stable 60 across legacy Android devices.",
    slotsTotal: 2,
    slotsFilled: 1,
    applicantsCount: 14,
    status: "Active",
    verified: true,
    platformFeeRate: 0.12,
    deliveryRequirements: "GitHub Pull Request with benchmark profiling video report."
  },
  {
    id: "opp-102",
    title: "Fintech Checkout Redesign & Flow",
    company: "Finova Analytics",
    companyLogo: "F",
    category: "Design",
    budget: 9500,
    escrowLocked: true,
    duration: "10 Days",
    type: "Hybrid",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    experience: "Beginner / Intermediate",
    description: "Re-architect our 3-step checkout funnel for Gen-Z users to increase mobile payment conversions and decrease drop-offs.",
    slotsTotal: 1,
    slotsFilled: 0,
    applicantsCount: 9,
    status: "Active",
    verified: true,
    platformFeeRate: 0.10,
    deliveryRequirements: "Figma prototype link with component auto-layout specs."
  },
  {
    id: "opp-103",
    title: "Automated Customer Retention Bot",
    company: "Orbit Systems",
    companyLogo: "O",
    category: "Technology",
    budget: 15000,
    escrowLocked: true,
    duration: "4 Weeks",
    type: "Remote",
    skills: ["Python", "OpenAI API", "Webhooks", "FastAPI"],
    experience: "Advanced",
    description: "Construct a self-hosted webhook agent that flags disengaged SaaS accounts and personalizes re-engagement discount sequences.",
    slotsTotal: 1,
    slotsFilled: 1,
    applicantsCount: 21,
    status: "Filled",
    verified: true,
    platformFeeRate: 0.15,
    deliveryRequirements: "Docker container and Postman collection documentation."
  },
  {
    id: "opp-104",
    title: "B2B SaaS Growth & Cold Email Funnel",
    company: "Bloom Collective",
    companyLogo: "B",
    category: "Marketing",
    budget: 6500,
    escrowLocked: true,
    duration: "7 Days",
    type: "Remote",
    skills: ["Copywriting", "Apollo.io", "Cold Email", "Canva"],
    experience: "Beginner",
    description: "Draft 5 hyper-targeted cold outreach email variants and build a responsive landing sales deck template for prospective clients.",
    slotsTotal: 3,
    slotsFilled: 1,
    applicantsCount: 16,
    status: "Active",
    verified: false,
    platformFeeRate: 0.10,
    deliveryRequirements: "Spreadsheet of 200 validated leads and approved templates."
  },
  {
    id: "opp-105",
    title: "Telemetry Data & SQL Cohort Audit",
    company: "NextGrid Dynamics",
    companyLogo: "G",
    category: "Data",
    budget: 8500,
    escrowLocked: true,
    duration: "2 Weeks",
    type: "Remote",
    skills: ["SQL", "Python", "Tableau", "PostgreSQL"],
    experience: "Intermediate",
    description: "Query 80,000 monthly user event rows to map weekly retention cohorts and formulate executive dashboards in Tableau.",
    slotsTotal: 2,
    slotsFilled: 0,
    applicantsCount: 6,
    status: "Active",
    verified: true,
    platformFeeRate: 0.12,
    deliveryRequirements: "Clean .sql scripts and downloadable Tableau workbook."
  }
];

const DEFAULT_PROFILE = {
  name: "Soham",
  university: "University Institute of Technology",
  degree: "B.Tech Computer Science (3rd Year)",
  skills: ["React", "JavaScript", "TypeScript", "UI/UX", "Python", "Figma", "SQL"],
  rating: 4.9,
  completedDeliverables: 5,
  lifetimeEarnings: 42000,
  escrowInTransit: 12000,
  profileCompletion: 92
};

const calculateSmartMatch = (projectSkills: any, studentSkills: any) => {
  if (!projectSkills || !projectSkills.length) return 80;
  const userStack = (studentSkills || []).map((s: string) => s.toLowerCase().trim());
  const matched = projectSkills.filter((ps: string) => 
    userStack.some((us: string) => us.includes(ps.toLowerCase().trim()) || ps.toLowerCase().trim().includes(us))
  );
  const ratio = matched.length / projectSkills.length;
  return Math.min(98, Math.max(68, Math.round(65 + (ratio * 33))));
};

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const styles: any = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    purple: "bg-purple-50 text-purple-700 border-purple-200/80",
    rose: "bg-rose-50 text-rose-700 border-rose-200/80",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${styles[variant] || styles.default} ${className}`}>
      {children}
    </span>
  );
};

const CustomModal = ({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl w-full ${maxWidth} shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden`}>
        <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-xl text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentModule, setCurrentModule] = useState('storefront'); 
  const [activeRole, setActiveRole] = useState('student');
  const [opportunities, setOpportunities] = useState(INITIAL_CATALOG);
  const [studentProfile, setStudentProfile] = useState(DEFAULT_PROFILE);

  const [activeContracts, setActiveContracts] = useState([
    {
      id: "CTR-8812",
      oppId: "opp-101",
      title: "React Native Performance Optimization",
      company: "Nova Labs",
      studentName: "Soham",
      stipendAmount: 12000,
      escrowLocked: true,
      milestoneStatus: "Work In Progress",
      submissionLink: "https://github.com/ind-soham/nova-rn-optimization",
      submissionNotes: "Removed redundant listeners, reduced frame latency by 34ms.",
      startedDate: "Sep 2, 2026",
      dueDate: "Sep 23, 2026"
    }
  ]);

  const [supportTickets, setSupportTickets] = useState([
    {
      id: "TCK-401",
      contractId: "CTR-8812",
      sender: "Soham (Student)",
      category: "Milestone Deliverable Clarification",
      status: "Resolved",
      message: "Required Android benchmark physical device specs verified.",
      reply: "Nova Labs engineering verified targeting Pixel 6 & Samsung A53."
    }
  ]);

  const [talentAlerts, setTalentAlerts] = useState([
    { id: 1, title: "🚀 3 New React Native Micro-Internships opened today", timestamp: "10 mins ago", unread: true },
    { id: 2, title: "⚡ Nova Labs funded escrow milestone for CTR-8812", timestamp: "2 hours ago", unread: false },
    { id: 3, title: "🎯 Smart Match Alert: 94% compatibility with Finova Checkout sprint", timestamp: "1 day ago", unread: false }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [workModeFilter, setWorkModeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("match");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitWorkModalOpen, setIsSubmitWorkModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isPostOpportunityModalOpen, setIsPostOpportunityModalOpen] = useState(false);
  const [savedProjectIds, setSavedProjectIds] = useState(["opp-101", "opp-102"]);

  const [toasts, setToasts] = useState<any[]>([]);
  const triggerToast = (message: string, variant = "check") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    // Exact Hash Routing Logic
    const handleHash = () => {
      if (window.location.hash === '#demo') setCurrentModule('demo-pitch');
      else setCurrentModule('storefront');
    };
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash === '#demo') setCurrentModule('demo-pitch');

    if (!firestoreDb) return;
    try {
      const oppsRef = collection(firestoreDb, "opportunities");
      const unsubscribe = onSnapshot(oppsRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOpportunities(cloudData);
        }
      }, (err) => {
        console.warn("Firestore snapshot listener handled gracefully:", err.message);
      });
      return () => {
        unsubscribe();
        window.removeEventListener('hashchange', handleHash);
      };
    } catch (e) {
      console.warn("Local storage fallback operative:", e);
    }
  }, []);

  const catalogList = useMemo(() => {
    return opportunities
      .filter(item => {
        const matchesQuery = 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.skills || []).some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCat = categoryFilter === "All" || item.category === categoryFilter;
        const matchesMode = workModeFilter === "All" || item.type === workModeFilter;
        return matchesQuery && matchesCat && matchesMode;
      })
      .map(item => ({
        ...item,
        smartScore: calculateSmartMatch(item.skills, studentProfile.skills)
      }))
      .sort((a, b) => {
        if (sortBy === "match") return b.smartScore - a.smartScore;
        if (sortBy === "budget") return b.budget - a.budget;
        if (sortBy === "slots") return (b.slotsTotal - b.slotsFilled) - (a.slotsTotal - a.slotsFilled);
        return 0;
      });
  }, [opportunities, searchQuery, categoryFilter, workModeFilter, sortBy, studentProfile.skills]);

  const handleConfirmApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (selectedProject.slotsFilled >= selectedProject.slotsTotal) {
      triggerToast("⚠️ All slots for this project have already been locked!", "alert");
      setIsApplyModalOpen(false);
      return;
    }

    setOpportunities(prev => prev.map(o => {
      if (o.id === selectedProject.id) {
        return { ...o, applicantsCount: (o.applicantsCount || 0) + 1 };
      }
      return o;
    }));

    triggerToast(`✓ Application submitted for "${selectedProject.title}"! Added to Review Queue.`);
    setIsApplyModalOpen(false);
  };

  const handleInstantHireContract = (project: any) => {
    if (project.slotsFilled >= project.slotsTotal) {
      triggerToast("⚠️ Project capacity reached! Inventory full.", "alert");
      return;
    }

    const platformFee = Math.round(project.budget * (project.platformFeeRate || 0.12));
    const totalDeposit = project.budget + platformFee;

    const newContract = {
      id: `CTR-${Math.floor(1000 + Math.random() * 9000)}`,
      oppId: project.id,
      title: project.title,
      company: project.company,
      studentName: studentProfile.name,
      stipendAmount: project.budget,
      escrowLocked: true,
      milestoneStatus: "Work In Progress",
      submissionLink: "",
      submissionNotes: "Contract executed via Point-of-Sale Instant Escrow lock.",
      startedDate: "Today",
      dueDate: project.duration
    };

    setActiveContracts(prev => [newContract, ...prev]);

    setOpportunities(prev => prev.map(o => {
      if (o.id === project.id) {
        const nextFilled = o.slotsFilled + 1;
        return { 
          ...o, 
          slotsFilled: nextFilled,
          status: nextFilled >= o.slotsTotal ? "Filled" : "Active" 
        };
      }
      return o;
    }));

    triggerToast(`💳 Escrow secured! ₹${totalDeposit.toLocaleString()} locked. Contract ${newContract.id} active!`);
    setIsCheckoutModalOpen(false);
  };

  const handleSubmitDeliverable = (e: React.FormEvent, contractId: string) => {
    e.preventDefault();
    const form = e.target as any;
    const link = form.workUrl.value;
    const notes = form.notes.value;

    setActiveContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          milestoneStatus: "Submitted for Review",
          submissionLink: link,
          submissionNotes: notes
        };
      }
      return c;
    }));

    triggerToast("📦 Deliverable uploaded to company review portal!");
    setIsSubmitWorkModalOpen(false);
  };

  const handleApproveAndReleasePayment = (contractId: string) => {
    const contract = activeContracts.find(c => c.id === contractId);
    if (!contract) return;

    setActiveContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return { ...c, milestoneStatus: "Payment Released" };
      }
      return c;
    }));

    setStudentProfile(prev => ({
      ...prev,
      lifetimeEarnings: prev.lifetimeEarnings + contract.stipendAmount,
      escrowInTransit: Math.max(0, prev.escrowInTransit - contract.stipendAmount),
      completedDeliverables: prev.completedDeliverables + 1
    }));

    triggerToast(`💰 Payment Released! ₹${contract.stipendAmount.toLocaleString()} credited to student balance.`);
  };

  const handleCreateSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const subject = form.subject.value;
    const category = form.ticketCat.value;
    const desc = form.desc.value;

    const newTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      contractId: "CTR-8812",
      sender: `${studentProfile.name} (${activeRole})`,
      category: `${category}: ${subject}`,
      status: "In Review",
      message: desc,
      reply: "Automated triage: Assigned to Zyqor Enterprise Arbitration Team (ETA 4 hrs)."
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    setIsNewTicketModalOpen(false);
    triggerToast("🎫 Ticket submitted! Resolution specialist notified.");
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          <div 
            onClick={() => { window.location.hash = ''; setCurrentModule('storefront'); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              Z
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">
                Zyqor<span className="text-blue-600 ml-1 font-semibold text-xs px-1.5 py-0.5 bg-blue-50 rounded-md">Intern</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide block">Small Projects. Big Opportunities.</span>
            </div>
          </div>

          {currentModule === 'demo-pitch' ? (
            <div className="hidden lg:flex items-center">
               <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-2">
                 <Sparkles size={14} /> Live Presentation Mode
               </span>
            </div>
          ) : (
            <>
              <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                {[
                  { id: 'storefront', label: '1. Storefront', icon: ShoppingCart },
                  { id: 'pos', label: '2. POS & Checkout', icon: Zap },
                  { id: 'escrow', label: '3. Escrow & Pay', icon: CreditCard },
                  { id: 'inventory', label: '4. Slot Quotas', icon: Layers },
                  { id: 'fulfillment', label: '5. Fulfillment', icon: Truck },
                  { id: 'analytics', label: '6. Analytics', icon: BarChart3 },
                  { id: 'support', label: '7. Support', icon: LifeBuoy },
                  { id: 'marketing', label: '8. Broadcast', icon: Megaphone }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentModule(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                      currentModule === tab.id 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-xs' 
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon size={14} className={currentModule === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button 
                    onClick={() => { setActiveRole('student'); triggerToast("Switched perspective to Student view"); }}
                    className={`px-2.5 py-1 rounded-lg transition ${activeRole === 'student' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    Student
                  </button>
                  <button 
                    onClick={() => { setActiveRole('company'); triggerToast("Switched perspective to Company Founder view"); }}
                    className={`px-2.5 py-1 rounded-lg transition ${activeRole === 'company' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    Company
                  </button>
                  <button 
                    onClick={() => { setActiveRole('admin'); triggerToast("Switched perspective to Platform Administrator"); }}
                    className={`px-2.5 py-1 rounded-lg transition ${activeRole === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    Admin
                  </button>
                </div>

                <button
                  onClick={() => setIsPostOpportunityModalOpen(true)}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition shadow-xs"
                >
                  <Plus size={14} /> Post Opening
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </header>
  );

  const renderDemoPitchModule = () => (
    <div className="animate-in fade-in py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">The B2B2C Talent Exchange</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">This presentation dashboard displays the complete end-to-end flow of the Zyqor platform, bridging Students, Companies, and Administrators.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pillar 1: Student Side */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><User size={24} /></div>
            <div><h3 className="font-bold text-xl leading-tight text-slate-900">Student Experience</h3><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">The Talent</p></div>
          </div>
          
          <div className="mb-8">
            <span className="text-xs font-bold text-slate-900 block mb-3">Live Opportunity Match</span>
            <div className="bg-white border border-slate-200 p-5 rounded-2xl relative shadow-sm">
              <span className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">94% Match</span>
              <h4 className="font-bold text-sm mb-1 text-slate-900">Frontend React Integration</h4>
              <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1">Nova Labs <CheckCircle2 size={12} className="text-blue-500" /> Verified</p>
              <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-900 flex items-center text-sm"><IndianRupee size={14}/>12,000</span><span className="text-blue-600 flex items-center gap-1 cursor-pointer">Apply Instantly <ArrowRight size={14} /></span></div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-900 block mb-3">Application Tracker</span>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold border border-slate-100 p-4 rounded-xl shadow-sm"><span className="text-slate-700">Figma Wireframing</span><span className="text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1 rounded-md">Under Review</span></div>
              <div className="flex justify-between items-center text-xs font-bold border border-slate-100 p-4 rounded-xl shadow-sm"><span className="text-slate-700">Python Scripting</span><span className="text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-md flex items-center gap-1"><Check size={12}/> Paid</span></div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Company Side */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center"><Building size={24} /></div>
            <div><h3 className="font-bold text-xl leading-tight text-slate-900">Company Console</h3><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">The Business</p></div>
          </div>

          <div className="mb-8">
             <span className="text-xs font-bold text-slate-900 block mb-3">Recruitment Pipeline</span>
             <div className="grid grid-cols-2 gap-4 text-center">
               <div className="bg-slate-50 py-6 rounded-2xl border border-slate-100"><span className="block text-4xl font-black text-blue-600 mb-1">4</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span></div>
               <div className="bg-slate-50 py-6 rounded-2xl border border-slate-100"><span className="block text-4xl font-black text-slate-900 mb-1">38</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicants</span></div>
             </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-900 block mb-3">Talent Cart & Escrow Gateway</span>
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-4 mb-4"><span>Fund 3 Students</span><span className="font-bold text-base flex items-center"><IndianRupee size={16}/>28,500</span></div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"><CreditCard size={16}/> Checkout via Escrow</button>
            </div>
          </div>
        </div>

        {/* Pillar 3: Admin Side */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center"><Shield size={24} /></div>
            <div><h3 className="font-bold text-xl leading-tight text-slate-900">Admin Moderation</h3><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Platform Control</p></div>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold text-slate-900 block mb-3">Security & Quality Control</span>
            <div className="bg-[#FFFAF0] border border-amber-200 p-5 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1.5 mb-3"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Pending Approval (1)</span>
              <h4 className="font-bold text-sm mb-4 text-slate-900">Brand Identity Design</h4>
              <div className="flex gap-3">
                <button className="flex-1 bg-[#059669] text-white text-xs font-bold py-2.5 rounded-lg flex justify-center items-center gap-1 shadow-sm"><Check size={14}/> Approve</button>
                <button className="flex-1 bg-rose-50 text-rose-500 text-xs font-bold py-2.5 rounded-lg flex justify-center items-center gap-1"><X size={14}/> Reject</button>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-900 block mb-3">Marketplace Telemetry</span>
            <div className="flex items-center justify-between text-sm font-bold bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-slate-600 flex items-center gap-2"><BarChart3 size={16}/> Platform GMV</span>
              <span className="text-[#059669] flex items-center"><IndianRupee size={14}/>1,42,000</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center pb-8">
         <button onClick={() => { window.location.hash = ''; setCurrentModule('storefront'); }} className="px-6 py-3 bg-slate-50 text-slate-700 hover:bg-slate-100 text-sm font-bold rounded-full transition shadow-sm border border-slate-200">
           Exit Presentation Mode
         </button>
      </div>
    </div>
  );

  const renderStorefrontModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="max-w-2xl relative z-10 space-y-3">
          <Badge variant="blue" className="bg-white/10 text-white border-white/20">
            <ShoppingCart size={13} /> E-Commerce Digital Storefront
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Browse Paid Micro-Internships.<br />Instant Verified Outcomes.
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Every project cataloged below holds guaranteed milestone escrow funds. Filter by specialized tech stacks, compare automated smart compatibility scores, and apply with portfolio proof.
          </p>
        </div>
        <div className="absolute right-6 -bottom-8 opacity-10 hidden md:block pointer-events-none">
          <GraduationCap size={260} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input 
            type="text" 
            placeholder="Search catalog by title, skill requirement, or startup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", "Technology", "Design", "Marketing", "Data"].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="match">Match % (AI Engine)</option>
            <option value="budget">Stipend: High to Low</option>
            <option value="slots">Open Slots Remaining</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogList.map(item => {
          const isSaved = savedProjectIds.includes(item.id);
          const slotsLeft = item.slotsTotal - item.slotsFilled;
          const isFull = slotsLeft <= 0;

          return (
            <div 
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm group-hover:bg-blue-600 group-hover:text-white transition">
                      {item.companyLogo || item.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {item.company}
                        {item.verified && <CheckCircle2 size={13} className="text-blue-600" />}
                      </h4>
                      <span className="text-[11px] text-slate-400">{item.type} • {item.category}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (isSaved) {
                        setSavedProjectIds(savedProjectIds.filter(id => id !== item.id));
                        triggerToast("Removed from wishlist");
                      } else {
                        setSavedProjectIds([...savedProjectIds, item.id]);
                        triggerToast("Saved to student wishlist!");
                      }
                    }}
                    className={`p-2 rounded-full transition ${isSaved ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Escrow Budget</span>
                    <span className="font-bold text-slate-900 flex items-center gap-0.5">
                      <IndianRupee size={12} /> {item.budget.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Timeline</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" /> {item.duration}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {(item.skills || []).map((skill: string) => (
                    <span key={skill} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Badge variant={item.smartScore >= 90 ? "blue" : "default"}>
                  <Zap size={11} className="text-blue-600" /> {item.smartScore}% Match
                </Badge>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProject(item);
                      setIsApplyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Details
                  </button>
                  <button
                    disabled={isFull}
                    onClick={() => {
                      setSelectedProject(item);
                      setIsCheckoutModalOpen(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isFull 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isFull ? 'Capacity Reached' : 'Instant Contract'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEscrowModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="green" className="mb-2">
              <CreditCard size={13} /> Payment Gateway & Milestone Escrow
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              B2B2C Secure Payment Pipeline & Commission Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Funds are deposited by founders into escrow at contract signing and only released when code/deliverables meet acceptance criteria.
            </p>
          </div>

          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <Shield size={24} className="text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Total Escrow Vault</span>
              <span className="text-xl font-black">₹{activeContracts.reduce((acc, c) => acc + (c.escrowLocked ? c.stipendAmount : 0), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 mb-8 text-xs font-semibold">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">1. Origin</span>
            <span className="text-slate-900 font-bold">Company Deposits Stipend</span>
          </div>
          <div className="bg-blue-50 text-blue-800 p-3.5 rounded-xl border border-blue-200 text-center">
            <span className="text-blue-500 block text-[10px] uppercase">2. Security</span>
            <span className="font-bold">Zyqor 100% Escrow Lock</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-400 block text-[10px] uppercase">3. Verification</span>
            <span className="text-slate-900 font-bold">Student Submits Output</span>
          </div>
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-center">
            <span className="text-emerald-500 block text-[10px] uppercase">4. Settlement</span>
            <span className="font-bold">88% to Student / 12% Zyqor</span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm mb-3">Live Milestone Escrow Deposits</h3>
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">Contract ID</th>
                <th className="p-3.5">Project Scope</th>
                <th className="p-3.5">Assigned Student</th>
                <th className="p-3.5">Locked Stipend</th>
                <th className="p-3.5">Zyqor Fee (12%)</th>
                <th className="p-3.5">State</th>
                <th className="p-3.5 text-right">Escrow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeContracts.map(c => {
                const fee = Math.round(c.stipendAmount * 0.12);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-blue-600 font-bold">{c.id}</td>
                    <td className="p-3.5 font-bold text-slate-800">{c.title}</td>
                    <td className="p-3.5">{c.studentName}</td>
                    <td className="p-3.5 font-bold text-slate-900">₹{c.stipendAmount.toLocaleString()}</td>
                    <td className="p-3.5 text-slate-500">₹{fee.toLocaleString()}</td>
                    <td className="p-3.5">
                      <Badge variant={c.milestoneStatus === 'Payment Released' ? 'green' : 'amber'}>
                        {c.milestoneStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {c.milestoneStatus !== 'Payment Released' ? (
                        <button
                          onClick={() => handleApproveAndReleasePayment(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs text-xs"
                        >
                          Sign & Release
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 justify-end">
                          <CheckCircle2 size={13} /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInventoryModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="purple" className="mb-2">
              <Layers size={13} /> Real-Time Inventory & Slot Allocation
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Talent Capacity & Anti-Overselling Guardrails
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Prevent project bloat and guarantee focused founder attention by programmatically locking openings once slots are filled.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Total Catalog Capacity</span>
            <span className="text-3xl font-black text-slate-900">
              {opportunities.reduce((sum, o) => sum + o.slotsTotal, 0)} Seats
            </span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Seats Contracted</span>
            <span className="text-3xl font-black text-blue-600">
              {opportunities.reduce((sum, o) => sum + o.slotsFilled, 0)} Active
            </span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-400 block uppercase mb-1">Inventory Remaining</span>
            <span className="text-3xl font-black text-emerald-600">
              {opportunities.reduce((sum, o) => sum + Math.max(0, o.slotsTotal - o.slotsFilled), 0)} Available
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {opportunities.map(item => {
            const pct = Math.round((item.slotsFilled / item.slotsTotal) * 100);
            return (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <span className="text-xs text-slate-400">({item.company})</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-md">
                    <div 
                      className={`h-full rounded-full ${pct >= 100 ? 'bg-rose-500' : 'bg-blue-600'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-slate-600">{item.slotsFilled} / {item.slotsTotal} Seats Claimed</span>
                  <Badge variant={pct >= 100 ? "rose" : "green"}>
                    {pct >= 100 ? "Out of Stock (Closed)" : `${item.slotsTotal - item.slotsFilled} Open Seats`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFulfillmentModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="blue" className="mb-2">
              <Truck size={13} /> Digital Delivery & Milestone Fulfillment
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Work Asset Upload & Code Review Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Equivalent to physical e-commerce logistics: students deliver digital assets, code repositories, or Figma files directly for milestone verification.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {activeContracts.map(c => (
            <div key={c.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{c.id}</span>
                    <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                  </div>
                  <span className="text-xs text-slate-500">Contract with {c.company} • Due by {c.dueDate}</span>
                </div>
                <Badge variant={c.milestoneStatus === 'Payment Released' ? 'green' : 'amber'}>
                  {c.milestoneStatus}
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block mb-1">Deliverable Asset URL</span>
                  {c.submissionLink ? (
                    <a 
                      href={c.submissionLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 font-bold hover:underline flex items-center gap-1 break-all"
                    >
                      <ExternalLink size={12} /> {c.submissionLink}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No deliverable URL submitted yet.</span>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block mb-1">Submission Notes</span>
                  <p className="text-slate-600">{c.submissionNotes || "Awaiting sprint completion."}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs font-semibold text-slate-500">
                  Deliverable Protected by Zyqor Escrow Release Protocol
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSubmitWorkModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <UploadCloud size={14} /> Submit Deliverable Link
                  </button>
                  {activeRole === 'company' && c.milestoneStatus === 'Submitted for Review' && (
                    <button 
                      onClick={() => handleApproveAndReleasePayment(c.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle size={14} /> Accept & Release Escrow
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSupportModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="amber" className="mb-2">
              <LifeBuoy size={13} /> Support & Dispute Resolution Desk
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Self-Service Help & Milestone Arbitration
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Resolving scope-creep, deliverable disagreements, and student payment timeline inquiries.
            </p>
          </div>

          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus size={14} /> Open Support Ticket
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-slate-900 text-sm">Recent Inquiry Tickets</h3>
          {supportTickets.map(t => (
            <div key={t.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-blue-600">{t.id} • {t.sender}</span>
                <Badge variant={t.status === 'Resolved' ? 'green' : 'amber'}>{t.status}</Badge>
              </div>
              <h4 className="font-bold text-sm text-slate-900">{t.category}</h4>
              <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">{t.message}</p>
              {t.reply && (
                <div className="text-xs text-blue-800 bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                  <LifeBuoy size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Zyqor Desk:</strong> {t.reply}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-bold text-slate-900 text-sm mb-3">Self-Service Resolution FAQ</h3>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1">What happens if a startup demands additional scope?</h5>
              <p className="text-slate-500 leading-relaxed">Milestones are frozen at contract Point-of-Sale. Any new features require an additional micro-internship sprint or budget top-up.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 mb-1">How fast is escrow released once PRs are submitted?</h5>
              <p className="text-slate-500 leading-relaxed">Companies have a 72-hour review window. If no review response occurs within 72 hours, funds auto-release to the student.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="blue" className="mb-2">
              <BarChart3 size={13} /> Commercial Intelligence & Data Telemetry
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Platform Performance & Talent Conversion Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Telemetry on student earnings, time-to-hire, match precision, and marketplace liquidity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1">Avg Time-to-Contract</span>
            <span className="text-2xl font-black text-slate-900">38 Hours</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">↑ 2.4x faster than corporate</span>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1">Escrow Success Rate</span>
            <span className="text-2xl font-black text-slate-900">98.4%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Under 1.6% dispute arbitration</span>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1">Student Net Earnings</span>
            <span className="text-2xl font-black text-emerald-600">₹{studentProfile.lifetimeEarnings.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Across 5 completed sprints</span>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase mb-1">Platform GMV (Q3 2026)</span>
            <span className="text-2xl font-black text-blue-600">₹4.8 Lakhs</span>
            <span className="text-[10px] text-blue-700 font-bold block mt-1">Commission: ~₹57,600</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 mb-4">Highest Demand Skills in Storefront</h4>
            <div className="space-y-3 text-xs">
              {[
                { name: "React / React Native", share: 88 },
                { name: "Python / AI Webhooks", share: 76 },
                { name: "Figma UI/UX Systems", share: 71 },
                { name: "PostgreSQL Analytics", share: 58 }
              ].map(item => (
                <div key={item.name}>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{item.name}</span>
                    <span className="text-blue-600 font-bold">{item.share}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-2">Pre-Placement Conversion (PPO)</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                34% of students completing at least two micro-internships receive full-time pre-placement job offers or retained monthly consulting contracts from the hiring startups.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Soham's Hiring Probability</span>
                <span className="text-slate-400">Based on 4.9 Star Verified Rating</span>
              </div>
              <Badge variant="green" className="text-sm font-bold">96% Very High</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPOSModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="blue" className="mb-2">
              <Zap size={13} /> Point-of-Sale (POS) Fast Checkout
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              One-Click Talent Contracting & Escrow Checkout
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Skip 3-week resume screenings. Instant checkouts lock milestones and initiate legal student NDA contracts directly.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {catalogList.slice(0, 2).map(project => (
            <div key={project.id} className="p-6 rounded-3xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono font-bold text-blue-600">{project.id}</span>
                  <Badge variant="blue">{project.smartScore}% Match Index</Badge>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{project.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{project.company} • {project.duration}</p>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Milestone Stipend:</span>
                    <span className="font-bold text-slate-900">₹{project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Zyqor Processing (12%):</span>
                    <span className="font-bold text-slate-900">₹{Math.round(project.budget * 0.12).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                    <span>Total Deposit:</span>
                    <span className="text-blue-600 font-black">₹{Math.round(project.budget * 1.12).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleInstantHireContract(project)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Zap size={14} /> Execute POS Escrow Checkout
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketingModule = () => (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Badge variant="purple" className="mb-2">
              <Megaphone size={13} /> Marketing Integration & Talent Alerts
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Automated Push Notifications & Skill Alerts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Broadcasts matched opportunities directly to students with &gt;90% compatibility within 15 minutes of project publishing.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h3 className="font-bold text-slate-900 text-sm">Real-Time Event Stream</h3>
          {talentAlerts.map(alert => (
            <div key={alert.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800">{alert.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{alert.timestamp}</span>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl text-white">
          <h4 className="font-bold text-sm mb-1">Company Talent Broadcast Blast</h4>
          <p className="text-xs text-slate-400 mb-4">Trigger an instant WhatsApp and Email notification blast to all 1,200+ verified engineering college developers.</p>
          <button
            onClick={() => triggerToast("📢 Broadcast dispatched to 842 matching college developers!")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
          >
            Dispatch Outreach Blast
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {currentModule === 'demo-pitch' && renderDemoPitchModule()}
        {currentModule === 'storefront' && renderStorefrontModule()}
        {currentModule === 'escrow' && renderEscrowModule()}
        {currentModule === 'inventory' && renderInventoryModule()}
        {currentModule === 'fulfillment' && renderFulfillmentModule()}
        {currentModule === 'support' && renderSupportModule()}
        {currentModule === 'analytics' && renderAnalyticsModule()}
        {currentModule === 'pos' && renderPOSModule()}
        {currentModule === 'marketing' && renderMarketingModule()}
      </main>

      {currentModule !== 'demo-pitch' && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around h-16 px-2">
          {[
            { id: 'storefront', label: 'Store', icon: ShoppingCart },
            { id: 'pos', label: 'POS', icon: Zap },
            { id: 'escrow', label: 'Escrow', icon: CreditCard },
            { id: 'fulfillment', label: 'Delivery', icon: Truck },
            { id: 'analytics', label: 'Data', icon: BarChart3 }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setCurrentModule(item.id)}
              className={`flex flex-col items-center gap-1 ${currentModule === item.id ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
            >
              <item.icon size={18} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Application Confirmation Modal */}
      <CustomModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Storefront Item"
        subtitle={selectedProject ? `${selectedProject.title} at ${selectedProject.company}` : ""}
      >
        <form onSubmit={handleConfirmApplication} className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">Candidate Identity Verification:</span>
            <p className="text-slate-600">Applicant: <strong>{studentProfile.name}</strong> ({studentProfile.degree})</p>
            <p className="text-slate-600">Verified Skills: {studentProfile.skills.slice(0, 4).join(', ')}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">GitHub / Figma Portfolio Deliverable URL</label>
            <input 
              type="url" 
              required
              defaultValue="https://github.com/ind-soham" 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Brief Technical Approach (2-3 Sentences)</label>
            <textarea 
              rows={3} 
              required
              placeholder="Outline how you plan to tackle this sprint within the timeline..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20"
          >
            Submit Application
          </button>
        </form>
      </CustomModal>

      {/* Instant Checkout / POS Modal */}
      <CustomModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Point-of-Sale Escrow Deposit"
        subtitle={selectedProject ? `Contract lock for ${selectedProject.title}` : ""}
      >
        {selectedProject && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Milestone Base Amount:</span>
                <span>₹{selectedProject.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Escrow Fee (12%):</span>
                <span>₹{Math.round(selectedProject.budget * 0.12).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-slate-900">
                <span>Immediate Deposit Due:</span>
                <span className="text-blue-600">₹{Math.round(selectedProject.budget * 1.12).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 flex items-center gap-2">
              <Shield size={16} className="text-blue-600 shrink-0" />
              <span>Funds are protected in bank escrow until milestone acceptance.</span>
            </div>

            <button
              onClick={() => handleInstantHireContract(selectedProject)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-md flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Authorize Escrow & Execute Contract
            </button>
          </div>
        )}
      </CustomModal>

      {/* Work Submission / Fulfillment Modal */}
      <CustomModal
        isOpen={isSubmitWorkModalOpen}
        onClose={() => setIsSubmitWorkModalOpen(false)}
        title="Digital Deliverable Fulfillment"
        subtitle="Submit your completed sprint deliverables for company verification"
      >
        <form onSubmit={(e) => handleSubmitDeliverable(e, "CTR-8812")} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Production Asset URL (GitHub PR / Live Demo / Figma)</label>
            <input 
              name="workUrl"
              type="url" 
              required
              placeholder="https://github.com/organization/repo/pull/4"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deliverable Release Notes</label>
            <textarea 
              name="notes"
              rows={3} 
              required
              placeholder="Summary of completed milestone goals and profiling metrics..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md shadow-blue-500/20"
          >
            Upload Deliverable to Review Portal
          </button>
        </form>
      </CustomModal>

      {/* Support Ticket Modal */}
      <CustomModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Open Support / Arbitration Ticket"
        subtitle="Submit an inquiry to the Zyqor Resolution Desk"
      >
        <form onSubmit={handleCreateSupportTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
            <select name="ticketCat" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white">
              <option value="Scope Clarification">Scope Clarification</option>
              <option value="Milestone Review Delay">Milestone Review Delay (&gt;72 hrs)</option>
              <option value="Escrow Deposit Inquiry">Escrow Deposit Inquiry</option>
              <option value="Dispute Arbitration">Dispute Arbitration</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject Header</label>
            <input 
              name="subject"
              required 
              placeholder="e.g. Clarification on Android hardware requirements" 
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Detailed Explanation</label>
            <textarea 
              name="desc"
              rows={3} 
              required
              placeholder="Explain the circumstances for review..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-md"
          >
            Submit to Support Desk
          </button>
        </form>
      </CustomModal>

      {/* Post Opportunity Modal */}
      <CustomModal
        isOpen={isPostOpportunityModalOpen}
        onClose={() => setIsPostOpportunityModalOpen(false)}
        title="Catalog a New Micro-Internship"
        subtitle="Publishes new inventory item directly to live marketplace"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as any;
          const newOpp = {
            id: `opp-${Date.now()}`,
            title: form.title.value,
            company: activeRole === 'company' ? "Nova Labs" : "Zyqor Partner",
            companyLogo: form.title.value.charAt(0),
            category: form.category.value,
            budget: Number(form.budget.value),
            escrowLocked: true,
            duration: form.duration.value,
            type: form.type.value,
            skills: form.skills.value.split(',').map((s: string) => s.trim()),
            experience: "Skill-based",
            description: form.desc.value,
            slotsTotal: Number(form.slots.value) || 1,
            slotsFilled: 0,
            applicantsCount: 0,
            status: "Active",
            verified: true,
            platformFeeRate: 0.12
          };

          setOpportunities(prev => [newOpp, ...prev]);

          if (firestoreDb) {
            try {
              await addDoc(collection(firestoreDb, "opportunities"), {
                ...newOpp,
                createdAt: serverTimestamp()
              });
            } catch (err) {
              console.log("Locally committed opportunity item.");
            }
          }

          setIsPostOpportunityModalOpen(false);
          triggerToast("✓ Opening listed on live Storefront catalog!");
        }} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Project Title</label>
            <input name="title" required placeholder="e.g. Build Mobile Payment Webhook Handler" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select name="category" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                <option value="Technology">Technology</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Data">Data</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Mode</label>
              <select name="type" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Budget (₹)</label>
              <input name="budget" type="number" required defaultValue="10000" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration</label>
              <input name="duration" required defaultValue="3 Weeks" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Slot Quota</label>
              <input name="slots" type="number" required defaultValue="2" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
            <input name="skills" required defaultValue="React, TypeScript, Node.js" className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Scope & Acceptance Criteria</label>
            <textarea name="desc" rows={2} required placeholder="State exact deliverable criteria expected..." className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none" />
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/20">
            Publish Opening to Storefront
          </button>
        </form>
      </CustomModal>

      {/* Floating System Toast Container */}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in ${toast.variant === 'alert' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-900 text-white'}`}
          >
            {toast.variant === 'alert' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
