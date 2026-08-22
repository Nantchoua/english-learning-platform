import { CheckCircle, PlayCircle, FileText } from 'lucide-react';

export default function CoursePlayer() {
  return (
    <div className="flex h-screen bg-white">
      <main className="flex-1 flex flex-col overflow-y-auto border-r border-slate-200">
        <div className="w-full bg-black aspect-video flex items-center justify-center relative">
          <PlayCircle className="w-20 h-20 text-white/50 absolute" />
          <p className="text-white">Video Player (e.g. Mux, YouTube, AWS S3)</p>
        </div>
        
        <div className="max-w-4xl w-full mx-auto p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Lesson 1: Present Perfect vs Past Simple</h1>
          <div className="prose prose-slate max-w-none">
            <p>In this lesson, we will cover the distinct differences between...</p>
          </div>
          
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between">
            <button className="px-4 py-2 border border-slate-300 rounded font-medium text-slate-700 hover:bg-slate-50">Previous</button>
            <button className="px-4 py-2 bg-[#0056D2] text-white rounded font-medium hover:bg-blue-700 flex items-center">
              Mark as Complete <CheckCircle className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <aside className="w-80 bg-slate-50 hidden lg:flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="font-bold text-slate-800">Course Content</h2>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
             <div className="bg-[#0056D2] h-full" style={{ width: '25%' }}></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">25% Complete</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-slate-200">
            <button className="w-full text-left p-4 bg-slate-100 font-semibold text-slate-800 flex justify-between items-center">
              Module 1: Grammar Foundations
            </button>
            <div className="flex flex-col">
              <button className="w-full text-left p-4 pl-8 bg-white hover:bg-slate-50 flex items-start border-l-4 border-[#0056D2]">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">1. Present Perfect vs Past Simple</p>
                  <span className="text-xs text-slate-500 flex items-center mt-1"><PlayCircle className="w-3 h-3 mr-1"/> 12 min</span>
                </div>
              </button>
              <button className="w-full text-left p-4 pl-8 bg-white hover:bg-slate-50 flex items-start border-l-4 border-transparent">
                <div className="w-5 h-5 border-2 border-slate-300 rounded-full mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">2. Conditionals Mastery</p>
                  <span className="text-xs text-slate-500 flex items-center mt-1"><FileText className="w-3 h-3 mr-1"/> Reading</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
