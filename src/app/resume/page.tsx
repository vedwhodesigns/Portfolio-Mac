import SiteHeader from '@/components/shelf/SiteHeader';
import ResumeChapter from '@/components/shelf/ResumeChapter';
import { RESUME } from '@/data/resume';

export const metadata = { title: `Résumé — ${RESUME.name}` };

export default function ResumePage() {
  return (
    <main className="page tone-paper">
      <SiteHeader />
      <div className="page-inner">
        <div className="chapter-head">
          <span className="kicker">Chapter 5</span>
          <h1 className="chapter-title">Résumé</h1>
          <p className="chapter-intro">{RESUME.name} · {RESUME.title} · {RESUME.location}</p>
        </div>
        <ResumeChapter full />
      </div>
    </main>
  );
}
