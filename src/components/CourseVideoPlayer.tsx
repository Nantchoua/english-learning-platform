'use client';

import React, { useState } from 'react';
import { Film, Play } from 'lucide-react';

interface CourseVideoPlayerProps {
  videoUrl: string;
  lessonTitle: string;
}

interface VideoPart {
  title: string;
  url: string;
}

export default function CourseVideoPlayer({ videoUrl, lessonTitle }: CourseVideoPlayerProps) {
  let videoList: VideoPart[] = [];

  try {
    const trimmed = videoUrl.trim();
    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      videoList = parsed.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { title: `Part ${idx + 1}`, url: item };
        }
        return {
          title: item.title || `Part ${idx + 1}`,
          url: item.url,
        };
      });
    } else if (trimmed.includes(',')) {
      videoList = trimmed.split(',').map((url, idx) => ({
        title: `Part ${idx + 1}`,
        url: url.trim(),
      }));
    } else {
      videoList = [{ title: 'Main Video', url: trimmed }];
    }
  } catch {
    videoList = [{ title: 'Main Video', url: videoUrl.trim() }];
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const currentVideo = videoList[activeIndex] || videoList[0];

  if (!currentVideo || !currentVideo.url) {
    return null;
  }

  return (
    <div className="w-full bg-black flex flex-col border-b border-slate-800">
      {/* Video Viewport */}
      <div className="aspect-video w-full bg-black flex items-center justify-center">
        <video
          key={currentVideo.url}
          src={currentVideo.url}
          controls
          className="w-full h-full"
          playsInline
        />
      </div>

      {/* Multi-Part Playlist Switcher */}
      {videoList.length > 1 && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider shrink-0 mr-2">
            <Film className="w-4 h-4" />
            <span>Video Parts ({videoList.length}):</span>
          </div>
          <div className="flex items-center gap-2">
            {videoList.map((part, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={`${part.url}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Play className={`w-3 h-3 ${isActive ? 'fill-white' : ''}`} />
                  <span>{part.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
