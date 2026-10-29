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

  const href = `/work/${book.slug}`;

  if (book.laid) {
    return (
      <Link href={href} className="book book-laid" style={style} aria-label={book.title}>
        <span className="laid-title">{book.title}</span>
        <span className="laid-meta">
          <span>{book.author}</span>
          <span>© {book.year}</span>
          {book.tagline && <span>{book.tagline}</span>}
        </span>
      </Link>
    );
  }

  if (book.faceOut) {
    return (
      <Link href={href} className="book book-faceout" style={style} aria-label={book.title}>
        <span className="cover-title">{book.title}</span>
        <span className="cover-author">{book.author}</span>
      </Link>
    );
  }

  const v = book.variant ?? 'serif';

  if (v === 'display') {
    return (
      <Link href={href} className="book book-spine v-display" style={style} aria-label={book.title}>
        <span className="display-words">
          {book.title.split(' ').map((w, i) => <span key={i} className="display-word">{w}</span>)}
        </span>
        <span className="display-tagline">{book.author}</span>
        <span className="spine-foot">{book.year}</span>
      </Link>
    );
  }

  if (v === 'boxed') {
    return (
      <Link href={href} className="book book-spine v-boxed" style={style} aria-label={book.title}>
        <span className="spine-text">
          <span className="boxed-author">{book.author}</span>
          <span className="boxed-title">{book.title}</span>
        </span>
        <span className="spine-foot">{book.year}</span>
      </Link>
    );
  }

  if (v === 'rules') {
    return (
      <Link href={href} className="book book-spine v-rules" style={style} aria-label={book.title}>
        <span className="spine-text">
          <span className="spine-author">{book.author}</span>
          <span className="rules-title">{book.title}</span>
          <span className="spine-author">{book.tagline ?? book.year}</span>
        </span>
      </Link>
    );
  }

  if (v === 'tiny') {
    return (
      <Link href={href} className="book book-spine v-tiny" style={style} aria-label={book.title}>
        <span className="spine-text">
          <span className="tiny-line">{book.title}</span>
          <span className="tiny-line">{book.year}</span>
          <span className="tiny-line tiny-end">{book.tagline ?? book.author}</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`book book-spine v-${v}${book.width >= 68 ? ' is-wide' : ''}`} style={style} aria-label={book.title}>
      <span className="spine-text">
        <span className="spine-title">{book.title}</span>
        <span className="spine-author">{book.tagline ?? book.author}</span>
      </span>
      <span className="spine-foot">{book.year}</span>
    </Link>
  );
}
