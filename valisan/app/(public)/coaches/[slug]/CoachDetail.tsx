'use client';
import { Award, Clock, Star } from 'lucide-react';
import type { Coach } from '@/domain/types';
import { MODALITY_LABEL, SESSION_TYPE_LABEL } from '@/domain/labels';
import { WEEKDAYS } from '@/domain/jalali';
import { useFmt } from '@/lib/hooks';
import { Badge, Button, Card, Photo } from '@/components/ui';
import { coachPhotos } from '@/data/seed/images';

export function CoachDetail({ coach }: { coach: Coach }) {
  const f = useFmt();
  return (
    <section className="container-x py-14 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <Card className="overflow-hidden text-center">
            <Photo srcs={coachPhotos(coach.id)} alt={coach.displayName} hue={coach.accent} className="aspect-[4/5]" overlay="soft" />
            <div className="p-8 pt-6">
            <h1 className="text-[24px] font-medium">{coach.displayName}</h1>
            <div className="text-[14px] text-muted">{coach.title}</div>
            <div className="mt-3 flex items-center justify-center gap-3 text-[13px] text-muted">
              <span className="flex items-center gap-1"><Star size={13} className="text-gold-400" fill="currentColor" /> {f.s(coach.rating)}</span>
              <span>{f.s(coach.yearsExperience)} سال تجربه</span>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">{coach.modalities.map((m) => <Badge key={m} tone="brand">{MODALITY_LABEL[m]}</Badge>)}</div>
            <div className="mt-5">{coach.isAcceptingNewClients ? <Badge tone="success" dot>پذیرش هنرجوی جدید</Badge> : <Badge tone="warning" dot>لیست انتظار</Badge>}</div>
            <Button href="/pricing" className="mt-6" full>رزرو جلسه با {coach.displayName.split(' ')[0]}</Button>
            </div>
          </Card>
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-2 font-medium"><Award size={18} className="text-gold-600" /> مدارک و گواهی‌نامه‌ها</div>
            <ul className="space-y-3">
              {coach.certifications.map((c) => (
                <li key={c.title} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="latin text-[14px] font-medium text-ink">{c.title}</div>
                  <div className="text-[12px] text-muted"><span className="latin">{c.issuer}</span> · {f.s(c.year)}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-8">
          <blockquote className="border-s-2 border-gold-400 ps-5 text-[20px] font-light leading-[1.8] text-ink-2">«{coach.quote}»</blockquote>
          <p className="text-[16px] leading-[1.9] text-ink-2">{coach.bio}</p>
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 font-medium"><Clock size={18} className="text-brand-500" /> ساعات حضور در استودیو</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {coach.studioHours.map((h, i) => (
                <div key={i} className="flex items-center justify-between rounded-[var(--radius-sm)] bg-surface-2 px-4 py-3 text-[14px]">
                  <span className="font-medium">{WEEKDAYS[h.weekday]}</span>
                  <span className="tabular text-ink-2">{h.windows.map((w) => `${f.s(w.start)}–${f.s(w.end)}`).join('، ')}</span>
                  <span className="text-[12px] text-muted">{SESSION_TYPE_LABEL[h.sessionType]} · حداکثر {f.s(coach.capacity[h.sessionType])} نفر</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
