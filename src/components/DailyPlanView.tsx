import { useMemo, useState } from 'react';
import { BookOpen, CheckSquare, ClipboardList, Search } from 'lucide-react';
import { CHAPTER_MAP } from '../data/curriculum';
import {
  ChapterProgress,
  DayTaskProgress,
  Language,
  SchedulePhase,
  ScheduledDay,
} from '../types/study';
import { formatDisplayDate } from '../utils/scheduler';

interface DailyPlanViewProps {
  days: ScheduledDay[];
  language: Language;
  dayProgress: Record<string, DayTaskProgress>;
  onUpdateDayProgress: (dateIso: string, patch: Partial<DayTaskProgress>) => void;
  chapterProgress: Record<string, ChapterProgress>;
  onUpdateChapterProgress: (chapterId: string, patch: Partial<ChapterProgress>) => void;
  onSelectChapter: (chapterId: string) => void;
}

export function DailyPlanView({
  days,
  language,
  dayProgress,
  onUpdateDayProgress,
  chapterProgress,
  onUpdateChapterProgress,
  onSelectChapter,
}: DailyPlanViewProps) {
  const bn = language === 'bn';
  const [phaseFilter, setPhaseFilter] = useState<'all' | SchedulePhase>('all');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'physics' | 'math'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDays = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return days.filter((d) => {
      if (phaseFilter !== 'all' && d.phase !== phaseFilter) return false;
      if (subjectFilter !== 'all') {
        const ch = d.chapterId ? CHAPTER_MAP[d.chapterId] : null;
        if (ch && ch.subject !== subjectFilter) return false;
        if (!ch && d.paperFocus) {
          const isPhy = d.paperFocus.startsWith('phy');
          if (subjectFilter === 'physics' && !isPhy) return false;
          if (subjectFilter === 'math' && isPhy) return false;
        }
      }
      if (q) {
        const hay = `${d.titleBn} ${d.titleEn} ${d.dateIso} ${d.teacherTaskBn} ${d.teacherTaskEn}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [days, phaseFilter, subjectFilter, searchQuery]);

  const phaseLabel = (phase: SchedulePhase) => {
    switch (phase) {
      case 'phase1_syllabus':
        return bn ? 'ধাপ ১: মূল সিলেবাস' : 'Phase 1: Syllabus';
      case 'phase2_rev1':
        return bn ? 'ধাপ ২: রিভিশন ১ ও মক' : 'Phase 2: Revision 1';
      case 'phase3_rev2':
        return bn ? 'ধাপ ৩: রিভিশন ২ স্প্রিন্ট' : 'Phase 3: Revision 2';
      case 'exam_day':
        return bn ? 'মডেল টেস্ট দিবস' : 'Model Test Day';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {bn ? 'দৈনিক ক্লাস ও বাসার পড়া রুটিন' : 'Daily Class & Home Self-Study Schedule'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {bn
              ? 'প্রতিদিন টিচার কী পড়াবেন, স্টুডেন্ট বাসায় কী করবে, এবং অধ্যায় শেষে কীভাবে পড়া আদায় ও টেস্ট হবে তার পূর্ণ তালিকা।'
              : 'Day-by-day execution calendar covering Teacher Class, Home Self-Study, Rolling Revision, Adai checks & Chapter Tests.'}
          </p>
        </div>

        <div className="text-xs font-mono-tabular text-slate-500">
          {bn
            ? `মোট প্রদর্শিত দিন: ${filteredDays.length} / ${days.length}`
            : `Showing ${filteredDays.length} of ${days.length} days`}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="no-print bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(
              [
                { id: 'all', bn: 'সব দিন', en: 'All Days' },
                { id: 'phase1_syllabus', bn: 'ধাপ ১: সিলেবাস', en: 'Phase 1' },
                { id: 'phase2_rev1', bn: 'ধাপ ২: রিভিশন ১', en: 'Rev 1' },
                { id: 'phase3_rev2', bn: 'ধাপ ৩: রিভিশন ২', en: 'Rev 2' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPhaseFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  phaseFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bn ? tab.bn : tab.en}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(
              [
                { id: 'all', bn: 'সব বিষয়', en: 'All Subjects' },
                { id: 'physics', bn: 'পদার্থবিজ্ঞান', en: 'Physics' },
                { id: 'math', bn: 'উচ্চতর গণিত', en: 'Higher Math' },
              ] as const
            ).map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubjectFilter(sub.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  subjectFilter === sub.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bn ? sub.bn : sub.en}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-64">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={bn ? 'অধ্যায় বা তারিখ খুঁজুন...' : 'Search chapter or date...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
        </div>
      </div>

      {/* Day List */}
      {filteredDays.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {bn ? 'কোনো দিনের তথ্য পাওয়া যায়নি' : 'No scheduled days match your filters'}
          </p>
          <button
            type="button"
            onClick={() => {
              setPhaseFilter('all');
              setSubjectFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-semibold text-blue-800 hover:underline"
          >
            {bn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDays.map((day) => {
            const dp = dayProgress[day.dateIso] || {
              teacherSessionDone: false,
              homeStudyDone: false,
              adaiChecked: false,
            };
            const ch = day.chapterId ? CHAPTER_MAP[day.chapterId] : null;
            const chProg = ch ? chapterProgress[ch.id] : undefined;
            const bothDone = dp.teacherSessionDone && dp.homeStudyDone;

            return (
              <article
                key={day.dateIso}
                className={`print-break-inside-avoid bg-white border rounded-xl p-5 transition-colors ${
                  day.phase === 'exam_day'
                    ? 'border-blue-700'
                    : bothDone
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono-tabular">
                      <span className="font-semibold text-slate-900">
                        {bn ? `দিন ${String(day.dayIndex).padStart(2, '0')}` : `Day ${String(day.dayIndex).padStart(2, '0')}`}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatDisplayDate(day.dateIso, language)} ({bn ? day.weekdayBn : day.weekdayEn})
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          day.phase === 'phase1_syllabus'
                            ? 'text-blue-800 font-medium'
                            : day.phase === 'phase2_rev1'
                            ? 'text-emerald-700 font-medium'
                            : day.phase === 'phase3_rev2'
                            ? 'text-amber-700 font-medium'
                            : 'text-blue-900 font-bold'
                        }
                      >
                        {phaseLabel(day.phase)}
                      </span>
                      {bothDone && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-semibold">
                            {bn ? '✓ আজকের কাজ সম্পন্ন' : '✓ Day Completed'}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {bn ? day.titleBn : day.titleEn}
                    </h3>
                  </div>

                  {ch && (
                    <button
                      type="button"
                      onClick={() => onSelectChapter(ch.id)}
                      className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{bn ? 'অধ্যায় গাইড ও আদায়' : 'Chapter Blueprint'}</span>
                    </button>
                  )}
                </div>

                {/* Two-Column Class vs Home Self-Study */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{bn ? 'টিচার সেশন ও প্র্যাকটিস-টেস্ট' : 'Teacher Class, Practice & Test'}</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {bn ? day.teacherTaskBn : day.teacherTaskEn}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      {bn ? day.practiceAndTestBn : day.practiceAndTestEn}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{bn ? 'ক্লাসের পর বাসায় স্টুডেন্ট যা পড়বে' : 'Student Home Self-Study'}</span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {(bn ? day.studentHomeTaskBn : day.studentHomeTaskEn).map((task, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {idx + 1}. {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Checkboxes */}
                <div className="no-print mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-5">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dp.teacherSessionDone}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          onUpdateDayProgress(day.dateIso, { teacherSessionDone: checked });
                          if (ch && day.isChapterEndDay) {
                            onUpdateChapterProgress(ch.id, { teacherDone: checked });
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                      />
                      <span>{bn ? 'টিচার ক্লাস সম্পন্ন' : 'Teacher Class Done'}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dp.homeStudyDone}
                        onChange={(e) =>
                          onUpdateDayProgress(day.dateIso, { homeStudyDone: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                      />
                      <span>{bn ? 'বাসার পড়া সম্পন্ন' : 'Home Study Done'}</span>
                    </label>

                    {ch && day.isChapterEndDay && (
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!chProg?.adaiVerified}
                          onChange={(e) =>
                            onUpdateChapterProgress(ch.id, { adaiVerified: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                        />
                        <span>{bn ? 'পড়া আদায় যাচাইকৃত' : 'Adai Verified'}</span>
                      </label>
                    )}
                  </div>

                  {ch && day.isChapterEndDay && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {bn ? 'অধ্যায় টেস্ট (/৩৫):' : 'Test (/35):'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={35}
                        placeholder="—"
                        value={chProg?.testScore ?? ''}
                        onChange={(e) => {
                          const val =
                            e.target.value === ''
                              ? null
                              : Math.min(35, Math.max(0, Number(e.target.value)));
                          onUpdateChapterProgress(ch.id, { testScore: val });
                        }}
                        className="w-16 px-2 py-1 text-xs font-mono-tabular text-right bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
