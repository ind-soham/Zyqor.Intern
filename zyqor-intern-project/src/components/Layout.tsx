import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from './ui';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname.includes('/dashboard');

  const NavLinks = () => (
    <>
      <Link to="/projects" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Projects</Link>
      <Link to="/students" className="text-sm font-medium text-muted hover:text-foreground transition-colors">For Students</Link>
      <Link to="/companies" className="text-sm font-medium text-muted hover:text-foreground transition-colors">For Companies</Link>
      <Link to="/about" className="text-sm font-medium text-muted hover:text-foreground transition-colors">About</Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {!isDashboard && (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex flex-col leading-none">
              <span className="font-bold tracking-tight text-lg">ZYQOR</span>
              <span className="text-[10px] font-medium tracking-widest text-accent uppercase">Intern</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <NavLinks />
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/dashboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Sign in</Link>
              <Link to="/projects"><Button>Get Started</Button></Link>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          
          {mobileMenuOpen && (
            <div className="md:hidden bg-surface border-b border-border px-6 py-4 flex flex-col gap-4">
              <NavLinks />
              <div className="h-px bg-border my-2" />
              <Link to="/dashboard" className="text-sm font-medium">Sign in</Link>
            </div>
          )}
        </header>
      )}
      
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {!isDashboard && (
        <footer className="border-t border-border bg-surface py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="font-bold tracking-tight">ZYQOR INTERN</span>
              <p className="text-sm text-muted mt-2">Small Projects. Big Opportunities.<br/>An academic startup concept.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/contact" className="text-sm text-muted hover:text-foreground">Contact</Link>
              <Link to="/about" className="text-sm text-muted hover:text-foreground">About Concept</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}