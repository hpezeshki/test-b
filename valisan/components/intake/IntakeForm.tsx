'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { DEFAULT_INTAKE, useStore, type IntakeDraft } from '@/data/store';
import { FITNESS_LEVEL_LABEL, GOAL_LABEL, INJURY_LABEL, REASSURANCE } from '@/domain/labels';
import type { FitnessLevel, Goal, InjuryArea } from '@/domain/types';
import { useFmt } from '@/lib/hooks';
import { Button, Chip, Field, Input, Progress, Textarea, Toggle } from '@/components/ui';
import { cn } from '@/lib/cn';

const STEPS = ['سطح تجربه', 'اهداف شما', 'سابقه قلبی و متابولیک', 'آسیب‌ها و مفاصل', 'سبک زندگی', 'تأیید محرمانگی'];

/** Six-step conversational health & lifestyle intake. Autosaves each step to the isolated intake draft. */
export function IntakeForm({ onDone }: { onDone: () => void }) {
  const draft = useStore((s) => s.intakeDraft);
  const save = useStore((s) => s.saveIntake);
  const submit = useStore((s) => s.submitAssessment);
  const f = useFmt();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const d: IntakeDraft = useMemo(() => ({ ...DEFAULT_INTAKE, ...draft }), [draft]);

  const valid = [
    () => !!d.fitnessLevel,
    () => d.goals.length > 0,
    () => true,
    () => true,
    () => d.lifestyle.sleepHours > 0,
    () => d.consentAccepted,
  ][step]();

  const next = () => {
    if (!valid) { setError(step === 1 ? 'دست‌کم یک هدف را انتخاب کنید.' : 'لطفاً این مورد را تکمیل کنید.'); return; }
    setError(null);
    if (step === STEPS.length - 1) { submit(); onDone(); return; }
    setStep((s) => s + 1);
  };

  return (
    <div className="card p-6 md:p-8 fade-up" key={step}>
      <div className="mb-6">
        <div className="flex items-center justify-between text-[12px] text-muted"><span>گام {f.s(step + 1)} از {f.s(STEPS.length)} · {STEPS[step]}</span><span className="tabular">{f.s(Math.round(((step + 1) / STEPS.length) * 100))}٪</span></div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2" />
      </div>

      <div className="card-lilac mb-6 flex items-start gap-3 p-4 text-[13px] leading-6 text-ink-2">
        <ShieldCheck size={20} className="mt-0.5 shrink-0 text-gold-600" /><span>{REASSURANCE}</span>
      </div>

      {step === 0 && (
        <Q title="سطح تجربه‌ی تمرینی شما چیست؟" hint="این پاسخ به ما کمک می‌کند شدت شروع را درست انتخاب کنیم.">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(FITNESS_LEVEL_LABEL) as FitnessLevel[]).map((k) => (
              <Chip key={k} selected={d.fitnessLevel === k} onClick={() => save({ fitnessLevel: k })} className="justify-start !rounded-[var(--radius-md)] !py-3">{FITNESS_LEVEL_LABEL[k]}</Chip>
            ))}
          </div>
        </Q>
      )}
      {step === 1 && (
        <Q title="هدف اصلی شما از تمرین چیست؟" hint="می‌توانید چند مورد انتخاب کنید.">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(GOAL_LABEL) as Goal[]).map((k) => {
              const on = d.goals.includes(k);
              return <Chip key={k} selected={on} onClick={() => save({ goals: on ? d.goals.filter((g) => g !== k) : [...d.goals, k] })} className="justify-start !rounded-[var(--radius-md)] !py-3">{GOAL_LABEL[k]}</Chip>;
            })}
          </div>
        </Q>
      )}
      {step === 2 && (
        <Q title="سابقه‌ی قلبی‌عروقی یا متابولیک" hint="در صورت وجود، مربی شما شدت و نوع تمرین را متناسب تنظیم می‌کند.">
          <div className="grid gap-2 sm:grid-cols-2">
            {([['hypertension', 'فشار خون بالا'], ['diabetes', 'دیابت'], ['heartCondition', 'بیماری قلبی'], ['thyroid', 'اختلال تیروئید']] as const).map(([k, l]) => (
              <Toggle key={k} label={l} checked={d.cardioMetabolic[k]} onChange={(v) => save({ cardioMetabolic: { ...d.cardioMetabolic, [k]: v } })} />
            ))}
          </div>
          <Field label="توضیحات (اختیاری)" className="mt-4"><Textarea value={d.cardioMetabolic.notes} onChange={(e) => save({ cardioMetabolic: { ...d.cardioMetabolic, notes: e.target.value } })} placeholder="مثلاً: داروی مصرفی، محدودیت پزشک…" /></Field>
        </Q>
      )}
      {step === 3 && (
        <Q title="آسیب‌های قبلی و محدودیت مفاصل" hint="نواحی‌ای که سابقه‌ی آسیب یا درد دارند را علامت بزنید.">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(INJURY_LABEL) as InjuryArea[]).map((k) => {
              const on = d.injuries.includes(k);
              return <Chip key={k} selected={on} onClick={() => save({ injuries: on ? d.injuries.filter((x) => x !== k) : [...d.injuries, k] })}>{INJURY_LABEL[k]}</Chip>;
            })}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="شرح آسیب (اختیاری)"><Textarea value={d.injuryNotes} onChange={(e) => save({ injuryNotes: e.target.value })} placeholder="مثلاً: دیسک کمر در سال ۱۴۰۱" /></Field>
            <Field label="محدودیت مفاصل (اختیاری)"><Textarea value={d.jointLimitations} onChange={(e) => save({ jointLimitations: e.target.value })} placeholder="مثلاً: محدودیت چرخش گردن" /></Field>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Toggle label="باردار هستم" checked={d.pregnancy.isPregnant} onChange={(v) => save({ pregnancy: { ...d.pregnancy, isPregnant: v } })} />
            <Toggle label="در دوره‌ی پس از زایمان هستم" checked={d.pregnancy.isPostpartum} onChange={(v) => save({ pregnancy: { ...d.pregnancy, isPostpartum: v } })} />
          </div>
        </Q>
      )}
      {step === 4 && (
        <Q title="عادت‌های سبک زندگی" hint="اعداد تقریبی کافی است.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ساعت خواب شبانه"><Input type="number" min={3} max={12} value={d.lifestyle.sleepHours} onChange={(e) => save({ lifestyle: { ...d.lifestyle, sleepHours: Number(e.target.value) } })} className="tabular" /></Field>
            <Field label="روزهای فعالیت در هفته"><Input type="number" min={0} max={7} value={d.lifestyle.activityDaysPerWeek} onChange={(e) => save({ lifestyle: { ...d.lifestyle, activityDaysPerWeek: Number(e.target.value) } })} className="tabular" /></Field>
            <Field label="ساعت نشستن پشت میز در روز"><Input type="number" min={0} max={16} value={d.lifestyle.deskHoursPerDay} onChange={(e) => save({ lifestyle: { ...d.lifestyle, deskHoursPerDay: Number(e.target.value) } })} className="tabular" /></Field>
          </div>
          <div className="mt-4">
            <div className="mb-2 text-[13px] font-medium text-ink-2">سطح استرس روزانه</div>
            <div className="flex gap-2">{([1, 2, 3, 4, 5] as const).map((n) => <Chip key={n} selected={d.lifestyle.stressLevel === n} onClick={() => save({ lifestyle: { ...d.lifestyle, stressLevel: n } })} className="w-12 justify-center tabular">{f.s(n)}</Chip>)}</div>
            <div className="mt-1 flex justify-between text-[11px] text-muted"><span>آرام</span><span>بسیار پراسترس</span></div>
          </div>
          <div className="mt-4"><Toggle label="سیگار یا قلیان مصرف می‌کنم" checked={d.lifestyle.smoking} onChange={(v) => save({ lifestyle: { ...d.lifestyle, smoking: v } })} /></div>
        </Q>
      )}
      {step === 5 && (
        <Q title="تأیید محرمانگی و ثبت" hint="پیش از ثبت، خلاصه‌ی پاسخ‌های خود را مرور کنید.">
          <div className="grid gap-2 rounded-[var(--radius-md)] bg-surface-2 p-4 text-[13.5px] sm:grid-cols-2">
            <Row k="سطح" v={FITNESS_LEVEL_LABEL[d.fitnessLevel]} />
            <Row k="اهداف" v={d.goals.map((g) => GOAL_LABEL[g]).join('، ') || '—'} />
            <Row k="سابقه پزشکی" v={Object.entries({ hypertension: 'فشار خون', diabetes: 'دیابت', heartCondition: 'قلبی', thyroid: 'تیروئید' }).filter(([k]) => d.cardioMetabolic[k as keyof typeof d.cardioMetabolic]).map(([, l]) => l).join('، ') || 'ندارد'} />
            <Row k="آسیب‌ها" v={d.injuries.map((i) => INJURY_LABEL[i]).join('، ') || 'ندارد'} />
            <Row k="خواب / فعالیت" v={`${f.s(d.lifestyle.sleepHours)} ساعت · ${f.s(d.lifestyle.activityDaysPerWeek)} روز در هفته`} />
            <Row k="استرس" v={`${f.s(d.lifestyle.stressLevel)} از ${f.s(5)}`} />
          </div>
          <label className={cn('mt-5 flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border p-4 transition-colors', d.consentAccepted ? 'border-brand-300 bg-brand-50/60' : 'border-border-strong')}>
            <input type="checkbox" className="mt-1 size-5 accent-[#D477CF]" checked={d.consentAccepted} onChange={(e) => save({ consentAccepted: e.target.checked })} />
            <span className="text-[14px] leading-7">متن محرمانگی را مطالعه کردم و می‌پذیرم که اطلاعات سلامت من صرفاً توسط کادر تخصصی والیسان برای شخصی‌سازی تمرین بررسی شود.</span>
          </label>
        </Q>
      )}

      {error && <div className="mt-4 text-[13px] text-danger">{error}</div>}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => { setError(null); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0}><ArrowRight size={16} /> مرحله قبل</Button>
        <Button onClick={next} disabled={step === STEPS.length - 1 && !d.consentAccepted}>{step === STEPS.length - 1 ? 'ثبت و ادامه' : 'ادامه'} <ArrowLeft size={16} /></Button>
      </div>
    </div>
  );
}

function Q({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[20px] font-medium md:text-[22px]">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) { return <div><span className="text-muted">{k}: </span><span>{v}</span></div>; }
