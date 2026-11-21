export type PaperId = 'phy1' | 'phy2' | 'math1' | 'math2';
export type SubjectType = 'physics' | 'math';
export type DifficultyTier = 'foundation' | 'moderate' | 'heavyweight';
export type OrderMode = 'alternating' | 'paper_block';
export type Language = 'bn' | 'en';

export interface ChapterData {
  id: string;
  paperId: PaperId;
  subject: SubjectType;
  chapterNumber: number;
  titleBn: string;
  titleEn: string;
  nctbBookBn: string;
  nctbBookEn: string;
  tier: DifficultyTier;
  /** Default days needed for a below-average student in Phase 1 (1 or 2) */
  defaultDays: 1 | 2;
  /** Weight / priority score for board exams (High / Very High / Standard) */
  boardPriority: 'Very High' | 'High' | 'Standard';
  keyTopicsBn: string[];
  keyTopicsEn: string[];
  mustMemorizeBn: string;
  mustMemorizeEn: string;
  teacherStrategyBn: string[];
  teacherStrategyEn: string[];
  practiceTargetBn: string;
  practiceTargetEn: string;
  adaiChecklistBn: string[];
  adaiChecklistEn: string[];
  homeStudyBn: string[];
  homeStudyEn: string[];
  chapterTestBn: string;
  chapterTestEn: string;
}

export interface ChapterProgress {
  teacherDone: boolean;
  adaiVerified: boolean;
  revision1Done: boolean;
  revision2Done: boolean;
  testScore: number | null; // out of 35
  notes: string;
}

export interface DayTaskProgress {
  teacherSessionDone: boolean;
  homeStudyDone: boolean;
  adaiChecked: boolean;
}

export type SchedulePhase = 'phase1_syllabus' | 'phase2_rev1' | 'phase3_rev2' | 'exam_day';

export interface ScheduledDay {
  dayIndex: number; // 1-based
  dateIso: string; // YYYY-MM-DD
  weekdayBn: string;
  weekdayEn: string;
  phase: SchedulePhase;
  chapterId: string | null;
  chapterDayPart?: 1 | 2;
  chapterTotalDays?: 1 | 2;
  paperFocus?: PaperId;
  revisionChapterIds?: string[];
  rollingRevisionChapterIds: string[];
  titleBn: string;
  titleEn: string;
  teacherTaskBn: string;
  teacherTaskEn: string;
  studentHomeTaskBn: string[];
  studentHomeTaskEn: string[];
  practiceAndTestBn: string;
  practiceAndTestEn: string;
  isChapterEndDay: boolean;
}

export interface StudySettings {
  startDate: string; // YYYY-MM-DD
  examDate: string; // 2027-01-25
  currentChapterId: string; // chapter student is finishing right now, or 'none'
  orderMode: OrderMode;
  language: Language;
  studentName: string;
}
