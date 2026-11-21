import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { CHAPTER_MAP, HSC_CURRICULUM, PAPER_META } from '../data/curriculum';
import { ChapterProgress, Language, StudySettings } from '../types/study';
import { formatDisplayDate, ScheduleSummary } from '../utils/scheduler';

interface RoadmapOverviewProps {
  settings: StudySettings;
  onUpdateSettings: (patch: Partial<StudySettings>) => void;
  schedule: ScheduleSummary;
  progressMap: Record<string, ChapterProgress>;
  onUpdateProgress: (chapterId: string, patch: Partial<ChapterProgress>) => void;
  onSelectChapter: (chapterId: string) => void;
  onGoToDaily: () => void;
  onResetAll: () => void;
}

export function RoadmapOverview({
  settings,
  onUpdateSettings,
  schedule,
  progressMap,
  onUpdateProgress,
  onSelectChapter,
  onGoToDaily,
  onResetAll,
}: RoadmapOverviewProps) {
  const bn = settings.language === 'bn';

  const totalChapters = HSC_CURRICULUM.length;
  const teacherDoneCount = HSC_CURRICULUM.filter(
    (c) => progressMap[c.id]?.teacherDone || c.id === settings.currentChapterId
  ).length;
  const adaiDoneCount = HSC_CURRICULUM.filter((c) => progressMap[c.id]?.adaiVerified).length;
  const rev1Count = HSC_CURRICULUM.filter((c) => progressMap[c.id]?.revision1Done).length;
  const rev2Count = HSC_CURRICULUM.filter((c) => progressMap[c.id]?.revision2Done).length;

  const scoredTests = HSC_CURRICULUM.map((c) => progressMap[c.id]?.testScore).filter(
    (s): s is number => typeof s === 'number'
  );
  const avgScore =
    scoredTests.length > 0
      ? Math.round((scoredTests.reduce((a, b) => a + b, 0) / scoredTests.length) * 10) / 10
      : null;

  // Find the first incomplete chapter in the sequential queue
  const activeChapter =
    schedule.orderedChapters.find((c) => {
      const p = progressMap[c.id];
      return !p?.teacherDone || !p?.adaiVerified;
    }) || schedule.orderedChapters[0];

  const activeProgress = activeChapter ? progressMap[activeChapter.id] : undefined;
  const activeScheduleDay = activeChapter
    ? schedule.days.find((d) => d.chapterId === activeChapter.id)
    : undefined;

  const setLang = (language: Language) => onUpdateSettings({ language });

  return (
    <div className="space-y-8">
      {/* Title & Language/Reset Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <p className="text-xs font-medium text-slate-500">
            {bn
              ? 'HSC ২০২৭ ব্যাচ · পূর্ণাঙ্গ সিলেবাস (NCTB) · পদার্থবিজ্ঞান ও উচ্চতর গণিত'
              : 'HSC 2027 Batch · Full NCTB Syllabus · Physics & Higher Mathematics'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            {bn
              ? '২ মাসের ধারাবাহিক স্টাডি রোডম্যাপ ও পড়া আদায় সিস্টেম'
              : 'Two-Month Sequential Study Roadmap & Mastery System'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {bn
              ? '২৫ জানুয়ারি মডেল টেস্টের আগে টিচারের তত্ত্বাবধানে ১ বার পূর্ণ সিলেবাস সমাপ্তি, প্রতিদিন বাসায় সেলফ-স্টাডি এবং স্টুডেন্টের ২ বার পূর্ণ রিভিশন নিশ্চিত করার বাস্তবসম্মত পরিকল্পনা।'
              : 'Structured to complete 100% of the NCTB full syllabus sequentially before the January 25 model test, paired with daily home tasks and 2 complete student self-revision cycles.'}
          </p>
        </div>

        <div className="no-print flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                bn ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                !bn ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
          <button
            type="button"
            onClick={onResetAll}
            title={bn ? 'সব অগ্রগতি রিসেট করুন' : 'Reset progress'}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{bn ? 'রিসেট' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Inline Teacher Setup Strip */}
      <section className="no-print bg-white border border-slate-200 rounded-xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {bn ? 'রুটিন শুরুর তারিখ' : 'Routine Start Date'}
            </label>
            <input
              type="date"
              value={settings.startDate}
              max="2027-01-12"
              min="2026-11-20"
              onChange={(e) => e.target.value && onUpdateSettings({ startDate: e.target.value })}
              className="w-full px-3 py-2 text-sm font-mono-tabular bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <p className="mt-1 text-xs text-slate-500">
              {bn ? 'চলমান অধ্যায় শেষ করেই শুরু করুন' : 'Start right after current chapter ends'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {bn ? 'বর্তমানে যে অধ্যায়টি শেষ করছে' : 'Chapter Currently Finishing Now'}
            </label>
            <select
              value={settings.currentChapterId}
              onChange={(e) => onUpdateSettings({ currentChapterId: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="none">
                {bn ? 'কোনোটিই নয় (৪১ অধ্যায় থেকেই শুরু)' : 'None (Start all 41 chapters)'}
              </option>
              {HSC_CURRICULUM.map((c) => (
                <option key={c.id} value={c.id}>
                  {bn
                    ? `${PAPER_META[c.paperId].titleBn} — ${c.chapterNumber}. ${c.titleBn}`
                    : `${PAPER_META[c.paperId].titleEn} — Ch ${c.chapterNumber}. ${c.titleEn}`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {bn
                ? 'এটি প্রি-রুটিন হিসেবে সম্পন্ন ধরা হবে'
                : 'Excluded from remaining queue as pre-completed'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {bn ? 'অধ্যায় পড়ানোর ক্রম' : 'Sequential Teaching Order'}
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateSettings({ orderMode: 'alternating' })}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors truncate ${
                  settings.orderMode === 'alternating'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bn ? '১ ম্যাথ ↔ ১ ফিজিক্স' : 'Alternating'}
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ orderMode: 'paper_block' })}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors truncate ${
                  settings.orderMode === 'paper_block'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {bn ? 'পেপার অনুযায়ী' : 'Paper Block'}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {bn
                ? 'একটি অধ্যায় শেষ হলেই কেবল পরের বিষয়'
                : 'Next subject starts only after 100% completion'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {bn ? 'মডেল টেস্ট ও স্টুডেন্ট নাম' : 'Model Test & Student Name'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.studentName}
                placeholder={bn ? 'স্টুডেন্টের নাম' : 'Student name'}
                onChange={(e) => onUpdateSettings({ studentName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>
            <p className="mt-1 text-xs font-mono-tabular text-slate-500">
              {bn ? 'টার্গেট পরীক্ষা: ২৫ জানু ২০২৭' : 'Target Exam: Jan 25, 2027'}
            </p>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{bn ? 'মোট সময় (মডেল টেস্ট পর্যন্ত)' : 'Total Plan Window'}</span>
            <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900">
            {schedule.totalDays} {bn ? 'দিন' : 'Days'}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {formatDisplayDate(settings.startDate, settings.language)} →{' '}
            {formatDisplayDate(settings.examDate, settings.language)}
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{bn ? 'টিচার সিলেবাস সম্পন্ন' : 'Syllabus Completed'}</span>
            <BookOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900">
            {teacherDoneCount} / {totalChapters}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {bn ? `পড়া আদায় সম্পন্ন: ${adaiDoneCount}টি` : `Adai Verified: ${adaiDoneCount}`}
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{bn ? 'স্টুডেন্ট ২ বার রিভিশন' : 'Student 2x Revisions'}</span>
            <Layers className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900">
            {rev1Count} · {rev2Count}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {bn
              ? `১ম রিভিশন ${rev1Count}/${totalChapters} · ২য় ${rev2Count}/${totalChapters}`
              : `Rev 1: ${rev1Count}/${totalChapters} · Rev 2: ${rev2Count}/${totalChapters}`}
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>{bn ? 'গড় অধ্যায়-টেস্ট নম্বর' : 'Avg Chapter Test'}</span>
            <ClipboardCheck className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono-tabular text-slate-900">
            {avgScore !== null ? `${avgScore} / 35` : '— / 35'}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-mono-tabular">
            {bn
              ? `পাস মার্ক: ২৪ · পরীক্ষা হয়েছে: ${scoredTests.length}টি`
              : `Pass Gate: 24 · Tests Taken: ${scoredTests.length}`}
          </p>
        </div>
      </section>

      {/* Active Sequential Chapter Spotlight */}
      {activeChapter && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-800">
                <span>{bn ? 'বর্তমান সক্রিয় অধ্যায় (একবারে ১টি)' : 'Current Active Chapter (1-at-a-Time Lock)'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {activeScheduleDay
                    ? `${formatDisplayDate(activeScheduleDay.dateIso, settings.language)} (${
                        bn ? activeScheduleDay.weekdayBn : activeScheduleDay.weekdayEn
                      })`
                    : ''}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {bn
                  ? `${PAPER_META[activeChapter.paperId].titleBn} — অধ্যায় ${activeChapter.chapterNumber}: ${activeChapter.titleBn}`
                  : `${PAPER_META[activeChapter.paperId].titleEn} — Ch ${activeChapter.chapterNumber}: ${activeChapter.titleEn}`}
              </h2>
              <p className="text-xs text-slate-500">
                {bn ? activeChapter.nctbBookBn : activeChapter.nctbBookEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onSelectChapter(activeChapter.id)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap"
              >
                {bn ? 'পড়ানোর গাইড ও আদায় খুলুন' : 'Open Teaching & Adai Blueprint'}
              </button>
              <button
                type="button"
                onClick={onGoToDaily}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>{bn ? 'আজকের দৈনিক রুটিন দেখুন' : 'View Daily Schedule'}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500">
                {bn ? 'ক্লাসে যেভাবে পড়াবেন (Below-Average Strategy)' : 'How to Teach (Below-Average Strategy)'}
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {(bn ? activeChapter.teacherStrategyBn : activeChapter.teacherStrategyEn).map((tip, i) => (
                  <li key={i} className="leading-relaxed">
                    {i + 1}. {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500">
                {bn ? 'পড়া আদায় ও প্র্যাকটিস শর্ত' : 'Practice & Adai Verification'}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {bn ? activeChapter.practiceTargetBn : activeChapter.practiceTargetEn}
              </p>
              <ul className="space-y-1 text-xs text-slate-600 pt-1">
                {(bn ? activeChapter.adaiChecklistBn : activeChapter.adaiChecklistEn).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-slate-700">
                {bn ? 'পরবর্তী অধ্যায় আনলক চেকলিস্ট' : 'Completion Gate (Before Next Chapter)'}
              </h3>
              <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!activeProgress?.teacherDone}
                  onChange={(e) =>
                    onUpdateProgress(activeChapter.id, { teacherDone: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                />
                <span>{bn ? 'ক্লাস ও বোর্ড CQ করানো শেষ' : 'Class & Board CQs Completed'}</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!activeProgress?.adaiVerified}
                  onChange={(e) =>
                    onUpdateProgress(activeChapter.id, { adaiVerified: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                />
                <span>{bn ? 'স্টুডেন্ট থেকে পড়া আদায় হয়েছে' : 'Student Oral/Written Adai Verified'}</span>
              </label>
              <div className="pt-1 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-600">
                  {bn ? 'অধ্যায়-টেস্ট নম্বর (/৩৫):' : 'Chapter Test (/35):'}
                </span>
                <input
                  type="number"
                  min={0}
                  max={35}
                  placeholder="0–35"
                  value={activeProgress?.testScore ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.min(35, Math.max(0, Number(e.target.value)));
                    onUpdateProgress(activeChapter.id, { testScore: val });
                  }}
                  className="w-20 px-2.5 py-1 text-sm font-mono-tabular bg-white border border-slate-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3-Phase Two-Month Architecture */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {bn ? '৩-ধাপের পূর্ণাঙ্গ রোডম্যাপ (১x সিলেবাস + ২x রিভিশন)' : '3-Phase Architecture (1x Syllabus + 2x Student Revisions)'}
          </h2>
          <span className="text-xs text-slate-500 font-mono-tabular">
            {bn
              ? `${schedule.orderedChapters.length}টি বাকি অধ্যায় + ১টি প্রি-রুটিন`
              : `${schedule.orderedChapters.length} queued chapters`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium text-blue-800">
              <span>{bn ? 'ধাপ ১ · মূল সিলেবাস সমাপ্তি' : 'Phase 1 · Full Syllabus Mastery'}</span>
              <span className="font-mono-tabular">{schedule.phase1DaysCount} {bn ? 'দিন' : 'd'}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 font-mono-tabular">
              {formatDisplayDate(settings.startDate, settings.language)} →{' '}
              {formatDisplayDate(schedule.phase1EndDate, settings.language)}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {bn
                ? 'টিচার একবারে ১টি অধ্যায় ১০০% শেষ করে (কনসেপ্ট + প্র্যাকটিস + পড়া আদায় + টেস্ট) তবেই পরের বিষয়ে যাবেন। পাশাপাশি স্টুডেন্ট প্রতিদিন রাতে ৪০ মিনিট রোলিং রিভিশন করবে।'
                : 'Teacher finishes 1 chapter completely (concepts + practice + Adai + test) before switching subjects. Student does 40-min daily rolling revision.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-700">
              <span>{bn ? 'ধাপ ২ · রিভিশন ১ ও পেপার মক' : 'Phase 2 · Revision 1 & Paper Mocks'}</span>
              <span className="font-mono-tabular">{schedule.phase2DaysCount} {bn ? 'দিন' : 'd'}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 font-mono-tabular">
              {formatDisplayDate(
                schedule.days[schedule.phase1DaysCount]?.dateIso || schedule.phase1EndDate,
                settings.language
              )}{' '}
              → {formatDisplayDate(schedule.phase2EndDate, settings.language)}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {bn
                ? 'স্টুডেন্টের ১ম পূর্ণাঙ্গ সেলফ-রিভিশন (প্রতি পেপারে ২ দিন)। যেসব অধ্যায়ের টেস্টে নম্বর <২৪ ছিল সেগুলো টিচার মেরামত করবেন এবং ৪টি পেপার-ভিত্তিক মক টেস্ট নেওয়া হবে।'
                : 'Student’s 1st full self-revision (2 days/paper). Teacher repairs weak chapters (<24/35) and conducts 4 paper-level mock tests.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-medium text-amber-700">
              <span>{bn ? 'ধাপ ৩ · রিভিশন ২ (র‍্যাপিড স্প্রিন্ট)' : 'Phase 3 · Revision 2 (Rapid Sprint)'}</span>
              <span className="font-mono-tabular">{schedule.phase3DaysCount} {bn ? 'দিন' : 'd'}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 font-mono-tabular">
              {formatDisplayDate(
                schedule.days[schedule.phase1DaysCount + schedule.phase2DaysCount]?.dateIso ||
                  schedule.phase2EndDate,
                settings.language
              )}{' '}
              → {formatDisplayDate(schedule.phase3EndDate, settings.language)}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {bn
                ? 'স্টুডেন্টের ২য় পূর্ণ রিভিশন: সূত্র খাতা ১৫ মিনিটে ঝালাই, হাই-ইয়েল্ড বোর্ড CQ ও ৫০টি MCQ/দিন অনুশীলন। ২৪ জানুয়ারি হালকা সূত্র রিভিশন করে ২৫ জানুয়ারি মডেল টেস্ট।'
                : 'Student’s 2nd full revision: 15-min/chapter formula scan, top Board CQs & 50 MCQs/day, ending with a calm Jan 24 wrap-up before Jan 25 Model Test.'}
            </p>
          </div>
        </div>
      </section>

      {/* Sequential Queue Preview */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {bn ? 'ধারাবাহিক অধ্যায় সিকোয়েন্স (১ম থেকে শেষ)' : 'Sequential Chapter Queue'}
            </h2>
            <p className="text-xs text-slate-500">
              {bn
                ? 'ক্লিক করে যেকোনো অধ্যায়ের পড়ানোর কৌশল, অনুশীলনী ও টেস্ট দেখুন'
                : 'Click any chapter to open its teaching guide, Adai checklist & test spec'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-mono-tabular">
              {schedule.pairedDaysUsed > 0
                ? bn
                  ? `${schedule.pairedDaysUsed}টি দিনে জোড়া হালকা অধ্যায়`
                  : `${schedule.pairedDaysUsed} paired sprint days`
                : bn
                ? 'কোনো অধ্যায় ওভারল্যাপ নেই'
                : 'Zero chapter overlap'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:gap-px bg-slate-200">
          {schedule.orderedChapters.slice(0, 12).map((ch, idx) => {
            const p = progressMap[ch.id];
            const isDone = p?.teacherDone && p?.adaiVerified;
            const dayInfo = schedule.days.find((d) => d.chapterId === ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChapter(ch.id)}
                className="bg-white hover:bg-slate-50 p-4 text-left transition-colors flex flex-col justify-between gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-mono-tabular">
                    #{String(idx + 1).padStart(2, '0')} ·{' '}
                    {bn ? PAPER_META[ch.paperId].titleBn : PAPER_META[ch.paperId].titleEn}
                  </span>
                  <span className="font-mono-tabular">
                    {dayInfo ? formatDisplayDate(dayInfo.dateIso, settings.language) : ''}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {bn ? `${ch.chapterNumber}. ${ch.titleBn}` : `Ch ${ch.chapterNumber}. ${ch.titleEn}`}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={isDone ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                    {isDone
                      ? bn
                        ? '✓ সম্পন্ন ও আদায়কৃত'
                        : '✓ Done & Verified'
                      : ch.subject === 'physics'
                      ? bn
                        ? 'পদার্থবিজ্ঞান'
                        : 'Physics'
                      : bn
                      ? 'উচ্চতর গণিত'
                      : 'Higher Math'}
                  </span>
                  <span className="font-mono-tabular text-slate-500">
                    {p?.testScore !== null && p?.testScore !== undefined
                      ? `${p.testScore}/35`
                      : ch.defaultDays === 2
                      ? bn
                        ? 'ভারী অধ্যায়'
                        : 'Heavy'
                      : bn
                      ? 'স্ট্যান্ডার্ড'
                      : 'Standard'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
