'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, CornerDownRight, Send } from 'lucide-react';

type User = {
  name: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
};

type CommentReply = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  replies: CommentReply[];
};

export default function DiscussionForum({ lessonId }: { lessonId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?lessonId=${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, content: newQuestion }),
      });

      if (res.ok) {
        const newComm = await res.json();
        setComments([newComm, ...comments]);
        setNewQuestion('');
      }
    } catch (err) {
      alert('Error posting question');
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (questionId: string) => {
    const text = replyInputs[questionId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, content: text, parentId: questionId }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setComments(
          comments.map((c) => {
            if (c.id === questionId) {
              return { ...c, replies: [...(c.replies || []), newReply] };
            }
            return c;
          })
        );
        setReplyInputs({ ...replyInputs, [questionId]: '' });
      }
    } catch (err) {
      alert('Error posting reply');
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mt-8">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <MessageSquare className="w-5 h-5 text-blue-400" />
        <h2 className="font-bold text-white text-base">Lesson Discussion / Q&A</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Post Question Form */}
        <form onSubmit={handlePostQuestion} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask a question about this lesson..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Send className="w-4 h-4" /> Ask
          </button>
        </form>

        {/* Questions Thread list */}
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm">
            No questions asked yet. Be the first to start a conversation!
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 divide-y divide-slate-750">
            {comments.map((q) => (
              <div key={q.id} className="pt-6 first:pt-0 space-y-4">
                {/* Question Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 text-sm">
                      {q.user.name || 'Anonymous User'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      q.user.role === 'INSTRUCTOR' || q.user.role === 'ADMIN'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                        : 'bg-blue-950 text-blue-400 border border-blue-900/50'
                    }`}>
                      {q.user.role}
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-350 text-sm font-medium">{q.content}</p>
                </div>

                {/* Sub-Replies list */}
                {q.replies && q.replies.length > 0 && (
                  <div className="pl-6 border-l border-slate-700 space-y-3">
                    {q.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        <CornerDownRight className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 text-xs">
                              {reply.user.name || 'Anonymous User'}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                              reply.user.role === 'INSTRUCTOR' || reply.user.role === 'ADMIN'
                                ? 'bg-orange-950 text-orange-400 border border-orange-800/50'
                                : 'bg-blue-950 text-blue-400 border border-blue-900/50'
                            }`}>
                              {reply.user.role}
                            </span>
                            <span className="text-slate-500 text-[9px]">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-350 text-xs">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                <div className="pl-6 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reply to this thread..."
                    value={replyInputs[q.id] || ''}
                    onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                    className="flex-1 bg-slate-900/40 border border-slate-750 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    onClick={() => handlePostReply(q.id)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
