import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LineChart,
  Brain,
  Trophy,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Flame,
  Zap,
  Target,
  Crown,
  Medal,
  Award,
  Hash,
  Atom,
  BookText,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticQuiz } from './components/DiagnosticQuiz';
import { AuthProvider, useAuth } from './lib/auth';
import { cn } from './lib/utils';

const PracticePage = () => {
  const [showQuiz, setShowQuiz] = useState(false);

  if (showQuiz) {
    return <DiagnosticQuiz onComplete={(res) => {
      console.log('Results:', res);
      setShowQuiz(false);
    }} />;
  }

  return (
    <div className="glass-card p-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Brain size={40} />
      </div>
      <h2 className="text-2xl font-bold">Adaptive Practice</h2>
      <p className="text-slate-500 max-w-sm mx-auto">Take a diagnostic assessment to unlock your personalized study path.</p>
      <button
        onClick={() => setShowQuiz(true)}
        className="btn-primary mx-auto"
      >
        Start Assessment
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-slate-500">You're on a 5-day streak! Keep it up.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Flame className="text-orange-500 w-5 h-5 fill-orange-500" />
            <span className="font-bold">5</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Zap className="text-amber-500 w-5 h-5 fill-amber-500" />
            <span className="font-bold">1,240 XP</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-emerald-600" /> Current Progress
          </h2>
          <div className="space-y-4">
            {['Mathematics', 'English Language', 'Physics'].map((subject) => (
              <div key={subject} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>{subject}</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none space-y-4">
          <Brain className="w-10 h-10" />
          <h2 className="text-xl font-bold leading-tight">Ready for your daily diagnostic?</h2>
          <p className="text-emerald-100 text-sm">Target your weaknesses and boost your score by up to 15% with AI-driven practice.</p>
          <button className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 shadow-lg transition-all active:scale-95">
            Start Diagnostic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Weak Topics Identified</h2>
          <div className="flex flex-wrap gap-2">
            {['Calculus', 'Organic Chem', 'Mechanics', 'Concord'].map((topic) => (
              <span key={topic} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold">WhatsApp Integration</h2>
          <p className="text-slate-500 text-sm">Get daily questions and instant explanations on WhatsApp.</p>
          <button className="flex items-center justify-center gap-2 w-full border-2 border-slate-200 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            Connect WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

const leaderboardData = [
  { rank: 1, name: 'Chioma O.', xp: 2840, streak: 12, subjects: ['Mathematics', 'Physics'], initials: 'CO' },
  { rank: 2, name: 'Emeka O.', xp: 2610, streak: 8, subjects: ['English', 'Chemistry'], initials: 'EO' },
  { rank: 3, name: 'Amara K.', xp: 2450, streak: 5, subjects: ['Mathematics', 'Biology'], initials: 'AK' },
  { rank: 4, name: 'Tega R.', xp: 2180, streak: 5, subjects: ['Mathematics', 'English', 'Physics'], initials: 'TR' },
  { rank: 5, name: 'Zainab B.', xp: 1950, streak: 3, subjects: ['English', 'Literature'], initials: 'ZB' },
  { rank: 6, name: 'David A.', xp: 1720, streak: 2, subjects: ['Physics', 'Chemistry'], initials: 'DA' },
  { rank: 7, name: 'Folake S.', xp: 1480, streak: 1, subjects: ['Biology', 'Geography'], initials: 'FS' },
];

const LeaderboardPage = () => {
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-slate-500">Top students ranked by XP this week</p>
      </header>

      <div className="grid grid-cols-3 gap-4 items-end">
        {[top3[1], top3[0], top3[2]].map((entry, i) => {
          const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
          const podiumHeight = actualRank === 1 ? 'h-40' : actualRank === 2 ? 'h-32' : 'h-28';
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: actualRank * 0.15, duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-center space-y-1">
                <div className={cn(
                  "w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg",
                  actualRank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  actualRank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                  'bg-gradient-to-br from-orange-400 to-orange-600'
                )}>
                  {entry.initials}
                </div>
                <p className="font-bold text-sm">{entry.name}</p>
                <p className="text-xs font-medium text-slate-400">{entry.xp.toLocaleString()} XP</p>
              </div>
              <div className={cn(
                "w-full rounded-t-2xl flex items-center justify-center",
                podiumHeight,
                actualRank === 1 ? 'bg-gradient-to-t from-amber-100 to-amber-50/50 border border-amber-200' :
                actualRank === 2 ? 'bg-gradient-to-t from-slate-100 to-slate-50/50 border border-slate-200' :
                'bg-gradient-to-t from-orange-100 to-orange-50/50 border border-orange-200'
              )}>
                {actualRank === 1 ? <Crown className="w-8 h-8 text-amber-500" /> :
                 actualRank === 2 ? <Medal className="w-7 h-7 text-slate-400" /> :
                 <Award className="w-6 h-6 text-orange-500" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="space-y-2">
        {rest.map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
            className="glass-card p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-bold text-slate-400">#{entry.rank}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {entry.initials}
              </div>
              <div>
                <p className="font-semibold">{entry.name}</p>
                <div className="flex gap-1.5 mt-0.5">
                  {entry.subjects.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-medium text-slate-600">{entry.streak}</span>
              </div>
              <span className="font-bold text-emerald-600">{entry.xp.toLocaleString()} XP</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-transparent border-emerald-100">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <p className="text-sm font-medium text-slate-600">You're ranked <strong className="text-emerald-600">#4</strong> — <span className="text-slate-400">340 XP away from the podium!</span></p>
        </div>
        <button className="btn-primary text-sm py-2 px-4">Practice Now</button>
      </div>
    </div>
  );
};

const subjectMastery = [
  {
    name: 'Mathematics',
    icon: Hash,
    color: 'emerald',
    mastery: 72,
    topics: [
      { name: 'Algebra', progress: 85 },
      { name: 'Calculus', progress: 42 },
      { name: 'Geometry', progress: 68 },
      { name: 'Statistics', progress: 91 },
    ]
  },
  {
    name: 'English Language',
    icon: BookText,
    color: 'blue',
    mastery: 68,
    topics: [
      { name: 'Grammar', progress: 75 },
      { name: 'Comprehension', progress: 82 },
      { name: 'Essay Writing', progress: 55 },
      { name: 'Concord', progress: 60 },
    ]
  },
  {
    name: 'Physics',
    icon: Atom,
    color: 'violet',
    mastery: 58,
    topics: [
      { name: 'Mechanics', progress: 65 },
      { name: 'Waves & Optics', progress: 50 },
      { name: 'Electromagnetism', progress: 45 },
      { name: 'Thermodynamics', progress: 70 },
    ]
  },
];

const masteryColorMap = {
  emerald: { bg: 'bg-emerald-500', track: 'bg-emerald-100', text: 'text-emerald-600', light: 'bg-emerald-50' },
  blue: { bg: 'bg-blue-500', track: 'bg-blue-100', text: 'text-blue-600', light: 'bg-blue-50' },
  violet: { bg: 'bg-violet-500', track: 'bg-violet-100', text: 'text-violet-600', light: 'bg-violet-50' },
};

const MasteryPage = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Topic Mastery</h1>
        <p className="text-slate-500">Your progress across all subjects</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subjectMastery.map((s) => {
          const mc = masteryColorMap[s.color];
          const overallIcon = s.mastery >= 70 ? Sparkles : s.mastery >= 50 ? TrendingUp : Target;
          const OverallIcon = overallIcon;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", mc.light)}>
                    <s.icon className={cn("w-5 h-5", mc.text)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.topics.length} topics</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <OverallIcon className={cn("w-4 h-4", mc.text)} />
                  <span className={cn("font-black text-lg", mc.text)}>{s.mastery}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {s.topics.map((topic) => {
                  const statusColor = topic.progress >= 80 ? 'emerald' : topic.progress >= 50 ? 'amber' : 'rose';
                  const statusText = topic.progress >= 80 ? 'Mastered' : topic.progress >= 50 ? 'Proficient' : 'Needs Work';
                  return (
                    <div key={topic.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{topic.name}</span>
                        <span className={cn("text-xs font-semibold",
                          statusColor === 'emerald' && 'text-emerald-600',
                          statusColor === 'amber' && 'text-amber-600',
                          statusColor === 'rose' && 'text-rose-500',
                        )}>
                          {statusText}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${topic.progress}%` }}
                          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                          className={cn(
                            "h-full rounded-full",
                            statusColor === 'emerald' && 'bg-emerald-500',
                            statusColor === 'amber' && 'bg-amber-500',
                            statusColor === 'rose' && 'bg-rose-500',
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">Last studied 2 days ago</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 text-center space-y-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none">
        <Sparkles className="w-8 h-8 mx-auto" />
        <h2 className="text-xl font-bold">AI-Powered Study Recommendations</h2>
        <p className="text-emerald-100 text-sm max-w-lg mx-auto">
          Based on your weakest topics, we recommend focusing on <strong>Calculus</strong>, <strong>Electromagnetism</strong>, and <strong>Essay Writing</strong> this week.
        </p>
        <button className="bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-all active:scale-95 shadow-lg">
          View Study Plan
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex text-slate-900 bg-slate-50">
      <aside className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Zap className="fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800">Sidekick</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { to: '/', icon: LineChart, label: 'Dashboard' },
            { to: '/practice', icon: Brain, label: 'Practice' },
            { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
            { to: '/mastery', icon: Target, label: 'Topic Mastery' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group",
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200">
            <Settings className="w-5 h-5" /> Settings
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-rose-500 hover:bg-rose-50 transition-all duration-200">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl flex items-center justify-around px-4 z-50">
        {[
          { to: '/', icon: LineChart },
          { to: '/practice', icon: Brain },
          { to: '/leaderboard', icon: Trophy },
          { to: '/mastery', icon: Target },
        ].map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "p-2 rounded-lg transition-all duration-200",
              isActive ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className="w-6 h-6" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/mastery" element={<MasteryPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
