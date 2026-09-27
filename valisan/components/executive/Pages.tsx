'use client';
import { useMemo, useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
import { useStore } from '@/data/store';
import { useFmt, useNow } from '@/lib/hooks';
import { addDays, sameDay, startOfDay } from '@/domain/jalali';
import { FITNESS_LEVEL_LABEL, GOAL_LABEL, INJURY_LABEL, MEMBERSHIP_STATUS_LABEL, ROLE_LABEL, TX_STATUS_LABEL } from '@/domain/labels';
import type { FitnessLevel, Transaction, TransactionStatus } from '@/domain/types';
import { Badge, Button, Card, Chip, Empty, Field, Input, Modal, Select, Stat, Textarea, type Tone } from '@/components/ui';
import { ExecutiveShell, Table } from './ExecutiveShell';

const TX_TONE: Record<TransactionStatus, Tone> = { initiated: 'neutral', succeeded: 'success', approved: 'success', failed: 'danger', rejected: 'danger', pending_verification: 'warning', refunded: 'info' };
const settled = (t: Transaction) => t.status === 'succeeded' || t.status === 'approved';

export function Overview() {
  const f = useFmt();
  const now = useNow();
  const tx = useStore((s) => s.transactions);
  const memberships = useStore((s) => s.memberships);
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const packages = useStore((s) => s.packages);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(startOfDay(now), i - 13)), [now]);
  const series = days.map((d) => ({ d, v: tx.filter((t) => settled(t) && sameDay(new Date(t.settledAt ?? t.createdAt), d)).reduce((n, t) => n + t.amountToman, 0) }));
  const max = Math.max(1, ...series.map((s) => s.v));
  const month = tx.filter((t) => settled(t) && new Date(t.settledAt ?? t.createdAt) > addDays(now, -30)).reduce((n, t) => n + t.amountToman, 0);
  const week = tx.filter((t) => settled(t) && new Date(t.settledAt ?? t.createdAt) > addDays(now, -7)).reduce((n, t) => n + t.amountToman, 0);
  const pending = tx.filter((t) => t.status === 'pending_verification');
  const active = memberships.filter((m) => m.status === 'active' && new Date(m.expiresAt) > now).length;
  const todayBookings = bookings.filter((b) => b.status === 'confirmed' && sameDay(new Date(b.bookedAt), now)).length;
  const [hover, setHover] = useState<number | null>(null);
  const byPkg = packages.map((p) => ({ p, n: tx.filter((t) => settled(t) && t.packageId === p.id).length }));
  return (
    <ExecutiveShell title="نمای کلی">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="درآمد ۳۰ روز اخیر" value={f.toman(month)} tone="brand" />
        <Stat label="درآمد ۷ روز اخیر" value={f.toman(week)} />
        <Stat label="عضویت‌های فعال" value={f.s(active)} sub={`${f.s(users.filter((u) => u.role === 'student').length)} هنرجو`} tone="success" />
        <Stat label="رسیدهای در انتظار" value={f.s(pending.length)} sub={`${f.s(todayBookings)} رزرو جدید امروز`} tone={pending.length ? 'warning' : 'neutral'} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="flex items-center justify-between"><div className="font-medium">درآمد روزانه · ۱۴ روز اخیر</div><div className="text-[12px] text-muted">تومان</div></div>
          <div className="relative mt-6 flex h-44 items-end gap-1.5" role="img" aria-label="نمودار درآمد روزانه">
            {series.map((s, i) => (
              <div key={i} className="group relative flex h-full flex-1 flex-col justify-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <div className="w-full rounded-t-[4px] bg-brand-500 transition-all duration-300" style={{ height: `${Math.max(2, (s.v / max) * 100)}%`, opacity: hover === null || hover === i ? 1 : 0.45 }} />
                {hover === i && <div className="glass absolute -top-12 start-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-xs)] px-2 py-1 text-[11px] shadow-md"><div className="text-muted">{f.d(s.d, 'weekday')}</div><div className="tabular font-medium">{f.toman(s.v)}</div></div>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted"><span>{f.d(days[0], 'dayMonth')}</span><span>امروز</span></div>
          <details className="mt-3 text-[12px] text-muted"><summary className="cursor-pointer">نمایش جدول داده‌ها</summary>
            <table className="mt-2 w-full text-[12px]"><tbody>{series.map((s, i) => <tr key={i} className="border-t border-border"><td className="py-1">{f.d(s.d, 'weekday')}</td><td className="py-1 text-end tabular">{f.toman(s.v)}</td></tr>)}</tbody></table>
          </details>
        </Card>
        <Card className="p-6">
          <div className="font-medium">فروش به تفکیک بسته</div>
          <ul className="mt-4 space-y-3">
            {byPkg.map(({ p, n }) => (
              <li key={p.id}><div className="flex items-center justify-between text-[13px]"><span>{p.title}</span><span className="tabular text-muted">{f.s(n)}</span></div><div className="mt-1 h-1.5 rounded-full bg-border"><div className="h-full rounded-full bg-brand-300" style={{ width: `${(n / Math.max(1, ...byPkg.map((x) => x.n))) * 100}%` }} /></div></li>
            ))}
          </ul>
          <Button href="/executive/queue" className="mt-6" full variant={pending.length ? 'primary' : 'ghost'}>{pending.length ? `بررسی ${f.s(pending.length)} رسید در انتظار` : 'صف بررسی خالی است'}</Button>
        </Card>
      </div>
    </ExecutiveShell>
  );
}

export function Queue() {
  const f = useFmt();
  const now = useNow();
  const tx = useStore((s) => s.transactions);
  const users = useStore((s) => s.users);
  const packages = useStore((s) => s.packages);
  const approve = useStore((s) => s.approveTransaction);
  const reject = useStore((s) => s.rejectTransaction);
  const [view, setView] = useState<Transaction | null>(null);
  const [rej, setRej] = useState<Transaction | null>(null);
  const [reason, setReason] = useState('مبلغ واریزی با مبلغ بسته مطابقت ندارد.');
  const pending = tx.filter((t) => t.status === 'pending_verification').sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const recent = tx.filter((t) => t.track === 'card_to_card' && t.status !== 'pending_verification').sort((a, b) => (b.settledAt ?? b.createdAt).localeCompare(a.settledAt ?? a.createdAt)).slice(0, 6);
  const uname = (id: string) => { const u = users.find((x) => x.id === id); return u ? `${u.firstName} ${u.lastName}` : id; };
  const ptitle = (id: string) => packages.find((p) => p.id === id)?.title ?? id;
  return (
    <ExecutiveShell title="صف بررسی رسیدهای کارت‌به‌کارت">
      {pending.length === 0 ? <Empty title="رسیدی در انتظار بررسی نیست" desc="رسیدهای جدید به‌محض ثبت توسط هنرجو اینجا نمایش داده می‌شوند." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((t) => (
            <Card key={t.id} className="overflow-hidden fade-up">
              <button onClick={() => setView(t)} className="relative block h-44 w-full bg-surface-2"><img src={t.cardToCard?.receipt?.dataUrl} alt="رسید" className="h-full w-full object-cover" /><span className="glass absolute bottom-2 end-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"><Eye size={12} /> بزرگ‌نمایی</span></button>
              <div className="space-y-2 p-5 text-[13.5px]">
                <div className="flex items-center justify-between"><span className="font-medium">{uname(t.userId)}</span><Badge tone="warning" dot>{f.rel(t.createdAt, now)}</Badge></div>
                <div className="grid grid-cols-2 gap-1 text-[12.5px] text-ink-2">
                  <span>بسته: {ptitle(t.packageId)}</span><span className="tabular">مبلغ: {f.toman(t.amountToman)}</span>
                  <span className="tabular">پیگیری: {f.s(t.cardToCard?.trackingNumber ?? '')}</span><span className="latin tabular text-muted">{t.id}</span>
                </div>
                <div className="flex gap-2 pt-2"><Button size="sm" onClick={() => approve(t.id)} className="flex-1"><Check size={15} /> تأیید</Button><Button size="sm" variant="danger" onClick={() => setRej(t)} className="flex-1"><X size={15} /> رد</Button></div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {recent.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 text-[15px] font-medium">بررسی‌های اخیر</div>
          <Table head={['هنرجو', 'بسته', 'مبلغ', 'پیگیری', 'تصمیم', 'زمان']}>
            {recent.map((t) => <tr key={t.id}><td className="px-4 py-2.5">{uname(t.userId)}</td><td className="px-4 py-2.5">{ptitle(t.packageId)}</td><td className="px-4 py-2.5 tabular">{f.toman(t.amountToman)}</td><td className="px-4 py-2.5 tabular">{f.s(t.cardToCard?.trackingNumber ?? '')}</td><td className="px-4 py-2.5"><Badge tone={TX_TONE[t.status]} dot>{TX_STATUS_LABEL[t.status]}</Badge>{t.cardToCard?.review?.reason && <div className="text-[11px] text-muted">{t.cardToCard.review.reason}</div>}</td><td className="px-4 py-2.5 text-muted">{f.d(t.settledAt ?? t.createdAt, 'weekday')}</td></tr>)}
          </Table>
        </div>
      )}
      <Modal open={!!view} onClose={() => setView(null)} title="تصویر رسید" width="max-w-md">{view && <img src={view.cardToCard?.receipt?.dataUrl} alt="رسید" className="w-full rounded-[var(--radius-md)]" />}</Modal>
      <Modal open={!!rej} onClose={() => setRej(null)} title="رد رسید">
        <Field label="دلیل رد (برای هنرجو پیامک می‌شود)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <div className="mt-2 flex flex-wrap gap-2">{['مبلغ واریزی با مبلغ بسته مطابقت ندارد.', 'شماره پیگیری در سامانه بانک یافت نشد.', 'تصویر رسید ناخوانا است.'].map((r) => <Chip key={r} selected={reason === r} onClick={() => setReason(r)} className="!py-1 !px-3 text-[12px]">{r}</Chip>)}</div>
        <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setRej(null)}>انصراف</Button><Button variant="danger" disabled={!reason.trim()} onClick={() => { if (rej) reject(rej.id, reason.trim()); setRej(null); }}>ثبت رد</Button></div>
      </Modal>
    </ExecutiveShell>
  );
}

export function Ledger() {
  const f = useFmt();
  const tx = useStore((s) => s.transactions);
  const users = useStore((s) => s.users);
  const packages = useStore((s) => s.packages);
  const [status, setStatus] = useState<'all' | TransactionStatus>('all');
  const [track, setTrack] = useState<'all' | 'ipg' | 'card_to_card'>('all');
  const list = tx.filter((t) => (status === 'all' || t.status === status) && (track === 'all' || t.track === track)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = list.filter(settled).reduce((n, t) => n + t.amountToman, 0);
  return (
    <ExecutiveShell title="دفتر مالی">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['all', 'ipg', 'card_to_card'] as const).map((k) => <Chip key={k} selected={track === k} onClick={() => setTrack(k)} className="!py-1 !px-3 text-[12px]">{k === 'all' ? 'همه روش‌ها' : k === 'ipg' ? 'درگاه آنلاین' : 'کارت به کارت'}</Chip>)}
        <span className="mx-1 h-5 w-px bg-border" />
        {(['all', 'succeeded', 'approved', 'pending_verification', 'failed', 'rejected'] as const).map((k) => <Chip key={k} selected={status === k} onClick={() => setStatus(k)} className="!py-1 !px-3 text-[12px]">{k === 'all' ? 'همه وضعیت‌ها' : TX_STATUS_LABEL[k]}</Chip>)}
        <span className="ms-auto text-[13px] text-muted">جمع تسویه‌شده: <span className="tabular text-ink">{f.toman(total)}</span></span>
      </div>
      <Table head={['شناسه', 'هنرجو', 'بسته', 'مبلغ', 'روش', 'وضعیت', 'مرجع', 'تاریخ']}>
        {list.map((t) => { const u = users.find((x) => x.id === t.userId); return (
          <tr key={t.id} className="hover:bg-brand-50/40">
            <td className="px-4 py-2.5 latin tabular text-[12px] text-muted">{t.id}</td>
            <td className="px-4 py-2.5">{u ? `${u.firstName} ${u.lastName}` : '—'}</td>
            <td className="px-4 py-2.5">{packages.find((p) => p.id === t.packageId)?.title}</td>
            <td className="px-4 py-2.5 tabular">{f.toman(t.amountToman)}</td>
            <td className="px-4 py-2.5">{t.track === 'ipg' ? 'درگاه' : 'کارت‌به‌کارت'}</td>
            <td className="px-4 py-2.5"><Badge tone={TX_TONE[t.status]} dot>{TX_STATUS_LABEL[t.status]}</Badge></td>
            <td className="px-4 py-2.5 latin tabular text-[12px] text-muted">{t.ipg?.refId ? f.s(t.ipg.refId) : t.cardToCard?.trackingNumber ? f.s(t.cardToCard.trackingNumber) : t.ipg?.failureCode ?? '—'}</td>
            <td className="px-4 py-2.5 text-muted">{f.d(t.createdAt, 'numeric')} {f.t(t.createdAt)}</td>
          </tr>); })}
        {list.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">تراکنشی یافت نشد.</td></tr>}
      </Table>
    </ExecutiveShell>
  );
}

export function UsersPage() {
  const f = useFmt();
  const now = useNow();
  const users = useStore((s) => s.users);
  const memberships = useStore((s) => s.memberships);
  const packages = useStore((s) => s.packages);
  const coaches = useStore((s) => s.coaches);
  const [q, setQ] = useState('');
  const list = users.filter((u) => `${u.firstName} ${u.lastName} ${u.phone}`.includes(q.trim()));
  return (
    <ExecutiveShell title="پایگاه کاربران">
      <div className="mb-4 max-w-sm"><Input placeholder="جستجو بر اساس نام یا شماره…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Table head={['کاربر', 'نقش', 'موبایل', 'مربی', 'عضویت', 'سهمیه', 'اعتبار']}>
        {list.map((u) => {
          const m = memberships.filter((x) => x.userId === u.id && (x.status === 'active' || x.status === 'pending_payment') && new Date(x.expiresAt) > now)[0];
          return (
            <tr key={u.id} className="hover:bg-brand-50/40">
              <td className="px-4 py-2.5 font-medium">{u.firstName} {u.lastName}</td>
              <td className="px-4 py-2.5"><Badge tone={u.role === 'super_admin' ? 'gold' : u.role === 'coach' ? 'brand' : 'neutral'}>{ROLE_LABEL[u.role]}</Badge></td>
              <td className="px-4 py-2.5 tabular">{f.s(u.phone)}</td>
              <td className="px-4 py-2.5 text-ink-2">{u.assignedCoachIds.map((c) => coaches.find((x) => x.id === c)?.displayName).filter(Boolean).join('، ') || '—'}</td>
              <td className="px-4 py-2.5">{m ? <><span>{packages.find((p) => p.id === m.packageId)?.title}</span> <Badge tone={m.status === 'active' ? 'success' : 'warning'}>{MEMBERSHIP_STATUS_LABEL[m.status]}</Badge></> : <span className="text-muted">—</span>}</td>
              <td className="px-4 py-2.5 tabular">{m ? `${f.s(m.quotaUsed + m.quotaHeld)} / ${f.s(m.quotaTotal)}` : '—'}</td>
              <td className="px-4 py-2.5 text-muted">{m ? f.d(m.expiresAt, 'numeric') : '—'}</td>
            </tr>
          );
        })}
      </Table>
    </ExecutiveShell>
  );
}

export function HealthRecords() {
  const f = useFmt();
  const records = useStore((s) => s.healthAssessments);
  const users = useStore((s) => s.users);
  const review = useStore((s) => s.reviewAssessment);
  const [openId, setOpenId] = useState<string | null>(null);
  const [level, setLevel] = useState<FitnessLevel>('intermediate');
  const [note, setNote] = useState('');
  const rec = records.find((r) => r.id === openId);
  const u = rec && users.find((x) => x.id === rec.userId);
  const yes = (b: boolean) => (b ? 'بله' : 'خیر');
  return (
    <ExecutiveShell title="پرونده‌های سلامت (محرمانه)">
      <div className="mb-4 rounded-[var(--radius-md)] border border-gold-400/50 bg-gold-400/8 p-3 text-[12.5px] text-ink-2">این بخش فقط برای مدیر ارشد قابل مشاهده است. مربیان صرفاً «سطح پیشنهادی» را می‌بینند. هر مشاهده در گزارش ثبت می‌شود.</div>
      <Table head={['هنرجو', 'ثبت', 'سطح اعلامی', 'اهداف', 'هشدارها', 'وضعیت', '']}>
        {records.map((r) => { const usr = users.find((x) => x.id === r.userId); const flags = [r.cardioMetabolic.hypertension && 'فشار خون', r.cardioMetabolic.diabetes && 'دیابت', r.cardioMetabolic.heartCondition && 'قلبی', r.cardioMetabolic.thyroid && 'تیروئید', r.pregnancy.isPregnant && 'بارداری', r.pregnancy.isPostpartum && 'پس از زایمان', ...r.injuries.map((i) => INJURY_LABEL[i])].filter(Boolean) as string[]; return (
          <tr key={r.id} className="hover:bg-brand-50/40">
            <td className="px-4 py-2.5 font-medium">{usr ? `${usr.firstName} ${usr.lastName}` : r.userId}</td>
            <td className="px-4 py-2.5 text-muted">{f.d(r.submittedAt, 'numeric')}</td>
            <td className="px-4 py-2.5">{FITNESS_LEVEL_LABEL[r.fitnessLevel]}</td>
            <td className="px-4 py-2.5 text-ink-2">{r.goals.map((g) => GOAL_LABEL[g]).join('، ')}</td>
            <td className="px-4 py-2.5"><div className="flex flex-wrap gap-1">{flags.length ? flags.map((x) => <Badge key={x} tone="danger">{x}</Badge>) : <span className="text-muted">—</span>}</div></td>
            <td className="px-4 py-2.5">{r.reviewedBy ? <Badge tone="success" dot>بررسی شده</Badge> : <Badge tone="warning" dot>در انتظار</Badge>}</td>
            <td className="px-4 py-2.5"><Button size="sm" variant="ghost" onClick={() => { setOpenId(r.id); setLevel(r.reviewedBy?.recommendedLevel ?? r.fitnessLevel); setNote(r.reviewedBy?.note ?? ''); }}><Eye size={14} /> مشاهده</Button></td>
          </tr>); })}
      </Table>
      <Modal open={!!rec} onClose={() => setOpenId(null)} title={u ? `پرونده ${u.firstName} ${u.lastName}` : 'پرونده'} width="max-w-2xl">
        {rec && (
          <div className="space-y-4 text-[13.5px]">
            <div className="grid gap-2 rounded-[var(--radius-md)] bg-surface-2 p-4 sm:grid-cols-2">
              <div><span className="text-muted">سطح: </span>{FITNESS_LEVEL_LABEL[rec.fitnessLevel]}</div>
              <div><span className="text-muted">اهداف: </span>{rec.goals.map((g) => GOAL_LABEL[g]).join('، ')}</div>
              <div><span className="text-muted">فشار خون / دیابت / قلبی / تیروئید: </span>{[rec.cardioMetabolic.hypertension, rec.cardioMetabolic.diabetes, rec.cardioMetabolic.heartCondition, rec.cardioMetabolic.thyroid].map(yes).join(' / ')}</div>
              <div><span className="text-muted">بارداری / پس از زایمان: </span>{yes(rec.pregnancy.isPregnant)} / {yes(rec.pregnancy.isPostpartum)}</div>
              <div className="sm:col-span-2"><span className="text-muted">آسیب‌ها: </span>{rec.injuries.map((i) => INJURY_LABEL[i]).join('، ') || 'ندارد'}{rec.injuryNotes && ` — ${rec.injuryNotes}`}</div>
              {rec.jointLimitations && <div className="sm:col-span-2"><span className="text-muted">محدودیت مفاصل: </span>{rec.jointLimitations}</div>}
              {rec.cardioMetabolic.notes && <div className="sm:col-span-2"><span className="text-muted">توضیحات پزشکی: </span>{rec.cardioMetabolic.notes}</div>}
              <div className="sm:col-span-2"><span className="text-muted">سبک زندگی: </span>خواب {f.s(rec.lifestyle.sleepHours)} ساعت · فعالیت {f.s(rec.lifestyle.activityDaysPerWeek)} روز/هفته · نشستن {f.s(rec.lifestyle.deskHoursPerDay)} ساعت/روز · استرس {f.s(rec.lifestyle.stressLevel)}/۵ · دخانیات: {yes(rec.lifestyle.smoking)}</div>
              <div className="sm:col-span-2 text-[12px] text-muted">رضایت‌نامه محرمانگی: پذیرفته‌شده در {f.d(rec.consent.acceptedAt, 'numeric')}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
              <Field label="سطح پیشنهادی"><Select value={level} onChange={(e) => setLevel(e.target.value as FitnessLevel)}>{(Object.keys(FITNESS_LEVEL_LABEL) as FitnessLevel[]).map((k) => <option key={k} value={k}>{FITNESS_LEVEL_LABEL[k]}</option>)}</Select></Field>
              <Field label="یادداشت کادر تخصصی"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثلاً: مناسب ریفرمر نیمه‌خصوصی با تأکید بر ثبات کمر…" /></Field>
            </div>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpenId(null)}>بستن</Button><Button onClick={() => { review(rec.id, level, note.trim() || 'بررسی شد.'); setOpenId(null); }}>ثبت بررسی</Button></div>
          </div>
        )}
      </Modal>
    </ExecutiveShell>
  );
}

export function SettingsPage() {
  const f = useFmt();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const coaches = useStore((s) => s.coaches);
  const [cut, setCut] = useState(settings.modificationCutoffHours);
  const [lead, setLead] = useState(settings.reminderLeadMinutes);
  const [card, setCard] = useState(settings.studioCard);
  const [saved, setSaved] = useState(false);
  return (
    <ExecutiveShell title="تنظیمات استودیو">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div className="font-medium">قوانین رزرو</div>
          <Field label="مهلت لغو/جابه‌جایی (ساعت قبل از شروع)" hint="هنرجویان پس از این مهلت نمی‌توانند جلسه را تغییر دهند."><Input type="number" min={0} max={72} value={cut} onChange={(e) => setCut(Number(e.target.value))} className="tabular" /></Field>
          <Field label="یادآوری پیامکی (دقیقه قبل از کلاس)"><Input type="number" min={15} max={1440} step={15} value={lead} onChange={(e) => setLead(Number(e.target.value))} className="tabular" /></Field>
          <div className="text-[13px] text-muted">روز تعطیل: جمعه</div>
        </Card>
        <Card className="p-6 space-y-4">
          <div className="font-medium">حساب کارت‌به‌کارت</div>
          <Field label="بانک"><Input value={card.bank} onChange={(e) => setCard({ ...card, bank: e.target.value })} /></Field>
          <Field label="شماره کارت"><Input dir="ltr" className="latin text-start tabular" value={card.pan} onChange={(e) => setCard({ ...card, pan: e.target.value })} /></Field>
          <Field label="شبا"><Input dir="ltr" className="latin text-start tabular" value={card.iban} onChange={(e) => setCard({ ...card, iban: e.target.value })} /></Field>
          <Field label="به نام"><Input value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} /></Field>
        </Card>
        <Card className="p-6 lg:col-span-2">
          <div className="mb-3 font-medium">ظرفیت مربیان (به ازای هر جلسه)</div>
          <Table head={['مربی', 'خصوصی', 'نیمه‌خصوصی', 'گروهی', 'پذیرش هنرجوی جدید']}>
            {coaches.map((c) => <tr key={c.id}><td className="px-4 py-2.5 font-medium">{c.displayName}</td><td className="px-4 py-2.5 tabular">{f.s(c.capacity.private)}</td><td className="px-4 py-2.5 tabular">{f.s(c.capacity.semi_private)}</td><td className="px-4 py-2.5 tabular">{f.s(c.capacity.group)}</td><td className="px-4 py-2.5">{c.isAcceptingNewClients ? <Badge tone="success">فعال</Badge> : <Badge tone="warning">لیست انتظار</Badge>}</td></tr>)}
          </Table>
        </Card>
      </div>
      <div className="mt-5 flex items-center gap-3"><Button onClick={() => { update({ modificationCutoffHours: cut, reminderLeadMinutes: lead, studioCard: card }); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>ذخیره تنظیمات</Button>{saved && <span className="text-[13px] text-success fade-up">ذخیره شد.</span>}</div>
    </ExecutiveShell>
  );
}

export function AuditPage() {
  const f = useFmt();
  const audit = useStore((s) => s.audit);
  const notifications = useStore((s) => s.notifications);
  const users = useStore((s) => s.users);
  const [tab, setTab] = useState<'audit' | 'sms'>('audit');
  const sms = notifications.filter((n) => n.channel === 'sms').slice(0, 40);
  const uname = (id: string) => { if (id === 'system') return 'سیستم'; const u = users.find((x) => x.id === id); return u ? `${u.firstName} ${u.lastName}` : id; };
  return (
    <ExecutiveShell title="گزارش فعالیت و پیامک‌ها">
      <div className="mb-4 flex gap-2"><Chip selected={tab === 'audit'} onClick={() => setTab('audit')}>گزارش فعالیت</Chip><Chip selected={tab === 'sms'} onClick={() => setTab('sms')}>پیامک‌های ارسال‌شده ({f.s(sms.length)})</Chip></div>
      {tab === 'audit' ? (
        <Table head={['زمان', 'عامل', 'رویداد', 'جزئیات']}>
          {audit.slice(0, 60).map((a) => <tr key={a.id}><td className="px-4 py-2.5 text-muted tabular">{f.d(a.at, 'numeric')} {f.t(a.at)}</td><td className="px-4 py-2.5">{uname(a.actorId)}</td><td className="px-4 py-2.5 latin text-[12px]">{a.action}</td><td className="px-4 py-2.5 text-ink-2">{f.s(a.detail)}</td></tr>)}
        </Table>
      ) : (
        <Table head={['زمان', 'گیرنده', 'متن پیامک']}>
          {sms.map((n) => { const u = users.find((x) => x.id === n.userId); return <tr key={n.id}><td className="px-4 py-2.5 text-muted tabular">{f.d(n.createdAt, 'numeric')} {f.t(n.createdAt)}</td><td className="px-4 py-2.5">{u ? `${u.firstName} ${u.lastName}` : '—'}<div className="text-[11px] tabular text-muted">{f.s(u?.phone ?? '')}</div></td><td className="px-4 py-2.5 text-ink-2 leading-6">{f.s(n.body)}</td></tr>; })}
        </Table>
      )}
    </ExecutiveShell>
  );
}
