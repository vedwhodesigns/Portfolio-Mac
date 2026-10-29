import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import SiteHeader from '@/components/shelf/SiteHeader';
import { ALL_BOOKS, getBook } from '@/data/books';

export function generateStaticParams() {
  return ALL_BOOKS.map(b => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBook(slug);
  return { title: book ? `${book.title} — Vedant Parikh` : 'Work' };
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const idx = ALL_BOOKS.findIndex(b => b.slug === slug);
  const prev = ALL_BOOKS[(idx - 1 + ALL_BOOKS.length) % ALL_BOOKS.length];
  const next = ALL_BOOKS[(idx + 1) % ALL_BOOKS.length];
  const style = { '--c': book.color, '--book-ink': book.ink } as CSSProperties;

  return (
    <main className="page tone-paper" style={style}>
      <SiteHeader />
      <div className="page-inner work">
        <Link href="/" className="back">← Back to the shelf</Link>

        <div className="work-hero">
          <div className="work-cover">
            <span className="cover-title">{book.title}</span>
            <span className="cover-author">{book.author}</span>
          </div>
          <div className="work-meta">
            <span className="kicker">{book.category}</span>
            <h1 className="chapter-title">{book.title}</h1>
            <p className="work-summary">{book.summary}</p>
            <dl className="work-facts">
              {book.client && <><dt>Client</dt><dd>{book.client}</dd></>}
              {book.role && <><dt>Role</dt><dd>{book.role}</dd></>}
              <dt>Year</dt><dd>{book.year}</dd>
              {book.tools && <><dt>Tools</dt><dd>{book.tools.join(', ')}</dd></>}
            </dl>
          </div>
        </div>

        <div className="work-gallery">
          {book.images.length > 0
            ? book.images.map(src => <img key={src} src={src} alt="" loading="lazy" />)
            : [1, 2, 3].map(n => (
              <div key={n} className="work-placeholder">
                <span>Image {n} — add to <code>images</code> in src/data/books.ts</span>
              </div>
            ))}
        </div>

        <nav className="work-nav">
          <Link href={`/work/${prev.slug}`}>← {prev.title}</Link>
          <Link href={`/work/${next.slug}`}>{next.title} →</Link>
        </nav>
      </div>
    </main>
  );
}
