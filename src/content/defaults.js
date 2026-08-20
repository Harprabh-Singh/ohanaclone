/* ─────────────────────────────────────────────────────────────────
   DEFAULT CONTENT — the bundled snapshot of everything editable.
   The site renders this instantly, then swaps in the published
   Cloudinary version when available. /admin edits a copy of this shape.
───────────────────────────────────────────────────────────────── */
import { categoryData, menuItems } from '../data/menuData';
import { galleryImages } from '../data/galleryImages';
import { DISHES } from '../data/houseFavourites';

/* Hero showcase dish photos (bundled art — the same files the hero uses) */
import dishCoffee from '../components/Hero/models/satellites/cup5.png';
import dishBurger from '../components/Hero/models/satellites/cup2.png';
import dishPizza from '../components/Hero/models/satellites/cup1.png';
import dishCake from '../components/Hero/models/satellites/cup3.png';
import dishFries from '../components/Hero/models/satellites/cup4.png';
import dishSplash from '../components/Hero/models/satellites/cup7.png';
import dishBeans from '../components/Hero/models/satellites/cup6b.png';

/* Menu-book page images, in order: cover, menu1 … menu13 */
export const defaultMenuPages = [
  '/menu-pages/cover.jpg',
  ...Array.from({ length: 13 }, (_, i) => `/menu-pages/menu${i + 1}.png`),
];

/* ─── Hero "Our Menu" showcase (home, after scroll) ───
   Every slot except the first points at a menu category; the item
   count + "from ₹" price are computed live from the menu data.
   The first slot (coffee) is the scroll-animation anchor — locked. */
export const defaultShowcase = [
  { id: 'coffee',  name: 'COFFEE',  img: dishCoffee, desc: 'Single origin, poured slow',  locked: true, categorySlug: null,           stats: ['24 items', 'from ₹75'] },
  { id: 'burgers', name: 'BURGERS', img: dishBurger, desc: 'Flame-grilled, stacked tall', categorySlug: 'street-bites' },
  { id: 'pizzas',  name: 'PIZZAS',  img: dishPizza,  desc: 'Wood-fired, leopard-spotted', categorySlug: 'pizza' },
  { id: 'pasta',   name: 'PASTA',   img: dishBeans,  desc: 'Rolled into every sauce',     categorySlug: 'mains-pasta' },
  { id: 'cakes',   name: 'CAKES',   img: dishCake,   desc: 'Baked for the sweet tooth',   categorySlug: 'dessert' },
  { id: 'drinks',  name: 'DRINKS',  img: dishSplash, desc: 'Coolers, shakes & brews',     categorySlug: 'beverages' },
  { id: 'snacks',  name: 'SNACKS',  img: dishFries,  desc: 'Small plates, big cravings',  categorySlug: 'starters' },
];

/* ─── Palate showcase — the 3-D category carousel on home ─── */
export const defaultPalate = [
  { key: 'breakfast',  title: 'Breakfast',  sub: 'Early Hours',       categorySlug: 'breakfast-brunch', color: '#e8a838', colorDark: '#7a4e0a', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=1400&auto=format&fit=crop&q=85', copy: 'Our take on the first meal of the day. Exceptional coffee paired with hearty morning plates.' },
  { key: 'appetizers', title: 'Appetizers', sub: 'For the Table',     categorySlug: 'starters',         color: '#4aad6e', colorDark: '#1a5c34', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1400&auto=format&fit=crop&q=85', copy: 'Small plates designed to be passed around. The best way to kick off an evening on the terrace.' },
  { key: 'burgers',    title: 'Burgers',    sub: 'Between the Buns',  categorySlug: 'street-bites',     color: '#e8622a', colorDark: '#7a2a08', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&auto=format&fit=crop&q=85', copy: 'No shortcuts here. Hand-formed patties, proper cheese, and house sauces piled high on soft brioche.' },
  { key: 'pizza',      title: 'Pizza',      sub: 'Wood Fired',        categorySlug: 'pizza',            color: '#e84a2a', colorDark: '#7a1a08', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1400&auto=format&fit=crop&q=85', copy: 'Hand-stretched dough fired until beautifully blistered. Featuring local favorites like our signature ghost pepper chicken.' },
  { key: 'pasta',      title: 'Pasta',      sub: 'Comfort Bowls',     categorySlug: 'mains-pasta',      color: '#e8c42a', colorDark: '#7a5c08', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1400&auto=format&fit=crop&q=85', copy: 'Proper comfort food. Rich sauces, plenty of cheese, and pasta cooked exactly how it should be.' },
  { key: 'beverages',  title: 'Beverages',  sub: 'Pour & Sip',        categorySlug: 'beverages',        color: '#2a8ce8', colorDark: '#0a3a7a', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1400&auto=format&fit=crop&q=85', copy: 'Whether you need a morning caffeine hit or an icy evening mocktail, the bar has you covered.' },
  { key: 'desserts',   title: 'Desserts',   sub: 'To Finish',         categorySlug: 'dessert',          color: '#c42d78', colorDark: '#6a0a38', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1400&auto=format&fit=crop&q=85', copy: 'Because there’s always room. Baked fresh in-house for when you just need something sweet.' },
];

/* ─── Our Story numbers (home) ─── */
export const defaultStory = { guests: '2K+', rating: '4.8', years: '3yr' };

/* ─── Ohana Experience panels (home) ─── */
export const defaultExperiences = [
  { id: '01', title: 'Terrace\nDining',      tag: 'Signature Experience', description: 'Open skies, warm lights, evenings worth staying for. Our rooftop terrace is where Jorhat unwinds.', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80', accent: '#B6912E' },
  { id: '02', title: 'Coffee\nMoments',      tag: 'All Day',              description: 'Slow pours, rich aromas, and conversations that stretch past noon.',                                  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80', accent: '#C42D78' },
  { id: '03', title: 'House\nFavourites',    tag: 'Most Ordered',         description: 'Tandoori pizza to fiery wings — the dishes guests order again and again.',                            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80', accent: '#E8742A' },
  { id: '04', title: 'Gatherings\n& Groups', tag: 'Celebrations',         description: 'The perfect backdrop for long celebrations and even longer conversations.',                           image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=1600&q=80', accent: '#B6912E' },
  { id: '05', title: 'Night\nAtmosphere',    tag: 'After Sunset',         description: 'Warm lights, cooler air, city below. The terrace transforms after dark.',                             image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=1600&q=80', accent: '#C42D78' },
];

/* ─── Guest reviews (home) — real Google reviews for Ohana ─── */
export const defaultReviews = [
  { quote: 'Relaxing and stylish interiors, flavorful food, and great music create such an amazing vibe. Shroomz Pizza is truly top-notch, and the chicken burgers are delicious too.', author: 'Jyotishman Saikia', visit: 'Brunch · Google review', rating: 5 },
  { quote: 'We were a group of 12 travelling for a Kaziranga safari trip. Fantastic service from Meghali and Smiti, delicious food and ambience. Would definitely recommend.', author: 'Karteek H', visit: 'Group lunch · Google review', rating: 5 },
  { quote: 'Best food in the city. I recommend this place for the food, ambience and service.', author: 'Shantanu Borgohain', visit: 'Lunch · Google review', rating: 5 },
  { quote: 'Had the peri peri chicken steak, fish steak, waffle and fruit cream. The food is really great in taste and the portion size is amazing. Our waitress was really pleasant.', author: 'Michelle Mathew', visit: 'Dinner · Google review', rating: 5 },
  { quote: 'A fantastic spot to hang out with friends and family. The ambiance here is truly unique in Jorhat, with vibrant decor and a welcoming atmosphere.', author: 'Hridoy Saikia', visit: 'Dinner · Google review', rating: 5 },
  { quote: 'Food was amazing, the service was very fast and the staff very polite. Price was justified by the food quality. The rooftop space is perfect for a meal with a view.', author: 'Simran S', visit: 'Rooftop dinner · Google review', rating: 5 },
  { quote: 'The place is very soothing and comfortable, the staff are well mannered, and the cafe is themed like Santorini, Greece. The paneer Ohana pizza and chicken a la kiev were great.', author: 'Risa Kalita', visit: 'Dine in · Google review', rating: 5 },
  { quote: 'One of the places everyone has highly spoken about — and it did not disappoint at all. The food options were great and the continental quality is one of the best I have had.', author: 'Ankur Jyoti Sharma', visit: 'Dinner · Google review', rating: 5 },
];

/* ─── Menu page hero stats ─── */
export const defaultMenuStats = [
  { n: '8',    l: 'Categories' },
  { n: '130+', l: 'Dishes' },
  { n: '4.8★', l: 'Avg Rating' },
  { n: 'Daily', l: 'Open 11AM–10PM' },
];

export const defaultContent = {
  version: 2,
  menu: {
    categories: categoryData,
    items: menuItems,
  },
  gallery: galleryImages,
  houseFavs: DISHES,
  menuPages: defaultMenuPages,
  showcase: defaultShowcase,
  palate: defaultPalate,
  story: defaultStory,
  experiences: defaultExperiences,
  reviews: defaultReviews,
  menuStats: defaultMenuStats,
};
