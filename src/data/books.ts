export type SpineVariant = 'plain' | 'band' | 'grid' | 'stacked';

export interface Book {
  slug: string;
  title: string;
  author: string;
  year: string;
  color: string;
  ink: string;
  width: number;
  height: number;
  lean?: number;
  faceOut?: boolean;
  variant?: SpineVariant;
  category: string;
  client?: string;
  role?: string;
  tools?: string[];
  summary: string;
  images: string[];
}

export interface Chapter {
  id: string;
  number: number;
  kicker: string;
  title: string;
  tone: 'paper' | 'grey';
  intro?: string;
  books: Book[];
}

const branding: Book[] = [
  {
    slug: 'hey-edition',
    title: 'Hey Edition',
    author: 'Identity & Packaging',
    year: '2025',
    color: '#e59bbb', ink: '#3a1b2a',
    width: 46, height: 236, variant: 'plain',
    category: 'Branding', client: 'Hey Studio', role: 'Art Direction, Identity',
    tools: ['Illustrator', 'Photoshop', 'Blender'],
    summary: 'A playful identity system built around a single typographic gesture, extended across packaging, posters and a motion sting.',
    images: [],
  },
  {
    slug: 'design-emergency',
    title: 'Design Emergency',
    author: 'Brand System',
    year: '2024',
    color: '#2f7a3f', ink: '#f2efe8',
    width: 34, height: 228, variant: 'band',
    category: 'Branding', client: 'Independent', role: 'Brand Design',
    tools: ['Illustrator', 'After Effects'],
    summary: 'A loud, utilitarian identity for a design collective: hazard stripes, condensed type and a grid that refuses to sit still.',
    images: [],
  },
  {
    slug: 'printable',
    title: 'Printable',
    author: 'Editorial Identity',
    year: '2024',
    color: '#d7e3ee', ink: '#1d3fb8',
    width: 40, height: 240, lean: -6, variant: 'stacked',
    category: 'Branding', client: 'Printable Press', role: 'Identity, Editorial',
    tools: ['InDesign', 'Illustrator'],
    summary: 'A print-first identity with a modular wordmark that stacks, stretches and wraps around the spine of every issue.',
    images: [],
  },
  {
    slug: 'new-utilitarian',
    title: 'New Utilitarian',
    author: 'Campaign & Identity',
    year: '2023',
    color: '#2b2b2b', ink: '#f6f3ea',
    width: 36, height: 230, variant: 'plain',
    category: 'Branding', client: 'Concept', role: 'Creative Direction',
    tools: ['Illustrator', 'Cinema 4D'],
    summary: 'Industrial restraint: a monochrome system of labels, tags and signage for a fictional hardware brand.',
    images: [],
  },
];

const logos: Book[] = [
  {
    slug: 'design-by-accident',
    title: 'Design by Accident',
    author: 'Vedant Parikh',
    year: '2025',
    color: '#2b3d8f', ink: '#c9d1f0',
    width: 176, height: 236, faceOut: true,
    category: 'Logo Design', client: 'Self-initiated', role: 'Logo Design',
    tools: ['Illustrator'],
    summary: 'Fifty marks in fifty days. A collection of logotypes and symbols made from constraints, mistakes and happy accidents.',
    images: [],
  },
  {
    slug: 'the-creative-act',
    title: 'The Creative Act',
    author: 'Logo Suite',
    year: '2024',
    color: '#d8382b', ink: '#fbe9e3',
    width: 24, height: 240, variant: 'plain',
    category: 'Logo Design', client: 'Creative Act Studio', role: 'Logo & Mark',
    tools: ['Illustrator'],
    summary: 'A single-stroke monogram and a flexible lock-up system for a creative studio.',
    images: [],
  },
  {
    slug: 'optic',
    title: 'Optic',
    author: 'Wordmark',
    year: '2024',
    color: '#d9d4c7', ink: '#1a1917',
    width: 40, height: 226, variant: 'plain',
    category: 'Logo Design', client: 'Optic Eyewear', role: 'Wordmark, Guidelines',
    tools: ['Illustrator', 'Figma'],
    summary: 'A heavy, optical wordmark cut from a single circle, with a guideline book covering spacing, colour and misuse.',
    images: [],
  },
  {
    slug: 'o-plus-s',
    title: 'O+S',
    author: 'Monogram',
    year: '2023',
    color: '#dfeaf6', ink: '#1a1917',
    width: 30, height: 232, variant: 'grid',
    category: 'Logo Design', client: 'O+S Architects', role: 'Monogram',
    tools: ['Illustrator'],
    summary: 'A gridded monogram for an architecture practice: two letters, one module, endless plans.',
    images: [],
  },
  {
    slug: 'sophie-lovell',
    title: 'A Sense of Place',
    author: 'Sophie Lovell',
    year: '2023',
    color: '#f0b826', ink: '#1a1917',
    width: 34, height: 222, lean: 5, variant: 'plain',
    category: 'Logo Design', client: 'Sophie Lovell', role: 'Identity',
    tools: ['Illustrator'],
    summary: 'A warm, editorial mark for a writer and curator, built on a custom serif and a small set of place-based glyphs.',
    images: [],
  },
];

const cgi: Book[] = [
  {
    slug: 'visible-signs',
    title: 'Visible Signs',
    author: 'CGI Short',
    year: '2025',
    color: '#1d2446', ink: '#dfe3f5',
    width: 54, height: 244, variant: 'plain',
    category: 'CGI & VFX', client: 'Personal', role: 'Direction, Lighting, Comp',
    tools: ['Blender', 'Nuke', 'DaVinci Resolve'],
    summary: 'A two-minute CGI short about signage at night. Fully built, lit and composited in Blender and Nuke.',
    images: [],
  },
  {
    slug: 'local-manual-of-style',
    title: 'The Local Manual of Style',
    author: 'VFX Breakdown',
    year: '2024',
    color: '#4a4a4a', ink: '#e8e4dc',
    width: 60, height: 236, variant: 'plain',
    category: 'CGI & VFX', client: 'Studio Project', role: 'Compositing, Matchmove',
    tools: ['Nuke', 'Blender', 'After Effects'],
    summary: 'Set extensions, screen replacements and clean-up across a 40-shot commercial. Breakdown reel inside.',
    images: [],
  },
  {
    slug: 'made-in-north-korea',
    title: 'Everyday Objects',
    author: 'Product CGI',
    year: '2024',
    color: '#b34b8a', ink: '#f8eaf2',
    width: 26, height: 230, lean: -4, variant: 'plain',
    category: 'CGI & VFX', client: 'Various', role: '3D, Look Development',
    tools: ['Blender', 'Substance Painter'],
    summary: 'Photoreal product renders for packaging, e-commerce and launch films.',
    images: [],
  },
  {
    slug: 'motion-reel',
    title: 'Motion Reel',
    author: '2025 Showreel',
    year: '2025',
    color: '#f0b826', ink: '#1a1917',
    width: 44, height: 240, variant: 'band',
    category: 'CGI & VFX', client: '—', role: 'Motion Design',
    tools: ['After Effects', 'Blender'],
    summary: 'Sixty seconds of type, product and brand animation from the last year.',
    images: [],
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: 'home',
    number: 1,
    kicker: 'Vedant Parikh',
    title: 'Selected Works',
    tone: 'paper',
    intro: 'CGI, VFX and graphic design. Scroll sideways to browse the shelves, or pull a book to open it.',
    books: [branding[0], branding[2], logos[1], logos[0], logos[2], cgi[0], cgi[3], branding[1], cgi[1]],
  },
  { id: 'branding', number: 2, kicker: 'Chapter 2', title: 'Branding', tone: 'grey', books: branding },
  { id: 'logos', number: 3, kicker: 'Chapter 3', title: 'Logo Designs', tone: 'paper', books: logos },
  { id: 'cgi', number: 4, kicker: 'Chapter 4', title: 'CGI & VFX', tone: 'grey', books: cgi },
  { id: 'resume', number: 5, kicker: 'Chapter 5', title: 'Résumé', tone: 'paper', books: [] },
];

export const ALL_BOOKS: Book[] = [...branding, ...logos, ...cgi];

export function getBook(slug: string) {
  return ALL_BOOKS.find(b => b.slug === slug);
}
