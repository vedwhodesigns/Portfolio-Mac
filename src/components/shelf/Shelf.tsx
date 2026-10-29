import Book from './Book';
import type { Book as BookData } from '@/data/books';

export default function Shelf({ books }: { books: BookData[] }) {
  const laid = books.filter(b => b.laid);
  const standing = books.filter(b => !b.laid);
  return (
    <div className="shelf">
      <div className={`shelf-row${laid.length ? ' has-laid' : ''}`}>
        {standing.map((b, i) => <Book key={b.slug} book={b} index={i} />)}
        {laid.map((b, i) => <Book key={b.slug} book={b} index={i} />)}
      </div>
    </div>
  );
}
