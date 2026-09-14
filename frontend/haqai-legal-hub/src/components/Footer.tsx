import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <img 
                src="/logo-crest.png" 
                alt="HaqAI Emblem" 
                className="w-full h-full object-contain logo-dark-theme" 
              />
              <img 
                src="/logo-crest-dark.png" 
                alt="HaqAI Emblem" 
                className="w-full h-full object-contain logo-light-theme" 
              />
            </div>
            <div className="flex flex-col justify-center select-none">
              <div className="flex items-center text-lg font-bold tracking-[0.16em] leading-none font-sans">
                <span className="text-foreground">HΛQ</span>
                <span className="ml-1.5 text-gold">ΛI</span>
              </div>
              <div className="text-[7px] font-bold uppercase tracking-[0.25em] text-muted-foreground/80 mt-1 flex items-center gap-1 leading-none">
                <span>LAW</span>
                <span className="text-gold/70 text-[5px]">×</span>
                <span>INTELLIGENCE</span>
                <span className="text-gold/70 text-[5px]">×</span>
                <span>JUSTICE</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered legal guidance grounded in Pakistani statutory and case law.
          </p>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-[0.2em] text-gold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Pakistan Penal Code</li>
            <li>Civil Procedure Code</li>
            <li>Constitution of Pakistan</li>
            <li>Family Laws Ordinance</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-[0.2em] text-gold mb-4">Disclaimer</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI-generated guidance only. Not a substitute for professional legal advice.
            Always consult a licensed advocate before acting on information provided here.
          </p>
        </div>
      </div>
      <div className="ornament-line" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} HaqAI. All rights reserved.</span>
        <span className="tracking-widest uppercase">Justice · Clarity · Access</span>
      </div>
    </footer>
  );
}
