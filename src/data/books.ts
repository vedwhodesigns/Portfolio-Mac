export type SpineVariant =
  | 'serif'    // small serif caps, like a classic spine
  | 'display'  // huge upright serif letters, one per line (WHY / NOT)
  | 'sans'     // tracked bold sans caps (PRINTABLE)
  | 'italic'   // italic serif, mixed case
  | 'boxed'    // author on top, title inside a hairline box (BRODKEY — ERSTE LIEBE)
  | 'rules'    // | Title | between vertical rules, tiny caps top and bottom
  | 'tiny'     // only tiny tracked caps, top and bottom
  | 'band';    // solid ink band at the top

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
  laid?: boolean;       // lies flat on top of the row
  variant?: SpineVariant;
  tagline?: string;     // secondary line used by some variants
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
    color: '#f2a4c4', ink: '#1a1917',
    width: 48, height: 236, variant: 'boxed',
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
    color: '#1f7a3a', ink: '#f2efe8',
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
    color: '#ff6a2a', ink: '#f7d9ea',
    width: 40, height: 244, lean: -6, variant: 'sans',
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
    color: '#1a1917', ink: '#f6f3ea',
    width: 36, height: 230, variant: 'tiny', tagline: 'Not a Brand',
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
    color: '#2d3fd1', ink: '#f6f3ea',
    width: 176, height: 236, faceOut: true,
    category: 'Logo Design', client: 'Self-initiated', role: 'Logo Design',
    tools: ['Illustrator'],
    summary: 'Fifty marks in fifty days. A collection of logotypes and symbols made from constraints, mistakes and happy accidents.',
    images: [],
  },
  {
    slug: 'why-not',
    title: 'Why Not',
    author: 'Thoughts I have never spoken out loud',
    year: '2025',
    color: '#f6f3ea', ink: '#1a1917',
    width: 92, height: 256, variant: 'display',
    category: 'Logo Design', client: 'Self-initiated', role: 'Logotype',
    tools: ['Illustrator', 'Glyphs'],
    summary: 'A two-word logotype cut as a display serif, with a lock-up that reads top-down, left-right and upside-down.',
    images: [],
  },
  {
    slug: 'the-creative-act',
    title: 'The Creative Act',
    author: 'Logo Suite',
    year: '2024',
    color: '#e0372b', ink: '#f6f3ea',
    width: 24, height: 240, variant: 'serif',
    category: 'Logo Design', client: 'Creative Act Studio', role: 'Logo & Mark',
    tools: ['Illustrator'],
    summary: 'A single-stroke monogram and a flexible lock-up system for a creative studio.',
    images: [],
  },
  {
    slug: 'optic',
    title: 'Letters of Optic',
    author: 'Walter Spacey',
    year: '2024',
    color: '#f6f3ea', ink: '#1a1917',
    width: 58, height: 226, variant: 'rules', tagline: 'A view of hype design',
    category: 'Logo Design', client: 'Optic Eyewear', role: 'Wordmark, Guidelines',
    tools: ['Illustrator', 'Figma'],
    summary: 'A heavy, optical wordmark cut from a single circle, with a guideline book covering spacing, colour and misuse.',
    images: [],
  },
  {
    slug: 'o-plus-s',
    title: 'O+S',
    author: 'A Monogram',
    year: '2023',
    color: '#8ec5ff', ink: '#1a1917',
    width: 28, height: 232, variant: 'tiny', tagline: 'Not a Book',
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
    color: '#ffd23f', ink: '#1a1917',
    width: 34, height: 222, lean: 7, variant: 'italic',
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
    color: '#141a4a', ink: '#f6f3ea',
    width: 70, height: 244, variant: 'serif', tagline: 'A CGI short, 2 min',
    category: 'CGI & VFX', client: 'Personal', role: 'Direction, Lighting, Comp',
    tools: ['Blender', 'Nuke', 'DaVinci Resolve'],
    summary: 'A two-minute CGI short about signage at night. Fully built, lit and composited in Blender and Nuke.',
    images: [],
  },
  {
    slug: 'local-manual-of-style',
    title: 'Typefaces I will design',
    author: 'VFX Breakdown',
    year: '2024',
    color: '#f6f3ea', ink: '#1a1917',
    width: 74, height: 236, variant: 'serif', tagline: 'A confident reminder',
    category: 'CGI & VFX', client: 'Studio Project', role: 'Compositing, Matchmove',
    tools: ['Nuke', 'Blender', 'After Effects'],
    summary: 'Set extensions, screen replacements and clean-up across a 40-shot commercial. Breakdown reel inside.',
    images: [],
  },
  {
    slug: 'everyday-objects',
    title: 'Everyday Objects',
    author: 'Product CGI',
    year: '2024',
    color: '#c43b8e', ink: '#f8eaf2',
    width: 26, height: 230, lean: -4, variant: 'italic',
    category: 'CGI & VFX', client: 'Various', role: '3D, Look Development',
    tools: ['Blender', 'Substance Painter'],
    summary: 'Photoreal product renders for packaging, e-commerce and launch films.',
    images: [],
  },
  {
    slug: 'motion-reel',
    title: 'Spring Symmetry',
    author: 'Motion Reel',
    year: '2025',
    color: '#f6f3ea', ink: '#1a1917',
    width: 520, height: 64, laid: true, lean: -3, tagline: 'Sixty seconds of type and product animation',
    category: 'CGI & VFX', client: '—', role: 'Motion Design',
    tools: ['After Effects', 'Blender'],
    summary: 'Sixty seconds of type, product and brand animation from the last year.',
    images: [],
  },
  {
    slug: 'practical-guide',
    title: 'Practical Guide',
    author: 'To book-spines & shaders',
    year: '2023',
    color: '#f6f3ea', ink: '#1a1917',
    width: 40, height: 250, lean: 10, variant: 'sans',
    category: 'CGI & VFX', client: 'Personal', role: 'Shading, Rendering',
    tools: ['Blender', 'Substance'],
    summary: 'A study in paper, cloth and foil shaders — rendered as a shelf of imaginary books.',
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
    books: [branding[0], branding[2], logos[1], logos[0], logos[3], cgi[0], branding[1], cgi[1], cgi[4], cgi[3]],
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
