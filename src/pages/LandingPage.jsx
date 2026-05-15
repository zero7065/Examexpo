import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Zap, ShieldCheck, History, Award, BookOpen, ChevronRight, PlayCircle } from "lucide-react";
import LivePulse from "../components/LivePulse";

const LandingPage = () => {
  return (
    <div className="md:-ml-64 bg-bg min-h-screen font-sora selection:bg-primary/30">
      <header className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary-dim),_transparent_70%)] opacity-40 -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 -z-20"></div>

        <div className="container mx-auto max-w-5xl space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary-dim text-primary px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-primary/20 animate-fade">
            <Sparkles size={14} className="animate-pulse" />
            <span>AI-Driven Exam Mastery</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tight animate-slide-up text-text">
            Score 300+ with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient">
              Intelligent Practice
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            The only JAMB &amp; WAEC study engine that analyzes your weak topics and generates real-time AI explanations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link to="/auth" className="btn-primary w-full sm:w-auto px-12 h-16 text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3">
              Start Practicing Free
              <ChevronRight size={24} />
            </Link>
            <a href="#features" className="btn-secondary w-full sm:w-auto px-12 h-16 text-lg flex items-center gap-3">
              <PlayCircle size={24} />
              See How It Works
            </a>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📚</div>
                <div className="font-black text-white text-sm">JAMB 2024</div>
                <div className="text-blue-200 text-xs">Past Questions</div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📝</div>
                <div className="font-black text-white text-sm">WAEC</div>
                <div className="text-green-200 text-xs">Latest Papers</div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🧠</div>
                <div className="font-black text-white text-sm">AI Tutor</div>
                <div className="text-purple-200 text-xs">Smart Analysis</div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-black text-white text-sm">300+ Score</div>
                <div className="text-orange-200 text-xs">Guaranteed</div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-16">
            <StatItem value="1.9M+" label="JAMB Candidates" />
            <StatItem value="2024" label="Latest Past Questions" />
            <StatItem value="25+" label="Subjects Covered" />
            <StatItem value="3x" label="Faster Learning" />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6">
        <p style={{
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 4,
        }}>
          What's inside
        </p>
        <LivePulse />
      </section>

      <section id="features" className="py-32 px-6 bg-bg-2 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-text">Built for Nigerian Excellence</h2>
            <p className="text-text-muted text-xl max-w-2xl mx-auto font-medium">Everything you need to dominate your exams, all in one intelligent platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={<Zap className="text-primary" size={32} />} title="CBT Simulation" description="Full-screen simulation of the real JAMB environment to build your confidence and speed." />
            <FeatureCard icon={<ShieldCheck className="text-primary" size={32} />} title="AI Tutoring" description="Get personalized, warm, and direct explanations for every single question you practice." />
            <FeatureCard icon={<History className="text-primary" size={32} />} title="10-Year Database" description="Practice with verified past questions from 2014 to 2024 for all subjects." />
            <FeatureCard icon={<Award className="text-primary" size={32} />} title="Exam Predictions" description="Our AI analyzes 10-year patterns to predict likely topics for your upcoming exam." />
            <FeatureCard icon={<BookOpen className="text-primary" size={32} />} title="Weak Topic Analysis" description="Automatically identify and get focused tips on the topics holding your score back." />
            <FeatureCard icon={<Sparkles className="text-primary" size={32} />} title="Smart Study Plan" description="Generate a day-by-day study schedule based on your target score and exam date." />
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto glass-card p-12 md:p-24 text-center space-y-8 relative overflow-hidden bg-gradient-to-br from-primary-dim to-transparent border-primary/20">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
          <h2 className="text-4xl md:text-6xl font-black text-text leading-tight">Ready to score 300+?</h2>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">Join thousands of students using ExamPadi AI to secure their university admission.</p>
          <div className="pt-8">
            <Link to="/auth" className="btn-primary px-16 h-16 text-xl shadow-2xl shadow-primary/30 inline-flex items-center gap-3">
              Get Started Now
              <ChevronRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-16 border-t border-border text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black text-sm">E</div>
          <span className="text-lg font-black text-text">ExamPadi AI</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-text-muted text-sm flex-wrap">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <span>·</span>
          <a href="mailto:jadai7065@gmail.com" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <p className="text-text-muted text-sm font-medium">© 2025 ExamPadi AI by Jadai Studios · jadai.dev</p>
      </footer>
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div className="space-y-1">
    <div className="text-4xl font-black text-text font-mono tracking-tighter">{value}</div>
    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-10 border-transparent hover:border-primary/30 transition-all group hover:-translate-y-2 duration-300">
    <div className="mb-8 w-16 h-16 bg-primary-dim rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-black mb-4 text-text">{title}</h3>
    <p className="text-text-muted leading-relaxed font-medium">{description}</p>
  </div>
);

export default LandingPage;