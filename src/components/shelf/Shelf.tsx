import Book from './Book';
import type { Book as BookData } from '@/data/books';

export default function Shelf({ books }: { books: BookData[] }) {
  return (
    <div className="shelf">
      <div className="shelf-row">
        {books.map((b, i) => <Book key={b.slug} book={b} index={i} />)}
      </div>
      <div className="shelf-board" />
    </div>
  );
}
