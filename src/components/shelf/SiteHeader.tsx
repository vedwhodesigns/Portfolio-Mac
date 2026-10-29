"use client";

import Link from 'next/link';
import { CHAPTERS } from '@/data/books';

interface Props {
  active?: number;
  onSelect?: (index: number) => void;
}

export default function SiteHeader({ active, onSelect }: Props) {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">Vedant Parikh</Link>
      <nav className="chapter-nav" aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          onSelect ? (
            <button
              key={c.id}
              type="button"
              className={`chapter-num ${active === i ? 'is-active' : ''}`}
              onClick={() => onSelect(i)}
              aria-label={c.title}
            >
              {c.number}
            </button>
          ) : (
            <Link key={c.id} href={`/#${c.id}`} className="chapter-num" aria-label={c.title}>
              {c.number}
            </Link>
          )
        ))}
      </nav>
    </header>
  );
}
