import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export function StaticPage({ type }: { type: 'students' | 'companies' | 'about' | 'contact' }) {
  const content = {
    students: {
      title: "Build your portfolio before you graduate.",
      text: "Don't wait for a 6-month internship to get real experience. Complete 1-2 week projects for real startups, earn money, and build a verified portfolio of shipped work.",
      cta: "Explore Projects", link: "/projects"
    },
    companies: {
      title: "Small tasks. Real talent.",
      text: "Need a landing page refreshed? Data cleaned? Get focused, specific tasks done in weeks, not months, by ambitious students looking to prove themselves.",
      cta: "Post a Project", link: "/dashboard"
    },
    about: {
      title: "The Concept Behind Zyqor",
      text: "Zyqor Intern is an academic startup concept proposing a structural fix to the entry-level experience paradox. By unbundling traditional internships into distinct deliverables, we lower the barrier for both sides.",
      cta: "View Platform", link: "/"
    },
    contact: {
      title: "Get in touch",
      text: "This is a prototype interface. For actual inquiries regarding the Zyqor Intern concept, please reach out directly.",
      cta: "Back to Home", link: "/"
    }
  };

  const data = content[type];

  return (
    <div className="max-w-3xl mx-auto px-6 py-32 text-center">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">{data.title}</h1>
      <p className="text-lg text-muted mb-10 leading-relaxed">{data.text}</p>
      
      {type === 'contact' ? (
        <form className="max-w-md mx-auto bg-surface border border-border p-8 rounded-xl text-left space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" className="w-full border border-border rounded-md px-3 py-2 bg-background" placeholder="Demo Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea className="w-full border border-border rounded-md px-3 py-2 bg-background h-32" placeholder="Demo message area..."></textarea>
          </div>
          <Button className="w-full mt-4" type="submit">Submit Demo Form</Button>
        </form>
      ) : (
        <Link to={data.link}><Button>{data.cta}</Button></Link>
      )}
    </div>
  );
}