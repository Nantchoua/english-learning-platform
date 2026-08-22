'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#0056D2] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer shadow"
    >
      <Printer className="w-4 h-4" /> Print Certificate
    </button>
  );
}
