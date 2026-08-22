'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Search, X } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  instructor: { name: string | null };
  _count: { enrollments: number; modules: number };
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const LEVEL_LABELS: Record<string, string> = {
  A1: 'A1 Beginner',
  A2: 'A2 Elementary',
  B1: 'B1 Intermediate',
  B2: 'B2 Upper-Int.',
  C1: 'C1 Advanced',
  C2: 'C2 Proficient',
};

export default function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesLevel = !activeLevel || c.level === activeLevel;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.instructor.name ?? '').toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [courses, query, activeLevel]);

  return (
    <section id="courses" className="max-w-6xl mx-auto py-16 px-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">All Courses</h2>
        <p className="text-slate-500 mt-1">Pick the level that suits you best</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, instructors…"
            className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0056D2] focus:border-[#0056D2] outline-none transition bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveLevel(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
              !activeLevel
                ? 'bg-[#0056D2] text-white border-[#0056D2]'
                : 'bg-white text-slate-600 border-slate-300 hover:border-[#0056D2] hover:text-[#0056D2]'
            }`}
          >
            All levels
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(activeLevel === lvl ? null : lvl)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                activeLevel === lvl
                  ? 'bg-[#0056D2] text-white border-[#0056D2]'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-[#0056D2] hover:text-[#0056D2]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {(query || activeLevel) && (
        <p className="text-sm text-slate-500 mb-5">
          {filtered.length === 0
            ? 'No courses match your search.'
            : `${filtered.length} course${filtered.length === 1 ? '' : 's'} found`}
          {activeLevel && <span className="ml-1">in <strong>{LEVEL_LABELS[activeLevel]}</strong></span>}
          {query && <span className="ml-1">for <strong>"{query}"</strong></span>}
          {' · '}
          <button
            onClick={() => { setQuery(''); setActiveLevel(null); }}
            className="text-[#0056D2] hover:underline"
          >
            Clear filters
          </button>
        </p>
      )}

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No published courses yet. Check back soon!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium text-slate-600 mb-1">No courses found</p>
          <p className="text-sm">Try a different search term or level.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <Link
              href={`/courses/${course.slug}`}
              key={course.id}
              className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <BookOpen className="w-14 h-14 text-[#0056D2] opacity-40 group-hover:opacity-60 transition" />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#0056D2] bg-blue-50 px-2 py-1 rounded-full uppercase">
                    {course.level}
                  </span>
                  <span className="text-xs text-slate-400">{course._count.modules} modules</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-[#0056D2] transition">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="text-slate-500">{course.instructor.name}</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Users className="w-4 h-4" /> {course._count.enrollments}
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <span className="text-sm font-semibold text-[#0056D2] group-hover:underline">
                  View Course →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
