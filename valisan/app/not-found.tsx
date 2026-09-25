import { Button } from '@/components/ui/Button';
export default function NotFound() {
  return (
    <section className="container-x py-32 text-center">
      <div className="latin text-[72px] font-light text-brand-300">404</div>
      <h1 className="text-[24px] font-light">صفحه پیدا نشد</h1>
      <div className="mt-6"><Button href="/" variant="ghost">بازگشت به خانه</Button></div>
    </section>
  );
}
