import { Language } from '../types/study';

interface MethodAndRoutineGuideProps {
  language: Language;
}

export function MethodAndRoutineGuide({ language }: MethodAndRoutineGuideProps) {
  const bn = language === 'bn';

  const dailyBlocks = bn
    ? [
        {
          slot: 'বিকাল / সন্ধ্যা (৯০–১২০ মি.)',
          who: 'টিচার + স্টুডেন্ট (ক্লাস)',
          task: 'আগের দিনের ২০% পড়া আদায় (১০ মি.) → নতুন অধ্যায়ের মূল কনসেপ্ট ও সূত্র (৩০ মি.) → টাইপ-ভিত্তিক মূল বই ও বোর্ড CQ সমাধান (৫০ মি.) → অধ্যায় শেষে ৩৫ নম্বরের টেস্ট।',
        },
        {
          slot: 'রাত ৮:৩০ – ৯:৩০ (১ ঘণ্টা)',
          who: 'স্টুডেন্ট (বাসায়)',
          task: 'আজ টিচার ক্লাসে যে অংকগুলো করিয়েছেন, তা খাতা বন্ধ করে না দেখে নিজে সমাধান করা + ১ পৃষ্ঠার সূত্র-কার্ড লেখা।',
        },
        {
          slot: 'রাত ১০:০০ – ১১:০০ (১ ঘণ্টা)',
          who: 'স্টুডেন্ট (বাসায়)',
          task: 'NCTB মূল বইয়ের অনুশীলনী থেকে একই টাইপের ৫–৮টি অংক ও ২০টি বোর্ড MCQ সমাধান।',
        },
        {
          slot: 'রাত ১১:০০ – ১১:৪০ (৪০ মি.)',
          who: 'স্টুডেন্ট (রোলিং রিভিশন)',
          task: '৩–৫ দিন আগে শেষ করা অধ্যায়ের সূত্র মুখস্থ লেখা ও ২টি কঠিন অংক রি-সলভ করা (ভুলে যাওয়া ঠেকাতে)।',
        },
        {
          slot: 'সকাল ৬:৩০ – ৭:১৫ (৪৫ মি.)',
          who: 'স্টুডেন্ট (সকালের রিকল)',
          task: 'গত রাতের সূত্র-কার্ড এবং ক ও খ নং জ্ঞানমূলক-অনুধাবন প্রশ্ন চোখ বুলিয়ে পড়া।',
        },
      ]
    : [
        {
          slot: 'Afternoon / Evening (90–120m)',
          who: 'Teacher + Student (Class)',
          task: '10m Adai check of prior session → 30m core concept & formula map → 50m type-sorted NCTB & Board CQs → 35-mark Chapter Test at end of chapter.',
        },
        {
          slot: '8:30 PM – 9:30 PM (1 hr)',
          who: 'Student (Home)',
          task: 'Re-solve every problem taught in today’s class without looking at notes + write a 1-page formula card.',
        },
        {
          slot: '10:00 PM – 11:00 PM (1 hr)',
          who: 'Student (Home)',
          task: 'Solve 5–8 similar problems from NCTB textbook exercise + 20 chapter MCQs.',
        },
        {
          slot: '11:00 PM – 11:40 PM (40m)',
          who: 'Student (Rolling Revision)',
          task: 'Write formulas from memory and re-solve 2 tricky CQs from chapters finished 3–5 days ago.',
        },
        {
          slot: '6:30 AM – 7:15 AM (45m)',
          who: 'Student (Morning Recall)',
          task: 'Quick review of last night’s formula card + 1-mark & 2-mark (ক/খ) definitions.',
        },
      ];

  const adaiSteps = bn
    ? [
        {
          title: '০১. দুর্বল স্টুডেন্টের জন্য "টাইপ-ভিত্তিক" পড়ানো',
          desc: 'পুরো বইয়ের ১০০টি অংক একসাথে না দিয়ে প্রতিটি অধ্যায়কে মাত্র ৩–৫টি নির্দিষ্ট টাইপে ভাগ করুন। দুর্বল স্টুডেন্ট আগে সহজ ও কমন টাইপ আয়ত্ত করলে আত্মবিশ্বাস ফিরে পায়।',
        },
        {
          title: '০২. ক্লাসেই স্পট-আদায় (Write Without Looking)',
          desc: 'কোনো অংক বোর্ডে করে দেওয়ার পর সাথে সাথে ঠিক একই ধরনের আরেকটি অংক স্টুডেন্টকে সামনে বসিয়ে না দেখে করতে দিন। সে আটকালে ঠিক কোন লাইনে আটকাচ্ছে তা চিহ্নিত করুন।',
        },
        {
          title: '০৩. মৌখিক সূত্র ও চিহ্ন পরীক্ষা (Oral Drill)',
          desc: 'পড়ানো শেষে ৫ মিনিট খাতা বন্ধ করিয়ে ৪–৫টি সূত্র এবং একক/মাত্রা/চিহ্ন (+ / -) মুখে জিজ্ঞাসা করুন। না পারলে সেই সূত্র ৩ বার লিখিয়ে ক্লাস শেষ করুন।',
        },
        {
          title: '০৪. ভুলের খাতা (Mistake Notebook)',
          desc: 'স্টুডেন্টকে একটি আলাদা চিকন খাতা দিন। অংক করার সময় সে যেসব জায়গায় ভুল করে (যেমন: °C থেকে K না করা, g-এর মান বা চিহ্ন ভুল), সেগুলো লাল কালিতে এই খাতায় লিখবে। রিভিশনের সময় শুধু এগুলোই দেখবে।',
        },
        {
          title: '০৫. ৩৫ নম্বরের অধ্যায়-টেস্ট ও ২৪ পাস গেট',
          desc: 'অধ্যায় শেষে ১৫ MCQ + ২ CQ = ৩৫ নম্বরের ৪৫ মিনিটের পরীক্ষা নিন। কমপক্ষে ২৪ (প্রায় ৭০%) না পেলে পরের অধ্যায়ে যাবেন না—ভুলগুলো ২০ মিনিটে ঠিক করে পরদিন ১০ নম্বরের ছোট রিটেক নিয়ে তবেই সামনে বাড়ুন।',
        },
      ]
    : [
        {
          title: '01. Type-Sorted Scaffolding',
          desc: 'Break each chapter into 3–5 fixed question types instead of overwhelming a below-average student with 100 random problems.',
        },
        {
          title: '02. Live Spot-Check (Adai)',
          desc: 'After solving one example, immediately assign a twin problem to be solved live in front of you without looking at notes.',
        },
        {
          title: '03. 5-Minute Oral Formula & Sign Check',
          desc: 'Close all books for the final 5 minutes and test formulas, SI units, and sign conventions orally before ending the session.',
        },
        {
          title: '04. Dedicated Mistake Notebook',
          desc: 'Keep one thin notebook exclusively for recurring mistakes (e.g., Celsius-to-Kelvin, gram-to-kg, sign flips) for rapid pre-exam review.',
        },
        {
          title: '05. 35-Mark Chapter Test & 24/35 Unlock Gate',
          desc: 'Run a 45-minute test (15 MCQs + 2 CQs = 35 marks) at chapter end. Require ≥24 before unlocking the next chapter or subject.',
        },
      ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {bn
            ? 'দুর্বল স্টুডেন্ট পড়ানো, পড়া আদায় ও দৈনিক সময়-বণ্টন গাইড'
            : 'Below-Average Teaching Method, Adai Protocol & Daily Time Split'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {bn
            ? 'টিচারের ১টি অধ্যায় শেষ করে অন্য বিষয়ে যাওয়ার নিয়ম এবং স্টুডেন্টের প্রতিদিন বাসায় ৩.৫ ঘণ্টা সেলফ-স্টাডি করার কার্যকর রুটিন।'
            : 'Daily time-blocked schedule (1.5–2h Teacher Class + 3.5h Home Self-Study) built for steady retention without burnout.'}
        </p>
      </div>

      {/* Daily Time-Split Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            {bn ? 'প্রতিদিনের আদর্শ সময় রুটিন (মোট ~৫ ঘণ্টা ফোকাসড পড়া)' : 'Daily Time-Blocked Routine (~5 Hours Total)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {bn
              ? 'দুর্বল স্টুডেন্টের জন্য একবারে দীর্ঘ সময় না দিয়ে ছোট ছোট ব্লকে পড়া সবচেয়ে কার্যকর'
              : 'Short, focused blocks prevent cognitive overload and build daily consistency'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4 w-52">{bn ? 'সময় ব্লক' : 'Time Block'}</th>
                <th className="py-3 px-4 w-48">{bn ? 'কে / কোথায়' : 'Mode'}</th>
                <th className="py-3 px-4">{bn ? 'সুনির্দিষ্ট কাজ' : 'Exact Activity'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailyBlocks.map((b, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 text-xs font-mono-tabular font-semibold text-slate-900 whitespace-nowrap">
                    {b.slot}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-blue-800 whitespace-nowrap">
                    {b.who}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-slate-700 leading-relaxed">{b.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5-Step Teaching & Adai Loop */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {bn ? 'ক্লাস, প্র্যাকটিস, পড়া আদায় ও টেস্টের ৫-ধাপ পদ্ধতি' : '5-Step Teaching, Practice, Adai & Test Protocol'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {adaiSteps.map((step, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NCTB Books & 2x Revision Guarantee */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            {bn ? 'প্রয়োজনীয় NCTB বই ও সোর্স (HSC 2027 ফুল সিলেবাস)' : 'Required NCTB Books & Sources (HSC 2027)'}
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">
                {bn ? 'পদার্থবিজ্ঞান ১ম ও ২য় পত্র:' : 'Physics 1st & 2nd Paper:'}
              </span>{' '}
              {bn
                ? 'ড. শাহজাহান তপন অথবা প্রফেসর আমির হোসেন খানের NCTB মূল বই + বিগত ৫ বছরের বোর্ড CQ প্রশ্ন ব্যাংক।'
                : 'Dr. Shahjahan Tapan or Amir Hossain Khan NCTB Textbook + Past 5 Years Board CQ Bank.'}
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                {bn ? 'উচ্চতর গণিত ১ম ও ২য় পত্র:' : 'Higher Math 1st & 2nd Paper:'}
              </span>{' '}
              {bn
                ? 'এস. ইউ. আহমেদ অথবা কেতাব উদ্দীনের NCTB মূল বই (অনুশীলনীর টাইপ-ভিত্তিক দাগানো অংক)।'
                : 'S.U. Ahmed or Ketab Uddin NCTB Textbook (type-marked exercise problems).'}
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                {bn ? 'দুটি জরুরি খাতা:' : 'Two Mandatory Notebooks:'}
              </span>{' '}
              {bn
                ? '(১) আলাদা সূত্র খাতা (৪ পেপারের সব সূত্র একসাথে) এবং (২) ভুলের খাতা (Mistake Notebook)।'
                : '(1) Master Formula Notebook across all 4 papers, and (2) Mistake Notebook.'}
            </li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            {bn ? '২ বার রিভিশন কীভাবে নিশ্চিত হবে?' : 'How 2 Full Student Revisions Are Guaranteed'}
          </h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">
                {bn ? 'রিভিশন ১ (রোলিং + ধাপ ২ কনসলিডেশন):' : 'Revision 1 (Rolling + Phase 2 Consolidation):'}
              </span>{' '}
              {bn
                ? 'ধাপ ১-এ প্রতি রাতে ৪০ মিনিট রোলিং রিভিশন এবং সিলেবাস শেষের পর ৮ দিনে ৪টি পেপার ধরে পুনরায় সম্পূর্ণ অনুশীলন ও ৪টি পেপার মক টেস্ট।'
                : '40-min nightly rolling revision during Phase 1, followed by an 8-day paper-by-paper consolidation & 4 Paper Mock Tests.'}
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                {bn ? 'রিভিশন ২ (ধাপ ৩ র‍্যাপিড স্প্রিন্ট):' : 'Revision 2 (Phase 3 Rapid Sprint):'}
              </span>{' '}
              {bn
                ? '২৫ জানুয়ারির ঠিক আগে শেষ ৯ দিনে (প্রতি পেপার ২ দিন) স্টুডেন্ট নিজে সূত্র খাতা + কমন বোর্ড CQ + দৈনিক ৫০ MCQ ঝালাই করে ২য় বার পূর্ণ রিভিশন শেষ করবে।'
                : 'In the final 9 days before Jan 25 (2 days/paper), the student independently completes a rapid formula + top CQ + 50 MCQ/day sprint.'}
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
