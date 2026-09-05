'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UnitData, LessonNodeData } from './types';
import UnitBanner from './UnitBanner';
import PathNode from './PathNode';
import { Play, Sparkles, X, Clock, Video, BookOpen, Award, CheckCircle } from 'lucide-react';

interface LearningPathProps {
  units: UnitData[];
  courseSlug: string;
  courseTitle: string;
}

// Sinusoidal horizontal offset sequence for snake layout
const NODE_OFFSETS = [0, -45, 45, -55, 0, 55, -45, 45];

export default function LearningPath({ units, courseSlug, courseTitle }: LearningPathProps) {
  const [selectedLesson, setSelectedLesson] = useState<LessonNodeData | null>(null);

  return (
    <div className="relative w-full max-w-2xl mx-auto py-6">
      {units.map((unit, unitIdx) => (
        <section key={unit.id} className="mb-12 relative">
          {/* Unit Header Banner */}
          <UnitBanner
            unit={unit}
            unitIndex={unitIdx}
            totalUnits={units.length}
          />

          {/* Stepping Stones Path Container */}
          <div className="relative flex flex-col items-center pt-4 pb-8">
            {unit.lessons.map((lesson, lessonIdx) => {
              const offset = NODE_OFFSETS[lessonIdx % NODE_OFFSETS.length];
              const isLastInUnit = lessonIdx === unit.lessons.length - 1;

              return (
                <div key={lesson.id} className="relative w-full flex justify-center">
                  <PathNode
                    lesson={lesson}
                    offsetPercentage={offset}
                    unitTheme={unit.colorTheme}
                    isLastInUnit={isLastInUnit}
                    onSelectNode={(l) => setSelectedLesson(l)}
                    isSelected={selectedLesson?.id === lesson.id}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* Interactive Modal / Popover when clicking a lesson node */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedLesson(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
              {selectedLesson.status === 'COMPLETED' ? (
                <CheckCircle className="w-8 h-8 text-emerald-500 stroke-[2.5]" />
              ) : (
                <Sparkles className="w-8 h-8 fill-amber-500 text-amber-600" />
              )}
            </div>

            <div className="text-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Lesson • {selectedLesson.type}
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2">
                {selectedLesson.title}
              </h3>
              {selectedLesson.description && (
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  {selectedLesson.description}
                </p>
              )}

              {/* Meta details (XP reward & duration) */}
              <div className="flex items-center justify-center gap-4 py-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <span className="text-base">⚡</span>
                  <span>+{selectedLesson.xpReward} XP Reward</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>~{selectedLesson.durationMinutes} min</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/courses/${courseSlug}/learn/${selectedLesson.id}`}
                  className="w-full bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black text-lg py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition duration-150"
                >

                  <Play className="w-5 h-5 fill-white" />
                  {selectedLesson.status === 'COMPLETED' ? 'PRACTICE AGAIN' : 'START LESSON'}
                </Link>

                <button
                  type="button"
                  onClick={() => setSelectedLesson(null)}
                  className="w-full py-2.5 text-slate-400 hover:text-slate-600 font-bold text-sm transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
