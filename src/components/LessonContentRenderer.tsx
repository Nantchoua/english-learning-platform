'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Volume2, PlayCircle, Film, Sparkles, MessageSquareQuote } from 'lucide-react';

interface LessonContentRendererProps {
  content: string;
}

export default function LessonContentRenderer({ content }: LessonContentRendererProps) {
  return (
    <div className="lesson-markdown-content text-slate-200 leading-relaxed space-y-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-black text-white mt-8 mb-4 border-b border-slate-700/80 pb-2 flex items-center gap-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-extrabold text-emerald-400 mt-6 mb-3 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-sky-400 mt-5 mb-2 flex items-center gap-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-4" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-white" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="text-amber-300 italic font-mono text-sm" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 my-3 pl-2 text-slate-300 text-sm md:text-base" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 my-3 pl-2 text-slate-300 text-sm md:text-base" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ children }) => (
            <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border-l-4 border-emerald-500 text-emerald-200 text-sm md:text-base font-medium shadow-xs flex gap-3">
              <MessageSquareQuote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">{children}</div>
            </div>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-slate-700/80 shadow-md bg-slate-900/60">
              <table className="w-full text-left text-xs md:text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-800 text-slate-200 font-bold border-b border-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="py-3 px-4 font-bold text-slate-200 tracking-wide uppercase text-[11px]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="py-2.5 px-4 border-b border-slate-800/80 text-slate-300 font-medium" {...props} />
          ),
          hr: () => (
            <hr className="my-6 border-slate-700/60" />
          ),
          audio: ({ node, ...props }) => (
            <span className="block my-4 p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md">
              <span className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Volume2 className="w-4 h-4" /> Listen & Repeat Audio Track
              </span>
              <audio controls className="w-full h-10 rounded-lg accent-emerald-500" {...props} />
            </span>
          ),
          video: () => null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
