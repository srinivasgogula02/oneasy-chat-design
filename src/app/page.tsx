import { Metadata } from 'next';
import Link from 'next/link';
import { Poppins } from 'next/font/google';

// Component Imports
import { PhoneChatDemo } from '@/components/legal-entity-generator/phone-chat-demo';
import { TypeAnimation } from '@/components/legal-entity-generator/type-animation';
import Image from 'next/image';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'], variable: '--font-poppins' });

export const metadata: Metadata = {
    title: "Legal Entity Generator — OnEasy.AI | Find the Right Business Structure in 60 Seconds",
    description: "Not sure whether to register a Private Limited Company, LLP, OPC, or Sole Proprietorship? Get a free, CA-grade recommendation in under 60 seconds. Used by 10,000+ Indian business owners.",
    keywords: "legal entity selection India, private limited vs LLP India, which business structure India, company registration guide India, CA advice business structure free, OPC vs LLP vs private limited, best entity for startup India",
    openGraph: {
        title: "Find Your Perfect Business Structure — Free · OnEasy.AI",
        description: "Answer 6 questions. Get a CA-grade recommendation in 60 seconds. Free forever.",
        url: "https://oneasy.ai/legal-entity-generator",
        type: "website",
    },
    alternates: {
        canonical: "https://oneasy.ai/legal-entity-generator",
    }
};

const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OnEasy Legal Entity Generator",
    "applicationCategory": "BusinessApplication",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
    },
    "description": "AI agent that recommends the correct legal entity (Pvt Ltd, LLP, OPC, etc.) for Indian businesses in under 60 seconds based on CA-grade logic."
};

export default function LegalEntityGeneratorPage() {
    return (
        <div className={`min-h-screen bg-[#080808] text-white font-sans selection:bg-[#E8192C]/20 selection:text-[#E8192C] overflow-x-hidden relative ${poppins.variable}`}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-glow-orb { background-image: radial-gradient(circle, rgba(232,25,44,0.1) 0%, transparent 70%); }
                .oneasy-card { border-radius: 1rem; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease; }
                .oneasy-card:hover { border-color: rgba(232,25,44,0.3); transform: translateY(-4px); box-shadow: 0 10px 40px -10px rgba(232,25,44,0.15); }
                .oneasy-gradient-text { color: transparent; background-clip: text; -webkit-background-clip: text; background-image: linear-gradient(to right, #E8192C, #ff4d5e); }
                @keyframes float {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(-10px); }
                  100% { transform: translateY(0px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .font-bebas { font-family: var(--font-poppins), sans-serif; font-weight: 700; }
                .font-mono { font-family: var(--font-poppins), sans-serif; font-weight: 500; }
                .font-sans { font-family: var(--font-poppins), sans-serif; }
                .text-primary { color: #E8192C; }
                .bg-primary { background-color: #E8192C; }
                .border-primary { border-color: #E8192C; }
                .text-muted-foreground { color: #A0A0A0; }
                .bg-background { background-color: #080808; }
                .bg-card { background-color: #111111; }
            `}} />
            {/* Background Red Glow Orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#E8192C]/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen bg-glow-orb" />

            {/* JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* 1. Navigation Shell */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1200px] mx-auto px-[5%] h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="OnEasy Logo" width={140} height={40} className="object-contain" />
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="#ai-agents" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">AI Agents</Link>
                        <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Pricing</Link>
                        <Link href="/login" className="text-sm font-medium text-white px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">Login</Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-16">

                {/* HERO SECTION */}
                <section className="max-w-[1200px] mx-auto px-[5%] mb-24">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">

                        {/* Left Col: Hero Copy */}
                        <div className="flex-1 space-y-8 relative z-10 w-full">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium">
                                <span className="text-base">⚖️</span>
                                <span className="text-muted-foreground">OnEasy Legal Entity Generator — <span className="text-white">Powered by CA-Grade AI</span></span>
                            </div>

                            {/* Headline */}
                            <h1 className="font-bebas text-5xl md:text-7xl tracking-tight leading-[1.1] text-white uppercase">
                                Want to start the business or launch your startup?<br />
                                <span className="text-primary oneasy-gradient-text block mt-2">GET YOUR LEGAL ENTITY</span>
                                <span className="text-white/60 text-2xl md:text-4xl block mt-6 min-h-[80px] font-medium normal-case tracking-normal">
                                    <TypeAnimation strings={[
                                        "Are you an NRI? Find the best entity in 60 seconds.",
                                        "Planning to raise venture capital?",
                                        "Operating a family business?",
                                        "Starting a tech agency?",
                                        "Freelancing for foreign clients?"
                                    ]} />
                                </span>
                            </h1>

                            {/* Quote Block */}
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 relative overflow-hidden group max-w-3xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="font-bebas text-6xl md:text-7xl text-primary leading-none oneasy-gradient-text tracking-tight shrink-0">68%</div>
                                <div className="space-y-3 relative z-10">
                                    <p className="font-semibold text-lg text-white">of Indian businesses register under the wrong legal structure — and pay for it for years.</p>
                                    <p className="text-sm text-primary font-medium">
                                        Do not fall under that 68% as we are there to help you choose the right legal entity in less than 60 seconds.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="#ai-agents" className="h-14 px-8 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-3 transition-all hover:bg-primary/90 shadow-[0_0_40px_rgba(232,25,44,0.3)] hover:-translate-y-1">
                                    Find My Legal Entity — Free <span className="text-xl leading-none">→</span>
                                </Link>
                                <Link href="#how-it-works" className="h-14 px-8 rounded-xl border border-white/20 bg-transparent text-white font-semibold transition-all hover:border-primary hover:bg-primary/5 flex items-center justify-center">
                                    See How It Works
                                </Link>
                            </div>
                        </div>

                    </div>
                </section>

                {/* VISUAL & STATS CONTAINER */}
                <section className="mb-24 relative">
                    <div className="max-w-[1200px] mx-auto px-[5%]">
                        <div className="flex flex-col md:flex-row items-stretch justify-center w-full max-w-5xl mx-auto mb-20 gap-8 lg:gap-12 relative pt-4 lg:pt-0">

                            {/* Without OnEasy */}
                            <div className="oneasy-card p-8 border-white/5 opacity-80 hover:opacity-100 flex-1 bg-gradient-to-br from-[#111111] to-[#0A0A0A] relative z-10">
                                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-2xl shrink-0">😩</div>
                                    <h3 className="font-bebas text-3xl tracking-wide text-white/50">WITHOUT ONEEASY</h3>
                                </div>
                                <ul className="space-y-6 font-mono text-sm text-muted-foreground">
                                    <li className="flex gap-4 items-start"><span className="text-white/30 text-lg leading-none mt-0.5 shrink-0">✕</span> <span>Calls CA at 9pm — goes to voicemail</span></li>
                                    <li className="flex gap-4 items-start"><span className="text-white/30 text-lg leading-none mt-0.5 shrink-0">✕</span> <span>Pays ₹2,000 for a 20-min consultation just to ask basic questions</span></li>
                                    <li className="flex gap-4 items-start"><span className="text-white/30 text-lg leading-none mt-0.5 shrink-0">✕</span> <span>Gets told "it depends" without any clear recommendation</span></li>
                                    <li className="flex gap-4 items-start"><span className="text-white/30 text-lg leading-none mt-0.5 shrink-0">✕</span> <span>Registers wrong entity — faces tax inefficiency or investor mismatch</span></li>
                                </ul>
                            </div>

                            {/* Human / VS Divider */}
                            <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-16 relative z-20">
                                <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent absolute left-1/2 -translate-x-1/2" />
                                <div className="w-16 h-16 rounded-full bg-[#080808] border border-white/10 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10">
                                    🤔
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/20 text-white flex items-center justify-center text-sm font-bold absolute top-1/2 -translate-y-1/2 mt-12 backdrop-blur-md shadow-[0_0_15px_rgba(232,25,44,0.3)]">
                                    VS
                                </div>
                            </div>

                            {/* With OnEasy */}
                            <div className="oneasy-card p-8 border-primary/30 bg-gradient-to-br from-[#1A0A0A] to-[#110505] flex-1 relative overflow-hidden group shadow-[0_10px_40px_rgba(232,25,44,0.1)] z-10 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                                <div>
                                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-primary/20 relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(232,25,44,0.4)] shrink-0">🤩</div>
                                        <h3 className="font-bebas text-3xl tracking-wide text-primary drop-shadow-[0_0_10px_rgba(232,25,44,0.5)]">WITH ONEEASY</h3>
                                    </div>
                                    <ul className="space-y-6 font-mono text-sm text-white/90 relative z-10 mb-8">
                                        <li className="flex gap-4 items-start"><span className="text-primary text-xl leading-none mt-0.5 shrink-0 drop-shadow-[0_0_5px_currentColor]">✓</span> <span>Answers 6 smart questions in under 60 seconds</span></li>
                                        <li className="flex gap-4 items-start"><span className="text-primary text-xl leading-none mt-0.5 shrink-0 drop-shadow-[0_0_5px_currentColor]">✓</span> <span className="text-white">Gets a clear recommendation: Pvt Ltd / LLP / OPC / Sole Prop</span></li>
                                        <li className="flex gap-4 items-start"><span className="text-primary text-xl leading-none mt-0.5 shrink-0 drop-shadow-[0_0_5px_currentColor]">✓</span> <span>Understands exactly why it suits their business + tax implications</span></li>
                                        <li className="flex gap-4 items-start"><span className="text-primary text-xl leading-none mt-0.5 shrink-0 drop-shadow-[0_0_5px_currentColor]">✓</span> <span>Knows investor compatibility upfront</span></li>
                                    </ul>
                                </div>
                                <div className="mt-8 pt-6 border-t border-primary/20 flex items-center gap-4 relative z-10 bg-primary/5 -mx-8 -mb-8 px-8 py-6">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">💰</div>
                                    <span className="text-sm font-sans font-bold text-white tracking-wide">Saved ₹40,000+ in restricting costs</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                {/* STATS BAR */}
                <section className="border-y border-white/5 bg-[#0A0A0A] py-12 mb-24">
                    <div className="max-w-[1200px] mx-auto px-[5%] grid grid-cols-2 lg:grid-cols-4 gap-8 divide-x divide-transparent lg:divide-white/5">
                        {[
                            { num: "10,000+", label: "Business owners guided" },
                            { num: "< 60 SEC", label: "Average recommendation time" },
                            { num: "5", label: "Entity types covered" },
                            { num: "₹0", label: "Always free to use" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center px-4 relative">
                                <div className="font-bebas text-5xl md:text-6xl text-white mb-2">{stat.num}</div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                                {i !== 3 && <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />}
                            </div>
                        ))}
                    </div>
                </section>

                {/* THE PROBLEM SECTION */}
                <section id="ai-agents" className="max-w-[1200px] mx-auto px-[5%] mb-32 relative pt-20 -mt-20">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block block">The Business Owner's Reality</span>
                        <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">Your CA Is Not Available 24/7. <span className="text-white/40">We Are.</span></h2>
                        <p className="text-lg text-muted-foreground">Choosing the wrong legal entity is one of the most expensive mistakes a founder can make. It affects your taxes, your ability to raise funding, your liability, and your compliance burden — for years. You deserve a clear answer, not a ₹2,000 consultation fee just to ask a basic question.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: "🌙", title: "Your CA Goes Offline. We Don't.", desc: "It's 11pm and you've just decided to start your business. Your CA is unreachable. OnEasy answers your questions instantly — any time, any day, completely free.", badge: "Available 24/7/365" },
                            { icon: "💸", title: "Stop Paying for Basic Advice", desc: "A 20-minute consultation with a CA costs ₹1,500–₹3,000 just to get a recommendation you could get in 60 seconds. Use that money to register instead.", badge: "Save up to ₹3,000 per consultation" },
                            { icon: "⏱️", title: "Decision in 60 Seconds, Not 6 Days", desc: "No scheduling. No waiting rooms. No \"I'll get back to you.\" Answer 6 targeted questions and get your recommendation immediately — backed by CA-grade logic.", badge: "Average: 52 seconds" },
                            { icon: "🏦", title: "Get Investor-Compatible from Day One", desc: "Raising funding later? Certain entity types block investor entry. We factor in your funding ambitions upfront so you never have to restructure.", badge: "VC/Angel compatible entities flagged" },
                            { icon: "📊", title: "Understand Your Tax Position", desc: "Different entities mean dramatically different tax rates, compliance costs, and deductions. We show you the financial implications before you commit.", badge: "Tax efficiency built in" },
                            { icon: "🛡️", title: "Know Your Personal Liability Upfront", desc: "Are you personally liable if the business fails? The answer depends entirely on which entity you choose. We make sure you understand the risk.", badge: "Liability explained clearly" }
                        ].map((card, i) => (
                            <div key={i} className="oneasy-card p-8 bg-gradient-to-b from-[#111111] to-[#0A0A0A] flex flex-col justify-between">
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-6">{card.icon}</div>
                                    <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">{card.desc}</p>
                                </div>
                                <div className="font-mono text-xs font-semibold text-primary/80 bg-primary/5 px-3 py-2 rounded border border-primary/10 self-start">
                                    ✦ {card.badge}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="max-w-[1200px] mx-auto px-[5%] mb-32 relative pt-20 -mt-20">
                    {/* Background Detail */}
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 mix-blend-screen" />

                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="lg:w-1/3 shrink-0 sticky top-24">
                            <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">The Process</span>
                            <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">6 Questions.<br />60 Seconds.<br />Your Answer.</h2>
                            <p className="text-lg text-muted-foreground mb-8">No jargon. No complexity. Just a smart conversation that leads to the right legal structure for your exact situation.</p>

                            {/* Time Promise Box */}
                            <div className="inline-flex flex-col p-6 rounded-2xl bg-[#111111] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-bebas text-6xl text-primary oneasy-gradient-text">&lt; 60</span>
                                    <span className="font-bebas text-2xl text-white/80">SECONDS</span>
                                </div>
                                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">From first question to final recommendation</span>
                            </div>
                        </div>

                        <div className="lg:w-2/3 space-y-8 relative">
                            {/* Vertical connecting line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/50 via-white/10 to-transparent hidden md:block" />

                            {[
                                {
                                    num: "01",
                                    title: "Answer 6 Smart Questions",
                                    desc: "Our AI asks you the questions a CA would — but in plain language. What type of business? How many founders? Do you plan to raise funding? Will you have foreign investment? What's your expected annual revenue? Are you a freelancer, trader, manufacturer, or service provider? Each answer narrows down the best structure.",
                                    badge: "💬 Conversational · No forms · No jargon"
                                },
                                {
                                    num: "02",
                                    title: "AI Analyses Your Business Profile",
                                    desc: "Behind the scenes, our CA-trained AI cross-references your answers against Indian company law, tax regulations, FEMA compliance requirements, MCA guidelines, and investor compatibility standards. It doesn't just pattern-match — it applies the same decision logic a senior CA would use.",
                                    badge: "⚖️ CA-grade logic · Updated with latest regulations"
                                },
                                {
                                    num: "03",
                                    title: "Get Your Recommendation + Full Explanation",
                                    desc: "You receive a clear, specific recommendation — Private Limited Company, LLP, OPC, Partnership Firm, or Sole Proprietorship — along with a plain-language explanation of why this entity fits your situation, what your compliance requirements are, what it costs to maintain, and what your next steps should be.",
                                    badge: "📋 Full breakdown · Next steps included · Ready to register"
                                }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-6 md:gap-8 group relative">
                                    <div className="shrink-0 relative z-10 w-12 h-12 rounded-full bg-[#111111] border border-white/20 flex items-center justify-center font-bebas text-xl text-white group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                                        {step.num}
                                    </div>
                                    <div className="pt-2 pb-8">
                                        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                                        <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-2xl">{step.desc}</p>
                                        <div className="inline-flex font-mono text-xs font-semibold text-white/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 group-hover:border-white/30 transition-colors">
                                            {step.badge}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className="bg-[#050505] py-24 border-y border-white/5 mb-32 relative">
                    <div className="max-w-[1200px] mx-auto px-[5%]">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">What You Get</span>
                            <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">CA-Grade Intelligence. <span className="text-white/40">Zero CA Fees.</span></h2>
                            <p className="text-lg text-muted-foreground">Built by Chartered Accountants, trained on Indian company law, always available — and always free.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: "🧠", title: "CA-Trained AI Logic", desc: "Our recommendation engine is built on the decision frameworks used by experienced Chartered Accountants — not generic chatbot responses." },
                                { icon: "⚡", title: "Instant Recommendation", desc: "No appointment. No waiting. Answer the questions and get your entity recommendation in under 60 seconds." },
                                { icon: "📋", title: "Full Compliance Breakdown", desc: "Know exactly what you're getting into before you register — annual filing requirements, compliance costs, audit obligations, and more." },
                                { icon: "💰", title: "Tax Efficiency Analysis", desc: "Understand the tax implications of each entity option. We show you corporate tax rates, presumptive taxation benefits, and how they affect your income." },
                                { icon: "🚀", title: "Funding Compatibility", desc: "Planning to raise investmenet? We flag which entity types are compatible with your funding goals and which ones will block you later." },
                                { icon: "🔄", title: "Restructuring Risk Alert", desc: "We identify early if your business might require restructuring in 2–3 years, saving you lakhs in conversion costs." }
                            ].map((feat, i) => (
                                <div key={i} className="oneasy-card p-6 bg-[#0A0A0A] border-white/5 hover:border-primary/30">
                                    <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-lg mb-4">{feat.icon}</div>
                                    <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ENTITY COMPARISON MATRIX */}
                <section className="max-w-[1200px] mx-auto px-[5%] mb-32 relative">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">Detailed Comparison</span>
                        <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">You Need Not Go Through This Table.<br /><span className="text-primary oneasy-gradient-text">We'll Choose For You In &lt; 60s.</span></h2>
                        <p className="text-lg text-muted-foreground">But for the deeply curious, here is exactly how the 5 major Indian business structures compare across key criteria ranging from setup costs to investor readiness.</p>
                    </div>

                    <div className="overflow-x-auto pb-6 scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[900px] bg-[#0A0A0A] rounded-2xl overflow-hidden border border-white/5">
                            <thead className="bg-[#111111] border-b border-primary/20">
                                <tr className="text-sm font-mono text-muted-foreground">
                                    <th className="py-6 px-6 font-medium w-1/6">Evaluation Metric</th>
                                    <th className="py-6 px-6 font-medium text-white">Proprietorship</th>
                                    <th className="py-6 px-6 font-medium text-white">Partnership</th>
                                    <th className="py-6 px-6 font-medium text-white">LLP</th>
                                    <th className="py-6 px-6 font-bold text-primary bg-primary/5">Private Limited</th>
                                    <th className="py-6 px-6 font-medium text-white">OPC</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    { metric: "Setup Time", p: "1-3 Days", part: "3-5 Days", llp: "10-15 Days", pvt: "10-15 Days", opc: "10-15 Days" },
                                    { metric: "Registration Cost", p: "Very Low", part: "Low", llp: "Medium", pvt: "High", opc: "Medium" },
                                    { metric: "Founder Liability", p: "Unlimited", part: "Unlimited", llp: "Limited", pvt: "Limited", opc: "Limited" },
                                    { metric: "Compliance Burden", p: "Minimal", part: "Low", llp: "Medium", pvt: "Very High", opc: "High" },
                                    { metric: "Investor Friendly?", p: "No", part: "No", llp: "Rarely", pvt: "Yes (Preferred)", opc: "No" },
                                    { metric: "FDI Allowed?", p: "No", part: "No", llp: "Yes (With RBI Approval)", pvt: "Yes (Automatic Route)", opc: "No" },
                                    { metric: "Ideal For", p: "Freelancers, Local Shops", part: "Small Family Businesses", llp: "Service Agencies, Consulting", pvt: "Tech Startups, Scalable Biz", opc: "Solo Founders scaling up" }
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-5 px-6 font-semibold text-white/80 border-r border-white/5">{row.metric}</td>
                                        <td className="py-5 px-6 text-muted-foreground">{row.p}</td>
                                        <td className="py-5 px-6 text-muted-foreground">{row.part}</td>
                                        <td className="py-5 px-6 text-white">{row.llp}</td>
                                        <td className="py-5 px-6 text-white font-medium bg-primary/5">{row.pvt}</td>
                                        <td className="py-5 px-6 text-muted-foreground">{row.opc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                {/* LIVE DEMO: PHONE CHAT */}
                <section className="border-y border-white/5 bg-[#050505] py-32 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

                    <div className="max-w-[1200px] mx-auto px-[5%] flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 space-y-8 relative z-10">
                            <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase block">Experience the AI</span>
                            <h2 className="font-bebas text-5xl md:text-7xl text-white tracking-tight leading-[0.9]">
                                SEE HOW IT<br />
                                <span className="text-primary oneasy-gradient-text">ACTUALLY WORKS</span>
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-lg">Watch our agent guide a founder through their legal entity decision. Real questions. Real logic. Real recommendation in under 60 seconds.</p>

                            <ul className="space-y-4 pt-4 font-mono text-sm text-white/80">
                                <li className="flex items-center gap-3"><span className="text-primary text-lg leading-none">✓</span> Adaptive questioning based on previous answers</li>
                                <li className="flex items-center gap-3"><span className="text-primary text-lg leading-none">✓</span> Explains complex terms simply when asked</li>
                                <li className="flex items-center gap-3"><span className="text-primary text-lg leading-none">✓</span> Generates a downloadable compliance roadmap</li>
                            </ul>

                            <button className="h-14 mt-8 px-8 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 transition-all hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-1">
                                Try It Yourself For Free <span className="text-xl leading-none font-normal">→</span>
                            </button>
                        </div>

                        <div className="lg:w-1/2 flex justify-center lg:justify-end relative">
                            {/* Device Mockup */}
                            <div className="w-[340px] h-[680px] rounded-[40px] border-[8px] border-[#1A1A1A] bg-[#050505] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] relative z-10 animate-float">
                                {/* Dynamic Island / Notch area */}
                                <div className="absolute top-0 inset-x-0 h-7 bg-[#1A1A1A] rounded-b-3xl w-40 mx-auto z-50 flex items-center justify-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                                </div>

                                {/* Inner Screen wrapping component */}
                                <div className="w-full h-full bg-[#0A0A0A] pt-8">
                                    <PhoneChatDemo />
                                </div>
                            </div>

                            {/* Glow Behind Phone */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-primary/20 blur-[80px] rounded-full z-0" />
                        </div>
                    </div>
                </section>

                {/* ALWAYS FREE STRIP */}
                <section id="pricing" className="bg-primary py-12 text-black overflow-hidden relative pt-20 -mt-20">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="max-w-[1200px] mx-auto px-[5%] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div>
                            <h2 className="font-bebas text-4xl md:text-5xl tracking-wide mb-1">Why is this free?</h2>
                            <p className="font-medium text-black/80">We believe foundational advice shouldn't be gatekept. We monetize when you choose to use our premium compliance services later.</p>
                        </div>
                        <div className="flex gap-4 shrink-0 font-mono text-sm font-bold uppercase tracking-wider">
                            <div className="bg-black text-white px-4 py-2 rounded-lg">No Credit Card</div>
                            <div className="bg-black/10 px-4 py-2 rounded-lg border border-black/20">No Spam</div>
                        </div>
                    </div>
                </section>

                {/* FREE BENEFITS SECTION */}
                <section className="max-w-[1200px] mx-auto px-[5%] py-32 relative border-b border-white/5">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">The Output</span>
                        <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">Everything You Need.<br />Nothing You Don't.</h2>
                        <p className="text-lg text-muted-foreground">After your 60-second consultation, you receive a comprehensive package that tells you exactly what to do next.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Definitive Recommendation", desc: "A clear 'Choose XYZ Entity' statement. No hedging, no 'it depends'.", num: "01" },
                            { title: "Cost-Benefit Analysis", desc: "A breakdown of setup costs, annual maintenance fees, and tax implications.", num: "02" },
                            { title: "Compliance Calendar", desc: "A downloaded list of every mandatory filing required for your first 12 months.", num: "03" },
                            { title: "Fundraising Readiness", desc: "A clear assessment of how VC/Angel investors will view your chosen structure.", num: "04" },
                            { title: "Liability Risk Score", desc: "An explanation of exactly what personal assets are at risk under this entity.", num: "05" },
                            { title: "Next-Step Registration Guide", desc: "Step-by-step instructions on the exact forms needed to register your entity tomorrow.", num: "06" }
                        ].map((benefit, i) => (
                            <div key={i} className="oneasy-card p-8 bg-gradient-to-br from-[#111111] to-[#0A0A0A] border-white/5 flex flex-col justify-between group hover:border-white/10">
                                <div>
                                    <div className="font-bebas text-4xl text-primary/30 mb-6 group-hover:text-primary transition-colors">{benefit.num}</div>
                                    <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section className="max-w-[1200px] mx-auto px-[5%] py-32 relative">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="font-mono text-primary text-sm font-semibold tracking-widest uppercase mb-4 block">Success Stories</span>
                        <h2 className="font-bebas text-5xl md:text-6xl mb-6 text-white tracking-tight">10,000+ Founders Saved From <span className="text-white/40">Expensive Mistakes.</span></h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { quote: "I was convinced I needed a Pvt Ltd to look professional. The AI asked about my funding plans (none) and recommended an LLP. Saved me ₹40k+ in audit fees my first year.", author: "Rahul M.", role: "B2B Service Agency", initial: "RM" },
                            { quote: "My CA suggested a Sole Proprietorship for my SaaS. This tool flagged that foreign clients might hesitate to pay an individual account. Changed to Pvt Ltd just in time.", author: "Priya S.", role: "SaaS Founder", initial: "PS" },
                            { quote: "Literally took 45 seconds while I was sitting in an Uber. It gave me a much clearer explanation of the tax differences than the 3 hour seminar I attended.", author: "Karthik V.", role: "D2C Brand", initial: "KV" }
                        ].map((test, i) => (
                            <div key={i} className="oneasy-card p-8 bg-[#0A0A0A] border-white/5 relative flex flex-col justify-between">
                                <div className="text-4xl text-primary/20 font-serif leading-none absolute top-6 left-6">"</div>
                                <p className="text-white/80 leading-relaxed mb-8 relative z-10 pt-4 text-sm">{test.quote}</p>
                                <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center font-bebas text-white border border-white/10">{test.initial}</div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{test.author}</div>
                                        <div className="text-xs text-muted-foreground">{test.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="max-w-[1200px] mx-auto px-[5%] mb-32">
                    <div className="oneasy-card p-12 md:p-20 bg-gradient-to-br from-[#1A0505] to-[#0A0505] border-primary/20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/10 blur-[100px] rounded-full -z-10 mix-blend-screen" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="font-bebas text-6xl md:text-8xl text-white tracking-tight leading-[0.9] mb-6">
                                STOP GUESSING.<br />
                                <span className="text-primary oneasy-gradient-text">START RIGHT.</span>
                            </h2>
                            <p className="text-xl text-white/80 mb-10">Get your CA-grade entity recommendation in the next 60 seconds. Completely free.</p>

                            <button className="h-16 px-10 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-primary/90 shadow-[0_0_50px_rgba(232,25,44,0.4)] hover:-translate-y-1 mx-auto">
                                Find My Legal Entity Now <span className="text-2xl leading-none font-normal">→</span>
                            </button>
                            <p className="mt-4 font-mono text-xs text-muted-foreground uppercase tracking-widest">No Sign-up required for recommendation</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#050505] pt-24 pb-8 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none" />

                <div className="max-w-[1200px] mx-auto px-[5%]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 relative z-10">

                        {/* Brand Col */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Image src="/logo.png" alt="OnEasy Logo" width={140} height={40} className="object-contain" />
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                AI agents built by Chartered Accountants to make foundational business decisions accessible to every Indian founder.
                            </p>
                        </div>

                        {/* Links Col 1 */}
                        <div>
                            <h4 className="font-mono text-xs font-bold uppercase text-white mb-6 tracking-widest">AI Agents</h4>
                            <ul className="space-y-4">
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Legal Entity Generator</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Tax Optimizer (Coming Soon)</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Compliance Checker (Coming Soon)</Link></li>
                            </ul>
                        </div>

                        {/* Links Col 2 */}
                        <div>
                            <h4 className="font-mono text-xs font-bold uppercase text-white mb-6 tracking-widest">Company</h4>
                            <ul className="space-y-4">
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Legal Col */}
                        <div>
                            <h4 className="font-mono text-xs font-bold uppercase text-white mb-6 tracking-widest">Legal</h4>
                            <ul className="space-y-4">
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/" className="text-sm text-muted-foreground hover:text-white transition-colors">Disclaimer</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} OnEasy.AI. All rights reserved.</p>
                        <p className="text-xs text-muted-foreground">
                            Disclaimer: OnEasy provides educational recommendations based on algorithms. We are not a law firm. Always consult a professional before incorporating.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
