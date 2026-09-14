import { Link } from "@tanstack/react-router";
import { Scale, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lang, setLang] = useState<"en" | "ur">("en");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    const savedLang = (localStorage.getItem("language") as "en" | "ur") || "en";
    setLang(savedLang);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const changeLanguage = (newLang: "en" | "ur") => {
    setLang(newLang);
    localStorage.setItem("language", newLang);
    window.dispatchEvent(new CustomEvent("language-changed", { detail: newLang }));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 md:w-12 md:h-12 flex items-center justify-center shrink-0">
            <img 
              src="/logo-crest.png" 
              alt="HaqAI Emblem" 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 logo-dark-theme" 
            />
            <img 
              src="/logo-crest-dark.png" 
              alt="HaqAI Emblem" 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 logo-light-theme" 
            />
          </div>
          <div className="flex flex-col justify-center select-none">
            <div className="flex items-center text-xl md:text-[22px] font-bold tracking-[0.16em] leading-none font-sans">
              <span className="text-foreground transition-colors group-hover:text-foreground/90">HΛQ</span>
              <span className="ml-1.5 text-gold text-shadow-gold">ΛI</span>
            </div>
            <div className="text-[7.5px] md:text-[8px] font-bold uppercase tracking-[0.28em] text-muted-foreground/80 mt-1.5 flex items-center gap-1 leading-none">
              <span>{lang === "en" ? "LAW" : "قانون"}</span>
              <span className="text-gold/70 text-[6px]">×</span>
              <span>{lang === "en" ? "INTELLIGENCE" : "ذہانت"}</span>
              <span className="text-gold/70 text-[6px]">×</span>
              <span>{lang === "en" ? "JUSTICE" : "انصاف"}</span>
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">
            {lang === "en" ? "Home" : "ہوم"}
          </Link>
          <a href="/#features" className="hover:text-foreground transition-colors">
            {lang === "en" ? "Features" : "خصوصیات"}
          </a>
          <a href="/#how" className="hover:text-foreground transition-colors">
            {lang === "en" ? "How it works" : "کام کرنے کا طریقہ"}
          </a>
        </nav>
        <div className="flex items-center gap-4">
          {/* UI Language Switch Toggle */}
          <div className="flex bg-secondary/80 border border-border p-0.5 rounded-lg shrink-0 text-xs">
            <button
              onClick={() => changeLanguage("en")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                lang === "en" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage("ur")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                lang === "ur" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              اردو
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>
          <Link
            to="/portal"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition shadow-gold"
          >
            {lang === "en" ? "Open Portal" : "پورٹل کھولیں"}
          </Link>
        </div>
      </div>
    </header>
  );
}
