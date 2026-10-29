"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAPTERS } from '@/data/books';
import Shelf from './Shelf';
import SiteHeader from './SiteHeader';
import ResumeChapter from './ResumeChapter';

const COUNT = CHAPTERS.length;

export default function HorizontalSite() {
  const [active, setActive] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const i = CHAPTERS.findIndex(c => `#${c.id}` === window.location.hash);
    return i < 0 ? 0 : i;
  });
  const lock = useRef(false);
  const wheelAcc = useRef(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    const i = Math.max(0, Math.min(COUNT - 1, next));
    setActive(prev => {
      if (i === prev) return prev;
      lock.current = true;
      setTimeout(() => { lock.current = false; }, 850);
      return i;
    });
  }, []);

  useEffect(() => {
    history.replaceState(null, '', `#${CHAPTERS[active].id}`);
  }, [active]);

  useEffect(() => {
    const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

    const onWheel = (e: WheelEvent) => {
      if (!isDesktop()) return;
      if ((e.target as HTMLElement).closest('.scrollable')) return;
      e.preventDefault();
      if (lock.current) return;
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAcc.current += d;
      if (Math.abs(wheelAcc.current) > 60) {
        go(active + (wheelAcc.current > 0 ? 1 : -1));
        wheelAcc.current = 0;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(active + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   go(active - 1);
    };
    const onTouchStart = (e: TouchEvent) => { touchX.current = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (!isDesktop() || touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
      touchX.current = null;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [active, go]);

  return (
    <div className={`pager tone-${CHAPTERS[active].tone}`}>
      <SiteHeader active={active} onSelect={go} />

      <div className="pager-track" style={{ transform: `translateX(${-active * 100}vw)` }}>
        {CHAPTERS.map((c, i) => (
          <section
            key={c.id}
            id={c.id}
            className={`chapter ${i === active ? 'is-active' : i < active ? 'is-past' : 'is-next'}`}
            aria-hidden={i !== active}
          >
            <div className="chapter-head">
              <span className="kicker">{c.kicker}</span>
              <h2 className="chapter-title">{c.title}</h2>
              {c.intro && <p className="chapter-intro">{c.intro}</p>}
            </div>

            {c.id === 'resume'
              ? <div className="chapter-body scrollable"><ResumeChapter /></div>
              : <div className="chapter-body"><Shelf books={c.books} /></div>}
          </section>
        ))}
      </div>

      <div className="pager-arrows">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous chapter">←</button>
        <span className="pager-hint">Scroll sideways</span>
        <button type="button" onClick={() => go(active + 1)} disabled={active === COUNT - 1} aria-label="Next chapter">→</button>
      </div>
    </div>
  );
}
