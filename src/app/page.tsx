"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { DemoChat } from "@/components/home/demo-chat";

import Image from "next/image";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="OnEasy Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">Legal AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</a>
            <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Solutions</a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">Log in</Link>
            <Link href="/chat" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-secondary mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-muted-foreground">AI-Powered Legal Strategist</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                LLC? C-Corp? Limited? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600">
                  Let AI Decide.
                </span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Don't guess with your business future. Our AI analyzes your goals, funding plans, and industry to recommend the <b>perfect legal structure</b> in minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/chat" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 group">
                  Find My Entity
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold ring-2 ring-background">
                        {/* Placeholder avatars */}
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      </div>
                    ))}
                  </div>
                  <span>Trusted by 10,000+ founders</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:w-1/2 relative"
            >
              {/* Abstract Visual Representation of Chat Logic */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-500/10 rounded-3xl rotate-6 blur-2xl" />
                <div className="absolute inset-0 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden flex flex-col">
                  {/* Mock Chat Interface Header */}
                  <div className="h-14 border-b border-border/50 flex items-center px-6 justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">OnEasy Legal AI</div>
                  </div>

                  {/* Mock Chat Content */}
                  <div className="flex-1 p-6 space-y-6 bg-gradient-to-b from-background to-muted/20">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-lg shadow-primary/10">
                        <p className="text-sm">I'm starting a SaaS platform and plan to raise VC money.</p>
                      </div>
                    </div>

                    {/* AI Response - Typing Indicator */}
                    <div className="flex justify-start">
                      <div className="bg-muted px-5 py-3 rounded-2xl rounded-tl-sm max-w-[80%] border border-border/50">
                        <div className="space-y-2">
                          <p className="text-sm">Based on your goal to raise VC funding, an LLC might limit you.</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded-lg border border-border/50">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span>Analyzing investability...</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completed Task Card (Floating UI Element) */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[90%] bg-card/80 backdrop-blur-xl border-l-4 border-l-green-500 border-y border-r border-border p-4 rounded-xl shadow-xl z-20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center shrink-0">
                          <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-foreground">Top Recommendation: Delaware C-Corp</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">98% Match</span>
                            <span className="text-xs text-muted-foreground">Preferred by VCs</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Banner */}
      <section className="py-10 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by founders from</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple SVG Logos placeholders */}
            {['Y Combinator', 'TechStars', '500 Startups', 'Antler', 'Founder Institute'].map((name) => (
              <span key={name} className="text-xl font-bold text-foreground/80">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works / Value Prop */}
      <section id="solutions" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Guesswork vs. Precision</h2>
            <p className="text-lg text-muted-foreground">Choosing the wrong entity can cost you taxes, liability protection, and investment. Why risk it?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent -translate-x-1/2" />

            {/* The Old Way */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl opacity-80">?</div>
                <h3 className="text-2xl font-bold text-muted-foreground">The Guessing Game</h3>
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                <h4 className="font-semibold text-red-900 mb-2">Confusing Information</h4>
                <p className="text-sm text-red-800/70">Googling "LLC vs Corp" leads to conflicting advice and legal jargon.</p>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                <h4 className="font-semibold text-red-900 mb-2">Expensive Consultations</h4>
                <p className="text-sm text-red-800/70">Lawyers charge $500+ just to tell you what to pick.</p>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                <h4 className="font-semibold text-red-900 mb-2">Costly Mistakes</h4>
                <p className="text-sm text-red-800/70">Picking an LLC when investors want a C-Corp allows them to walk away.</p>
              </div>
            </div>

            {/* The OnEasy Way */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8 md:flex-row-reverse md:text-right">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl order-1 md:order-none">✓</div>
                <h3 className="text-2xl font-bold text-primary">The OnEasy AI</h3>
              </div>

              <div className="bg-card border border-green-100 shadow-lg shadow-green-900/5 rounded-2xl p-6 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Strategic Analysis</h4>
                    <p className="text-sm text-muted-foreground">We ask about your <b>goals</b> (funding, privacy, taxes), not just your name.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-green-100 shadow-lg shadow-green-900/5 rounded-2xl p-6 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Real-Time Scoring</h4>
                    <p className="text-sm text-muted-foreground">See a live "Match Score" for every entity type as you chat.</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-green-100 shadow-lg shadow-green-900/5 rounded-2xl p-6 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">The "Why" Engine</h4>
                    <p className="text-sm text-muted-foreground">We don't just say "Pick This". We explain <b>why</b> it fits your specific situation.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase (Demo Chat) */}
      <section id="features" className="py-24 bg-muted/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                <span className="text-xs font-bold uppercase tracking-wider">Live Logic Demo</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">Watch the AI think.</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Most tools are static forms. OnEasy is a dynamic legal brain.
                Watch how it adapts its questions based on your previous answers to find the needle in the haystack.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "Identifies intent (Profit vs Non-Profit)",
                  "Detects 'Red Flags' (e.g., funding needs)",
                  "Calculates suitability scores across 10+ entities"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/chat" className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
                Try the interactive demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-indigo-500/20 rounded-3xl blur-3xl -z-10 transform rotate-3 scale-105" />
                <DemoChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Common Qs from Founders</h2>
          <div className="space-y-6">
            {[
              { q: "Can I just switch entities later?", a: "Converting an entity (e.g., LLC to C-Corp) is expensive and complex. It's much cheaper to get it right the first time using our AI analysis." },
              { q: "Is this better than LegalZoom?", a: "LegalZoom processes forms you choose. OnEasy helps you *make* the choice. We are a decision-intelligence tool first." },
              { q: "Does it cover my state?", a: "Yes, our AI understands the specific formation statutes and tax implications for all 50 US states." },
              { q: "What if I need a lawyer?", a: "OnEasy handles 90% of standard cases. For edge cases, we flag them and can refer you to a partner attorney with a complete briefing." }
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 -z-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="container mx-auto px-6 text-center text-primary-foreground">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Start your business.<br />
            <span className="text-white/60">One chat away.</span>
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join the future of legal entity management. Fast, easy, and affordable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat" className="h-14 px-8 rounded-full bg-white text-primary font-bold text-lg hover:bg-white/90 transition-all flex items-center gap-2 shadow-2xl shadow-black/20">
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-8 text-sm text-white/40">No credit card required for demo.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">O</span>
                </div>
                <span className="font-bold text-lg">OnEasy</span>
              </div>
              <p className="text-sm text-muted-foreground">Making legal entity management simple through conversation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OnEasy Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
