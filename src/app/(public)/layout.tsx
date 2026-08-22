import Navbar from '@/components/Navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-600">EnglishPro</span>
            <a href="/" className="hover:text-[#0056D2] transition">Courses</a>
            <a href="/dashboard" className="hover:text-[#0056D2] transition">My Learning</a>
          </div>
          <p>© {new Date().getFullYear()} EnglishPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
