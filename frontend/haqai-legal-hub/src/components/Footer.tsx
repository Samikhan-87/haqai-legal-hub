import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[oklch(0.85_0.12_88)] to-[oklch(0.72_0.14_80)] flex items-center justify-center">
              <Scale className="w-4 h-4 text-[var(--navy-deep)]" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold">
              Haq<span className="text-gradient-gold">AI</span>
            </span>N
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
