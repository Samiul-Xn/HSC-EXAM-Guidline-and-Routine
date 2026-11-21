import { Printer } from 'lucide-react';
import { Language } from '../types/study';

export type ActiveTab = 'roadmap' | 'daily' | 'chapters' | 'guide';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
  onPrint: () => void;
}

export function Header({ activeTab, onTabChange, language, onPrint }: HeaderProps) {
  const navItems: { id: ActiveTab; labelBn: string; labelEn: string }[] = [
    { id: 'roadmap', labelBn: 'রোডম্যাপ', labelEn: 'Roadmap' },
    { id: 'daily', labelBn: 'দৈনিক রুটিন', labelEn: 'Daily Plan' },
    { id: 'chapters', labelBn: '৪১ অধ্যায়', labelEn: '41 Chapters' },
    { id: 'guide', labelBn: 'পড়ানোর নিয়ম', labelEn: 'Method & Routine' },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => onTabChange('roadmap')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 rounded-sm"
        >
          {language === 'bn' ? "HSC '২৭ স্টাডি প্ল্যান" : "HSC '27 Study Plan"}
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
                  isActive
                    ? 'border-blue-800 text-blue-900 font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {language === 'bn' ? item.labelBn : item.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'bn' ? 'রুটিন প্রিন্ট' : 'Print Routine'}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <nav className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 bg-white">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`py-2.5 px-2 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 ${
                isActive
                  ? 'border-blue-800 text-blue-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {language === 'bn' ? item.labelBn : item.labelEn}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
