import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-16 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <span className="bg-emerald-100 text-emerald-850 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Our Philosophy
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Speaking First.<br />Fluency Guaranteed.
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            We believe language learning is about human connection. At Speaking Express, we bypass rote drills to focus on speaking competency from day one.
          </p>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">Why Speaking Express?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Standard curriculums focus extensively on reading and passive writing. We design interactive dialogues, real-life conversation simulations, and vocabulary blueprints to get students speaking confidently in professional environments.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-3 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">Meet Your Instructor</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Principal Nantchoua
            </p>
            <p className="text-sm text-slate-450 leading-relaxed">
              With years of experience guiding corporate professionals and language students, Principal Nantchoua structures curriculums tailored around the CEFR levels (A1 through C2) to ensure rapid fluency milestones.
            </p>
          </div>
        </div>

        {/* CTA block */}
        <div className="bg-emerald-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-white/5 skew-x-12 pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to master English?</h2>
          <p className="text-emerald-100 text-sm max-w-md mx-auto leading-relaxed">
            Join thousands of successful professionals speaking fluent English inside our premium modules.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl text-sm transition hover:bg-slate-100 shadow">
              Explore Courses
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
