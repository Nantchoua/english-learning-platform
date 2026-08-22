'use client';

import { useState } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

type Question = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: number;
};

export default function QuizBuilder({
  lessonId,
  initialQuestions,
}: {
  lessonId: string;
  initialQuestions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [loading, setLoading] = useState(false);

  // Form states
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/instructor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          question: questionText,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add question');
      }

      const newQ = await res.json();
      setQuestions([...questions, newQ]);

      // Reset form
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setCorrectOption(0);
      setShowAddForm(false);
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const res = await fetch(`/api/instructor/quiz?questionId=${questionId}&lessonId=${lessonId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-800 text-sm">Quiz Questions ({questions.length})</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-[#0056D2] hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Cancel' : 'Add Question'}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Question Form */}
        {showAddForm && (
          <form onSubmit={handleAddQuestion} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Question Text</label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What is the past simple of 'go'?"
                required
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#0056D2] focus:border-[#0056D2]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Option A</label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="went"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Option B</label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="gone"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Option C</label>
                <input
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="goes"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Option D</label>
                <input
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="go"
                  required
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Correct Option</label>
              <select
                value={correctOption}
                onChange={(e) => setCorrectOption(Number(e.target.value))}
                className="border border-slate-300 rounded px-3 py-2 text-sm bg-white w-full md:w-48"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-4 py-2 rounded transition"
              >
                {loading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </form>
        )}

        {/* Questions list */}
        {questions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No quiz questions yet for this lesson. Create some to test students' learning.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} flex justify-between gap-4`}>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <p className={q.correctOption === 0 ? 'text-green-600 font-bold' : 'text-slate-500'}>
                      A) {q.optionA}
                    </p>
                    <p className={q.correctOption === 1 ? 'text-green-600 font-bold' : 'text-slate-500'}>
                      B) {q.optionB}
                    </p>
                    <p className={q.correctOption === 2 ? 'text-green-600 font-bold' : 'text-slate-500'}>
                      C) {q.optionC}
                    </p>
                    <p className={q.correctOption === 3 ? 'text-green-600 font-bold' : 'text-slate-500'}>
                      D) {q.optionD}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-slate-400 hover:text-red-500 self-start transition p-1.5"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
