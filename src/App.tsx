import { useEffect, useMemo, useState } from 'react';
import { ChapterDrawer } from './components/ChapterDrawer';
import { DailyPlanView } from './components/DailyPlanView';
import { ActiveTab, Header } from './components/Header';
import { MethodAndRoutineGuide } from './components/MethodAndRoutineGuide';
import { RoadmapOverview } from './components/RoadmapOverview';
import { SyllabusTracker } from './components/SyllabusTracker';
import { HSC_CURRICULUM } from './data/curriculum';
import { ChapterProgress, DayTaskProgress, StudySettings } from './types/study';
import { generateStudySchedule, getDefaultChapterOrder } from './utils/scheduler';

const STORAGE_KEYS = {
  settings: 'hsc27_study_settings_v1',
  chapterProgress: 'hsc27_chapter_progress_v1',
  dayProgress: 'hsc27_day_progress_v1',
  customOrder: 'hsc27_custom_order_v1',
};

const DEFAULT_SETTINGS: StudySettings = {
  startDate: '2026-11-23',
  examDate: '2027-01-25',
  currentChapterId: 'phy1-1',
  orderMode: 'alternating',
  language: 'bn',
  studentName: '',
};

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap');
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const [settings, setSettings] = useState<StudySettings>(() =>
    loadJson<StudySettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  );
  const [chapterProgress, setChapterProgress] = useState<Record<string, ChapterProgress>>(() =>
    loadJson<Record<string, ChapterProgress>>(STORAGE_KEYS.chapterProgress, {})
  );
  const [dayProgress, setDayProgress] = useState<Record<string, DayTaskProgress>>(() =>
    loadJson<Record<string, DayTaskProgress>>(STORAGE_KEYS.dayProgress, {})
  );
  const [customOrder, setCustomOrder] = useState<string[] | undefined>(() =>
    loadJson<string[] | undefined>(STORAGE_KEYS.customOrder, undefined)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.chapterProgress, JSON.stringify(chapterProgress));
    } catch {
      // ignore storage errors
    }
  }, [chapterProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.dayProgress, JSON.stringify(dayProgress));
    } catch {
      // ignore storage errors
    }
  }, [dayProgress]);

  useEffect(() => {
    try {
      if (customOrder) {
        localStorage.setItem(STORAGE_KEYS.customOrder, JSON.stringify(customOrder));
      } else {
        localStorage.removeItem(STORAGE_KEYS.customOrder);
      }
    } catch {
      // ignore storage errors
    }
  }, [customOrder]);

  const schedule = useMemo(
    () => generateStudySchedule(settings, customOrder),
    [settings, customOrder]
  );

  const handleUpdateSettings = (patch: Partial<StudySettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      // If user switches orderMode, clear customOrder so the new mode takes effect immediately
      if (patch.orderMode && patch.orderMode !== prev.orderMode) {
        setCustomOrder(undefined);
      }
      return next;
    });
  };

  const handleUpdateChapterProgress = (
    chapterId: string,
    patch: Partial<ChapterProgress>
  ) => {
    setChapterProgress((prev) => {
      const current = prev[chapterId] || {
        teacherDone: false,
        adaiVerified: false,
        revision1Done: false,
        revision2Done: false,
        testScore: null,
        notes: '',
      };
      return {
        ...prev,
        [chapterId]: { ...current, ...patch },
      };
    });
  };

  const handleUpdateDayProgress = (dateIso: string, patch: Partial<DayTaskProgress>) => {
    setDayProgress((prev) => {
      const current = prev[dateIso] || {
        teacherSessionDone: false,
        homeStudyDone: false,
        adaiChecked: false,
      };
      return {
        ...prev,
        [dateIso]: { ...current, ...patch },
      };
    });
  };

  const handleMoveChapter = (chapterId: string, direction: 'up' | 'down') => {
    const base =
      customOrder && customOrder.length === HSC_CURRICULUM.length
        ? [...customOrder]
        : getDefaultChapterOrder(settings.orderMode);

    // Move within the non-currentChapterId slice, keeping currentChapterId anchored
    const visibleIds = base.filter((id) => id !== settings.currentChapterId);
    const idx = visibleIds.indexOf(chapterId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= visibleIds.length) return;

    [visibleIds[idx], visibleIds[swapIdx]] = [visibleIds[swapIdx], visibleIds[idx]];
    const rebuilt =
      settings.currentChapterId !== 'none'
        ? [settings.currentChapterId, ...visibleIds]
        : visibleIds;
    setCustomOrder(rebuilt);
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setChapterProgress({});
    setDayProgress({});
    setCustomOrder(undefined);
    setSettings(DEFAULT_SETTINGS);
    setConfirmReset(false);
  };

  const bn = settings.language === 'bn';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        language={settings.language}
        onPrint={() => window.print()}
      />

      {/* Inline reset confirmation bar (avoids native window.confirm in iFrame) */}
      {confirmReset && (
        <div className="no-print bg-rose-50 border-b border-rose-200 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-medium text-rose-900">
              {bn
                ? 'আপনি কি নিশ্চিতভাবে সব অধ্যায়ের প্রগ্রেস, টেস্ট নম্বর এবং দৈনিক চেকবক্স রিসেট করতে চান?'
                : 'Reset all chapter progress, test scores, and daily checklists?'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAll}
                className="px-3 py-1 font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md"
              >
                {bn ? 'হ্যাঁ, রিসেট করুন' : 'Confirm Reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1 font-medium text-slate-700 bg-white border border-slate-300 rounded-md"
              >
                {bn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-only Header */}
      <div className="hidden print-only border-b border-slate-300 pb-3 mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {bn
            ? 'HSC 2027 — ২ মাসের পূর্ণাঙ্গ স্টাডি প্ল্যান (পদার্থবিজ্ঞান ও উচ্চতর গণিত)'
            : 'HSC 2027 — Two-Month Full Syllabus Study Plan (Physics & Higher Math)'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          {settings.studentName ? `${bn ? 'শিক্ষার্থী:' : 'Student:'} ${settings.studentName} · ` : ''}
          {bn
            ? `শুরু: ${settings.startDate} · মডেল টেস্ট: ${settings.examDate} · NCTB পূর্ণাঙ্গ সিলেবাস`
            : `Start: ${settings.startDate} · Model Test: ${settings.examDate} · Full NCTB Syllabus`}
        </p>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'roadmap' && (
          <RoadmapOverview
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            schedule={schedule}
            progressMap={chapterProgress}
            onUpdateProgress={handleUpdateChapterProgress}
            onSelectChapter={setSelectedChapterId}
            onGoToDaily={() => setActiveTab('daily')}
            onResetAll={handleResetAll}
          />
        )}

        {activeTab === 'daily' && (
          <DailyPlanView
            days={schedule.days}
            language={settings.language}
            dayProgress={dayProgress}
            onUpdateDayProgress={handleUpdateDayProgress}
            chapterProgress={chapterProgress}
            onUpdateChapterProgress={handleUpdateChapterProgress}
            onSelectChapter={setSelectedChapterId}
          />
        )}

        {activeTab === 'chapters' && (
          <SyllabusTracker
            language={settings.language}
            currentChapterId={settings.currentChapterId}
            schedule={schedule}
            progressMap={chapterProgress}
            onUpdateProgress={handleUpdateChapterProgress}
            onSelectChapter={setSelectedChapterId}
            onMoveChapter={handleMoveChapter}
            onResetOrder={() => setCustomOrder(undefined)}
            hasCustomOrder={!!customOrder}
          />
        )}

        {activeTab === 'guide' && <MethodAndRoutineGuide language={settings.language} />}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {bn
              ? 'HSC 2027 NCTB পূর্ণাঙ্গ সিলেবাস (পদার্থবিজ্ঞান ১ম/২য় · উচ্চতর গণিত ১ম/২য়)'
              : 'HSC 2027 NCTB Full Syllabus (Physics 1st/2nd · Higher Math 1st/2nd)'}
          </span>
          <span>
            {bn
              ? 'সব অগ্রগতি আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে'
              : 'All progress is saved automatically in your browser'}
          </span>
        </div>
      </footer>

      <ChapterDrawer
        chapterId={selectedChapterId}
        language={settings.language}
        progress={selectedChapterId ? chapterProgress[selectedChapterId] : undefined}
        onUpdateProgress={handleUpdateChapterProgress}
        onClose={() => setSelectedChapterId(null)}
      />
    </div>
  );
}
