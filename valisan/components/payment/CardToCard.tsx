'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, ImagePlus, Landmark, Trash2, UploadCloud } from 'lucide-react';
import { useHydrated, useStore } from '@/data/store';
import { useCopy, useFmt, useQueryParam } from '@/lib/hooks';
import { RoleGuard } from '@/lib/rbac';
import { Button, Card, Field, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

/** Client-side downscale to ≤1280px JPEG so IndexedDB stays small. */
async function shrink(file: File): Promise<{ name: string; dataUrl: string; sizeKb: number }> {
  const dataUrl = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(file); });
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
  const out = c.toDataURL('image/jpeg', 0.82);
  return { name: file.name, dataUrl: out, sizeKb: Math.round((out.length * 3) / 4 / 1024) };
}

export function CardToCard() {
  const router = useRouter();
  const pkgSlug = useQueryParam('pkg');
  const hydrated = useHydrated();
  const settings = useStore((s) => s.settings);
  const checkout = useStore((s) => s.checkout);
  const startCheckout = useStore((s) => s.startCheckout);
  const pkg = useStore((s) => s.packages).find((p) => p.slug === (checkout?.packageSlug ?? pkgSlug));
  const submit = useStore((s) => s.submitCardToCard);
  const f = useFmt();
  const { copied, copy } = useCopy();
  const [tracking, setTracking] = useState('');
  const [receipt, setReceipt] = useState<{ name: string; dataUrl: string; sizeKb: number } | null>(null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('فقط تصویر (JPG/PNG) پذیرفته می‌شود.'); return; }
    setErr(null);
    setReceipt(await shrink(file));
  };
  const send = () => {
    if (!/^\d{4,}$/.test(tracking.replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))))) { setErr('شماره پیگیری معتبر وارد کنید (حداقل ۴ رقم).'); return; }
    if (!receipt) { setErr('تصویر رسید را بارگذاری کنید.'); return; }
    setBusy(true);
    if (pkg && !checkout) startCheckout(pkg.slug);
    setTimeout(() => { submit({ trackingNumber: tracking.replace(/[۰-۹]/g, (c) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))), receipt }); router.push(`/join/${pkg?.slug ?? 'monthly-12'}/done/`); }, 900);
  };

  if (!hydrated) return null;
  const rows: Array<{ k: string; v: string; latin?: boolean; raw?: string }> = [
    { k: 'شماره کارت', v: settings.studioCard.pan, latin: true },
    { k: 'شماره شبا', v: settings.studioCard.iban, latin: true },
    { k: 'به نام', v: settings.studioCard.holder },
    { k: 'بانک', v: settings.studioCard.bank },
    ...(pkg ? [{ k: 'مبلغ', v: f.toman(pkg.priceToman), raw: String(pkg.priceToman) }] : []),
  ];

  return (
    <RoleGuard allow={['student', 'super_admin']} next="/pay/card">
      <section className="container-x py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6"><div className="eyebrow">Card to card</div><h1 className="mt-1 text-[28px] font-light">پرداخت کارت به کارت</h1><p className="mt-1 text-[13.5px] text-muted">مبلغ را به کارت استودیو منتقل کنید، شماره پیگیری را وارد و تصویر رسید را بارگذاری کنید. پس از بررسی مدیریت، عضویت شما فعال می‌شود.</p></div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2 font-medium"><Landmark size={18} className="text-brand-500" /> اطلاعات حساب استودیو</div>
              <ul className="space-y-2">
                {rows.map((r) => (
                  <li key={r.k} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2.5">
                    <span className="text-[12px] text-muted">{r.k}</span>
                    <span className={cn('flex-1 text-end text-[14px] tabular', r.latin && 'latin text-start')}>{r.latin ? r.v : f.s(r.v)}</span>
                    <button onClick={() => copy((r.raw ?? r.v).replace(/\s/g, ''), r.k)} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-brand-50 hover:text-ink" aria-label={`کپی ${r.k}`}>{copied === r.k ? <Check size={15} className="text-success" /> : <Copy size={15} />}</button>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] leading-6 text-muted">پس از انتقال، شماره پیگیری روی رسید بانک را در فرم روبه‌رو وارد کنید.</p>
            </Card>
            <Card className="p-6">
              <Field label="شماره پیگیری بانک" error={err && !receipt && tracking ? undefined : undefined}><Input inputMode="numeric" dir="ltr" className="text-start tabular" placeholder="مثلاً 734120" value={tracking} onChange={(e) => setTracking(e.target.value)} /></Field>
              <div className="mt-4">
                <div className="mb-1.5 text-[13px] font-medium text-ink-2">تصویر رسید</div>
                {receipt ? (
                  <div className="relative overflow-hidden rounded-[var(--radius-md)] border border-border">
                    <img src={receipt.dataUrl} alt="رسید" className="max-h-56 w-full object-cover" />
                    <div className="flex items-center justify-between bg-surface px-3 py-2 text-[12px] text-muted"><span className="latin truncate">{receipt.name} · {f.s(receipt.sizeKb)} KB</span><button onClick={() => setReceipt(null)} className="flex items-center gap-1 text-danger"><Trash2 size={13} /> حذف</button></div>
                  </div>
                ) : (
                  <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); void onFiles(e.dataTransfer.files); }} onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
                    className={cn('flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed p-8 text-center transition-colors', drag ? 'border-brand-300 bg-brand-50' : 'border-border-strong hover:border-brand-300 hover:bg-brand-50/40')}>
                    <span className="grid size-11 place-items-center rounded-full bg-brand-50 text-brand-700">{drag ? <UploadCloud size={22} /> : <ImagePlus size={22} />}</span>
                    <span className="text-[13.5px]">تصویر رسید را اینجا رها کنید یا انتخاب کنید</span>
                    <span className="text-[11px] text-muted">JPG یا PNG · حداکثر ۵ مگابایت</span>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFiles(e.target.files)} />
                  </div>
                )}
              </div>
              {err && <div className="mt-3 text-[13px] text-danger">{err}</div>}
              <Button className="mt-5" full size="lg" loading={busy} onClick={send}>ثبت رسید و ارسال برای بررسی</Button>
            </Card>
          </div>
        </div>
      </section>
    </RoleGuard>
  );
}
