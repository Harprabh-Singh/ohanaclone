/**
 * render-menu.mjs — code-rendered flipbook menu pages for Ohana Cafe.
 *
 * Rebuilds public/menu-pages/{cover.jpg, menu1.png…menu13.png} as crisp
 * HTML/CSS screenshots (Playwright chromium) in the site's dark-luxury
 * design system. No AI image generation — text is real, sharp, editable.
 *
 * Re-run when prices/items change:
 *   node scripts/render-menu.mjs            (from the project root)
 *
 * Originals are preserved in public/menu-pages-old/.
 *
 * Tag kinds: 'veg' | 'nonveg' | 'mixed' (veg/chicken) | 'bacon' | 'prawn' | 'seasonalveg'
 * Item shapes:
 *   rows : { name, tag?, price }                       — dotted-leader line
 *   rich : { name, tag?, price, desc }                 — name + price, description below
 */

import { chromium } from 'playwright-core';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';

/* ────────────────────────────────────────────────────────────
   MENU CONTENT — transcribed 1:1 from the printed menu images
   (public/menu-pages-old/). Tag slash direction normalised to
   "VEG / CHICKEN" everywhere (page 10 printed a backslash).
   ──────────────────────────────────────────────────────────── */
const SUBS = {
  breakfast: 'SERVED ALL DAY, EVERY DAY',
  starters: 'FRESH, FLAVORFUL & MADE TO SHARE',
  beverages: 'REFRESH, RECHARGE & RELAX',
};

const PAGES = [
  {
    file: 'menu1.png', num: '01',
    titleA: 'BREAKFAST &', titleEm: 'BRUNCH', subtitle: SUBS.breakfast,
    photo: 'menu1-band.jpg',
    sections: [
      {
        header: 'SANDWICHES', style: 'rows',
        items: [
          { name: 'Peanut Butter & Jelly Sandwich', tag: 'veg', price: '149' },
          { name: 'Cucumber Tomato Cheese Sandwich', tag: 'veg', price: '179' },
          { name: 'Cheese & Corn Sandwich', tag: 'veg', price: '179' },
          { name: 'Peppy Paneer Sandwich', tag: 'veg', price: '179' },
          { name: 'Mayo Chicken Sandwich', tag: 'nonveg', price: '199' },
          { name: 'Chicken Club Sandwich', tag: 'nonveg', price: '229' },
        ],
      },
      {
        header: 'OMELETTES', style: 'rows',
        items: [
          { name: 'Masala Omelette', tag: 'nonveg', price: '149' },
          { name: 'Cheese Omelette', tag: 'nonveg', price: '149' },
          { name: 'Spanish Omelette', tag: 'nonveg', price: '169' },
          { name: 'Mushroom Omelette', tag: 'nonveg', price: '189' },
          { name: 'Chicken Sausage Omelette', tag: 'nonveg', price: '189' },
        ],
      },
    ],
    footnote: 'Served with a side of Wedges & Ketchup',
  },
  {
    file: 'menu2.png', num: '02',
    titleA: 'BREAKFAST &', titleEm: 'BRUNCH', subtitle: SUBS.breakfast,
    photo: 'menu2-band.jpg',
    sections: [
      {
        header: 'ADD ONS', style: 'rows',
        items: [
          { name: 'Extra Toast', tag: 'veg', price: '20/PC' },
          { name: 'Hash Brown', tag: 'veg', price: '30/PC' },
          { name: 'Boiled Eggs', tag: 'nonveg', price: '30/PC' },
          { name: 'Sunny Side Up', tag: 'nonveg', price: '40/PC' },
          { name: 'Scrambled Eggs', tag: 'nonveg', price: '75/PORTION' },
          { name: 'Baked Beans', tag: 'veg', price: '40/PORTION' },
          { name: 'Breakfast Sausages (2 PCS)', tag: 'nonveg', price: '80/PORTION' },
          { name: 'Chicken Frankfurter', tag: 'nonveg', price: '80/PC' },
          { name: 'Pork Frankfurter', tag: 'nonveg', price: '90/PC' },
          { name: 'Fried Bacon (4 STRIPS)', tag: 'nonveg', price: '80/PC' },
        ],
      },
      {
        header: 'SOUPS', style: 'rows',
        items: [
          { name: 'Cream of Tomato Soup', tag: 'veg', price: '100' },
          { name: 'Tomato Egg Drop Soup', tag: 'nonveg', price: '120' },
          { name: 'Sweet Corn Soup', tag: 'mixed', price: '100 / 120' },
          { name: 'Lemon Coriander Soup', tag: 'mixed', price: '100 / 120' },
          { name: 'Hot & Sour Soup', tag: 'mixed', price: '100 / 120' },
          { name: 'Thai Tom Yum Soup', tag: 'mixed', price: '120 / 150' },
        ],
      },
    ],
    footnote: 'Soup One into Two charge 30 Extra',
  },
  {
    file: 'menu3.png', num: '03',
    photo: 'menu3-band.jpg',
    titleA: 'BREAKFAST &', titleEm: 'BRUNCH', subtitle: SUBS.breakfast,
    sections: [
      {
        header: 'ALL DAY BREAKFAST COMBOS', style: 'rich',
        items: [
          { name: 'The Full English', tag: 'nonveg', price: '279', desc: '2 breakfast sausages, 2 fried eggs, baked beans, grilled tomatoes, 2 toasts' },
          { name: 'Veggie Breakfast', tag: 'veg', price: '259', desc: 'Sauteed mushrooms & onions, 2 hash browns, baked beans, grilled tomatoes, 2 toasts' },
          { name: 'Carnivores Plate', tag: 'nonveg', price: '289', desc: 'Pork bacon rashes, 2 breakfast sausages, 2 fried eggs, grilled tomatoes, 2 toasts' },
          { name: 'Bangers & Mash', tag: 'nonveg', price: '289', desc: '2 chicken frankfurters tossed in house made BBQ sauce placed on a bed of mashed potatoes with a side of green peas' },
        ],
      },
    ],
  },
  {
    file: 'menu4.png', num: '04',
    photo: 'menu4-band.jpg',
    titleA: 'STARTERS &', titleEm: 'SHARING', subtitle: SUBS.starters,
    sections: [
      {
        header: 'SALADS', style: 'rows',
        items: [
          { name: 'Summer Watermelon Feta Salad', tag: 'seasonalveg', price: '200' },
          { name: 'Caesar Salad', tag: 'mixed', price: '250 / 300' },
          { name: 'Greek Horiatiki Salad', tag: 'mixed', price: '250 / 300' },
          { name: 'Vietnamese Chicken Salad', tag: 'nonveg', price: '300' },
        ],
      },
      {
        header: 'APPETIZER — VEG', style: 'rich',
        items: [
          { name: 'French Fries — Classic / Peri-Peri', price: '170 / 180', desc: 'Where it all starts' },
          { name: 'Texan Onion Rings', price: '180', desc: 'Never thought onions could taste this good. Served with our in-house dip sauce' },
          { name: 'Chilli Cheese Triangles', price: '200', desc: 'Toasts topped with molten mozarella and a whole lot of zing. Served with our in-house dip sauce' },
          { name: 'Veg Bullet', price: '230', desc: 'Small vegetable bullets that have a burst of flavours paired with ketchup' },
          { name: 'Crispy Chilli Sweet Corn', price: '230', desc: 'The towns hottest selling snack — Ohana Style' },
          { name: 'Honey Chilli Potato', price: '230', desc: 'When you are spicy and sweet, timeless potato classic' },
          { name: 'Crispy Veg Salt & Pepper', price: '230', desc: "OHANA's hot favourite — Asian style veggies, crispy, spicy and a lot tasty" },
          { name: 'Falafel with Hummus', price: '230', desc: "EGYPT's famous chickpeas based tikkis married to the ISRAELI dip — hummus" },
        ],
      },
    ],
  },
  {
    file: 'menu5.png', num: '05',
    photo: 'menu5-band.jpg',
    titleA: 'STARTERS &', titleEm: 'SHARING', subtitle: SUBS.starters,
    sections: [
      {
        header: 'APPETIZER — NON-VEG', style: 'rich',
        items: [
          { name: 'Panko Chicken Strips', price: '250', desc: 'Juicy & tender chicken strips breaded and fried served with peri-peri dip sauce' },
          { name: 'Chilly Chicken Chunks', price: '250', desc: 'A time defying Asian classic' },
          { name: 'Chicken Corn Dogs', price: '250', desc: 'Sausages batter fried on a stick. Close to a non veg lollipop, served with our in-house dip sauce' },
          { name: 'BBQ Chicken Wings', price: '270', desc: "OHANA's hot favourite — chicken whole wings tossed in BBQ sauce. Succulent, sweet & spicy at the same time" },
          { name: 'Dragon Fiery Chicken Wings', price: '270', desc: 'Our hottest dish on the menu — chicken whole wings tossed in our in-house Asian styled fiery sauce' },
          { name: 'Fish Finger', price: '300', desc: 'Basa fish rolled in bread crumbs served with freshly made tartar dip sauce' },
          { name: 'Fried Calamari', price: '330', desc: 'Classic batter fried squid rings served with freshly made tartar dip sauce' },
        ],
      },
    ],
  },
  {
    file: 'menu6.png', num: '06',
    photo: 'menu6-band.jpg',
    titleA: 'STARTERS &', titleEm: 'SHARING', subtitle: SUBS.starters,
    sections: [
      {
        header: 'HAWKER STYLE STEAMED DUMPLINGS', note: 'Served with In-house Spicy Dip', style: 'rows',
        items: [
          { name: 'Veg Dumplings', price: '190' },
          { name: 'Chicken Dumplings', price: '210' },
          { name: 'Pork Dumplings', price: '230' },
        ],
      },
      {
        header: 'HOT DOGS — THE AMERICAN COMFORT SNACK', note: 'Topped with In-house Sauces', style: 'rows',
        items: [
          { name: 'Classic Chicken Hot Dog', price: '250' },
          { name: 'Tandoori Twist Hot Dog', price: '250' },
          { name: 'Indie Mint Hot Dog', price: '250' },
        ],
      },
    ],
  },
  {
    file: 'menu7.png', num: '07',
    photo: 'menu7-band.jpg',
    titleA: 'MAINS &', titleEm: 'MORE', subtitle: SUBS.starters,
    sections: [
      {
        header: 'PASTA & SPAGHETTI', style: 'rich',
        items: [
          { name: 'Penne Arabiatta', tag: 'mixed', price: '300 / 325', desc: 'Red sauce made with tomatoes, garlic and Italian herbs' },
          { name: 'Penne Alfredo', tag: 'mixed', price: '300 / 325', desc: 'White sauce made with butter, cream garlic and lots of parmesan cheese' },
          { name: 'Spaghetti Aglio Olio', tag: 'mixed', price: '325 / 350', desc: 'Tossed in olive oil, garlic, basil and black olives' },
          { name: 'Spaghetti Carbonara', tag: 'bacon', price: '375', desc: 'Traditional spaghetti with bacon, parmesan cheese, egg yolk, parsley and garlic' },
          { name: "Fisherman's Penne Pasta", tag: 'prawn', price: '400', desc: 'Penne pasta tossed in Ohana signature orange sauce with prawns' },
        ],
      },
    ],
  },
  {
    file: 'menu8.png', num: '08',
    photo: 'menu8-band.jpg',
    titleA: 'MAINS &', titleEm: 'MORE', subtitle: SUBS.starters,
    sections: [
      {
        header: 'PIZZA', style: 'rich',
        items: [
          { name: 'Classic Margherita', tag: 'veg', price: '350', desc: 'A lot of house made pizza sauce topped with mozarella & cheddar cheese with basil leaves' },
          { name: 'The Vegetable Garden', tag: 'veg', price: '370', desc: 'House made pizza sauce topped with bell pepper, onion, sweet corn, tomato & mozarella & cheddar' },
          { name: 'Paneer Ohana Pizza', tag: 'veg', price: '390', desc: 'House made pizza sauce topped with paneer, olive, jalepeno, bell pepper, onion & mozarella & cheddar' },
          { name: 'Shrimp Pizza', tag: 'nonveg', price: '400', desc: 'A Mushroom loaded pizza topped with house made Pizza Sauce, Olive Oil, Onion, Parsley and Mozarella Cheddar Cheese' },
          { name: 'Roasted Exotic Veggie Pizza', tag: 'veg', price: '420', desc: 'Roasted Green & Yellow Zucchini, Red Yellow Green Bell Peppers, Black Olives, Brocolli, Grilled Onions on house made Pizza Sauce topped with Mozarella & Cheddar cheese' },
          { name: 'Peri Peri Chicken Pizza', tag: 'nonveg', price: '390', desc: 'Peri peri chicken, jalepeno, bell pepper, cherry tomato, onion & mozarella & cheddar' },
          { name: 'The Ghost Pepper Chicken Pizza', tag: 'nonveg', price: '400', desc: "OHANA's signature red hot pizza with chicken rashers & the pride of Assam" },
          { name: 'Tandoori Chicken Sausage Pizza', tag: 'nonveg', price: '400', desc: 'House made Pizza Sauce topped with Chicken Sausage, Tandoori Sauce, Bell Peppers and Mozarella & Cheddar cheese' },
          { name: 'Chicken Overload Pizza', tag: 'nonveg', price: '450', desc: 'Peri Peri Chicken, Chicken sausage, Roasted chicken rashers on house made Pizza Sauce topped with Mozarella & Cheddar cheese' },
          { name: 'Pork Pepperoni Pizza', tag: 'nonveg', price: '420', desc: 'House made pizza sauce topped with mozarella & cheddar cheese & pork pepperoni' },
          { name: 'Pork Bacon & Sausage Pizza', tag: 'nonveg', price: '500', desc: 'Pork lovers choice..' },
        ],
      },
    ],
  },
  {
    file: 'menu9.png', num: '09',
    photo: 'menu9-band.jpg',
    titleA: 'MAINS &', titleEm: 'MORE', subtitle: SUBS.starters,
    sections: [
      {
        header: 'STEAKS', style: 'rich',
        items: [
          { name: 'Pesto Vegetable Steak', tag: 'veg', price: '400', desc: 'Vegetable Steak topped with Pesto Sauce & served with a side of grilled vegetables' },
          { name: 'Peri - Peri Vegetable Steak', tag: 'veg', price: '400', desc: 'Vegetable Steak topped with Peri – Peri Sauce & served with a side of grilled vegetables' },
          { name: 'Pesto Chicken Steak', tag: 'nonveg', price: '450', desc: 'Chicken breast seasoned with oregano & olive oil served with pesto sauce and grilled vegetables' },
          { name: 'Peri - Peri Chicken Steak', tag: 'nonveg', price: '450', desc: 'Chicken breast seasoned with peri peri mix, olive oil served with peri – peri sauce and grilled vegetables' },
          { name: 'Fish Steak with Creamy Sauce', tag: 'nonveg', price: '500', desc: 'Grilled Fish Fillet topped with creamy garlic sauce served with a side of grilled vegetables' },
        ],
      },
      {
        header: 'DESSERT', style: 'rows',
        items: [
          { name: 'Fresh Fruits & Cream', price: '220' },
        ],
      },
    ],
  },
  {
    file: 'menu10.png', num: '10',
    photo: 'menu10-band.jpg',
    titleA: 'MAINS &', titleEm: 'MORE', subtitle: SUBS.starters,
    sections: [
      {
        header: 'MAINS', style: 'rich',
        items: [
          { name: 'Mongolian Vegetables with Rice', tag: 'mixed', price: '350 / 400', desc: 'A OHANA speciality — Asian vegetables tossed in tangy, sweet yet spicy Mongolian sauce served on steamed rice' },
          { name: 'Thai Red Curry with Rice', tag: 'mixed', price: '350 / 400', desc: 'Asian greens, flavoured with lemongrass and tossed in Thai red curry paste along with a dash of coconut milk served on steamed rice' },
          { name: 'Thai Green Curry with Rice', tag: 'mixed', price: '350 / 400', desc: 'Asian greens, flavoured with lemongrass and tossed in Thai green curry paste along with a dash of coconut milk served on steamed rice' },
          { name: 'Louisiana Cajun Chicken', tag: 'nonveg', price: '400', desc: 'Chicken breast rubbed in cajun spice and oven-baked. Served with grilled veggies & peri-peri mayo' },
          { name: 'English Fish & Chips', tag: 'nonveg', price: '400', desc: "A classic from the streets of London — fish filet's batter fried with a side of classic french fries and tartar dip sauce" },
          { name: 'Chicken A-La-Kiev', tag: 'nonveg', price: '420', desc: 'A OHANA speciality — watch the goodness of butter ooze out of stuffed panko crusted chicken breast. Served with a side of grilled veggies & creamy mashed potatoes' },
          { name: 'Orange Sauce Prawns with Herbed Rice', tag: 'nonveg', price: '450', desc: 'Prawns tossed in our in-house orange sauce served with a side of buttery green peas on a bed of herbed rice' },
          { name: 'Asian Slow Cooked Pork on Rice', tag: 'nonveg', price: '450', desc: 'A OHANA speciality of slow roasted pork cooked with Asian greens in dark soy served on a bed of herbed rice' },
        ],
      },
    ],
  },
  {
    file: 'menu11.png', num: '11',
    photo: 'menu11-band.jpg',
    titleA: '', titleEm: 'BEVERAGES', subtitle: SUBS.beverages,
    sections: [
      {
        header: 'MOJITO & COOLERS', style: 'rows',
        items: [
          { name: 'Classic Mojito', price: '180' },
          { name: 'Watermelon Mojito', price: '180' },
          { name: 'Strawberry Mojito', price: '180' },
          { name: 'Moroccan Squash', price: '180' },
          { name: 'Watermelon Sparkler', price: '180' },
          { name: 'Green Apple Sparkler', price: '180' },
          { name: 'Classic Lemonade', price: '140' },
          { name: 'Masala Lemonade', price: '150' },
          { name: 'Lemon Iced Tea', price: '180' },
          { name: 'Peach Iced Tea', price: '180' },
        ],
      },
      {
        header: 'SHAKES', style: 'rows',
        items: [
          { name: 'Mango Burst Shake', price: '220' },
          { name: 'Choco Banana Shake', price: '220' },
          { name: 'Strawberry Milk Shake', price: '220' },
          { name: 'Blueberry Pie Shake', price: '220' },
          { name: 'Oreo Dark', price: '220' },
          { name: 'Chocolate Shake', price: '220' },
          { name: 'Kit Kat Shake', price: '220' },
          { name: 'Ohana Chunky', price: '220' },
          { name: 'Brownie Shake', price: '240' },
        ],
      },
    ],
  },
  {
    file: 'menu12.png', num: '12',
    photo: 'menu12-band.jpg',
    titleA: '', titleEm: 'BEVERAGES', subtitle: SUBS.beverages,
    sections: [
      {
        header: 'JUICES', style: 'rows',
        items: [
          { name: 'Fresh Seasonal Juice', price: '150' },
          { name: 'Apple Juice', price: '150' },
          { name: 'Orange Juice', price: '150' },
          { name: 'Pineapple Juice', price: '150' },
          { name: 'Mixed Fruit Juice', price: '150' },
        ],
      },
      {
        header: 'OHANA SUMMER SELECTIONS', style: 'rows',
        items: [
          { name: 'Tropical Spice', price: '200' },
          { name: 'Bombay Kala Khatta', price: '200' },
          { name: 'Cucumber Mint Julep', price: '200' },
        ],
      },
      {
        header: 'OTHERS', style: 'rows',
        items: [
          { name: 'Coca Cola', price: '80' },
          { name: 'Coke Zero', price: '80' },
          { name: 'Sprite', price: '80' },
          { name: 'Red Bull', price: 'MRP' },
          { name: 'Mineral Water', price: 'MRP' },
        ],
      },
    ],
  },
  {
    file: 'menu13.png', num: '13',
    photo: 'menu13-band.jpg',
    density: 'compact',
    titleA: '', titleEm: 'BEVERAGES', subtitle: SUBS.beverages,
    sections: [
      {
        header: 'HOT BREWS', style: 'rows', cols: 2,
        items: [
          { name: 'Espresso Shot', price: '80' },
          { name: 'Americano', price: '90' },
          { name: 'Cappuccino', price: '140' },
          { name: 'Café Latte', price: '140' },
          { name: 'Mocha', price: '160' },
          { name: 'Macchiato', price: '160' },
          { name: 'Caramel Cappuccino', price: '160' },
          { name: 'Vietnamese Coffee', price: '160' },
          { name: 'Irish Coffee', price: '190' },
          { name: 'Hot Chocolate', price: '160' },
          { name: 'Peanut Butter Hot Chocolate', price: '190' },
        ],
      },
      {
        header: 'COLD BREWS', style: 'rows', cols: 2,
        items: [
          { name: 'Iced Americano', price: '140' },
          { name: 'Iced Latte', price: '170' },
          { name: 'Classic Cold Coffee', price: '180' },
          { name: 'Hazelnut Frappe', price: '220' },
          { name: 'Caramel Frappe', price: '220' },
          { name: 'Mocha Frappe', price: '220' },
          { name: 'Vietnamese Iced Coffee', price: '220' },
        ],
      },
      {
        header: 'TEA', style: 'rows', cols: 2,
        items: [
          { name: 'English Breakfast Tea', price: '75' },
          { name: 'Earl Grey Tea', price: '75' },
          { name: 'Lemon Tea', price: '75' },
          { name: 'Assam Tea', price: '75' },
          { name: 'Green Tea', price: '85' },
          { name: 'Honey Ginger Tea', price: '120' },
        ],
      },
    ],
  },
];

/* ────────────────────────────────────────────────────────────
   TEMPLATE — dark-luxury design system (matches the website)
   ──────────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;600;700&display=swap';

const CSS = `
  :root {
    --bg: #0B0906; --gold: #B6912E; --goldb: #D9B45B;
    --cream: #F2E7D0; --muted: rgba(242,231,208,0.55); --faint: rgba(242,231,208,0.28);
    --hair: rgba(242,231,208,0.12);
    --veg: #6B8F6B; --nonveg: #C24E72;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: var(--bg); }
  body { font-family: 'Work Sans', sans-serif; -webkit-font-smoothing: antialiased; }

  .page {
    position: relative; width: 1122px; height: 1402px; overflow: hidden;
    background: var(--bg); color: var(--cream);
    display: flex; flex-direction: column;
    padding: 84px 96px 64px;
  }
  .page-photo {
    position: absolute; top: 0; left: 0; right: 0; height: 470px;
    background-size: cover; background-position: center 30%;
  }
  .page-photo-scrim {
    position: absolute; top: 0; left: 0; right: 0; height: 560px; pointer-events: none;
    background:
      linear-gradient(to bottom, rgba(11,9,6,0.80) 0%, rgba(11,9,6,0.38) 30%, rgba(11,9,6,0.70) 62%, var(--bg) 92%);
  }
  .page-photo ~ header .lockup, .page-photo ~ header .subtitle { text-shadow: 0 2px 14px rgba(0,0,0,0.8); }
  .frame-outer { position: absolute; inset: 28px; border: 1px solid rgba(182,145,46,0.42); pointer-events: none; }
  .frame-inner { position: absolute; inset: 35px; border: 1px solid rgba(182,145,46,0.18); pointer-events: none; }

  .ghost {
    position: absolute; right: 34px; bottom: 6px; z-index: 0;
    font-family: 'Archivo Black', sans-serif; font-size: 240px; line-height: 1;
    color: transparent; -webkit-text-stroke: 1.5px rgba(242,231,208,0.09);
    user-select: none; overflow: hidden; padding-bottom: 22px;
  }

  header { text-align: center; position: relative; z-index: 1; }
  .lockup {
    display: flex; align-items: center; justify-content: center; gap: 18px;
    font-size: 15px; font-weight: 700; letter-spacing: 0.42em;
    color: var(--gold); text-transform: uppercase;
  }
  .lockup .hl, .subtitle .hl, .sec-h .hl { height: 1px; background: var(--gold); opacity: 0.6; }
  .lockup .hl { width: 56px; }
  h1 {
    margin-top: 28px;
    font-family: 'Archivo Black', sans-serif; font-weight: 400;
    font-size: 88px; line-height: 0.98; letter-spacing: -0.015em;
    color: var(--cream); text-transform: uppercase;
    text-shadow: 0 4px 30px rgba(0,0,0,0.55);
  }
  h1 em, .cover-title em {
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-weight: 400;
    color: var(--goldb);
  }
  .subtitle {
    margin-top: 22px;
    display: flex; align-items: center; justify-content: center; gap: 16px;
    font-size: 16px; font-weight: 700; letter-spacing: 0.4em;
    color: var(--gold); text-transform: uppercase;
  }
  .subtitle .hl { width: 88px; }

  main { flex: 1; margin-top: calc(48px * var(--s, 1)); position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
  section + section { margin-top: calc(44px * var(--s, 1)); }

  .sec-h {
    display: flex; align-items: center; gap: 20px;
    font-size: calc(24px * var(--s, 1)); font-weight: 700; letter-spacing: 0.3em;
    color: var(--gold); text-transform: uppercase; text-align: center;
  }
  .sec-h .hl { flex: 1; opacity: 0.45; }
  .sec-note {
    text-align: center; margin-top: 10px;
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
    font-size: calc(20px * var(--s, 1)); color: var(--muted);
  }

  .items { margin-top: calc(22px * var(--s, 1)); }

  /* simple dotted-leader rows */
  .row {
    display: flex; align-items: baseline; gap: 14px;
    padding: calc(13px * var(--s, 1)) 2px;
  }
  .dots { display: inline-flex; gap: 6px; align-items: center; transform: translateY(-3px); }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dot.veg { background: var(--veg); }
  .dot.nonveg { background: var(--nonveg); }
  .name {
    font-size: calc(27px * var(--s, 1)); font-weight: 600; letter-spacing: 0.05em;
    color: var(--cream); text-transform: uppercase; white-space: nowrap;
  }
  .leader { flex: 1; border-bottom: 2px dotted rgba(242,231,208,0.25); transform: translateY(-6px); min-width: 30px; }
  .taglabel {
    font-size: calc(14px * var(--s, 1)); font-weight: 600; letter-spacing: 0.18em;
    color: var(--muted); text-transform: uppercase; white-space: nowrap;
  }
  .taglabel.veg { color: var(--veg); }
  .taglabel.nonveg { color: var(--nonveg); }
  .price {
    font-size: calc(27px * var(--s, 1)); font-weight: 700; letter-spacing: 0.04em;
    color: var(--goldb); white-space: nowrap; text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* rich items — name + price line, description below */
  .rich-item { padding: calc(16px * var(--s, 1)) 2px; }
  .rich-item + .rich-item { border-top: 1px dotted rgba(242,231,208,0.14); }
  .rich-line { display: flex; align-items: baseline; gap: 14px; }
  .rich-line .name { font-size: calc(29px * var(--s, 1)); white-space: normal; }
  .rich-line .leader { opacity: 0; }
  .rich-line .price { font-size: calc(29px * var(--s, 1)); margin-left: auto; }
  .desc {
    margin-top: 6px;
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
    font-size: calc(20px * var(--s, 1)); line-height: 1.42; color: var(--muted);
    max-width: 82%;
  }

  footer { position: relative; z-index: 1; margin-top: calc(34px * var(--s, 1)); }
  .footnote {
    text-align: center; margin-bottom: calc(20px * var(--s, 1));
    font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
    font-size: calc(22px * var(--s, 1)); color: var(--goldb);
  }
  .footline {
    border-top: 1px solid var(--hair); padding-top: 16px;
    display: flex; align-items: center; justify-content: center; gap: 14px;
    font-size: 12px; font-weight: 600; letter-spacing: 0.34em; text-transform: uppercase;
    color: var(--faint);
  }
  .footline .fl-hl { width: 42px; height: 1px; background: var(--hair); }

  /* per-page density escape hatch — tighter rows without shrinking scale */
  .compact .row { padding: calc(10.5px * var(--s, 1)) 2px; }
  .compact .rich-item { padding: calc(12px * var(--s, 1)) 2px; }
  .compact .items { margin-top: calc(16px * var(--s, 1)); }
  .compact section + section { margin-top: calc(34px * var(--s, 1)); }
  .compact main { margin-top: calc(36px * var(--s, 1)); }

  /* two-column item grid for very dense drink sections */
  .items.cols2 { display: grid; grid-template-columns: 1fr 1fr; column-gap: 64px; }
  .items.cols2 .row { min-width: 0; }
  .items.cols2 .name { font-size: calc(24px * var(--s, 1)); }

  /* ── COVER ── */
  .cover {
    position: relative; width: 819px; height: 1024px; overflow: hidden;
    background: var(--bg); color: var(--cream);
    display: flex; flex-direction: column;
  }
  .cover-content { padding: 88px 72px 56px; }
  .cover .frame-outer { inset: 22px; }
  .cover .frame-inner { inset: 28px; }
  .cover-photo { position: absolute; inset: 0; background-size: cover; background-position: center 18%; }
  .cover-scrim {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 95% 60% at 50% 44%, rgba(11,9,6,0.60) 0%, rgba(11,9,6,0.30) 60%, rgba(11,9,6,0.16) 100%),
      linear-gradient(to bottom, rgba(11,9,6,0.90) 0%, rgba(11,9,6,0.55) 20%, rgba(11,9,6,0.42) 45%, rgba(11,9,6,0.58) 68%, rgba(11,9,6,0.95) 100%);
  }
  .cover-content {
    position: relative; z-index: 2; flex: 1; width: 100%;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    justify-content: space-evenly;
  }
  .cover-lockup {
    font-size: 12px; font-weight: 700; letter-spacing: 0.5em; color: var(--gold);
    text-transform: uppercase;
  }
  .cover-brand {
    margin-top: 30px; font-family: 'Archivo Black', sans-serif;
    font-size: 108px; line-height: 0.92; letter-spacing: -0.02em; color: var(--cream);
  }
  .cover-sub {
    margin-top: 16px; font-size: 13px; font-weight: 700; letter-spacing: 0.44em;
    color: var(--gold); text-transform: uppercase;
  }
  .cover-rule { margin: 38px 0; width: 220px; height: 1px; background: var(--gold); opacity: 0.55; }
  .cover-title {
    font-family: 'Archivo Black', sans-serif; font-size: 76px; line-height: 1;
    letter-spacing: -0.01em; color: var(--cream); text-transform: uppercase;
  }
  .cover-title em { font-size: 82px; }
  .cover-hours {
    margin-top: 26px; font-size: 15px; font-weight: 700; letter-spacing: 0.42em; color: var(--gold);
  }
  .cover-tagline {
    margin-top: 26px; font-family: 'Instrument Serif', Georgia, serif; font-style: italic;
    font-size: 27px; color: rgba(242,231,208,0.8);
  }
  .cover-tagline em { color: var(--goldb); }
  .cover-values { margin-top: 46px; width: 100%; max-width: 480px; }
  .cover-values .cv {
    display: flex; align-items: center; justify-content: center; gap: 14px;
    padding: 15px 0; font-size: 12.5px; font-weight: 600; letter-spacing: 0.34em;
    text-transform: uppercase; color: var(--muted);
  }
  .cover-values .cv + .cv { border-top: 1px solid var(--hair); }
  .cover-values .cv:first-child { border-top: 1px solid var(--hair); }
  .cover-values .cv:last-child { border-bottom: 1px solid var(--hair); }
  .cover-values .cv-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); }
  .cover-foot {
    margin-top: 24px; font-size: 9.5px; font-weight: 600; letter-spacing: 0.36em;
    text-transform: uppercase; color: var(--faint);
  }
`;

const TAGS = {
  veg: { dots: ['veg'], label: 'VEG', cls: 'veg' },
  nonveg: { dots: ['nonveg'], label: 'NON VEG', cls: 'nonveg' },
  mixed: { dots: ['veg', 'nonveg'], label: 'VEG / CHICKEN', cls: '' },
  bacon: { dots: ['nonveg'], label: 'BACON', cls: 'nonveg' },
  prawn: { dots: ['nonveg'], label: 'PRAWN', cls: 'nonveg' },
  seasonalveg: { dots: ['veg'], label: 'SEASONAL · VEG', cls: 'veg' },
};

const tagHtml = (kind) => {
  if (!kind) return '';
  const t = TAGS[kind];
  return `<span class="dots">${t.dots.map((d) => `<span class="dot ${d}"></span>`).join('')}</span>`
    + `<span class="taglabel ${t.cls}">${t.label}</span>`;
};

const rowItem = (it) => `
  <div class="row">
    ${tagHtml(it.tag)}
    <span class="name">${esc(it.name)}</span>
    <span class="leader"></span>
    <span class="price">${esc(it.price)}</span>
  </div>`;

const richItem = (it) => `
  <div class="rich-item">
    <div class="rich-line">
      ${tagHtml(it.tag)}
      <span class="name">${esc(it.name)}</span>
      <span class="price">${esc(it.price)}</span>
    </div>
    <p class="desc">${esc(it.desc)}</p>
  </div>`;

const pageHtml = (p) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet"><style>${CSS}</style></head>
<body>
<div class="page${p.density === 'compact' ? ' compact' : ''}">
  ${p.photo ? `<div class="page-photo" style="background-image:url('${assetUri(p.photo)}')"></div><div class="page-photo-scrim"></div>` : ''}
  <div class="frame-outer"></div><div class="frame-inner"></div>
  <div class="ghost">${p.num}</div>
  <header>
    <div class="lockup"><span class="hl"></span><span>Ohana · Cafe Kitchen &amp; Terraces</span><span class="hl"></span></div>
    <h1>${p.titleA ? esc(p.titleA) + ' ' : ''}<em>${esc(p.titleEm)}</em></h1>
    <div class="subtitle"><span class="hl"></span><span>${esc(p.subtitle)}</span><span class="hl"></span></div>
  </header>
  <main>
    ${p.sections.map((s) => `
      <section>
        <div class="sec-h"><span class="hl"></span><span>${esc(s.header)}</span><span class="hl"></span></div>
        ${s.note ? `<p class="sec-note">${esc(s.note)}</p>` : ''}
        <div class="items${s.cols === 2 ? ' cols2' : ''}">${s.items.map(s.style === 'rich' ? richItem : rowItem).join('')}</div>
      </section>`).join('')}
  </main>
  <footer>
    ${p.footnote ? `<p class="footnote">${esc(p.footnote)}</p>` : ''}
    <div class="footline"><span class="fl-hl"></span><span>Gar-Ali · Jorhat — Above KFC</span><span class="fl-hl"></span></div>
  </footer>
</div>
</body></html>`;

const COVER_PHOTO_URI = 'data:image/jpeg;base64,'
  + fs.readFileSync(path.resolve(process.cwd(), 'scripts/assets/cover-photo-45.jpg')).toString('base64');

const assetUri = (f) => 'data:image/jpeg;base64,'
  + fs.readFileSync(path.resolve(process.cwd(), 'scripts/assets', f)).toString('base64');

const coverHtml = () => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet"><style>${CSS}</style></head>
<body>
<div class="cover">
  <div class="cover-photo" style="background-image:url('${COVER_PHOTO_URI}')"></div>
  <div class="cover-scrim"></div>
  <div class="frame-outer"></div><div class="frame-inner"></div>
  <div class="cover-content">
  <div class="cover-brand">OHANA</div>
  <div class="cover-sub">Cafe Kitchen &amp; Terraces</div>
  <div class="cover-rule"></div>
  <div class="cover-title">FOOD <em>Menu</em></div>
  <div class="cover-hours">11AM — 10PM</div>
  <p class="cover-tagline">Good food. <em>Better together.</em></p>
  <div class="cover-values">
    <div class="cv"><span class="cv-dot"></span>Fresh Ingredients</div>
    <div class="cv"><span class="cv-dot"></span>Made to Order</div>
    <div class="cv"><span class="cv-dot"></span>Ohana Favourites</div>
  </div>
  <div class="cover-foot">Gar-Ali · Jorhat, Assam</div>
  </div>
</div>
</body></html>`;

/* ────────────────────────────────────────────────────────────
   RENDER
   ──────────────────────────────────────────────────────────── */
const OUT = path.resolve(process.cwd(), 'public/menu-pages');

function findChromium() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXE) return process.env.PLAYWRIGHT_CHROMIUM_EXE;
  const root = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
  const dirs = fs.readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => parseInt(b.split('-')[1], 10) - parseInt(a.split('-')[1], 10));
  for (const d of dirs) {
    const exe = path.join(root, d, 'chrome-win', 'chrome.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('No cached chromium found under ' + root + ' — run: npx playwright install chromium');
}

/* Auto-fit scale steps — typography tightens until the page fits its fixed
   height. If even the smallest scale overflows, we FAIL LOUDLY. */
const SCALES = [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76];

async function renderPage(browser, html, outFile, { width, height, type, quality }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  try {
    let shot = false;
    for (const s of SCALES) {
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate((scale) => document.documentElement.style.setProperty('--s', scale), s);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(120);
      const overflow = await page.evaluate(() => {
        const el = document.querySelector('.page, .cover');
        return el.scrollHeight - el.clientHeight;
      });
      if (process.env.DEBUG_MEASURE) {
        const diag = await page.evaluate(() => {
          const el = document.querySelector('.page, .cover');
          const pr = el.getBoundingClientRect();
          const out = { scrollH: el.scrollHeight, clientH: el.clientHeight, pageTop: pr.top, pageH: pr.height, kids: [] };
          for (const k of el.children) {
            const r = k.getBoundingClientRect();
            out.kids.push({ cls: k.className, top: Math.round(r.top - pr.top), bottom: Math.round(r.bottom - pr.top), h: Math.round(r.height), scrollH: k.scrollHeight });
          }
          const m = el.querySelector('main');
          if (m) {
            out.mainKids = [];
            for (const k of m.children) {
              const r = k.getBoundingClientRect();
              const mr = m.getBoundingClientRect();
              out.mainKids.push({ cls: k.className, top: Math.round(r.top - mr.top), bottom: Math.round(r.bottom - mr.top), h: Math.round(r.height), scrollH: k.scrollHeight });
            }
          }
          return out;
        });
        console.log('  diag', JSON.stringify(diag, null, 1));
      }
      if (overflow <= 0) {
        await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width, height }, type, ...(quality ? { quality } : {}) });
        console.log(`  ok  ${path.basename(outFile)}  (scale ${s}, slack ${-overflow}px)`);
        shot = true;
        break;
      }
      if (s === SCALES[SCALES.length - 1]) {
        console.error(`  FAIL ${path.basename(outFile)} — content overflows by ${overflow}px even at scale ${s}. Tighten typography or split content.`);
        return false;
      }
    }
    return shot;
  } finally {
    await page.close();
  }
}

const only = process.argv[2]; // optional: render a single file, e.g. "menu8.png"

const browser = await chromium.launch({ executablePath: findChromium(), headless: true });
const failures = [];
try {
  fs.mkdirSync(OUT, { recursive: true });

  if (!only || only === 'cover.jpg') {
    const ok = await renderPage(browser, coverHtml(), path.join(OUT, 'cover.jpg'), { width: 819, height: 1024, type: 'jpeg', quality: 92 });
    if (!ok) failures.push('cover.jpg');
  }
  for (const p of PAGES) {
    if (only && only !== p.file) continue;
    const ok = await renderPage(browser, pageHtml(p), path.join(OUT, p.file), { width: 1122, height: 1402, type: 'png' });
    if (!ok) failures.push(p.file);
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('\nFailed pages: ' + failures.join(', '));
  process.exit(1);
}
console.log('\nAll menu pages rendered → public/menu-pages/');
