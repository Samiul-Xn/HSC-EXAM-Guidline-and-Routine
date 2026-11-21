import { CHAPTER_MAP, HSC_CURRICULUM, PAPER_META } from '../data/curriculum';
import { ChapterData, OrderMode, PaperId, ScheduledDay, StudySettings } from '../types/study';

const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export function formatIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatIsoDate(d);
}

export function diffDaysIso(startIso: string, endIso: string): number {
  const s = parseIsoDate(startIso).getTime();
  const e = parseIsoDate(endIso).getTime();
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

export function formatDisplayDate(iso: string, lang: 'bn' | 'en'): string {
  const d = parseIsoDate(iso);
  const day = d.getUTCDate();
  const monthIdx = d.getUTCMonth();
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
  return lang === 'bn' ? `${day} ${monthsBn[monthIdx]}` : `${monthsEn[monthIdx]} ${day}`;
}

export function getDefaultChapterOrder(mode: OrderMode): string[] {
  if (mode === 'paper_block') {
    return HSC_CURRICULUM.map((c) => c.id);
  }
  // Alternating: 1 Physics chapter (fully completed) <-> 1 Math chapter (fully completed)
  // Interleaves Phy1 + Math1 first, then Phy2 + Math2 so foundations build cleanly.
  const phy = HSC_CURRICULUM.filter((c) => c.subject === 'physics').map((c) => c.id);
  const math = HSC_CURRICULUM.filter((c) => c.subject === 'math').map((c) => c.id);
  const result: string[] = [];
  const maxLen = Math.max(phy.length, math.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < phy.length) result.push(phy[i]);
    if (i < math.length) result.push(math[i]);
  }
  return result;
}

export interface ScheduleSummary {
  days: ScheduledDay[];
  totalDays: number;
  phase1DaysCount: number;
  phase2DaysCount: number;
  phase3DaysCount: number;
  phase1EndDate: string;
  phase2EndDate: string;
  phase3EndDate: string;
  orderedChapters: ChapterData[];
  pairedDaysUsed: number;
}

export function generateStudySchedule(
  settings: StudySettings,
  customOrder?: string[]
): ScheduleSummary {
  const baseOrder =
    customOrder && customOrder.length === HSC_CURRICULUM.length
      ? customOrder
      : getDefaultChapterOrder(settings.orderMode);

  // Exclude the chapter the student is finishing right now (pre-routine)
  const queueIds = baseOrder.filter((id) => id !== settings.currentChapterId);
  const orderedChapters = queueIds.map((id) => CHAPTER_MAP[id]).filter(Boolean);

  const rawTotalBeforeExam = Math.max(12, diffDaysIso(settings.startDate, settings.examDate));

  // Allocate Revision Phase 2 and Phase 3 budgets
  // Ideal: Phase 2 = 8 days (2 days/paper for Rev 1 + Paper Tests), Phase 3 = 9 days (2 days/paper for Rev 2 + 1 final prep day)
  let phase2Budget = 8;
  let phase3Budget = 9;
  if (rawTotalBeforeExam < 54) {
    phase2Budget = Math.max(4, Math.floor(rawTotalBeforeExam * 0.14));
    phase3Budget = Math.max(5, Math.floor(rawTotalBeforeExam * 0.15));
  }
  const phase1Budget = Math.max(orderedChapters.length, rawTotalBeforeExam - phase2Budget - phase3Budget);
  const actualPhase2Budget = Math.max(4, Math.min(phase2Budget, rawTotalBeforeExam - phase1Budget - 4));
  const actualPhase3Budget = Math.max(1, rawTotalBeforeExam - phase1Budget - actualPhase2Budget);

  // Assign 1 or 2 days per chapter in Phase 1 based on available extra days
  const chapterAllocations: { chapter: ChapterData; days: 1 | 2 }[] = orderedChapters.map((ch) => ({
    chapter: ch,
    days: 1,
  }));

  let extraDays = phase1Budget - orderedChapters.length;
  // Priority 1: Heavyweight chapters get 2 days
  for (const item of chapterAllocations) {
    if (extraDays <= 0) break;
    if (item.chapter.defaultDays === 2) {
      item.days = 2;
      extraDays--;
    }
  }
  // Priority 2: High-priority moderate chapters if days still remain
  for (const item of chapterAllocations) {
    if (extraDays <= 0) break;
    if (item.days === 1 && item.chapter.boardPriority === 'Very High') {
      item.days = 2;
      extraDays--;
    }
  }

  // If even with 1 day/ch we need fewer days (late start date), compress gracefully
  const scheduledPhase1Entries: {
    chapter: ChapterData;
    secondaryChapter?: ChapterData;
    part: 1 | 2;
    totalParts: 1 | 2;
  }[] = [];

  for (const item of chapterAllocations) {
    if (item.days === 2) {
      scheduledPhase1Entries.push({ chapter: item.chapter, part: 1, totalParts: 2 });
      scheduledPhase1Entries.push({ chapter: item.chapter, part: 2, totalParts: 2 });
    } else {
      scheduledPhase1Entries.push({ chapter: item.chapter, part: 1, totalParts: 1 });
    }
  }

  let pairedDaysUsed = 0;
  // If compressed start date makes Phase 1 entries exceed rawTotalBeforeExam - 8
  const maxPhase1Allowed = Math.max(10, rawTotalBeforeExam - 8);
  while (scheduledPhase1Entries.length > maxPhase1Allowed) {
    // Merge last two single-part foundation/moderate entries sequentially on 1 sprint day
    let merged = false;
    for (let i = 0; i < scheduledPhase1Entries.length - 1; i++) {
      const a = scheduledPhase1Entries[i];
      const b = scheduledPhase1Entries[i + 1];
      if (a.totalParts === 1 && b.totalParts === 1 && !a.secondaryChapter && !b.secondaryChapter) {
        a.secondaryChapter = b.chapter;
        scheduledPhase1Entries.splice(i + 1, 1);
        pairedDaysUsed++;
        merged = true;
        break;
      }
    }
    if (!merged) break;
  }

  const days: ScheduledDay[] = [];
  const completedSoFar: string[] =
    settings.currentChapterId !== 'none' && CHAPTER_MAP[settings.currentChapterId]
      ? [settings.currentChapterId]
      : [];

  let cursorDate = settings.startDate;
  let dayIdx = 1;

  // Build Phase 1 days
  for (const entry of scheduledPhase1Entries) {
    const d = parseIsoDate(cursorDate);
    const wd = d.getUTCDay();
    const ch = entry.chapter;
    const isEnd = entry.part === entry.totalParts;

    // Pick 2 recently finished chapters for Rolling Revision at home
    const rollingPool = completedSoFar.slice(-4);
    const rollingIds =
      rollingPool.length >= 2
        ? [rollingPool[0], rollingPool[rollingPool.length - 1]]
        : rollingPool;

    const partLabelBn =
      entry.totalParts === 2
        ? entry.part === 1
          ? ' (পর্ব ১/২: কনসেপ্ট ও টাইপ ১–২)'
          : ' (পর্ব ২/২: পূর্ণ অনুশীলন, পড়া আদায় ও টেস্ট)'
        : entry.secondaryChapter
        ? ` + ${entry.secondaryChapter.titleBn} (জোড়া অধ্যায় স্প্রিন্ট)`
        : ' (১ দিনে পূর্ণ সমাপ্তি ও টেস্ট)';

    const partLabelEn =
      entry.totalParts === 2
        ? entry.part === 1
          ? ' (Part 1/2: Core Concepts & Types 1–2)'
          : ' (Part 2/2: Practice, Adai & Chapter Test)'
        : entry.secondaryChapter
        ? ` + ${entry.secondaryChapter.titleEn} (Sequential Sprint)`
        : ' (Complete Chapter + Test)';

    const teacherTaskBn =
      entry.totalParts === 2 && entry.part === 1
        ? `ক্লাস (৯০–১২০ মি.): ${ch.titleBn}-এর মূল কনসেপ্ট, সূত্র ও ১ম অর্ধেক টাইপ-ভিত্তিক অংক বোঝানো। ${ch.teacherStrategyBn[0]}`
        : entry.totalParts === 2 && entry.part === 2
        ? `ক্লাস (৯০–১২০ মি.): বাকি টাইপ ও বোর্ড CQ করানো + পড়া আদায় + অধ্যায়ভিত্তিক টেস্ট নেওয়া। ${ch.teacherStrategyBn[1] || ''}`
        : entry.secondaryChapter
        ? `প্রথমে ${ch.titleBn} সম্পূর্ণ শেষ করে টেস্ট নিন; তারপর একই দিনে ${entry.secondaryChapter.titleBn} শুরু ও শেষ করুন।`
        : `ক্লাস (৯০–১২০ মি.): ${ch.titleBn} সম্পূর্ণ অধ্যায় শেষ করা। ${ch.teacherStrategyBn.join(' ')}`;

    const teacherTaskEn =
      entry.totalParts === 2 && entry.part === 1
        ? `Class (90–120m): Teach ${ch.titleEn} foundations, formula sheet & first half problem types. ${ch.teacherStrategyEn[0]}`
        : entry.totalParts === 2 && entry.part === 2
        ? `Class (90–120m): Finish remaining CQ types, conduct Adai oral/written check & Chapter Test. ${ch.teacherStrategyEn[1] || ''}`
        : entry.secondaryChapter
        ? `Finish ${ch.titleEn} 100% first, then complete ${entry.secondaryChapter.titleEn} sequentially.`
        : `Class (90–120m): Complete ${ch.titleEn} end-to-end. ${ch.teacherStrategyEn.join(' ')}`;

    const homeTasksBn = [
      ...ch.homeStudyBn,
      rollingIds.length > 0
        ? `রোলিং রিভিশন (৪০ মি.): পূর্বের অধ্যায় (${rollingIds
            .map((rid) => CHAPTER_MAP[rid]?.titleBn)
            .filter(Boolean)
            .join(', ')})-এর সূত্র ও ২টি করে কঠিন অংক না দেখে করা`
        : 'সূত্র খাতায় আজকের অধ্যায়ের সব সূত্র পরিষ্কারভাবে লিখে মুখস্থ করা',
    ];

    const homeTasksEn = [
      ...ch.homeStudyEn,
      rollingIds.length > 0
        ? `Rolling Revision (40m): Revise formulas & 2 tricky problems from (${rollingIds
            .map((rid) => CHAPTER_MAP[rid]?.titleEn)
            .filter(Boolean)
            .join(', ')})`
        : 'Build a clean 1-page formula card for today’s chapter',
    ];

    days.push({
      dayIndex: dayIdx++,
      dateIso: cursorDate,
      weekdayBn: WEEKDAYS_BN[wd],
      weekdayEn: WEEKDAYS_EN[wd],
      phase: 'phase1_syllabus',
      chapterId: ch.id,
      chapterDayPart: entry.part,
      chapterTotalDays: entry.totalParts,
      rollingRevisionChapterIds: rollingIds,
      titleBn: `${PAPER_META[ch.paperId].titleBn} — ${ch.titleBn}${partLabelBn}`,
      titleEn: `${PAPER_META[ch.paperId].titleEn} — ${ch.titleEn}${partLabelEn}`,
      teacherTaskBn,
      teacherTaskEn,
      studentHomeTaskBn: homeTasksBn,
      studentHomeTaskEn: homeTasksEn,
      practiceAndTestBn: isEnd
        ? `প্র্যাকটিস: ${ch.practiceTargetBn} | টেস্ট: ${ch.chapterTestBn}`
        : `আজকের প্র্যাকটিস: ${ch.practiceTargetBn} (আগামীকাল পূর্ণ টেস্ট ও পড়া আদায়)`,
      practiceAndTestEn: isEnd
        ? `Practice: ${ch.practiceTargetEn} | Test: ${ch.chapterTestEn}`
        : `Today's Practice: ${ch.practiceTargetEn} (Full Adai & Test tomorrow)`,
      isChapterEndDay: isEnd,
    });

    if (isEnd) {
      completedSoFar.push(ch.id);
      if (entry.secondaryChapter) {
        completedSoFar.push(entry.secondaryChapter.id);
      }
    }

    cursorDate = addDaysIso(cursorDate, 1);
  }

  const phase1EndDate = days.length > 0 ? days[days.length - 1].dateIso : settings.startDate;
  const phase1DaysCount = days.length;

  // Build Phase 2: Full Syllabus Self-Revision #1 + Paper Mock Tests
  const remainingUntilExam = Math.max(2, diffDaysIso(cursorDate, settings.examDate));
  const rev1DaysCount = Math.max(4, Math.floor(remainingUntilExam * 0.48));
  const rev2DaysCount = Math.max(1, remainingUntilExam - rev1DaysCount);

  const paperOrder: PaperId[] = ['phy1', 'math1', 'phy2', 'math2'];
  const buildPaperRevisionDays = (
    count: number,
    phase: 'phase2_rev1' | 'phase3_rev2'
  ) => {
    for (let i = 0; i < count; i++) {
      const d = parseIsoDate(cursorDate);
      const wd = d.getUTCDay();
      const paperId = paperOrder[Math.min(3, Math.floor((i * 4) / count))];
      const paperMeta = PAPER_META[paperId];
      const paperChapters = HSC_CURRICULUM.filter((c) => c.paperId === paperId);
      const isSecondDayOfPaper =
        i === count - 1 ||
        paperOrder[Math.min(3, Math.floor(((i + 1) * 4) / count))] !== paperId;

      if (phase === 'phase2_rev1') {
        const halfIdx = Math.ceil(paperChapters.length / 2);
        const slice = isSecondDayOfPaper
          ? paperChapters.slice(halfIdx)
          : paperChapters.slice(0, halfIdx);

        days.push({
          dayIndex: dayIdx++,
          dateIso: cursorDate,
          weekdayBn: WEEKDAYS_BN[wd],
          weekdayEn: WEEKDAYS_EN[wd],
          phase: 'phase2_rev1',
          chapterId: null,
          paperFocus: paperId,
          revisionChapterIds: slice.map((c) => c.id),
          rollingRevisionChapterIds: [],
          titleBn: `রিভিশন ১ (দৃঢ়ীকরণ): ${paperMeta.titleBn} — অধ্যায় ${slice[0]?.chapterNumber}–${slice[slice.length - 1]?.chapterNumber}`,
          titleEn: `Revision 1 (Consolidation): ${paperMeta.titleEn} — Ch ${slice[0]?.chapterNumber}–${slice[slice.length - 1]?.chapterNumber}`,
          teacherTaskBn: isSecondDayOfPaper
            ? `টিচার সেশন: ${paperMeta.titleBn}-এর দুর্বল অধ্যায় (যাতে টেস্টে <৭০% এসেছিল) ঝালাই + পূর্ণ পেপার ৫০ নম্বরের মক টেস্ট ও খাতা মূল্যায়ন।`
            : `টিচার সেশন: স্টুডেন্টের ভুল-খাতা (Mistake Notebook) ও কঠিন বোর্ড CQ-গুলোর সমাধান ধরিয়ে দেওয়া।`,
          teacherTaskEn: isSecondDayOfPaper
            ? `Teacher Session: Repair weak chapters (<70% test score) in ${paperMeta.titleEn} + conduct 50-mark Paper Mock Test.`
            : `Teacher Session: Review student Mistake Notebook and unblock tricky Board CQs.`,
          studentHomeTaskBn: [
            `নির্ধারিত অধ্যায়গুলোর (${slice.map((c) => c.titleBn).join(', ')}) সূত্র খাতা না দেখে লেখা`,
            'আগের অধ্যায়-টেস্টে ভুল হওয়া সব অংক ও দাগানো গুরুত্বপূর্ণ CQ রি-সলভ করা',
            'NCTB অনুশীলনীর ৪০টি বোর্ড MCQ ঘড়ি ধরে সমাধান (সময়: ৩৫ মিনিট)',
          ],
          studentHomeTaskEn: [
            `Write all formulas for (${slice.map((c) => c.titleEn).join(', ')}) from memory`,
            'Re-solve all missed chapter-test problems & starred Board CQs',
            'Timed drill: 40 NCTB/Board MCQs in 35 minutes',
          ],
          practiceAndTestBn: isSecondDayOfPaper
            ? `পেপার মক টেস্ট: ${paperMeta.titleBn} (২৫ MCQ + ৩ CQ = ৫৫ নম্বর, সময়: ১ ঘণ্টা ৩০ মি.)`
            : 'অনুশীলন টার্গেট: প্রতিটি অধ্যায় থেকে অন্তত ২টি করে বোর্ড CQ নিজে সমাধান',
          practiceAndTestEn: isSecondDayOfPaper
            ? `Paper Mock Test: ${paperMeta.titleEn} (25 MCQs + 3 CQs = 55 Marks, 90 min)`
            : 'Target: Solve 2 top Board CQs per chapter independently',
          isChapterEndDay: isSecondDayOfPaper,
        });
      } else {
        // Phase 3: Final Rapid Revision 2
        const isLastDayBeforeExam = i === count - 1;
        if (isLastDayBeforeExam) {
          days.push({
            dayIndex: dayIdx++,
            dateIso: cursorDate,
            weekdayBn: WEEKDAYS_BN[wd],
            weekdayEn: WEEKDAYS_EN[wd],
            phase: 'phase3_rev2',
            chapterId: null,
            rollingRevisionChapterIds: [],
            titleBn: 'চূড়ান্ত প্রস্তুতি (মডেল টেস্টের আগের দিন) — রিভিশন ২ সমাপ্তি',
            titleEn: 'Final Eve Prep (Day Before Model Test) — Revision 2 Wrap-Up',
            teacherTaskBn:
              'টিচার সেশন (৩০–৪৫ মি.): শুধুমাত্র আত্মবিশ্বাস বাড়ানো, পরীক্ষার হলে CQ বাছাই কৌশল (সহজ ২টি আগে লেখা) ও সময় ব্যবস্থাপনা শেখানো। নতুন কোনো কঠিন অংক করাবেন না।',
            teacherTaskEn:
              'Teacher Session (30–45m): Confidence briefing, exam hall CQ selection strategy & time pacing. No new heavy topics.',
            studentHomeTaskBn: [
              '৪টি পেপারের সমস্ত সূত্র-খাতা একবার চোখ বুলানো (২ ঘণ্টা)',
              'ক্যালকুলেটর, জ্যামিতি বক্স, কলম ও প্রবেশপত্র গুছিয়ে রাখা',
              'রাত ১০:৩০-এর মধ্যে ঘুমিয়ে পড়া (পরীক্ষার দিন মাথা ঠান্ডা রাখার জন্য)',
            ],
            studentHomeTaskEn: [
              'Light 2-hour scan of all 4 formula notebooks',
              'Pack calculator, geometry box & stationery',
              'Sleep by 10:30 PM for peak exam alertness',
            ],
            practiceAndTestBn: 'হালকা সূত্র রিভিশন — আজ কোনো ভারী লিখিত পরীক্ষা নয়',
            practiceAndTestEn: 'Light formula scan only — rest brain before tomorrow’s exam',
            isChapterEndDay: true,
          });
        } else {
          const halfIdx = Math.ceil(paperChapters.length / 2);
          const slice = isSecondDayOfPaper
            ? paperChapters.slice(halfIdx)
            : paperChapters.slice(0, halfIdx);
          days.push({
            dayIndex: dayIdx++,
            dateIso: cursorDate,
            weekdayBn: WEEKDAYS_BN[wd],
            weekdayEn: WEEKDAYS_EN[wd],
            phase: 'phase3_rev2',
            chapterId: null,
            paperFocus: paperId,
            revisionChapterIds: slice.map((c) => c.id),
            rollingRevisionChapterIds: [],
            titleBn: `রিভিশন ২ (র‍্যাপিড স্প্রিন্ট): ${paperMeta.titleBn} — দ্রুত ঝালাই`,
            titleEn: `Revision 2 (Rapid Sprint): ${paperMeta.titleEn} — Speed Drill`,
            teacherTaskBn: `কুইক-চেক সেশন (৪৫ মি.): ${paperMeta.titleBn}-এর সবচেয়ে গুরুত্বপূর্ণ ৫টি CQ প্যাটার্ন ও ক-খ জ্ঞানমূলক মুখে পড়া নেওয়া।`,
            teacherTaskEn: `Quick-Check Session (45m): Rapid oral recall of top 5 CQ patterns & short questions in ${paperMeta.titleEn}.`,
            studentHomeTaskBn: [
              `প্রতিটি অধ্যায়ের সূত্র মাত্র ১৫ মিনিটে রিভিশন (${slice.map((c) => c.titleBn).join(', ')})`,
              'সর্বাধিক কমন আসা বোর্ড CQ-এর গ ও ঘ নং হাতে লিখে প্র্যাকটিস',
              '৫০টি হাই-ইয়েল্ড MCQ দ্রুত সমাধান',
            ],
            studentHomeTaskEn: [
              `15-min/chapter rapid formula scan (${slice.map((c) => c.titleEn).join(', ')})`,
              'Write out high-probability Board CQ parts (গ & ঘ)',
              'Rapid drill of 50 high-yield Board MCQs',
            ],
            practiceAndTestBn: isSecondDayOfPaper
              ? `পূর্ণ মডেল টেস্ট অনুশীলন: ${paperMeta.titleBn} (বোর্ড সময় মেনে)`
              : 'র‍্যাপিড ফর্মুলা ও কমন CQ রিকল টেস্ট',
            practiceAndTestEn: isSecondDayOfPaper
              ? `Full Timed Model Simulation: ${paperMeta.titleEn}`
              : 'Rapid formula & high-yield CQ recall drill',
            isChapterEndDay: isSecondDayOfPaper,
          });
        }
      }
      cursorDate = addDaysIso(cursorDate, 1);
    }
  };

  buildPaperRevisionDays(rev1DaysCount, 'phase2_rev1');
  const phase2EndDate = days[days.length - 1]?.dateIso || phase1EndDate;

  buildPaperRevisionDays(rev2DaysCount, 'phase3_rev2');
  const phase3EndDate = days[days.length - 1]?.dateIso || phase2EndDate;

  // Model Test Day (Jan 25, 2027)
  const examDateObj = parseIsoDate(settings.examDate);
  const examWd = examDateObj.getUTCDay();
  days.push({
    dayIndex: dayIdx,
    dateIso: settings.examDate,
    weekdayBn: WEEKDAYS_BN[examWd],
    weekdayEn: WEEKDAYS_EN[examWd],
    phase: 'exam_day',
    chapterId: null,
    rollingRevisionChapterIds: [],
    titleBn: 'HSC 2027 মডেল টেস্ট (টার্গেট দিবস)',
    titleEn: 'HSC 2027 Model Test Day',
    teacherTaskBn: 'পরীক্ষার পর প্রশ্নপত্র সংগ্রহ করে দুর্বল জায়গাগুলো মার্ক করুন পরবর্তী ফাইনাল বুস্টের জন্য।',
    teacherTaskEn: 'Collect the model test paper afterward to analyze remaining weak spots for final board prep.',
    studentHomeTaskBn: [
      'সকালে শুধু মূল সূত্র-শিট ১০ মিনিট চোখ বুলানো',
      'পরীক্ষার হলে প্রথমে নিশ্চিত জানা ৫টি CQ ও সহজ MCQ শেষ করা',
    ],
    studentHomeTaskEn: [
      '10-minute calm formula review in the morning',
      'Answer sure-shot CQs and easy MCQs first in the exam hall',
    ],
    practiceAndTestBn: 'পূর্ণ সিলেবাস মডেল টেস্ট',
    practiceAndTestEn: 'Full Syllabus Model Test',
    isChapterEndDay: true,
  });

  return {
    days,
    totalDays: days.length,
    phase1DaysCount,
    phase2DaysCount: rev1DaysCount,
    phase3DaysCount: rev2DaysCount,
    phase1EndDate,
    phase2EndDate,
    phase3EndDate,
    orderedChapters,
    pairedDaysUsed,
  };
}
