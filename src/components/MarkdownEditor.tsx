'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Heading1, Heading2, Heading3, List, ListOrdered,
  Code, Quote, Table, Sparkles, Eye, Edit3, Link2, HelpCircle,
  Check, Copy, BookOpen
} from 'lucide-react';

interface MarkdownEditorProps {
  initialContent: string;
  lessonId: string;
  lessonTitle: string;
}

export default function MarkdownEditor({
  initialContent,
  lessonId,
  lessonTitle,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(initialContent || '');
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('write');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Statistics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 180));

  // Helper to insert markdown at cursor position
  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultText;
    const replacement = before + selected + after;

    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + before.length + selected.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  // Quick speaking lesson templates
  const insertSpeakingTemplate = () => {
    const template = `### 1. Lesson Objectives
- **CEFR Level:** B1 / Intermediate
- **Goal:** Master natural conversational phrases and sentence patterns.

---

### 2. Target Vocabulary
| Phrase / Word | Part of Speech | Pronunciation | Context Meaning | Example Sentence |
|---|---|---|---|---|
| **Break the ice** | Phrase | /breɪk ðə aɪs/ | Relieve initial tension | "I brought coffee to break the ice." |
| **Common ground** | Noun | /ˈkɑː.mən ɡraʊnd/ | Shared interests | "We found common ground discussing music." |

---

### 3. Grammar & Sentence Blueprints
- **Pattern:** Subject + Verb + Gerund (-ing)
- **Example:** *I look forward to meeting you.*
- ❌ **Common Error:** *I look forward to meet you.* (Always use -ing after "look forward to")

---

### 4. Speaking Dialogue & Roleplay
- **Speaker A:** "Hi there! How was your weekend?"
- **Speaker B:** "It was great! I spent Saturday exploring the new art gallery in town. How about you?"
- **Speaker A:** "Sounds lovely! I stayed home and caught up on reading."

#### Practice Prompt:
*Practice this dialogue out loud, paying attention to rhythm and intonation.*
`;
    setContent((prev) => (prev ? prev + '\n\n' + template : template));
  };

  const insertTableTemplate = () => {
    insertText(
      '| Vocabulary | Meaning | Example |\n|---|---|---|\n| Term 1 | Definition | "Example sentence" |\n| Term 2 | Definition | "Example sentence" |\n',
      ''
    );
  };

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('lessonId', lessonId);
      formData.append('content', content);

      const res = await fetch('/api/instructor/update-lesson', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save lesson content:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert basic markdown to safe HTML for instant live preview
  const renderPreview = (md: string) => {
    if (!md.trim()) {
      return (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nothing to preview yet. Start typing your lesson content!</p>
        </div>
      );
    }

    // Process basic markdown blocks
    let html = md
      // Escape angle brackets
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 mt-8 mb-3 pb-1 border-b border-slate-200">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 mt-8 mb-4">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-slate-700">$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[#0056D2] bg-blue-50/50 pl-4 py-2 my-3 text-slate-700 italic">$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-lg my-4 text-xs font-mono overflow-x-auto"><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      // Horizontal Rule
      .replace(/^---$/gim, '<hr class="my-6 border-slate-200" />')
      // Line breaks to paragraphs
      .replace(/\n\n/gim, '</p><p class="my-3 text-slate-700 leading-relaxed text-sm">');

    // Table formatting helper
    if (html.includes('|')) {
      const lines = html.split('\n');
      let inTable = false;
      let tableHtml = '';
      const processedLines = [];

      for (let line of lines) {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          if (!inTable) {
            inTable = true;
            tableHtml = '<div class="overflow-x-auto my-4"><table class="min-w-full border border-slate-200 divide-y divide-slate-200 text-xs">';
          }
          const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (line.includes('---')) {
            // divider row, skip
            continue;
          }
          const isHeader = !tableHtml.includes('<tbody>');
          if (isHeader) {
            tableHtml += '<thead class="bg-slate-100 font-semibold text-slate-800"><tr>';
            cells.forEach(c => tableHtml += `<th class="px-3 py-2 text-left border-r border-slate-200">${c.trim()}</th>`);
            tableHtml += '</tr></thead><tbody>';
          } else {
            tableHtml += '<tr class="hover:bg-slate-50 border-t border-slate-100">';
            cells.forEach(c => tableHtml += `<td class="px-3 py-2 text-slate-700 border-r border-slate-200">${c.trim()}</td>`);
            tableHtml += '</tr>';
          }
        } else {
          if (inTable) {
            inTable = false;
            tableHtml += '</tbody></table></div>';
            processedLines.push(tableHtml);
            tableHtml = '';
          }
          processedLines.push(line);
        }
      }
      if (inTable) {
        tableHtml += '</tbody></table></div>';
        processedLines.push(tableHtml);
      }
      html = processedLines.join('\n');
    }

    return (
      <div
        className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Editor Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'write'
                ? 'bg-[#0056D2] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-[#0056D2] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'split'
                ? 'bg-[#0056D2] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Side-by-Side
          </button>
        </div>

        {/* Action Button & Status */}
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Content Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleQuickSave}
            disabled={isSubmitting}
            className="bg-[#0056D2] hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Save Lesson Content'}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      {activeTab !== 'preview' && (
        <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-slate-100/70 border-b border-slate-200 text-slate-600">
          <button
            type="button"
            onClick={() => insertText('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertText('# ', '', 'Heading 1')}
            title="Heading 1"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('## ', '', 'Heading 2')}
            title="Heading 2"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('### ', '', 'Heading 3')}
            title="Heading 3"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertText('- ', '', 'Bullet item')}
            title="Bullet List"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('1. ', '', 'Numbered item')}
            title="Numbered List"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('> ', '', 'Quote note')}
            title="Quote"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`', 'code')}
            title="Inline Code"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={insertTableTemplate}
            title="Insert Vocabulary Table"
            className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
          >
            <Table className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-300 mx-1" />

          {/* Quick Speaking Lesson Template Inserter */}
          <button
            type="button"
            onClick={insertSpeakingTemplate}
            className="flex items-center gap-1 px-2 py-1 bg-[#0056D2]/10 hover:bg-[#0056D2]/20 text-[#0056D2] rounded text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Speaking Lesson Template
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="p-4 flex-1">
        {activeTab === 'write' && (
          <textarea
            ref={textareaRef}
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            placeholder={`Type your lesson content in Markdown...\n\n# Introduction\nWelcome students to this lesson.\n\n### Vocabulary\n- Word 1: Definition\n- Word 2: Definition`}
            className="w-full border border-slate-200 rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none resize-y text-slate-900 leading-relaxed bg-white"
          />
        )}

        {activeTab === 'preview' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[380px] max-h-[600px] overflow-y-auto">
            {renderPreview(content)}
          </div>
        )}

        {activeTab === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Markdown Input</span>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={18}
                placeholder="Write markdown here..."
                className="w-full border border-slate-200 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none resize-y text-slate-900 leading-relaxed bg-white"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Live Student Render</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-[380px] max-h-[450px] overflow-y-auto">
                {renderPreview(content)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Statistics */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span><strong>{wordCount}</strong> words</span>
          <span><strong>{charCount}</strong> characters</span>
          <span>~<strong>{estimatedReadTime}</strong> min reading time</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Markdown styling supported (bold, italics, tables, lists, code)
        </div>
      </div>
    </div>
  );
}
