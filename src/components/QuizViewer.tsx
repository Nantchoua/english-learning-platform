'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

type Question = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

type Attempt = {
  id: string;
  score: number;
  total: number;
  createdAt: Date;
};

export default function QuizViewer({
  quizId,
  questions,
  initialAttempts,
}: {
  quizId: string;
  questions: Question[];
  initialAttempts: Attempt[];
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; total: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submitted) return; // Block changes after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quiz/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: selectedAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit quiz');
      }

      const attemptResult = await res.json();
      setLastResult({ score: attemptResult.score, total: attemptResult.total });
      setAttempts([
        {
          id: attemptResult.id,
          score: attemptResult.score,
          total: attemptResult.total,
          createdAt: new Date(),
        },
        ...attempts,
      ]);
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Error submitting quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setLastResult(null);
    setSubmitted(false);
  };

  if (questions.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mt-8">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <HelpCircle className="w-5 h-5 text-blue-400" />
        <h2 className="font-bold text-white text-base">Lesson Quiz</h2>
      </div>

      <div className="p-6 space-y-8">
        {/* Results Banner */}
        {submitted && lastResult && (
          <div className={`p-4 rounded-lg flex items-center justify-between border ${
            lastResult.score === lastResult.total
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-blue-950/40 border-blue-800 text-blue-300'
          }`}>
            <div>
              <p className="font-bold text-lg">
                Quiz Result: {lastResult.score} / {lastResult.total} Correct
              </p>
              <p className="text-xs opacity-80 mt-1">
                {lastResult.score === lastResult.total
                  ? 'Excellent job! You mastered this lesson.'
                  : 'Keep learning! Review the video and try again.'}
              </p>
            </div>
            <button
              onClick={handleRetake}
              className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retake
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => {
            const selected = selectedAnswers[q.id];
            const options = [q.optionA, q.optionB, q.optionC, q.optionD];

            return (
              <div key={q.id} className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {options.map((opt, oIdx) => {
                    const isSelected = selected === oIdx;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, oIdx)}
                        className={`text-left text-xs px-4 py-3 rounded-lg border transition ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white'
                            : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:bg-slate-900/60 hover:text-white'
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {String.fromCharCode(65 + oIdx)})
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!submitted && (
            <div className="flex justify-end pt-2 border-t border-slate-750">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs px-6 py-2.5 rounded-md transition"
              >
                {loading ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          )}
        </form>

        {/* Previous attempts */}
        {attempts.length > 0 && (
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Your Quiz History
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {attempts.map((att) => (
                <div key={att.id} className="flex justify-between items-center text-xs text-slate-400 bg-slate-900/20 px-3 py-2 rounded-md border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {att.score === att.total ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>Score: <strong>{att.score} / {att.total}</strong></span>
                  </div>
                  <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
