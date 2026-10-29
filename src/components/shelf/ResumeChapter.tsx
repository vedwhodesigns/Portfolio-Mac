import Link from 'next/link';
import { RESUME } from '@/data/resume';

export default function ResumeChapter({ full = false }: { full?: boolean }) {
  return (
    <div className={`resume ${full ? 'resume-full' : ''}`}>
      <div className="resume-col">
        <p className="resume-summary">{RESUME.summary}</p>
        <h3 className="resume-h">Experience</h3>
        {RESUME.experience.map(e => (
          <div className="resume-item" key={e.role + e.org}>
            <div className="resume-item-head">
              <span>{e.role} · <em>{e.org}</em></span>
              <span className="resume-period">{e.period}</span>
            </div>
            {full && (
              <ul>{e.notes.map(n => <li key={n}>{n}</li>)}</ul>
            )}
          </div>
        ))}
        <h3 className="resume-h">Education</h3>
        {RESUME.education.map(e => (
          <div className="resume-item" key={e.school}>
            <div className="resume-item-head">
              <span>{e.degree} · <em>{e.school}</em></span>
              <span className="resume-period">{e.period}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="resume-col">
        <h3 className="resume-h">Skills</h3>
        {Object.entries(RESUME.skills).map(([group, items]) => (
          <div className="resume-item" key={group}>
            <div className="resume-item-head"><span>{group}</span></div>
            <p className="resume-skills">{items.join(' · ')}</p>
          </div>
        ))}
        <h3 className="resume-h">Contact</h3>
        <div className="resume-links">
          {RESUME.links.map(l => (
            <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
        {!full && <Link href="/resume" className="resume-more">Open full résumé →</Link>}
      </div>
    </div>
  );
}
