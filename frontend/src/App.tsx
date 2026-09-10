import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, doc, setDoc, getDoc } from 'firebase/firestore';
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

  const [authMode, setAuthMode] = useState('login');
  const [authRole, setAuthRole] = useState('student');
  const [authError, setAuthError] = useState("");

  const showToast = (msg: string, isError = false) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, isError }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    // Firestore Listeners
    const oppsQuery = query(collection(db, "opportunities"), orderBy("timestamp", "desc"));
    const unsubOpps = onSnapshot(oppsQuery, (snap) => {
      setOpportunities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setDbStatus("Connected to Cloud Firestore ✓");
    }, (err: any) => {
      setDbStatus(err.code === "permission-denied" ? "Database Locked: Update Firestore Rules" : "Firestore Error: " + err.message);
    });

    const appsQuery = query(collection(db, "applications"), orderBy("timestamp", "desc"));
    const unsubApps = onSnapshot(appsQuery, (snap) => {
      setApplications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Auth Listener
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

    return () => { unsubOpps(); unsubApps(); unsubAuth(); };
  }, []);

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
        showToast(`✓ Account created as ${name}!`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("✓ Signed in successfully!");
      }
      setActiveModal(null);
    } catch (err: any) {
      if (err.code === "auth/unauthorized-domain") setAuthError("Domain blocked: Authorize domain in Firebase Auth Settings.");
      else setAuthError(err.message.replace("Firebase: ", ""));
    }
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
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, "opportunities"), newOpp);
      setActiveModal(null);
      showToast("✓ Opportunity published to live Firestore!");
    } catch(err) {
      showToast("Failed to write to database. Check rules.", true);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthRole('student');
      setAuthMode('login');
      setActiveModal('auth-modal');
      return;
    }
    const form = e.target as any;
    const newApp = {
      opportunityId: selectedOpp.id,
      projectTitle: selectedOpp.title,
      company: selectedOpp.company,
      studentUid: currentUser.uid,
      studentEmail: currentUser.email,
      studentName: userProfile?.name || currentUser.email,
      status: "Under Review",
      note: form.note.value,
      timestamp: Date.now()
    };

    try {
      await addDoc(collection(db, "applications"), newApp);
      setActiveModal(null);
      showToast("✓ Application saved to database!");
    } catch(err: any) {
      showToast("Failed to apply: " + err.message, true);
    }
  };

  const filtered = opportunities.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.skills?.some((s:string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const myApplications = applications.filter(a => a.studentUid === currentUser?.uid);
  const myPostings = opportunities.filter(o => o.authorUid === currentUser?.uid);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dbStatus.includes("✓") ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}></span>
          <span>{dbStatus}</span>
        </div>
        <span className="hidden sm:inline text-slate-500">Repo: Zyqor.Intern</span>
      </div>

      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('storefront')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">Z</div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">Zyqor Intern</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Small Projects. Big Opportunities.</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!currentUser ? (
              <>
                <button onClick={() => { setAuthRole('student'); setAuthMode('login'); setActiveModal('auth-modal'); }} className="text-xs sm:text-sm font-semibold text-slate-700 px-3 py-1.5 hover:text-slate-900">Sign In</button>
                <button onClick={() => { setAuthRole('company'); setAuthMode('signup'); setActiveModal('auth-modal'); }} className="bg-blue-600 text-white rounded-full text-xs sm:text-sm font-bold px-4 py-2 hover:bg-blue-700 shadow-sm">Post Opportunity</button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full cursor-pointer" onClick={() => setCurrentView(userProfile?.role === 'company' ? 'company-dash' : 'student-dash')}>
                  Dashboard ({userProfile?.role || "user"})
                </span>
                {userProfile?.role === 'company' && (
                  <button onClick={() => setActiveModal('post-modal')} className="bg-blue-600 text-white rounded-full text-xs font-bold px-3.5 py-1.5 hover:bg-blue-700 shadow-sm">+ Post</button>
                )}
                <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 font-bold">Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow w-full">
        {currentView === 'storefront' && (
          <>
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-sm w-full">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase mb-4 tracking-wide">Direct Firebase Firestore Database</span>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight">Your Career Starts Before Graduation.</h1>
                <p className="text-slate-300 text-sm sm:text-base mb-6">Work on verified micro-projects in 1–4 weeks. Earn real stipends, get rated by founders, and showcase proof of work.</p>
                <button onClick={() => { if (currentUser && userProfile?.role === 'company') setActiveModal('post-modal'); else { setAuthRole('company'); setAuthMode('signup'); setActiveModal('auth-modal'); } }} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-full text-xs sm:text-sm hover:bg-blue-700 shadow-md">Post an Opportunity</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div><h2 className="text-2xl font-black text-slate-900">Marketplace Projects</h2></div>
              <input type="text" placeholder="Search projects, skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full sm:w-72 px-4 py-2 border rounded-full text-xs bg-white focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>

            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 custom-scrollbar text-xs font-semibold">
              {["All", "Technology", "Design", "Marketing", "Data", "Business"].map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-1.5 rounded-full border transition whitespace-nowrap ${selectedCategory === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"}`}>{c}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <h3 className="font-bold text-lg text-slate-800 mb-2">No projects in database yet</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">Zero mock data. Everything here will be a real Firestore document.</p>
                <button onClick={() => { if (currentUser && userProfile?.role === 'company') setActiveModal('post-modal'); else { setAuthRole('company'); setAuthMode('signup'); setActiveModal('auth-modal'); } }} className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700">+ Post First Opportunity</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                  <div key={p.id} onClick={() => { setSelectedOpp(p); setActiveModal('detail-modal'); }} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition cursor-pointer flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">{p.category}</span>
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">{p.type}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mb-1 leading-snug">{p.title}</h3>
                      <p className="text-xs text-slate-500 font-medium mb-4">{p.company}</p>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 mb-4 text-xs font-semibold">
                        <div><span className="text-slate-400 block text-[10px] uppercase">Stipend</span><span className="text-slate-900 font-black text-sm">₹{Number(p.budget).toLocaleString()}</span></div>
                        <div><span className="text-slate-400 block text-[10px] uppercase">Duration</span><span className="text-slate-900 font-black text-sm">{p.duration}</span></div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {p.skills && p.skills.map((s:string) => <span key={s} className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">{s}</span>)}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 text-xs font-bold text-blue-600">View Details & Apply &rarr;</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {currentView === 'student-dash' && (
          <div className="w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-4">My Applications</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {myApplications.length === 0 ? <p className="text-sm text-slate-500">You haven't applied to anything yet.</p> : (
                <div className="space-y-4">
                  {myApplications.map(app => (
                    <div key={app.id} className="p-4 border rounded-xl flex justify-between items-center text-sm">
                      <div><span className="font-bold block">{app.projectTitle}</span><span className="text-slate-500 text-xs">{app.company}</span></div>
                      <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">{app.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'company-dash' && (
          <div className="w-full">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Company Console</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-bold mb-4 text-sm">Your Live Postings</h3>
              {myPostings.length === 0 ? <p className="text-sm text-slate-500">You haven't posted any projects.</p> : (
                <div className="space-y-4">
                  {myPostings.map(opp => (
                    <div key={opp.id} className="p-4 border rounded-xl flex justify-between items-center text-sm">
                      <div><span className="font-bold block">{opp.title}</span><span className="text-slate-500 text-xs">₹{opp.budget} • {opp.duration}</span></div>
                      <span className="bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Active in DB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {activeModal === 'auth-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">{authMode === 'login' ? 'Sign In' : `Create ${authRole === 'student' ? 'Student' : 'Company'} Account`}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            {authError && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4 font-medium">{authError}</div>}
            <form onSubmit={handleAuth} className="space-y-3 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{authRole === 'company' ? 'Company Name' : 'Full Name'}</label>
                  <input name="name" required placeholder="Name" className="w-full p-2.5 border rounded-xl" />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                <input name="email" type="email" required placeholder="user@example.com" className="w-full p-2.5 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
                <input name="password" type="password" required placeholder="Minimum 6 characters" className="w-full p-2.5 border rounded-xl" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-full text-xs hover:bg-blue-700 shadow-sm mt-2">{authMode === 'login' ? 'Sign In' : 'Create Real Account'}</button>
            </form>
            <div className="mt-4 pt-3 border-t text-center text-xs text-slate-500">
              {authMode === 'login' ? 
                <span>No account? <button onClick={() => { setAuthMode('signup'); setAuthError(""); }} className="text-blue-600 font-bold">Sign Up</button></span> : 
                <span>Have an account? <button onClick={() => { setAuthMode('login'); setAuthError(""); }} className="text-blue-600 font-bold">Sign In</button></span>
              }
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {activeModal === 'post-modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-base text-slate-900">Post Opportunity to Cloud Firestore</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handlePostOpportunity} className="space-y-3 text-xs">
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label><input name="title" required placeholder="e.g. Build React Component Library" className="w-full p-2.5 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stipend (₹)</label><input name="budget" type="number" required placeholder="10000" className="w-full p-2.5 border rounded-xl" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label><input name="duration" required placeholder="e.g. 3 Weeks" className="w-full p-2.5 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select name="category" className="w-full p-2.5 border rounded-xl bg-white"><option>Technology</option><option>Design</option><option>Marketing</option><option>Data</option><option>Business</option></select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mode</label>
                  <select name="type" className="w-full p-2.5 border rounded-xl bg-white"><option>Remote</option><option>Hybrid</option><option>On-site</option></select>
                </div>
              </div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Skills (comma separated)</label><input name="skills" required placeholder="React, TypeScript, Tailwind" className="w-full p-2.5 border rounded-xl" /></div>
              <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label><textarea name="description" required rows="3" placeholder="Specify deliverables..." className="w-full p-2.5 border rounded-xl"></textarea></div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 shadow-md">Publish Directly to Database</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModal === 'detail-modal' && selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-lg text-slate-900">{selectedOpp.title}</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500 font-semibold mb-4">{selectedOpp.company} • {selectedOpp.type}</p>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl mb-4 text-xs font-semibold">
              <div><span className="text-slate-400 block text-[10px] uppercase">Stipend</span><span className="text-slate-900 font-black text-sm">₹{Number(selectedOpp.budget).toLocaleString()}</span></div>
              <div><span className="text-slate-400 block text-[10px] uppercase">Timeline</span><span className="text-slate-900 font-black text-sm">{selectedOpp.duration}</span></div>
            </div>
            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">{selectedOpp.description || "The student will work with the company on this project."}</p>
            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Proposal Pitch</label>
                <textarea name="note" required rows="2" placeholder="Explain your fit for this role..." className="w-full p-2 border rounded-xl text-xs"></textarea>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-full text-xs hover:bg-blue-700 shadow-sm">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`${t.isError ? 'bg-red-600' : 'bg-slate-900'} text-white text-xs px-4 py-2.5 rounded-full shadow-2xl font-bold`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
