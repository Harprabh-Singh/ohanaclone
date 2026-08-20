/* One-off: export the bundled default content to a JSON file for seeding
   Cloudinary's ohana/content.json (the site's content "database").
   Mirrors src/content/defaults.js (which uses Vite-style extensionless
   imports Node can't resolve, so we import the data files directly). */
import { writeFileSync, mkdirSync } from 'node:fs';
import { categoryData, menuItems } from '../src/data/menuData.js';
import { galleryImages } from '../src/data/galleryImages.js';
import { DISHES } from '../src/data/houseFavourites.js';

const payload = {
  version: 1,
  menu: { categories: categoryData, items: menuItems },
  gallery: galleryImages,
  houseFavs: DISHES,
  menuPages: [
    '/menu-pages/cover.jpg',
    ...Array.from({ length: 13 }, (_, i) => `/menu-pages/menu${i + 1}.png`),
  ],
  publishedAt: new Date().toISOString(),
};

mkdirSync('cloudinary-seed', { recursive: true });
writeFileSync('cloudinary-seed/content.json', JSON.stringify(payload));
console.log('seed written:', 'cloudinary-seed/content.json');
console.log('menu items:', payload.menu.items.length, '| gallery:', payload.gallery.length, '| favs:', payload.houseFavs.length, '| pages:', payload.menuPages.length);
