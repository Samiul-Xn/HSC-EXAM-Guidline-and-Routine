import { useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, RotateCcw } from 'lucide-react';
import { CHAPTER_MAP, HSC_CURRICULUM, PAPER_META } from '../data/curriculum';
import { ChapterData, ChapterProgress, Language, PaperId } from '../types/study';
import { formatDisplayDate, ScheduleSummary } from '../utils/scheduler';

interface SyllabusTrackerProps {
  language: Language;
  currentChapterId: string;
  schedule: ScheduleSummary;
  progressMap: Record<string, ChapterProgress>;
  onUpdateProgress: (chapterId: string, patch: Partial<ChapterProgress>) => void;
  onSelectChapter: (chapterId: string) => void;
  onMoveChapter: (chapterId: string, direction: 'up' | 'down') => void;
  onResetOrder: () => void;
  hasCustomOrder: boolean;
}

export function SyllabusTracker({
  language,
  currentChapterId,
  schedule,
  progressMap,
  onUpdateProgress,
  onSelectChapter,
  onMoveChapter,
  onResetOrder,
  hasCustomOrder,
}: SyllabusTrackerProps) {
  const bn = language === 'bn';
  const [viewMode, setViewMode] = useState<'by_paper' | 'queue'>('by_paper');
  const [selectedPaper, setSelectedPaper] = useState<'all' | PaperId>('all');

  const papers: PaperId[] = ['phy1', 'phy2', 'math1', 'math2'];

  const renderStatusText = (ch: ChapterData) => {
    if (ch.id === currentChapterId) {
      return (
        <span className="text-xs font-semibold text-blue-800">
          {bn ? '● প্রি-রুটিন (চলমান)' : '● Finishing Now'}
        </span>
      );
    }
    const p = progressMap[ch.id];
    if (typeof p?.testScore === 'number' && p.testScore < 24) {
      return (
        <span className="text-xs font-semibold text-rose-700">
          {bn ? '▲ রিটেক প্রয়োজন (<২৪)' : '▲ Retake (<24)'}
        </span>
      );
    }
    if (p?.teacherDone && p?.adaiVerified) {
      return (
        <span className="text-xs font-semibold text-emerald-700">
          {bn ? '✓ সম্পন্ন' : '✓ Mastered'}
        </span>
      );
    }
    if (p?.teacherDone) {
      return (
        <span className="text-xs font-medium text-amber-700">
          {bn ? '◐ আদায় বাকি' : '◐ Adai Pending'}
        </span>
      );
    }
    return <span className="text-xs text-slate-400">{bn ? 'অপেক্ষমাণ' : 'Queued'}</span>;
  };

  const renderChapterRow = (ch: ChapterData, idxInList: number, allowReorder: boolean) => {
    const p = progressMap[ch.id] || {
      teacherDone: false,
      adaiVerified: false,
      revision1Done: false,
      revision2Done: false,
      testScore: null,
      notes: '',
    };
    const dayEntry = schedule.days.find((d) => d.chapterId === ch.id);

    return (
      <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
        <td className="py-3 px-4 text-xs font-mono-tabular text-slate-500 whitespace-nowrap">
          {allowReorder ? `#${String(idxInList + 1).padStart(2, '0')}` : `${ch.chapterNumber}.`}
        </td>
        <td className="py-3 px-4 min-w-[220px]">
          <button
            type="button"
            onClick={() => onSelectChapter(ch.id)}
            className="text-left group focus:outline-none"
          >
            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-800 transition-colors">
              {bn ? ch.titleBn : ch.titleEn}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {bn ? PAPER_META[ch.paperId].titleBn : PAPER_META[ch.paperId].titleEn}
              <span aria-hidden="true"> · </span>
              {ch.boardPriority === 'Very High'
                ? bn
                  ? 'অতি গুরুত্বপূর্ণ'
                  : 'Very High Yield'
                : ch.boardPriority === 'High'
                ? bn
                  ? 'গুরুত্বপূর্ণ'
                  : 'High Yield'
                : bn
                ? 'স্ট্যান্ডার্ড'
                : 'Standard'}
              {dayEntry && (
                <>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono-tabular">
                    {formatDisplayDate(dayEntry.dateIso, language)}
                  </span>
                </>
              )}
            </p>
          </button>
        </td>
        <td className="py-3 px-3 whitespace-nowrap">{renderStatusText(ch)}</td>
        <td className="py-3 px-3 text-center">
          <input
            type="checkbox"
            aria-label={`Teacher done ${ch.titleEn}`}
            checked={p.teacherDone || ch.id === currentChapterId}
            disabled={ch.id === currentChapterId}
            onChange={(e) => onUpdateProgress(ch.id, { teacherDone: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
          />
        </td>
        <td className="py-3 px-3 text-center">
          <input
            type="checkbox"
            aria-label={`Adai verified ${ch.titleEn}`}
            checked={p.adaiVerified}
            onChange={(e) => onUpdateProgress(ch.id, { adaiVerified: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
          />
        </td>
        <td className="py-3 px-3 text-center">
          <input
            type="number"
            min={0}
            max={35}
            placeholder="—"
            value={p.testScore ?? ''}
            onChange={(e) => {
              const val =
                e.target.value === '' ? null : Math.min(35, Math.max(0, Number(e.target.value)));
              onUpdateProgress(ch.id, { testScore: val });
            }}
            className={`w-14 px-1.5 py-1 text-xs font-mono-tabular text-right border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700 ${
              typeof p.testScore === 'number' && p.testScore < 24
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </td>
        <td className="py-3 px-3 text-center">
          <input
            type="checkbox"
            aria-label={`Revision 1 ${ch.titleEn}`}
            checked={p.revision1Done}
            onChange={(e) => onUpdateProgress(ch.id, { revision1Done: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
          />
        </td>
        <td className="py-3 px-3 text-center">
          <input
            type="checkbox"
            aria-label={`Revision 2 ${ch.titleEn}`}
            checked={p.revision2Done}
            onChange={(e) => onUpdateProgress(ch.id, { revision2Done: e.target.checked })}
            className="w-4 h-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
          />
        </td>
        <td className="py-3 px-4 text-right whitespace-nowrap">
          <div className="inline-flex items-center gap-1.5">
            {allowReorder && (
              <>
                <button
                  type="button"
                  onClick={() => onMoveChapter(ch.id, 'up')}
                  disabled={idxInList === 0}
                  title={bn ? 'আগে পড়ান' : 'Move up'}
                  className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 border border-slate-200 rounded-md"
                >
                  <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveChapter(ch.id, 'down')}
                  disabled={idxInList === schedule.orderedChapters.length - 1}
                  title={bn ? 'পরে পড়ান' : 'Move down'}
                  className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 border border-slate-200 rounded-md"
                >
                  <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => onSelectChapter(ch.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-50 border border-slate-200 rounded-md transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{bn ? 'গাইড' : 'Guide'}</span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {bn ? 'NCTB পূর্ণাঙ্গ সিলেবাস ও ৪১ অধ্যায় ট্র্যাকার' : 'NCTB Full Syllabus & 41-Chapter Mastery Ledger'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {bn
              ? 'প্রতিটি অধ্যায়ের ক্লাস, পড়া আদায়, ৩৫ নম্বরের টেস্ট এবং স্টুডেন্টের ২ বার রিভিশন এক জায়গায় ট্র্যাক করুন।'
              : 'Track teacher completion, Adai verification, 35-mark chapter tests, and both student self-revision cycles.'}
          </p>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('by_paper')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'by_paper'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {bn ? '৪টি পেপার অনুযায়ী' : 'By NCTB Paper'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('queue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                viewMode === 'queue'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {bn ? 'পড়ানোর সিরিয়াল ও সাজানো' : 'Sequential Queue Order'}
            </button>
          </div>

          {viewMode === 'queue' && hasCustomOrder && (
            <button
              type="button"
              onClick={onResetOrder}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:text-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{bn ? 'ডিফল্ট সিরিয়াল' : 'Default Order'}</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === 'by_paper' && (
        <div className="no-print flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-fit">
          <button
            type="button"
            onClick={() => setSelectedPaper('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedPaper === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            {bn ? 'সব ৪টি পেপার (৪১ অধ্যায়)' : 'All 4 Papers (41)'}
          </button>
          {papers.map((pid) => (
            <button
              key={pid}
              type="button"
              onClick={() => setSelectedPaper(pid)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedPaper === pid ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              {bn ? PAPER_META[pid].titleBn : PAPER_META[pid].titleEn}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'by_paper' ? (
        <div className="space-y-6">
          {papers
            .filter((pid) => selectedPaper === 'all' || selectedPaper === pid)
            .map((pid) => {
              const meta = PAPER_META[pid];
              const list = HSC_CURRICULUM.filter((c) => c.paperId === pid);
              const doneCount = list.filter(
                (c) => progressMap[c.id]?.teacherDone || c.id === currentChapterId
              ).length;

              return (
                <section key={pid} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        {bn ? meta.titleBn : meta.titleEn}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {bn ? meta.nctbRefBn : meta.nctbRefEn}
                      </p>
                    </div>
                    <span className="text-xs font-mono-tabular font-semibold text-slate-700">
                      {doneCount} / {list.length} {bn ? 'অধ্যায় সম্পন্ন' : 'completed'}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                          <th className="py-2.5 px-4">#</th>
                          <th className="py-2.5 px-4">{bn ? 'অধ্যায়ের নাম (NCTB)' : 'Chapter Title'}</th>
                          <th className="py-2.5 px-3">{bn ? 'অবস্থা' : 'Status'}</th>
                          <th className="py-2.5 px-3 text-center">{bn ? 'ক্লাস' : 'Class'}</th>
                          <th className="py-2.5 px-3 text-center">{bn ? 'আদায়' : 'Adai'}</th>
                          <th className="py-2.5 px-3 text-center">{bn ? 'টেস্ট (/৩৫)' : 'Test (/35)'}</th>
                          <th className="py-2.5 px-3 text-center">{bn ? 'রিভি ১' : 'Rev 1'}</th>
                          <th className="py-2.5 px-3 text-center">{bn ? 'রিভি ২' : 'Rev 2'}</th>
                          <th className="py-2.5 px-4 text-right">{bn ? 'বিস্তারিত' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>{list.map((ch, i) => renderChapterRow(ch, i, false))}</tbody>
                    </table>
                  </div>
                </section>
              );
            })}
        </div>
      ) : (
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {bn ? 'টিচারের পড়ানোর পূর্ণ ধারাবাহিক ক্রম' : 'Teacher Sequential Delivery Queue'}
              </h2>
              <p className="text-xs text-slate-500">
                {bn
                  ? 'তীর বাটন (↑ / ↓) দিয়ে যেকোনো অধ্যায় আগে বা পরে নিলে ২ মাসের রুটিন স্বয়ংক্রিয়ভাবে আপডেট হবে।'
                  : 'Reorder chapters with ↑ / ↓ to adjust your 2-month schedule automatically.'}
              </p>
            </div>
            {currentChapterId !== 'none' && CHAPTER_MAP[currentChapterId] && (
              <span className="text-xs text-blue-800 font-medium">
                {bn
                  ? `প্রি-রুটিন: ${CHAPTER_MAP[currentChapterId].titleBn}`
                  : `Pre-Routine: ${CHAPTER_MAP[currentChapterId].titleEn}`}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">{bn ? 'ক্রম' : 'Seq'}</th>
                  <th className="py-2.5 px-4">{bn ? 'অধ্যায় ও তারিখ' : 'Chapter & Date'}</th>
                  <th className="py-2.5 px-3">{bn ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-2.5 px-3 text-center">{bn ? 'ক্লাস' : 'Class'}</th>
                  <th className="py-2.5 px-3 text-center">{bn ? 'আদায়' : 'Adai'}</th>
                  <th className="py-2.5 px-3 text-center">{bn ? 'টেস্ট (/৩৫)' : 'Test (/35)'}</th>
                  <th className="py-2.5 px-3 text-center">{bn ? 'রিভি ১' : 'Rev 1'}</th>
                  <th className="py-2.5 px-3 text-center">{bn ? 'রিভি ২' : 'Rev 2'}</th>
                  <th className="py-2.5 px-4 text-right">{bn ? 'সাজান / গাইড' : 'Order / Guide'}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.orderedChapters.map((ch, idx) => renderChapterRow(ch, idx, true))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
