import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { CHAPTER_MAP, PAPER_META } from '../data/curriculum';
import { ChapterProgress, Language } from '../types/study';

interface ChapterDrawerProps {
  chapterId: string | null;
  language: Language;
  progress: ChapterProgress | undefined;
  onUpdateProgress: (chapterId: string, patch: Partial<ChapterProgress>) => void;
  onClose: () => void;
}

export function ChapterDrawer({
  chapterId,
  language,
  progress,
  onUpdateProgress,
  onClose,
}: ChapterDrawerProps) {
  const bn = language === 'bn';
  const ch = chapterId ? CHAPTER_MAP[chapterId] : null;

  useEffect(() => {
    if (!ch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ch, onClose]);

  if (!ch) return null;

  const p = progress || {
    teacherDone: false,
    adaiVerified: false,
    revision1Done: false,
    revision2Done: false,
    testScore: null,
    notes: '',
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={bn ? ch.titleBn : ch.titleEn}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white h-full overflow-y-auto border-l border-slate-200 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-blue-800">
              {bn ? PAPER_META[ch.paperId].titleBn : PAPER_META[ch.paperId].titleEn}
              <span aria-hidden="true"> · </span>
              {bn ? `অধ্যায় ${ch.chapterNumber}` : `Chapter ${ch.chapterNumber}`}
              <span aria-hidden="true"> · </span>
              {ch.boardPriority}
            </p>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {bn ? ch.titleBn : ch.titleEn}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {bn ? ch.nctbBookBn : ch.nctbBookEn}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Progress Controls */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.teacherDone}
                  onChange={(e) => onUpdateProgress(ch.id, { teacherDone: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-800"
                />
                <span>{bn ? 'ক্লাস শেষ' : 'Class Done'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.adaiVerified}
                  onChange={(e) => onUpdateProgress(ch.id, { adaiVerified: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span>{bn ? 'পড়া আদায়' : 'Adai Done'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.revision1Done}
                  onChange={(e) => onUpdateProgress(ch.id, { revision1Done: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-800"
                />
                <span>{bn ? 'রিভিশন ১' : 'Revision 1'}</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={p.revision2Done}
                  onChange={(e) => onUpdateProgress(ch.id, { revision2Done: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-800"
                />
                <span>{bn ? 'রিভিশন ২' : 'Revision 2'}</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  {bn ? 'অধ্যায় টেস্ট নম্বর (/৩৫):' : 'Chapter Test Score (/35):'}
                </span>
                <input
                  type="number"
                  min={0}
                  max={35}
                  placeholder="0–35"
                  value={p.testScore ?? ''}
                  onChange={(e) => {
                    const val =
                      e.target.value === ''
                        ? null
                        : Math.min(35, Math.max(0, Number(e.target.value)));
                    onUpdateProgress(ch.id, { testScore: val });
                  }}
                  className="w-20 px-2.5 py-1 text-sm font-mono-tabular text-right bg-white border border-slate-300 rounded-md"
                />
                {typeof p.testScore === 'number' && p.testScore < 24 && (
                  <span className="text-xs font-semibold text-rose-700">
                    {bn ? 'পাস মার্ক ২৪ — পুনরায় রিভাইজ ও রিটেক করুন' : 'Below 24 — Schedule Retake'}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {bn ? ch.chapterTestBn : ch.chapterTestEn}
              </span>
            </div>
          </div>

          {/* Core Topics */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              {bn ? '১. NCTB মূল টপিকসমূহ (কোনগুলো পড়াবেন)' : '1. Core NCTB Syllabus Topics'}
            </h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              {(bn ? ch.keyTopicsBn : ch.keyTopicsEn).map((t, i) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          </div>

          {/* Must-Memorize Formulas */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              {bn ? '২. অবশ্য মুখস্থ সূত্র ও শর্তাবলি' : '2. Must-Memorize Formulas & Conditions'}
            </h3>
            <p className="text-sm font-mono-tabular text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3.5 leading-relaxed">
              {bn ? ch.mustMemorizeBn : ch.mustMemorizeEn}
            </p>
          </div>

          {/* Teacher Strategy */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              {bn ? '৩. দুর্বল স্টুডেন্টকে যেভাবে পড়াবেন (Teaching Strategy)' : '3. Below-Average Teaching Protocol'}
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {(bn ? ch.teacherStrategyBn : ch.teacherStrategyEn).map((s, i) => (
                <li key={i} className="leading-relaxed">
                  {i + 1}. {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Practice & Adai */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                {bn ? '৪. প্র্যাকটিস ও পড়া আদায়' : '4. Practice & Adai Verification'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {bn ? ch.practiceTargetBn : ch.practiceTargetEn}
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700 pt-1">
                {(bn ? ch.adaiChecklistBn : ch.adaiChecklistEn).map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                {bn ? '৫. বাসায় স্টুডেন্টের সেলফ-স্টাডি' : '5. Student Home Self-Study'}
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {(bn ? ch.homeStudyBn : ch.homeStudyEn).map((h, i) => (
                  <li key={i} className="leading-relaxed">
                    {i + 1}. {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Teacher Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-900">
              {bn ? 'টিচারের ব্যক্তিগত নোট (স্টুডেন্টের দুর্বলতা / হোমওয়ার্ক)' : 'Teacher Notes (Weaknesses / Remarks)'}
            </label>
            <textarea
              rows={3}
              value={p.notes}
              onChange={(e) => onUpdateProgress(ch.id, { notes: e.target.value })}
              placeholder={
                bn
                  ? 'যেমন: সাইন চিহ্নে ভুল করে, আগামী ক্লাসে ২টি অংক আবার ধরবো...'
                  : 'e.g., Struggles with sign convention; re-check 2 problems next session...'
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
