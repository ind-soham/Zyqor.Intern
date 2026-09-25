import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState("Connecting to Firebase...");
  
  const [currentView, setCurrentView] = useState('storefront');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toasts, setToasts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]); 

  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('student');
  const [authError, setAuthError] = useState("");

  const showToast = (msg: string, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, isError }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    // Check URL Hash for Demo Mode
    const handleHash = () => {
      if (window.location.hash === '#demo') setCurrentView('demo-pitch');
      else if (currentView === 'demo-pitch') setCurrentView('storefront');
    };
    window.addEventListener('hashchange', handleHash);
    if (window.location.hash === '#demo') setCurrentView('demo-pitch');

    // Firestore Listeners
    const oppsQuery = query(collection(db, "opportunities"), orderBy("timestamp", "desc"));
    const unsubOpps = onSnapshot(oppsQuery, (snap) => {
      setOpportunities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbStatus("Connected to Cloud Firestore ✓");
    }, (err: any) => setDbStatus("Firestore Error: " + err.message));

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

    return () => { 
      unsubOpps(); unsubApps(); unsubAuth(); 
      window.removeEventListener('hashchange', handleHash);
    };
  }, [currentView]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) newFavs = favorites.filter(f => f !== id);
    else newFavs = [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('zyqor_favs', JSON.stringify(newFavs));
    showToast(favorites.includes(id) ? "Removed from Favourites" : "Added to Favourites");
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
        const data = { uid: res.user.uid, email, name, role: authRole, createdAt: Date.now() };
        await setDoc(doc(db, "users", res.user.uid), data);
        setUserProfile(data);
        showToast(`✓ Account created!`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("✓ Signed in successfully!");
      }
      setActiveModal(null);
    } catch (err: any) { setAuthError(err.message.replace("Firebase: ", "")); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView('storefront');
    showToast("Signed out");
  };

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    const newOpp = {
      title: form.title.value.trim(),
      company: userProfile?.name || (currentUser ? currentUser.email?.split('@')[0] : "Verified Partner"),
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
      showToast("✓ Request sent to Admin for approval.");
    } catch(err) { showToast("Failed to post.", true); }
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
      note: form.note.value,
      timestamp: Date.now()
    };
    try {
      await addDoc(collection(db, "applications"), newApp);
      setActiveModal(null);
      showToast("✓ Application saved to database!");
    } catch(err) { showToast("Failed to apply.", true); }
  };

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, "opportunities", id), { approvalStatus: "approved" });
    showToast("✓ Approved & Live!");
  };
  const handleRemove = async (id: string) => {
    if(!window.confirm("Delete permanently?")) return;
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      
      {/* Top Status Bar (Hidden in Demo) */}
      {currentView !== 'demo-pitch' && (
        <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dbStatus.includes("✓") ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}></span>
            <span>{dbStatus}</span>
          </div>
          <span className="hidden sm:inline">Repo: Zyqor.Intern</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { window.location.hash = ''; setCurrentView('storefront'); }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">Z</div>
            <div>
              <span className="font-extrabold text-lg tracking-tight block leading-tight">Zyqor Intern</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Small Projects. Big Opportunities.</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-semibold">
            {currentView === 'demo-pitch' ? (
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">✨ Live Presentation Mode</span>
            ) : (
              <>
                <button onClick={() => setActiveModal('about-modal')} className="text-slate-500 hover:text-slate-900 hidden sm:block">About</button>
                {!currentUser ? (
                  <>
                    <button onClick={() => { setAuthRole('student'); setAuthMode('login'); setActiveModal('auth-modal'); }} className="text-slate-700">Sign In</button>
                    <button onClick={() => { setAuthRole('company'); setAuthMode('signup'); setActiveModal('auth-modal'); }} className="bg-blue-600 text-white rounded-full px-4 py-2 hover:bg-blue-700">Post Opportunity</button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentView(`${userProfile?.role}-dash`)} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-200">
                      Dashboard ({userProfile?.role})
                    </button>
                    {userProfile?.role === 'company' && (
                       <button onClick={() => setCurrentView('cart-view')} className="text-slate-600 relative">
                         Cart {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
                       </button>
                    )}
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        
        {/* --- DEMO PITCH VIEW (Triggered via /#demo) --- */}
        {currentView === 'demo-pitch' && (
          <div className="animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">The B2B2C Talent Exchange</h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">This presentation dashboard displays the complete end-to-end flow of the Zyqor platform, bridging Students, Companies, and Administrators.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Pillar 1: Student Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl">S</div>
                  <div><h3 className="font-bold text-lg leading-tight">Student Experience</h3><p className="text-[10px] uppercase font-bold text-slate-400">The Talent</p></div>
                </div>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Live Opportunity Match</span>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative">
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">94% Match</span>
                    <h4 className="font-bold text-sm mb-1">Frontend React Integration</h4>
                    <p className="text-[11px] text-slate-500 mb-2">Nova Labs ✓ Verified</p>
                    <div className="flex justify-between items-center text-xs font-bold"><span className="text-slate-900">₹12,000</span><span className="text-blue-600">Apply Instantly</span></div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Application Tracker</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-bold border border-slate-100 p-2 rounded-lg"><span className="text-slate-700">Figma Wireframing</span><span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">Under Review</span></div>
                    <div className="flex justify-between items-center text-[11px] font-bold border border-slate-100 p-2 rounded-lg"><span className="text-slate-700">Python Scripting</span><span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Completed & Paid</span></div>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Company Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl">C</div>
                  <div><h3 className="font-bold text-lg leading-tight">Company Console</h3><p className="text-[10px] uppercase font-bold text-slate-400">The Business</p></div>
                </div>

                <div className="mb-6">
                   <span className="text-xs font-bold text-slate-900 block mb-2">Recruitment Pipeline</span>
                   <div className="grid grid-cols-2 gap-2 text-center">
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="block text-2xl font-black text-blue-600">4</span><span className="text-[10px] font-bold text-slate-400 uppercase">Active Jobs</span></div>
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100"><span className="block text-2xl font-black text-slate-900">38</span><span className="text-[10px] font-bold text-slate-400 uppercase">Applicants</span></div>
                   </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Talent Cart & Escrow Gateway</span>
                  <div className="bg-slate-900 text-white p-4 rounded-xl">
                    <div className="flex justify-between items-center text-xs border-b border-slate-700 pb-2 mb-2"><span>Fund 3 Students</span><span className="font-bold">₹28,500</span></div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-[11px] font-bold py-2 rounded-lg transition">Checkout via Escrow</button>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Admin Side */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10"></div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xl">A</div>
                  <div><h3 className="font-bold text-lg leading-tight">Admin Moderation</h3><p className="text-[10px] uppercase font-bold text-slate-400">Platform Control</p></div>
                </div>

                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-900 block mb-2">Security & Quality Control</span>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1 mb-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> Pending Approval (1)</span>
                    <h4 className="font-bold text-xs mb-2">Brand Identity Design</h4>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 text-white text-[10px] font-bold py-1.5 rounded">Approve</button>
                      <button className="flex-1 bg-red-100 text-red-600 text-[10px] font-bold py-1.5 rounded">Reject</button>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-900 block mb-2">Marketplace Telemetry</span>
                  <div className="flex items-center justify-between text-xs font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500">Platform GMV</span>
                    <span className="text-green-600">₹1,42,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
               <button onClick={() => { window.location.hash = ''; setCurrentView('storefront'); }} className="text-xs font-bold text-slate-400 hover:text-slate-900">Exit Presentation Mode</button>
            </div>
          </div>
        )}

        {/* --- STOREFRONT --- */}
        {currentView === 'storefront' && (
          <>
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-sm w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">Your Career Starts Before Graduation.</h1>
                <p className="text-slate-300 text-sm sm:text-base mb-6">Work on verified micro-projects in 1–4 weeks. Earn real stipends and build a portfolio.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-black">Find Opportunities</h2>
              <input type="text" placeholder="Search by title or company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-72 px-4 py-2 border rounded-full text-xs outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar text-xs font-semibold">
              {["All", "Technology", "Design", "Marketing", "Data", "Business"].map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-1.5 rounded-full border whitespace-nowrap ${selectedCategory === c ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>{c}</button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <div key={p.id} onClick={() => { setSelectedOpp(p); setActiveModal('detail-modal'); }} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition cursor-pointer flex flex-col justify-between relative group">
                  <button onClick={(e) => toggleFavorite(p.id, e)} className="absolute top-4 right-4 text-xl">
                    {favorites.includes(p.id) ? '❤️' : '🤍'}
                  </button>
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md mb-3 inline-block">{p.category}</span>
                    <h3 className="font-bold text-base mb-1 pr-6">{p.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">{p.company} ✓</p>
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 mb-4 text-xs font-semibold">
                      <div><span className="text-slate-400 block text-[10px] uppercase">Stipend</span><span className="font-black text-sm">₹{Number(p.budget).toLocaleString()}</span></div>
                      <div><span className="text-slate-400 block text-[10px] uppercase">Duration</span><span className="font-black text-sm">{p.duration}</span></div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 text-xs font-bold text-blue-600">Apply Now &rarr;</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- STUDENT DASHBOARD --- */}
        {currentView === 'student-dash' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-2xl border p-6">
              <h2 className="font-black text-xl mb-4">My Profile</h2>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-black mb-3">{userProfile?.name?.charAt(0) || 'S'}</div>
              <p className="font-bold">{userProfile?.name}</p>
              <p className="text-xs text-slate-500 mb-4">{currentUser?.email}</p>
              <button className="text-xs bg-slate-100 font-bold px-4 py-2 rounded-lg w-full text-left mb-2">Edit Skills & Resume</button>
              <button className="text-xs bg-slate-100 font-bold px-4 py-2 rounded-lg w-full text-left">Payment Preferences</button>
            </div>
            
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-bold text-lg mb-4">My Applications</h3>
                {myApplications.length === 0 ? <p className="text-sm text-slate-500">No applications sent yet.</p> : myApplications.map(app => (
                  <div key={app.id} className="p-3 border rounded-xl flex justify-between items-center text-sm mb-2">
                    <div><span className="font-bold block">{app.projectTitle}</span><span className="text-slate-500 text-xs">{app.company}</span></div>
                    <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">{app.status}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">❤️ Favourites List</h3>
                {favorites.length === 0 ? <p className="text-sm text-slate-500">No saved projects.</p> : (
                  <div className="space-y-2">
                    {opportunities.filter(o => favorites.includes(o.id)).map(opp => (
                      <div key={opp.id} className="p-3 bg-slate-50 rounded-xl text-sm font-bold flex justify-between items-center">
                        {opp.title} <button onClick={() => { setSelectedOpp(opp); setActiveModal('detail-modal'); }} className="text-blue-600 text-xs">View</button>
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-2xl border p-6">
              <h2 className="font-black text-xl mb-4">Company Profile</h2>
              <p className="font-bold">{userProfile?.name}</p>
              <p className="text-xs text-slate-500 mb-4">Verified Business Account</p>
              <button onClick={() => setActiveModal('post-modal')} className="w-full bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg mb-3">Post New Project</button>
              <button onClick={() => setCurrentView('cart-view')} className="w-full bg-slate-100 text-slate-800 font-bold text-xs py-2.5 rounded-lg">View Talent Cart ({cart.length})</button>
            </div>
            
            <div className="md:col-span-2 bg-white rounded-2xl border p-6">
              <h3 className="font-bold text-lg mb-4">Our Projects</h3>
              {myPostings.length === 0 ? <p className="text-sm text-slate-500">No postings yet.</p> : myPostings.map(opp => (
                <div key={opp.id} className="p-4 border rounded-xl flex justify-between items-center text-sm mb-3">
                  <div>
                    <span className="font-bold block">{opp.title}</span>
                    <span className="text-slate-500 text-xs">₹{opp.budget} • Status: {opp.approvalStatus}</span>
                  </div>
                  <button onClick={() => { setCart([...cart, { ...opp, cartId: Date.now() }]); showToast("Added to Cart!"); }} className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                    Add Stipend to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CART & PAYMENT GATEWAY VIEW --- */}
        {currentView === 'cart-view' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Payment Cart & Gateway</h2>
            <div className="bg-white rounded-2xl border p-6 mb-6">
              {cart.length === 0 ? <p className="text-sm text-slate-500">Your cart is empty.</p> : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.cartId} className="flex justify-between border-b pb-3 text-sm">
                      <span className="font-bold">{item.title} (Escrow Funding)</span>
                      <span className="font-black text-slate-700">₹{item.budget.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-lg font-black">
                    <span>Total Escrow Deposit</span>
                    <span>₹{cart.reduce((a, b) => a + Number(b.budget), 0).toLocaleString()}</span>
                  </div>
                  <button onClick={() => setActiveModal('payment-modal')} className="w-full mt-4 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm">Proceed to Secure Escrow Gateway</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {currentView === 'admin-dash' && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Admin Console</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border-2 border-amber-200 p-6">
                <h3 className="font-bold text-lg mb-4 text-amber-800">Pending Approval ({pendingQueue.length})</h3>
                <div className="space-y-4">
                  {pendingQueue.map(opp => (
                    <div key={opp.id} className="p-4 border rounded-xl bg-slate-50 text-sm">
                      <span className="font-bold block">{opp.title}</span>
                      <span className="text-slate-500 text-xs block mb-3">{opp.company} • ₹{opp.budget}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(opp.id)} className="bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs">Approve</button>
                        <button onClick={() => handleRemove(opp.id)} className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border p-6">
                <h3 className="font-bold text-lg mb-4">Live Database</h3>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {liveOpportunities.map(opp => (
                    <div key={opp.id} className="p-3 border rounded-xl flex justify-between items-center text-sm">
                      <div><span className="font-bold block text-sm">{opp.title}</span><span className="text-slate-500 text-[10px]">{opp.company}</span></div>
                      <button onClick={() => handleRemove(opp.id)} className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}
      {/* About Page Modal */}
      {activeModal === 'about-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center">
            <h3 className="font-black text-2xl mb-4">About Zyqor Intern</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Zyqor Intern bridges the gap between academics and industry through verified micro-internships. 
              Our platform features built-in Escrow Payment Gateways, Profile matching, and real-time application tracking.
            </p>
            <button onClick={() => setActiveModal(null)} className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-full text-xs">Close</button>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {activeModal === 'payment-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-black text-xl mb-1 text-center">Zyqor Secure Checkout</h3>
            <p className="text-[10px] text-slate-400 text-center mb-6 uppercase tracking-widest font-bold">Encrypted Escrow Gateway</p>
            <div className="bg-slate-50 border p-4 rounded-xl mb-4 text-center">
              <span className="text-xs text-slate-500 block mb-1">Amount to Fund</span>
              <span className="text-3xl font-black">₹{cart.reduce((a, b) => a + Number(b.budget), 0).toLocaleString()}</span>
            </div>
            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Cardholder Name" className="w-full p-2.5 border rounded-lg text-xs" />
              <input type="text" placeholder="Card Number (Demo)" className="w-full p-2.5 border rounded-lg text-xs" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM/YY" className="w-full p-2.5 border rounded-lg text-xs" />
                <input type="text" placeholder="CVC" className="w-full p-2.5 border rounded-lg text-xs" />
              </div>
            </div>
            <button onClick={() => { setCart([]); setActiveModal(null); setCurrentView('company-dash'); showToast("✓ Escrow Funded Successfully!"); }} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs">
              Simulate Secure Payment
            </button>
            <button onClick={() => setActiveModal(null)} className="w-full py-2 mt-2 text-slate-400 font-bold text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Auth Modal (Admin button strictly removed for security) */}
      {activeModal === 'auth-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base">{authMode === 'login' ? 'Sign In' : `Create Account`}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg mb-4 text-xs font-bold">
              <button onClick={() => setAuthRole('student')} className={`flex-1 py-1.5 rounded-md ${authRole === 'student' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Student</button>
              <button onClick={() => setAuthRole('company')} className={`flex-1 py-1.5 rounded-md ${authRole === 'company' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Company</button>
            </div>
            {authError && <div className="bg-red-50 text-red-600 text-[11px] p-2 rounded-lg mb-4">{authError}</div>}
            <form onSubmit={handleAuth} className="space-y-3 text-xs">
              {authMode === 'signup' && <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Name</label><input name="name" required className="w-full p-2.5 border rounded-xl" /></div>}
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label><input name="email" type="email" required className="w-full p-2.5 border rounded-xl" /></div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label><input name="password" type="password" required className="w-full p-2.5 border rounded-xl" /></div>
              <button type="submit" className="w-full py-2.5 font-bold rounded-full text-xs text-white bg-blue-600 hover:bg-blue-700 mt-2">{authMode === 'login' ? 'Sign In' : 'Create Account'}</button>
            </form>
            <div className="mt-4 pt-3 border-t text-center text-xs text-slate-500">
              {authMode === 'login' ? <span>No account? <button onClick={() => { setAuthMode('signup'); setAuthError(""); }} className="text-blue-600 font-bold">Sign Up</button></span> : <span>Have an account? <button onClick={() => { setAuthMode('login'); setAuthError(""); }} className="text-blue-600 font-bold">Sign In</button></span>}
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {activeModal === 'post-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-base">Post Opportunity</h3><button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button></div>
            <form onSubmit={handlePostOpportunity} className="space-y-3 text-xs">
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input name="title" required className="w-full p-2.5 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stipend (₹)</label><input name="budget" type="number" required className="w-full p-2.5 border rounded-xl" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label><input name="duration" required className="w-full p-2.5 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label><select name="category" className="w-full p-2.5 border rounded-xl bg-white"><option>Technology</option><option>Design</option><option>Marketing</option></select></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mode</label><select name="type" className="w-full p-2.5 border rounded-xl bg-white"><option>Remote</option><option>Hybrid</option></select></div>
              </div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Skills</label><input name="skills" required className="w-full p-2.5 border rounded-xl" /></div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label><textarea name="description" required rows="3" className="w-full p-2.5 border rounded-xl"></textarea></div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-full">Submit for Approval</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModal === 'detail-modal' && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2"><h3 className="font-black text-xl">{selectedOpp.title}</h3><button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button></div>
            <p className="text-xs text-slate-600 font-semibold mb-4">{selectedOpp.company} ✓</p>
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl mb-6 text-xs font-semibold">
              <div><span className="text-slate-400 block text-[10px] uppercase mb-1">Stipend</span><span className="font-black text-base">₹{Number(selectedOpp.budget).toLocaleString()}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase mb-1">Timeline</span><span className="font-black text-base">{selectedOpp.duration}</span></div>
            </div>
            <form onSubmit={handleApply} className="space-y-3">
              <textarea name="note" required rows="3" placeholder="Cover Letter..." className="w-full p-3 border rounded-xl text-sm"></textarea>
              <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-full text-sm">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map(t => <div key={t.id} className={`${t.isError ? 'bg-red-600' : 'bg-slate-900'} text-white text-xs px-4 py-2.5 rounded-full shadow-2xl font-bold`}>{t.msg}</div>)}
      </div>
    </div>
  );
}
