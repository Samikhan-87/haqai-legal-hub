import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FileText,
  Sparkles,
  BookOpenCheck,
  Upload,
  Brain,
  ScrollText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Law3DHeroCanvas } from "@/components/Law3DHeroCanvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HaqAI — Your AI-Powered Legal Guide" },
      {
        name: "description",
        content:
          "Upload documents and get instant legal guidance based on Pakistani law. AI-powered legal intelligence for citizens, students, and professionals.",
      },
      { property: "og:title", content: "HaqAI — Your AI-Powered Legal Guide" },
      {
        property: "og:description",
        content: "Instant legal guidance grounded in Pakistani law.",
      },
    ],
  }),
  component: Landing,
});

const homeTranslations = {
  en: {
    heroEyebrow: "Pakistani Law · AI Counsel",
    heroTitlePart1: "Your AI-Powered",
    heroTitlePart2: "Legal Guide",
    heroSubtitle: "Upload your documents. Get instant legal guidance grounded in Pakistani law — from contracts and FIRs to family disputes and property matters.",
    heroCtaPrimary: "Get Legal Help",
    heroCtaSecondary: "Learn More",
    stat1Label: "Statutes Indexed",
    stat2Label: "Case Precedents",
    stat3Label: "Instant Guidance",
    capabilities: "Capabilities",
    capabilitiesTitle: "Built for the realities of Pakistani law",
    cap1Title: "Document Upload",
    cap1Desc: "Drag and drop FIRs, contracts, notices, deeds, or scanned court orders. PDF and image support with OCR.",
    cap2Title: "AI Legal Analysis",
    cap2Desc: "Receive structured opinions: applicable statutes, your rights, suggested actions, and required filings.",
    cap3Title: "Pakistan Law Database",
    cap3Desc: "Grounded in PPC, CrPC, CPC, the Constitution, family laws, and Supreme Court precedents.",
    divineWisdom: "Divine Wisdom · حکمتِ الٰہی",
    verseAr: "اِنَّ اللّٰهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ",
    verseUr: "بے شک اللہ تمہیں حکم دیتا ہے کہ امانتیں ان کے حق داروں کو ادا کرو، اور جب لوگوں کے درمیان فیصلہ کرو تو انصاف کے ساتھ فیصلہ کرو۔",
    verseEn: "“Indeed, Allah commands you to render trusts to whom they are due, and when you judge between people, to judge with justice.”",
    surah: "Surah An-Nisa · 4:58",
    process: "The Process",
    processTitle: "How HaqAI works",
    step1Label: "STEP 01",
    step1Title: "Submit your case",
    step1Desc: "Upload supporting documents or describe your situation in plain Urdu or English.",
    step2Label: "STEP 02",
    step2Title: "AI analyzes",
    step2Desc: "HaqAI cross-references your facts against Pakistani statutes and binding precedent.",
    step3Label: "STEP 03",
    step3Title: "Receive guidance",
    step3Desc: "Get a clear opinion: rights, remedies, jurisdiction, timelines, and next steps.",
    beginBtn: "Begin your consultation"
  },
  ur: {
    heroEyebrow: "پاکستانی قانون · اے آئی مشیر",
    heroTitlePart1: "آپ کا اے آئی",
    heroTitlePart2: "قانونی رہنما",
    heroSubtitle: "دستاویزات اپ لوڈ کریں۔ تعزیراتِ پاکستان سے لے کر معاہدوں، ایف آئی آر، عائلی مسائل اور جائیداد کے معاملات پر فوری قانونی رہنمائی حاصل کریں۔",
    heroCtaPrimary: "قانونی مدد حاصل کریں",
    heroCtaSecondary: "مزید معلومات",
    stat1Label: "قوانین انڈیکسڈ",
    stat2Label: "عدالتی نظائر",
    stat3Label: "فوری رہنمائی",
    capabilities: "خصوصیات",
    capabilitiesTitle: "پاکستانی قانون کے تقاضوں کے مطابق بنایا گیا",
    cap1Title: "دستاویز اپ لوڈ",
    cap1Desc: "ایف آئی آر، معاہدے، نوٹس اور عدالتی احکامات ڈریگ اینڈ ڈراپ کریں۔ پی ڈی ایف اور تصاویر کے لیے او سی آر سپورٹ۔",
    cap2Title: "قانونی تجزیہ",
    cap2Desc: "تفصیلی رائے حاصل کریں: لاگو قوانین، آپ کے حقوق، تجویز کردہ اقدامات اور ضروری دستاویزات۔",
    cap3Title: "پاکستانی قوانین کا ڈیٹا بیس",
    cap3Desc: "تعزیرات پاکستان، ضابطہ فوجداری، ضابطہ دیوانی، آئینِ پاکستان اور عدالتی فیصلوں پر مبنی۔",
    divineWisdom: "حکمتِ الٰہی · Divine Wisdom",
    verseAr: "اِنَّ اللّٰهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ",
    verseUr: "بے شک اللہ تمہیں حکم دیتا ہے کہ امانتیں ان کے حق داروں کو ادا کرو، اور جب لوگوں کے درمیان فیصلہ کرو تو انصاف کے ساتھ فیصلہ کرو۔",
    verseEn: "“Indeed, Allah commands you to render trusts to whom they are due, and when you judge between people, to judge with justice.”",
    surah: "سورۃ النساء · 4:58",
    process: "طریقہ کار",
    processTitle: "HaqAI کیسے کام کرتا ہے",
    step1Label: "پہلا قدم",
    step1Title: "اپنا مقدمہ پیش کریں",
    step1Desc: "متعلقہ دستاویزات اپ لوڈ کریں یا اپنے حالات سادہ اردو یا انگریزی میں بیان کریں۔",
    step2Label: "دوسرا قدم",
    step2Title: "اے آئی کا تجزیہ",
    step2Desc: "HaqAI آپ کے حقائق کا موازنہ متعلقہ قوانین اور عدالتی فیصلوں سے کرتا ہے۔",
    step3Label: "تیسرا قدم",
    step3Title: "رہنمائی حاصل کریں",
    step3Desc: "واضح مشورہ پائیں: حقوق، حل، دائرہ اختیار، قانونی وقت اور اگلے اقدامات۔",
    beginBtn: "مشاورت شروع کریں"
  }
};

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<"en" | "ur">("en");

  useEffect(() => {
    const savedLang = (localStorage.getItem("language") as "en" | "ur") || "en";
    setLang(savedLang);

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<"en" | "ur">;
      setLang(customEvent.detail || "en");
    };

    window.addEventListener("language-changed", handleLangChange);
    return () => {
      window.removeEventListener("language-changed", handleLangChange);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(".hero-word", { yPercent: 110, opacity: 0 });
      gsap.set(".hero-sub", { y: 20, opacity: 0 });
      gsap.set(".hero-cta", { y: 16, opacity: 0 });
      gsap.set(".hero-eyebrow", { opacity: 0, y: 10 });
      gsap.set(".hero-3d-wrapper", { opacity: 0, scale: 0.85, rotateY: -20 });
      
      // Set circuit initial dashoffset (each path has dasharray 300)
      gsap.set(".circuit-path", { strokeDashoffset: 300, strokeDasharray: 300 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      // Reveal timeline
      tl.to(".hero-3d-wrapper", { opacity: 1, scale: 1, rotateY: 0, duration: 1.5, ease: "power3.out" })
        .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, "-=1.0")
        .to(
          ".hero-word",
          { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.08 },
          "-=0.7"
        )
        .to(".hero-sub", { y: 0, opacity: 1, duration: 0.9 }, "-=0.6")
        .to(".hero-cta", { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, "-=0.5");

      // Circuit line pulsing animation (infinite looping)
      gsap.to(".circuit-path", {
        strokeDashoffset: 0,
        duration: 3,
        ease: "power1.inOut",
        stagger: 0.4,
        repeat: -1,
      });
    }, heroRef);
    
    return () => ctx.revert();
  }, [lang]); // Re-run animation if layout shifts during translation

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const currentTrans = homeTranslations[lang];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden grain flex items-center min-h-[90vh]"
      >
        {/* Background ornaments & ambient gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-[oklch(0.78_0.13_85_/_0.05)] blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[oklch(0.4_0.1_265_/_0.3)] blur-[100px]" />
        </div>

        {/* Asymmetric Layout Container */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Headline & Content */}
          <div className="lg:col-span-7 text-left z-10 flex flex-col justify-center">
            <div className="hero-eyebrow inline-flex self-start items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 text-gold text-xs uppercase tracking-[0.25em] mb-6 md:mb-8">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentTrans.heroEyebrow}
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold leading-[1.1] tracking-tight">
              <span className="block overflow-hidden py-1">
                <span className="hero-word inline-block">{currentTrans.heroTitlePart1}&nbsp;</span>
              </span>
              <span className="block overflow-hidden mt-1 md:mt-2 pt-2 pb-6 pr-2">
                <span className="hero-word inline-block text-gradient-gold italic px-4 pb-4 pt-2 -mx-4">{currentTrans.heroTitlePart2}</span>
              </span>
            </h1>

            <p className="hero-sub mt-6 text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {currentTrans.heroSubtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Premium Get Legal Help Button with outline trace animation */}
              <Link
                to="/portal"
                className="hero-cta group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary text-primary-foreground font-medium shadow-gold overflow-hidden transition-all duration-300 hover:bg-transparent hover:text-gold border border-primary/20"
              >
                {/* SVG for border drawing hover micro-interaction */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <rect
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    fill="none"
                    stroke="#c9a84c"
                    strokeWidth="4"
                    className="transition-all duration-700"
                    style={{
                      strokeDasharray: "400",
                      strokeDashoffset: "400",
                      transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </svg>
                <span className="relative z-10 flex items-center gap-2">
                  {currentTrans.heroCtaPrimary}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <button
                onClick={scrollToFeatures}
                className="hero-cta inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-border text-foreground hover:border-gold/60 hover:text-gold transition-colors duration-300"
              >
                {currentTrans.heroCtaSecondary}
              </button>
            </div>

            {/* Stats strip */}
            <div className="hero-cta mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-6 max-w-xl border-t border-border/40 pt-8">
              {[
                { k: "150+", v: currentTrans.stat1Label },
                { k: "12k+", v: currentTrans.stat2Label },
                { k: "24/7", v: currentTrans.stat3Label },
              ].map((s) => (
                <div key={s.v} className="border-l border-gold/30 pl-4">
                  <div className="font-display text-2xl md:text-3xl text-gradient-gold font-semibold">{s.k}</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-1">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: 3D Scene Wrapper & Circuit Lines */}
          <div className="lg:col-span-5 relative flex items-center justify-center w-full min-h-[400px] md:min-h-[550px] -mt-6 md:-mt-10 lg:-mt-14">
            {/* SVG Circuit Lines behind 3D Object */}
            <svg 
              className="absolute inset-0 w-full h-full opacity-25 pointer-events-none z-0" 
              viewBox="0 0 200 200" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                className="circuit-path" 
                d="M 20 100 Q 60 70 100 100 T 180 100" 
                stroke="url(#circuit-grad)" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
              <path 
                className="circuit-path" 
                d="M 50 150 C 90 130 110 70 150 50" 
                stroke="url(#circuit-grad)" 
                strokeWidth="1" 
                strokeLinecap="round"
              />
              <path 
                className="circuit-path" 
                d="M 30 40 L 80 40 L 120 120 L 170 120" 
                stroke="url(#circuit-grad)" 
                strokeWidth="1.2" 
                strokeLinecap="round"
              />
              <circle cx="80" cy="40" r="3" fill="#c9a84c" opacity="0.8" />
              <circle cx="120" cy="120" r="3" fill="#c9a84c" opacity="0.8" />
              
              <defs>
                <linearGradient id="circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {/* 3D WebGL Canvas Wrapper */}
            <div className="hero-3d-wrapper w-full h-full relative z-10 flex items-center justify-center">
              <Law3DHeroCanvas />
            </div>
          </div>
        </div>

        {/* Premium Scroll-down Indicator */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300 z-20"
          onClick={scrollToFeatures}
        >
          <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Scroll</span>
          <div className="w-[16px] h-[26px] rounded-full border border-gold/30 flex justify-center p-1">
            <div className="w-[2.5px] h-[5px] rounded-full bg-gold animate-bounce" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{currentTrans.capabilities}</div>
            <h2 className="font-display text-4xl md:text-5xl">
              {lang === "en" ? (
                <>Built for the realities of <span className="text-gradient-gold">Pakistani law</span></>
              ) : (
                <>پاکستانی قانون کے <span className="text-gradient-gold">تقاضوں کے مطابق</span></>
              )}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: currentTrans.cap1Title,
                desc: currentTrans.cap1Desc,
              },
              {
                icon: Sparkles,
                title: currentTrans.cap2Title,
                desc: currentTrans.cap2Desc,
              },
              {
                icon: BookOpenCheck,
                title: currentTrans.cap3Title,
                desc: currentTrans.cap3Desc,
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative p-8 rounded-xl border border-border bg-card hover:border-gold/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
              >
                <div className="w-12 h-12 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 group-hover:bg-gold group-hover:text-[var(--navy-deep)] transition-colors">
                  <f.icon className="w-5 h-5 text-gold group-hover:text-[var(--navy-deep)]" />
                </div>
                <h3 className="font-display text-2xl mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="ornament-line mt-6 opacity-40 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QURANIC VERSE */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[oklch(0.78_0.13_85_/_0.06)] blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-6">{currentTrans.divineWisdom}</div>
          <div className="ornament-line w-32 mx-auto mb-10 opacity-70" />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            dir="rtl"
            lang="ar"
            className="font-display text-3xl md:text-5xl leading-[1.9] text-gradient-gold"
            style={{ fontFamily: '"Amiri", "Scheherazade New", "Cormorant Garamond", serif' }}
          >
            {currentTrans.verseAr}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            dir="rtl"
            lang="ur"
            className="mt-10 text-lg md:text-2xl text-foreground/85 leading-loose"
            style={{ fontFamily: '"Noto Nastaliq Urdu", "Amiri", serif' }}
          >
            {currentTrans.verseUr}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-6 text-base md:text-lg italic text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            {currentTrans.verseEn}
          </motion.p>

          <div className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold">
            <span className="w-8 h-px bg-gold/50" />
            {currentTrans.surah}
            <span className="w-8 h-px bg-gold/50" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-28 relative bg-gradient-navy">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-4">{currentTrans.process}</div>
            <h2 className="font-display text-4xl md:text-5xl">{currentTrans.processTitle}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            {[
              {
                icon: Upload,
                step: currentTrans.step1Label,
                title: currentTrans.step1Title,
                desc: currentTrans.step1Desc,
              },
              {
                icon: Brain,
                step: currentTrans.step2Label,
                title: currentTrans.step2Title,
                desc: currentTrans.step2Desc,
              },
              {
                icon: ScrollText,
                step: currentTrans.step3Label,
                title: currentTrans.step3Title,
                desc: currentTrans.step3Desc,
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto w-16 h-16 rounded-full bg-background border border-gold flex items-center justify-center mb-6 shadow-gold">
                  <s.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="text-xs tracking-[0.3em] text-gold mb-2">{s.step}</div>
                <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-primary text-primary-foreground font-medium shadow-gold hover:translate-y-[-1px] transition"
            >
              {currentTrans.beginBtn}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
