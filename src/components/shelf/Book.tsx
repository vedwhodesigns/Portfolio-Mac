"use client";

import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Book as BookData } from '@/data/books';

export default function Book({ book, index = 0 }: { book: BookData; index?: number }) {
  const lean = book.lean ?? 0;
  const leanRoom = Math.round(Math.abs(Math.sin((lean * Math.PI) / 180)) * book.height);
  const style = {
    '--c': book.color,
    '--ink': book.ink,
    '--lean': `${lean}deg`,
    '--i': index,
    width: book.width,
    height: book.height,
    marginLeft: lean < 0 ? leanRoom : undefined,
    marginRight: lean > 0 ? leanRoom : undefined,
    transformOrigin: lean < 0 ? '0% 100%' : lean > 0 ? '100% 100%' : undefined,
  } as CSSProperties;

  if (book.faceOut) {
    return (
      <Link href={`/work/${book.slug}`} className="book book-faceout" style={style} aria-label={book.title}>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
      </Link>
    );
  }

  return (
    <Link href={`/work/${book.slug}`} className={`book book-spine v-${book.variant ?? 'plain'}`} style={style} aria-label={book.title}>
      <span className="spine-text">
        <span className="spine-title">{book.title}</span>
        <span className="spine-author">{book.author}</span>
      </span>
      <span className="spine-foot">{book.year}</span>
    </Link>
  );
}
