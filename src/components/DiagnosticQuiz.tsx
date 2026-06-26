import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, CircleCheck, Brain, Target, ArrowRight } from 'lucide-react';
import { Question } from '../types';
import { cn } from '../lib/utils';

interface DiagnosticQuizProps {
  onComplete: (results: any) => void;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'What is the value of x if 2x + 5 = 15?',
    options: ['x = 4', 'x = 5', 'x = 10', 'x = 7.5'],
    correctOption: 1,
    explanation: 'Subtract 5 from both sides: 2x = 10. Then divide by 2: x = 5.',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 2
  },
  {
    id: '2',
    text: 'Which of the following parts of speech describes an action?',
    options: ['Noun', 'Adjective', 'Verb', 'Preposition'],
    correctOption: 2,
    explanation: 'A verb is a word that expresses an action, occurrence, or state of being.',
    subject: 'English',
    topic: 'Grammar',
    difficulty: 1
  },
  {
    id: '3',
    text: 'Identify the odd one out among these quantities:',
    options: ['Velocity', 'Acceleration', 'Force', 'Mass'],
    correctOption: 3,
    explanation: 'Mass is a scalar quantity, while the others are vector quantities.',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 3
  }
];

export function DiagnosticQuiz({ onComplete }: DiagnosticQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex];

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResults = () => {
    const correctCount = userAnswers.reduce((acc, ans, idx) => {
      return ans === SAMPLE_QUESTIONS[idx].correctOption ? acc + 1 : acc;
    }, 0);

    return {
      total: SAMPLE_QUESTIONS.length,
      correct: correctCount,
      percentage: (correctCount / SAMPLE_QUESTIONS.length) * 100,
      weakTopics: Array.from(new Set(
        SAMPLE_QUESTIONS
          .filter((q, idx) => userAnswers[idx] !== q.correctOption)
          .map(q => q.topic)
      ))
    };
  };

  if (isFinished) {
    const results = calculateResults();
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-12 text-center space-y-8 max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CircleCheck size={40} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Diagnostic Complete!</h2>
          <p className="text-slate-500">We've identified your strengths and areas for improvement.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="block text-2xl font-black text-emerald-600">{results.percentage}%</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <span className="block text-2xl font-black text-amber-600">{results.weakTopics.length}</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weak Areas</span>
          </div>
        </div>

        <div className="text-left space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Target className="text-rose-500" /> Focus Topics:
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.weakTopics.length > 0 ? (
              results.weakTopics.map(topic => (
                <span key={topic} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">
                  {topic}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-sm">No specific weaknesses found. Excellent!</span>
            )}
          </div>
        </div>

        <button 
          onClick={() => onComplete(results)}
          className="btn-primary w-full shadow-emerald-200 shadow-xl"
        >
          Generate Study Path <ArrowRight size={20} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center text-sm font-bold text-slate-400">
        <span className="uppercase tracking-[0.2em]">Diagnostic assessment</span>
        <span>Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}</span>
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <motion.div 
          className="bg-emerald-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
        />
      </div>

      <motion.div 
        key={currentIndex}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-card p-6 md:p-10 space-y-8"
      >
        <h2 className="text-2xl font-bold text-slate-800 leading-snug">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={cn(
                "w-full text-left p-5 rounded-xl border-2 transition-all font-medium flex items-center justify-between group",
                selectedOption === idx 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                  : "border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600"
              )}
            >
              <span>{option}</span>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedOption === idx ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200"
              )}>
                {selectedOption === idx && <CircleCheck size={14} />}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          className={cn(
            "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
            selectedOption === null 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "btn-primary shadow-emerald-100 shadow-lg"
          )}
        >
          {currentIndex === SAMPLE_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'} 
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
