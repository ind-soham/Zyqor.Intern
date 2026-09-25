import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, GraduationCap, X, Shield, Clock, IndianRupee, 
  Building, Zap, User, Heart, CheckCircle2, ArrowRight, 
  Plus, Check, ExternalLink, Briefcase, LayoutDashboard,
  LogOut, AlertTriangle, Sparkles, MapPin
} from 'lucide-react';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAUZTle5J7FSu_Af6xLebmtN8M9g69DIxw",
  authDomain: "zyqor-intern.firebaseapp.com",
  projectId: "zyqor-intern",
  storageBucket: "zyqor-intern.firebasestorage.app",
  messagingSenderId: "209139233286",
  appId: "1:209139233286:web:308e9ac0462d5e15c24987",
  measurementId: "G-1GTDNLXQSV"
};

let db: any = null;
let auth: any = null;
try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} catch (err) {
  console.warn("Firebase init error:", err);
}

// --- UI COMPONENTS ---
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
    <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md border ${styles[variant] || styles.default} ${className}`}>
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
            <h3 className="font-black text-xl text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs font-semibold text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState("Connecting...");
  
  const [currentView, setCurrentView] = useState('storefront');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);

  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('student');
  const [authError, setAuthError] = useState("");
  const [toasts, setToasts] = useState<any[]>([]);

  const showToast = (message: string, variant = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    // Hash Routing for Presentation Mode
    const handleHash = () => {
      if (window.location.hash === '#demo') setCurrentView('demo-pitch');
      else setCurrentView('storefront');
    };
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash === '#demo') setCurrentView('demo-pitch');

    if (!db) return;

    // Real-time Database Sync
    const oppsQuery = query(collection(db, "opportunities"), orderBy("timestamp", "desc"));
    const unsubOpps = onSnapshot(oppsQuery, (snap) => {
      setOpportunities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbStatus("Live");
    }, () => setDbStatus("Error"));

    const appsQuery = query(collection(db, "applications"), orderBy("timestamp", "desc"));
    const unsubApps = onSnapshot(appsQuery, (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) setUserProfile(userDoc.data());
          else setUserProfile({ role: 'student', name: user.email?.split('@')[0] });
        } catch {
          setUserProfile({ role: 'student', name: user.email?.split('@')[0] });
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
    });

    const savedFavs = localStorage.getItem('zyqor_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    return () => { unsubOpps(); unsubApps(); unsubAuth(); window.removeEventListener('hashchange', handleHash); };
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('zyqor_favs', JSON.stringify(newFavs));
    showToast(favorites.includes(id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const form = e.target as any;
    const email = form.email.value.trim();
    const password = form.password.value;
    const name = form.name ? form.name.value.trim() : email.split('@')[0];

    try {
      if (authMode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), { uid: res.user.uid, email, name, role: authRole, createdAt: Date.now() });
        showToast(`Account created successfully!`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Signed in successfully!");
      }
      setActiveModal(null);
    } catch (err: any) { setAuthError(err.message.replace("Firebase: ", "")); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('storefront');
    showToast("Signed out successfully");
  };

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const newOpp = {
      title: form.title.value.trim(),
      company: userProfile?.name || "Verified Partner",
      companyLogo: (userProfile?.name || "V").charAt(0).toUpperCase(),
      authorUid: currentUser?.uid || "anonymous",
      budget: Number(form.budget.value),
      duration: form.duration.value.trim(),
      type: form.type.value,
      category: form.category.value,
      skills: form.skills.value.split(',').map((s:string) => s.trim()).filter(Boolean),
      description: form.description.value.trim(),
      approvalStatus: "pending",
      timestamp: Date.now()
    };
    try {
      await addDoc(collection(db, "opportunities"), newOpp);
      setActiveModal(null);
      showToast("Listing submitted! Pending Admin verification.");
    } catch(err) { showToast("Failed to post.", "alert"); }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return setActiveModal('auth-modal');
    const form = e.target as any;
    const newApp = {
      opportunityId: selectedOpp.id,
      projectTitle: selectedOpp.title,
      company: selectedOpp.company,
      studentUid: currentUser.uid,
      studentName: userProfile?.name || currentUser.email,
      status: "Under Review",
      coverLetter: form.note.value,
      timestamp: Date.now()
    };
    try {
      await addDoc(collection(db, "applications"), newApp);
      setActiveModal(null);
      showToast("Application submitted successfully!");
    } catch(err) { showToast("Failed to apply.", "alert"); }
  };

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "opportunities", id), { approvalStatus: "approved" });
    showToast("Listing approved & published.");
  };

  const handleRemove = async (id: string) => {
    if(!window.confirm("Delete this listing permanently?")) return;
    await deleteDoc(doc(db, "opportunities", id));
  };

  const liveOpportunities = opportunities.filter(o => o.approvalStatus === "approved");
  const filtered = liveOpportunities.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const myApplications = applications.filter(a => a.studentUid === currentUser?.uid);
  const myPostings = opportunities.filter(o => o.authorUid === currentUser?.uid);
  const pendingQueue = opportunities.filter(o => o.approvalStatus === "pending");

  // --- NAUKRI STYLE CLEAN HEADER ---
  const renderHeader = () => (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div onClick={() => { window.location.hash = ''; setCurrentView('storefront'); }} className="flex items-center gap-2.5 cursor-pointer select-none group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">Z</div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">Zyqor<span className="text-blue-600 ml-1 font-semibold text-[10px] px-1.5 py-0.5 bg-blue-50 rounded-md">Intern</span></span>
          </div>
        </div>

        {/* Clean Navigation (Depends on Role) */}
        {currentView === 'demo-pitch' ? (
          <span className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-2">
            <Sparkles size={14} /> Live Presentation Mode
          </span>
        ) : (
          <div className="flex items-center gap-4 text-sm font-semibold">
            {!currentUser ? (
              <>
                <button onClick={() => setCurrentView('storefront')} className="hidden sm:block text-slate-600 hover:text-slate-900">Find Work</button>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <button onClick={() => { setAuthRole('student'); setAuthMode('login'); setActiveModal('auth-modal'); }} className="text-slate-700 hover:text-blue-600">Login</button>
                <button onClick={() => { setAuthRole('company'); setAuthMode('signup'); setActiveModal('auth-modal'); }} className="bg-blue-600 text-white rounded-full px-5 py-2 hover:bg-blue-700 shadow-sm transition">Hire Talent</button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                
                {/* Student specific links */}
                {userProfile?.role === 'student' && (
                  <button onClick={() => setCurrentView('student-dash')} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition">
                    <User size={16} /> <span className="hidden sm:inline">My Profile</span>
                  </button>
                )}

                {/* Company specific links */}
                {userProfile?.role === 'company' && (
                  <>
                    <button onClick={() => setCurrentView('company-dash')} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition">
                      <Briefcase size={16} /> <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveModal('post-modal')} className="bg-blue-600 text-white rounded-full px-4 py-2 text-xs font-bold shadow-sm hover:bg-blue-700 transition flex items-center gap-1">
                      <Plus size={14} /> Post Job
                    </button>
                  </>
                )}

                {/* Admin specific links */}
                {userProfile?.role === 'admin' && (
                  <button onClick={() => setCurrentView('admin-dash')} className="bg-red-50 text-red-600 rounded-full px-4 py-2 text-xs font-bold border border-red-100 flex items-center gap-1">
                    <Shield size={14} /> Moderation Queue
                  </button>
                )}

                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-600 transition p-2" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        
        {/* --- DEMO PITCH VIEW (Triggered via /#demo) --- */}
        {currentView === 'demo-pitch' && (
          <div className="animate-in fade-in py-4">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">The B2B2C Talent Exchange</h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">This presentation dashboard displays the complete end-to-end flow of the Zyqor platform, bridging Students, Companies, and Administrators.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pillar 1: Student Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><User size={24} /></div>
                  <div><h3 className="font-bold text-xl leading-tight text-slate-900">Student Experience</h3><p className="text-[10px] uppercase font-bold text-slate-400">The Talent</p></div>
                </div>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Live Opportunity Match</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">94% Match</span>
                    <h4 className="font-bold text-sm mb-1 text-slate-900">Frontend React Integration</h4>
                    <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">Nova Labs <CheckCircle2 size={10} className="text-blue-500" /> Verified</p>
                    <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-900 flex items-center"><IndianRupee size={12}/>12,000</span><span className="text-blue-600 flex items-center gap-1">Apply Instantly <ArrowRight size={12} /></span></div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Application Tracker</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold border border-slate-100 p-3 rounded-lg"><span className="text-slate-700">Figma Wireframing</span><span className="bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100">Under Review</span></div>
                    <div className="flex justify-between items-center text-[11px] font-bold border border-slate-100 p-3 rounded-lg"><span className="text-slate-700">Python Scripting</span><span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1"><Check size={10}/> Paid</span></div>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Company Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center"><Building size={24} /></div>
                  <div><h3 className="font-bold text-xl leading-tight text-slate-900">Company Console</h3><p className="text-[10px] uppercase font-bold text-slate-400">The Business</p></div>
                </div>

                <div className="mb-6">
                   <span className="text-xs font-bold text-slate-900 block mb-2">Recruitment Pipeline</span>
                   <div className="grid grid-cols-2 gap-3 text-center">
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="block text-3xl font-black text-blue-600 mb-1">4</span><span className="text-[10px] font-bold text-slate-400 uppercase">Active Jobs</span></div>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><span className="block text-3xl font-black text-slate-900 mb-1">38</span><span className="text-[10px] font-bold text-slate-400 uppercase">Applicants</span></div>
                   </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Talent Cart & Escrow Gateway</span>
                  <div className="bg-slate-900 text-white p-5 rounded-xl shadow-inner">
                    <div className="flex justify-between items-center text-xs border-b border-slate-700 pb-3 mb-3"><span>Fund 3 Students</span><span className="font-bold text-sm flex items-center"><IndianRupee size={12}/>28,500</span></div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2">Checkout via Escrow</button>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Admin Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><Shield size={24} /></div>
                  <div><h3 className="font-bold text-xl leading-tight text-slate-900">Admin Moderation</h3><p className="text-[10px] uppercase font-bold text-slate-400">Platform Control</p></div>
                </div>

                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Security & Quality Control</span>
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1.5 mb-2"><span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span> Pending Approval (1)</span>
                    <h4 className="font-bold text-sm mb-3 text-slate-900">Brand Identity Design</h4>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg flex justify-center items-center gap-1"><Check size={14}/> Approve</button>
                      <button className="flex-1 bg-rose-100 text-rose-600 text-xs font-bold py-2 rounded-lg flex justify-center items-center gap-1"><X size={14}/> Reject</button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Marketplace Telemetry</span>
                  <div className="flex items-center justify-between text-sm font-bold bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-slate-600 flex items-center gap-2"><LayoutDashboard size={16}/> Platform GMV</span>
                    <span className="text-emerald-600 flex items-center"><IndianRupee size={14}/>1,42,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 text-center">
               <button onClick={() => { window.location.hash = ''; setCurrentView('storefront'); }} className="px-6 py-2.5 bg-white text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-full transition shadow-sm border border-slate-200">
                 Exit Presentation Mode
               </button>
            </div>
          </div>
        )}

        {/* --- MAIN STOREFRONT (Naukri Style) --- */}
        {currentView === 'storefront' && (
          <div className="animate-in fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-8 sm:p-12 mb-8 text-white shadow-lg">
              <div className="max-w-2xl relative z-10 space-y-4">
                <Badge variant="blue" className="bg-white/10 text-white border-white/20 mb-2 inline-flex">
                  Verified Micro-Internships
                </Badge>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Build Your Portfolio.<br />Get Paid Instantly.
                </h1>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-lg">
                  Work on 1-4 week sprints for verified startups. Escrow-backed stipends guarantee you get paid when the work is done.
                </p>
              </div>
              <div className="absolute right-6 -bottom-12 opacity-10 hidden md:block pointer-events-none">
                <GraduationCap size={280} />
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by job title, skill (e.g. React), or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {["All", "Technology", "Design", "Marketing", "Data"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      selectedCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Board Grid */}
            {filtered.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center mt-8">
                 <h3 className="font-bold text-lg text-slate-800 mb-2">No matched internships found</h3>
                 <p className="text-slate-500 text-sm max-w-md mx-auto">Try adjusting your filters or check back soon as companies post new opportunities.</p>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => { setSelectedOpp(item); setActiveModal('detail-modal'); }}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between group cursor-pointer relative"
                  >
                    <button 
                      onClick={(e) => toggleFavorite(item.id, e)} 
                      className="absolute top-6 right-6 text-xl hover:scale-110 transition"
                      title="Save Job"
                    >
                      {favorites.includes(item.id) ? '❤️' : '🤍'}
                    </button>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-black flex items-center justify-center text-lg group-hover:bg-blue-600 group-hover:text-white transition">
                          {item.companyLogo || item.company.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            {item.company}
                            <CheckCircle2 size={13} className="text-blue-500" />
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><MapPin size={10}/> {item.type}</span>
                        </div>
                      </div>

                      <h3 className="font-black text-lg text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition pr-8">
                        {item.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        <Badge variant="blue">{item.category}</Badge>
                        {(item.skills || []).slice(0, 2).map((skill: string) => (
                          <span key={skill} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                            {skill}
                          </span>
                        ))}
                        {item.skills?.length > 2 && <span className="text-[10px] font-bold text-slate-400 px-1 py-1">+{item.skills.length - 2}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Stipend</span>
                          <span className="font-black text-slate-900 text-sm flex items-center gap-0.5">
                            ₹{Number(item.budget).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Duration</span>
                          <span className="font-black text-slate-800 text-sm flex items-center gap-1">
                            {item.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Posted recently</span>
                      <span className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STUDENT DASHBOARD --- */}
        {currentView === 'student-dash' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 shadow-inner">
                    {userProfile?.name?.charAt(0) || 'S'}
                  </div>
                  <h2 className="font-black text-xl text-slate-900">{userProfile?.name}</h2>
                  <p className="text-xs font-semibold text-slate-500 mb-4">{currentUser?.email}</p>
                  <div className="w-full bg-slate-100 rounded-xl p-3 mb-4">
                    <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-700">Profile Strength</span><span className="text-blue-600">85%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full"><div className="bg-blue-600 h-1.5 rounded-full w-[85%]"></div></div>
                  </div>
                  <button className="text-xs bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl w-full transition hover:bg-slate-800">Edit Profile & Resume</button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2"><Briefcase size={18} className="text-blue-600"/> Applied Internships</h3>
                {myApplications.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-3">You haven't applied to any roles yet.</p>
                    <button onClick={() => setCurrentView('storefront')} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Browse Storefront</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myApplications.map(app => (
                      <div key={app.id} className="p-4 border border-slate-100 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <span className="font-bold text-slate-900 block">{app.projectTitle}</span>
                          <span className="text-slate-500 text-xs font-semibold">{app.company}</span>
                        </div>
                        <Badge variant="blue">{app.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2"><Heart size={18} className="text-rose-500"/> Saved For Later</h3>
                {favorites.length === 0 ? <p className="text-sm font-semibold text-slate-500">No saved projects.</p> : (
                  <div className="space-y-3">
                    {opportunities.filter(o => favorites.includes(o.id)).map(opp => (
                      <div key={opp.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-blue-200 transition">
                        <div>
                          <span className="font-bold text-sm block text-slate-900">{opp.title}</span>
                          <span className="text-xs text-slate-500 font-semibold">₹{opp.budget}</span>
                        </div>
                        <button onClick={() => { setSelectedOpp(opp); setActiveModal('detail-modal'); }} className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">View</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- COMPANY DASHBOARD --- */}
        {currentView === 'company-dash' && (
          <div className="animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Company Dashboard</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">Manage your active listings and applicants.</p>
              </div>
              <button onClick={() => setActiveModal('post-modal')} className="bg-blue-600 text-white rounded-xl text-sm font-bold px-5 py-2.5 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition flex items-center gap-2">
                <Plus size={16} /> Post New Internship
              </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-black text-lg text-slate-900 mb-6 border-b border-slate-100 pb-4">Your Active Listings</h3>
              {myPostings.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"><Briefcase size={24} className="text-slate-400"/></div>
                  <p className="text-sm font-semibold text-slate-600">You haven't posted any opportunities yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPostings.map(opp => (
                    <div key={opp.id} className="p-5 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-blue-200 transition">
                      <div>
                        <span className="font-black text-base text-slate-900 block mb-1">{opp.title}</span>
                        <span className="text-slate-500 text-xs font-semibold">Budget: ₹{opp.budget} • {opp.duration}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {opp.approvalStatus === 'pending' ? (
                          <Badge variant="amber"><AlertTriangle size={12}/> Pending Review</Badge>
                        ) : (
                          <Badge variant="green"><CheckCircle2 size={12}/> Published Live</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {currentView === 'admin-dash' && (
          <div className="animate-in fade-in">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900">Platform Moderation Desk</h2>
              <p className="text-sm font-semibold text-slate-500 mt-1">Approve or reject company postings before they go live on the storefront.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Queue */}
              <div className="bg-white rounded-3xl border-2 border-amber-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>
                <h3 className="font-black text-lg mb-6 text-amber-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Pending Approval ({pendingQueue.length})
                </h3>
                {pendingQueue.length === 0 ? <p className="text-sm font-semibold text-slate-500">Queue is fully cleared!</p> : (
                  <div className="space-y-4">
                    {pendingQueue.map(opp => (
                      <div key={opp.id} className="p-5 border border-slate-100 bg-white shadow-sm rounded-2xl">
                        <span className="font-black text-base text-slate-900 block mb-1">{opp.title}</span>
                        <span className="text-slate-500 text-xs font-semibold block mb-4">By: {opp.company} • Stipend: ₹{opp.budget}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(opp.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1"><Check size={14}/> Approve</button>
                          <button onClick={() => handleRemove(opp.id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1"><X size={14}/> Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Catalog Management */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-black text-lg mb-6 text-slate-900">Live Database Directory</h3>
                {liveOpportunities.length === 0 ? <p className="text-sm font-semibold text-slate-500">No live items.</p> : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {liveOpportunities.map(opp => (
                      <div key={opp.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center group hover:border-rose-100 transition">
                        <div>
                          <span className="font-bold text-sm text-slate-900 block mb-0.5">{opp.title}</span>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">{opp.company}</span>
                        </div>
                        <button onClick={() => handleRemove(opp.id)} className="text-rose-500 font-bold text-xs bg-rose-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      
      {/* Auth Modal */}
      <CustomModal isOpen={activeModal === 'auth-modal'} onClose={() => setActiveModal(null)} title={authMode === 'login' ? 'Welcome Back' : 'Join Zyqor Intern'}>
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 text-xs font-bold">
          <button onClick={() => setAuthRole('student')} className={`flex-1 py-2 rounded-lg transition ${authRole === 'student' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>I am a Student</button>
          <button onClick={() => setAuthRole('company')} className={`flex-1 py-2 rounded-lg transition ${authRole === 'company' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>I am a Company</button>
        </div>
        {authError && <div className="bg-rose-50 text-rose-600 text-xs font-bold p-3 rounded-xl mb-4 border border-rose-100">{authError}</div>}
        <form onSubmit={handleAuth} className="space-y-4 text-xs font-semibold text-slate-700">
          {authMode === 'signup' && <div><label className="block mb-1.5 ml-1">Full Name / Company Name</label><input name="name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>}
          <div><label className="block mb-1.5 ml-1">Email Address</label><input name="email" type="email" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <div><label className="block mb-1.5 ml-1">Password</label><input name="password" type="password" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <button type="submit" className="w-full py-3.5 font-bold rounded-xl text-sm text-white bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/20 mt-2">{authMode === 'login' ? 'Sign In Securely' : 'Create Account'}</button>
        </form>
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs font-bold text-slate-500">
          {authMode === 'login' ? <span>New here? <button onClick={() => { setAuthMode('signup'); setAuthError(""); }} className="text-blue-600">Create an account</button></span> : <span>Already registered? <button onClick={() => { setAuthMode('login'); setAuthError(""); }} className="text-blue-600">Sign In</button></span>}
        </div>
      </CustomModal>

      {/* Post Modal */}
      <CustomModal isOpen={activeModal === 'post-modal'} onClose={() => setActiveModal(null)} title="Post a Micro-Internship" subtitle="List your sprint to find verified student talent.">
        <form onSubmit={handlePostOpportunity} className="space-y-4 text-xs font-semibold text-slate-700">
          <div><label className="block mb-1.5 ml-1">Project Title</label><input name="title" required placeholder="e.g. Build Mobile Payment Component" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block mb-1.5 ml-1">Stipend (₹)</label><input name="budget" type="number" required placeholder="10000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
            <div><label className="block mb-1.5 ml-1">Timeline</label><input name="duration" required placeholder="e.g. 3 Weeks" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block mb-1.5 ml-1">Category</label><select name="category" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"><option>Technology</option><option>Design</option><option>Marketing</option><option>Data</option></select></div>
            <div><label className="block mb-1.5 ml-1">Work Mode</label><select name="type" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"><option>Remote</option><option>Hybrid</option></select></div>
          </div>
          <div><label className="block mb-1.5 ml-1">Required Skills (Comma separated)</label><input name="skills" required placeholder="React, TypeScript, Figma" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" /></div>
          <div><label className="block mb-1.5 ml-1">Deliverables & Scope</label><textarea name="description" required rows={3} placeholder="Describe exactly what needs to be built..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500"></textarea></div>
          <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20">Submit for Approval</button>
        </form>
      </CustomModal>

      {/* Detail & Apply Modal */}
      <CustomModal isOpen={activeModal === 'detail-modal'} onClose={() => setActiveModal(null)} title={selectedOpp?.title}>
        {selectedOpp && (
          <div className="text-slate-900">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 font-black text-slate-700 flex items-center justify-center text-lg">{selectedOpp.companyLogo || selectedOpp.company.charAt(0)}</div>
              <div>
                <p className="text-sm font-black flex items-center gap-1">{selectedOpp.company} <CheckCircle2 size={14} className="text-blue-500" /></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{selectedOpp.type} • {selectedOpp.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-xs font-semibold">
              <div><span className="text-slate-400 block text-[10px] uppercase mb-0.5">Escrow Stipend</span><span className="font-black text-base">₹{Number(selectedOpp.budget).toLocaleString()}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase mb-0.5">Timeline</span><span className="font-black text-base">{selectedOpp.duration}</span></div>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-black text-slate-900 mb-2">Required Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedOpp.skills || []).map((s:string) => <span key={s} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">{s}</span>)}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-black text-slate-900 mb-2">Scope of Work</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{selectedOpp.description}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900">Apply for this role</h4>
              <textarea name="note" required rows={3} placeholder="Briefly explain your relevant experience..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500"></textarea>
              <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20 flex justify-center items-center gap-2">
                Submit Application <Send size={16}/>
              </button>
            </form>
          </div>
        )}
      </CustomModal>

      {/* Floating System Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in ${t.variant === 'alert' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-900 text-white'}`}>
            {t.variant === 'alert' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
