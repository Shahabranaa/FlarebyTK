export interface SeedCategory {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface SeedMenuItem {
  name: string;
  slug: string;
  description: string;
  category_slug: string;
  price: number;
  original_price: number | null;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  calories: number;
  tags: string[];
}

export interface SeedDeal {
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  deal_price: number;
  discount_type: string;
  discount_value: number;
}

const IMG = {
  frenchFries: "/menu/french-fries.png",
  masalaFries: "/menu/masala-fries.png",
  loadedFries: "/menu/loaded-fries.png",
  curlyFries: "/menu/curly-fries.png",
  pizzaFries: "/menu/pizza-fries.png",
  waffleFries: "/menu/waffle-fries.png",
  smashBurger: "/menu/smash-burger.jpg",
  doubleSmashBurger: "/menu/double-smash-burger.jpg",
  zingerBurger: "/menu/zinger-burger.png",
  mightyBurger: "/menu/mighty-burger.png",
  grilledBurger: "/menu/grilled-burger.jpg",
  longBurger: "/menu/long-burger.jpg",
  chapliBurger: "/menu/chapli-burger.png",
  pattyBurger: "/menu/patty-burger.jpg",
  chickenRoll: "/menu/chicken-roll.jpg",
  periPeriRoll: "/menu/peri-peri-roll.jpg",
  zingerRoll: "/menu/zinger-roll.png",
  malaiBotiRoll: "/menu/malai-boti-roll.png",
  crunchyWrap: "/menu/crunchy-wrap.png",
  turkishWrap: "/menu/turkish-wrap.jpg",
  beefWrap: "/menu/beef-wrap.jpg",
  tortillaWrap: "/menu/tortilla-wrap.jpg",
  lachaBurger: "/menu/lacha-burger.png",
  behariBurger: "/menu/behari-burger.jpg",
  broast: "/menu/broast.jpg",
  periPeriPizza: "/menu/peri-peri-pizza.png",
  malaiBotiPizza: "/menu/malai-boti-pizza.jpg",
  crownCrustPizza: "/menu/crown-crust-pizza.png",
  tikkaPizza: "/menu/tikka-pizza.png",
  fajitaPizza: "/menu/fajita-pizza.png",
  bbqPizza: "/menu/bbq-pizza.png",
  kababPizza: "/menu/kabab-pizza.jpg",
  cheesePizza: "/menu/cheese-pizza.jpg",
  sando: "/menu/sando.png",
  clubSandwich: "/menu/club-sandwich.png",
  grilledSandwich: "/menu/grilled-sandwich.jpg",
  beefSandwich: "/menu/beef-sandwich.png",
  panini: "/menu/panini.png",
  skySip: "/menu/sky-sip.jpg",
  softDrink: "/menu/soft-drink.jpg",
  water: "/menu/water.jpg",
  regularDrink: "/menu/regular-drink.jpg",
  hero: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80",
};

export const seedCategories: SeedCategory[] = [
  { name: "Potato Mania", slug: "potato-mania", description: "Crispy fries in every style — classic, loaded, curly and more", image_url: IMG.loadedFries, sort_order: 1 },
  { name: "Burgers", slug: "burgers", description: "Smashed, grilled and zinger burgers stacked high", image_url: IMG.smashBurger, sort_order: 2 },
  { name: "Wraps & Rolls", slug: "wraps-rolls", description: "Paratha rolls and tortilla wraps packed with flavor", image_url: IMG.chickenRoll, sort_order: 3 },
  { name: "Lacha Burgers", slug: "lacha-burgers", description: "Crispy lacha paratha layers meet juicy fillings", image_url: IMG.lachaBurger, sort_order: 4 },
  { name: "Injected Broast", slug: "injected-broast", description: "Flavor-injected crispy broast — full, half or quarter", image_url: IMG.broast, sort_order: 5 },
  { name: "Pizza", slug: "pizza", description: "Hand-tossed pizzas with generous desi-style toppings", image_url: IMG.tikkaPizza, sort_order: 6 },
  { name: "Sandwich", slug: "sandwich", description: "Sandos, clubs, melts and paninis", image_url: IMG.clubSandwich, sort_order: 7 },
  { name: "Drinks", slug: "drinks", description: "Chilled sips to wash it all down", image_url: IMG.softDrink, sort_order: 8 },
];

export const seedMenuItems: SeedMenuItem[] = [
  // Potato Mania
  { name: "French Fries", slug: "french-fries", description: "Crispy golden fries with signature seasoning", category_slug: "potato-mania", price: 350, original_price: null, image_url: IMG.frenchFries, is_available: true, is_featured: false, calories: 380, tags: ["fries"] },
  { name: "Fire Season Masala Fries", slug: "fire-season-masala-fries", description: "Fries tossed in fiery desi masala", category_slug: "potato-mania", price: 350, original_price: null, image_url: IMG.masalaFries, is_available: true, is_featured: false, calories: 410, tags: ["fries", "spicy"] },
  { name: "All Star Loaded Fries (Regular)", slug: "all-star-loaded-fries-regular", description: "Fries buried in cheese sauce, chicken bits and signature drizzles", category_slug: "potato-mania", price: 500, original_price: null, image_url: IMG.loadedFries, is_available: true, is_featured: true, calories: 680, tags: ["fries", "cheese", "bestseller"] },
  { name: "All Star Loaded Fries (Large)", slug: "all-star-loaded-fries-large", description: "Large serving of our fully loaded cheese fries", category_slug: "potato-mania", price: 700, original_price: null, image_url: IMG.loadedFries, is_available: true, is_featured: false, calories: 950, tags: ["fries", "cheese", "sharing"] },
  { name: "Curly Fries", slug: "curly-fries", description: "Seasoned spiral-cut fries, extra crispy", category_slug: "potato-mania", price: 390, original_price: null, image_url: IMG.curlyFries, is_available: true, is_featured: false, calories: 420, tags: ["fries"] },
  { name: "Loaded Curly Fries (Regular)", slug: "loaded-curly-fries-regular", description: "Curly fries loaded with cheese sauce and toppings", category_slug: "potato-mania", price: 450, original_price: null, image_url: IMG.curlyFries, is_available: true, is_featured: false, calories: 620, tags: ["fries", "cheese"] },
  { name: "Loaded Curly Fries (Large)", slug: "loaded-curly-fries-large", description: "Large loaded curly fries — made for sharing", category_slug: "potato-mania", price: 750, original_price: null, image_url: IMG.curlyFries, is_available: true, is_featured: false, calories: 890, tags: ["fries", "cheese", "sharing"] },
  { name: "Fries Pizza Affair (Regular)", slug: "fries-pizza-affair-regular", description: "Fries topped with pizza sauce, mozzarella and chicken chunks", category_slug: "potato-mania", price: 500, original_price: null, image_url: IMG.pizzaFries, is_available: true, is_featured: false, calories: 720, tags: ["fries", "cheese"] },
  { name: "Fries Pizza Affair (Large)", slug: "fries-pizza-affair-large", description: "Large pizza fries drowning in cheese and toppings", category_slug: "potato-mania", price: 700, original_price: null, image_url: IMG.pizzaFries, is_available: true, is_featured: false, calories: 990, tags: ["fries", "cheese", "sharing"] },
  { name: "Waffle Fries", slug: "waffle-fries", description: "Crispy waffle-cut fries with house seasoning", category_slug: "potato-mania", price: 450, original_price: null, image_url: IMG.waffleFries, is_available: true, is_featured: false, calories: 440, tags: ["fries"] },

  // Burgers
  { name: "Mazaydawr Beef Smash Burger — Single (with Fries)", slug: "mazaydawr-beef-smash-single", description: "Smashed beef patty, melted cheese and flare sauce — fries included", category_slug: "burgers", price: 700, original_price: null, image_url: IMG.smashBurger, is_available: true, is_featured: true, calories: 890, tags: ["beef", "bestseller"] },
  { name: "Mazaydawr Beef Smash Burger — Double (with Fries)", slug: "mazaydawr-beef-smash-double", description: "Double smashed beef patties, double cheese — fries included", category_slug: "burgers", price: 1100, original_price: null, image_url: IMG.doubleSmashBurger, is_available: true, is_featured: false, calories: 1250, tags: ["beef"] },
  { name: "The OG Zinger Burger", slug: "og-zinger-burger", description: "Crispy fried chicken fillet with spicy mayo and crunchy lettuce", category_slug: "burgers", price: 400, original_price: null, image_url: IMG.zingerBurger, is_available: true, is_featured: true, calories: 690, tags: ["chicken", "spicy", "bestseller"] },
  { name: "The OG Mighty Burger", slug: "og-mighty-burger", description: "Loaded mighty stack with crispy chicken and all the extras", category_slug: "burgers", price: 650, original_price: null, image_url: IMG.mightyBurger, is_available: true, is_featured: false, calories: 980, tags: ["chicken"] },
  { name: "Flamed Kissed Grilled Burger", slug: "flamed-kissed-grilled-burger", description: "Flame-grilled chicken breast with smoky glaze and garlic aioli", category_slug: "burgers", price: 700, original_price: null, image_url: IMG.grilledBurger, is_available: true, is_featured: false, calories: 640, tags: ["chicken", "grilled"] },
  { name: "Long OG Zinger Burger", slug: "long-og-zinger-burger", description: "Long-cut crispy zinger fillet in a toasted sub bun", category_slug: "burgers", price: 450, original_price: null, image_url: IMG.longBurger, is_available: true, is_featured: false, calories: 720, tags: ["chicken", "spicy"] },
  { name: "Classic Chapli Burger", slug: "classic-chapli-burger", description: "Traditional spiced chapli kebab patty with fresh salad and chutney", category_slug: "burgers", price: 450, original_price: null, image_url: IMG.chapliBurger, is_available: true, is_featured: false, calories: 710, tags: ["beef", "desi"] },
  { name: "Urban Patty Burger", slug: "urban-patty-burger", description: "Classic patty burger with lettuce, ketchup and house mayo", category_slug: "burgers", price: 350, original_price: null, image_url: IMG.pattyBurger, is_available: true, is_featured: false, calories: 560, tags: ["classic"] },

  // Wraps & Rolls
  { name: "Grilled Chicken Roll", slug: "grilled-chicken-roll", description: "Char-grilled chicken chunks with onions and chutney in crispy paratha", category_slug: "wraps-rolls", price: 550, original_price: null, image_url: IMG.chickenRoll, is_available: true, is_featured: true, calories: 540, tags: ["chicken", "grilled", "bestseller"] },
  { name: "Peri Peri Roll", slug: "peri-peri-roll", description: "Spicy peri peri chicken wrapped with cool garlic sauce", category_slug: "wraps-rolls", price: 500, original_price: null, image_url: IMG.periPeriRoll, is_available: true, is_featured: false, calories: 560, tags: ["chicken", "spicy"] },
  { name: "Zinger Roll", slug: "zinger-roll", description: "Crispy zinger strips, jalapeños and cheese rolled tight", category_slug: "wraps-rolls", price: 600, original_price: null, image_url: IMG.zingerRoll, is_available: true, is_featured: false, calories: 640, tags: ["chicken", "spicy"] },
  { name: "Malai Boti Roll", slug: "malai-boti-roll", description: "Creamy malai chicken boti with garlic mayo in fresh paratha", category_slug: "wraps-rolls", price: 600, original_price: null, image_url: IMG.malaiBotiRoll, is_available: true, is_featured: false, calories: 580, tags: ["chicken", "creamy"] },
  { name: "Crunchy Wrap", slug: "crunchy-wrap", description: "Grilled tortilla wrap with a crunchy layer and loaded fillings", category_slug: "wraps-rolls", price: 600, original_price: null, image_url: IMG.crunchyWrap, is_available: true, is_featured: false, calories: 650, tags: ["chicken"] },
  { name: "Turkish Wrap", slug: "turkish-wrap", description: "Doner-style chicken with fresh veggies and Turkish sauces", category_slug: "wraps-rolls", price: 600, original_price: null, image_url: IMG.turkishWrap, is_available: true, is_featured: false, calories: 610, tags: ["chicken"] },
  { name: "Beef Wrap", slug: "beef-wrap", description: "Grilled beef strips with caramelized onions and signature sauce", category_slug: "wraps-rolls", price: 990, original_price: null, image_url: IMG.beefWrap, is_available: true, is_featured: false, calories: 780, tags: ["beef"] },
  { name: "Tortilla Wrap", slug: "tortilla-wrap", description: "Grilled chicken tortilla wrap with fresh greens and mayo", category_slug: "wraps-rolls", price: 700, original_price: null, image_url: IMG.tortillaWrap, is_available: true, is_featured: false, calories: 590, tags: ["chicken"] },

  // Lacha Burgers
  { name: "Lacha Grilled Chicken", slug: "lacha-grilled-chicken", description: "Grilled chicken layered in crispy lacha paratha bun", category_slug: "lacha-burgers", price: 700, original_price: null, image_url: IMG.lachaBurger, is_available: true, is_featured: true, calories: 820, tags: ["chicken", "grilled", "bestseller"] },
  { name: "Smash Lacha Beef", slug: "smash-lacha-beef", description: "Smashed beef patty wrapped in flaky lacha layers", category_slug: "lacha-burgers", price: 750, original_price: null, image_url: IMG.doubleSmashBurger, is_available: true, is_featured: false, calories: 900, tags: ["beef"] },
  { name: "Lacha Behari", slug: "lacha-behari", description: "Smoky behari beef strips in crispy lacha paratha", category_slug: "lacha-burgers", price: 750, original_price: null, image_url: IMG.behariBurger, is_available: true, is_featured: false, calories: 870, tags: ["beef", "spicy"] },

  // Injected Broast
  { name: "Injected Broast Full", slug: "injected-broast-full", description: "Whole flavor-injected broast chicken, crispy outside, juicy inside", category_slug: "injected-broast", price: 2300, original_price: null, image_url: IMG.broast, is_available: true, is_featured: true, calories: 3200, tags: ["chicken", "sharing", "bestseller"] },
  { name: "Injected Broast Half", slug: "injected-broast-half", description: "Half flavor-injected broast with fries and sauce", category_slug: "injected-broast", price: 1250, original_price: null, image_url: IMG.broast, is_available: true, is_featured: false, calories: 1650, tags: ["chicken"] },
  { name: "Injected Broast Quarter", slug: "injected-broast-quarter", description: "Quarter flavor-injected broast — perfect solo portion", category_slug: "injected-broast", price: 650, original_price: null, image_url: IMG.broast, is_available: true, is_featured: false, calories: 850, tags: ["chicken"] },

  // Pizza
  { name: "Extreme Peri Peri Pizza (Medium)", slug: "extreme-peri-peri-pizza-medium", description: "Fiery peri peri chicken with jalapeños and extra cheese", category_slug: "pizza", price: 1500, original_price: null, image_url: IMG.periPeriPizza, is_available: true, is_featured: true, calories: 1350, tags: ["chicken", "spicy", "bestseller"] },
  { name: "Extreme Peri Peri Pizza (Large)", slug: "extreme-peri-peri-pizza-large", description: "Large fiery peri peri chicken pizza", category_slug: "pizza", price: 2200, original_price: null, image_url: IMG.periPeriPizza, is_available: true, is_featured: false, calories: 1950, tags: ["chicken", "spicy"] },
  { name: "Extreme Malai Boti Pizza (Medium)", slug: "extreme-malai-boti-pizza-medium", description: "Creamy malai boti chunks on a rich white-sauce base", category_slug: "pizza", price: 1500, original_price: null, image_url: IMG.malaiBotiPizza, is_available: true, is_featured: false, calories: 1380, tags: ["chicken", "creamy"] },
  { name: "Extreme Malai Boti Pizza (Large)", slug: "extreme-malai-boti-pizza-large", description: "Large creamy malai boti pizza", category_slug: "pizza", price: 2200, original_price: null, image_url: IMG.malaiBotiPizza, is_available: true, is_featured: false, calories: 1980, tags: ["chicken", "creamy"] },
  { name: "Flare by TK Special Malai Boti Crown Crust (Medium)", slug: "special-malai-boti-crown-crust-medium", description: "Signature crown crust stuffed with cheese, topped with malai boti", category_slug: "pizza", price: 1550, original_price: null, image_url: IMG.crownCrustPizza, is_available: true, is_featured: true, calories: 1520, tags: ["chicken", "signature", "bestseller"] },
  { name: "Flare by TK Special Malai Boti Crown Crust (Large)", slug: "special-malai-boti-crown-crust-large", description: "Large signature malai boti crown crust", category_slug: "pizza", price: 2350, original_price: null, image_url: IMG.crownCrustPizza, is_available: true, is_featured: false, calories: 2150, tags: ["chicken", "signature"] },
  { name: "Chicken Tikka Pizza (Small)", slug: "chicken-tikka-pizza-small", description: "Desi-style tikka chunks, onions and green chilies", category_slug: "pizza", price: 700, original_price: null, image_url: IMG.tikkaPizza, is_available: true, is_featured: false, calories: 780, tags: ["chicken"] },
  { name: "Chicken Tikka Pizza (Medium)", slug: "chicken-tikka-pizza-medium", description: "Medium chicken tikka pizza on cheesy crust", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.tikkaPizza, is_available: true, is_featured: false, calories: 1280, tags: ["chicken"] },
  { name: "Chicken Tikka Pizza (Large)", slug: "chicken-tikka-pizza-large", description: "Large chicken tikka pizza", category_slug: "pizza", price: 1650, original_price: null, image_url: IMG.tikkaPizza, is_available: true, is_featured: false, calories: 1850, tags: ["chicken"] },
  { name: "Chicken Fajita Pizza (Small)", slug: "chicken-fajita-pizza-small", description: "Fajita chicken, bell peppers and onions", category_slug: "pizza", price: 700, original_price: null, image_url: IMG.fajitaPizza, is_available: true, is_featured: false, calories: 760, tags: ["chicken"] },
  { name: "Chicken Fajita Pizza (Medium)", slug: "chicken-fajita-pizza-medium", description: "Medium chicken fajita pizza with signature sauce", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.fajitaPizza, is_available: true, is_featured: false, calories: 1240, tags: ["chicken"] },
  { name: "Chicken Fajita Pizza (Large)", slug: "chicken-fajita-pizza-large", description: "Large chicken fajita pizza", category_slug: "pizza", price: 1650, original_price: null, image_url: IMG.fajitaPizza, is_available: true, is_featured: false, calories: 1820, tags: ["chicken"] },
  { name: "BBQ Pizza (Small)", slug: "bbq-pizza-small", description: "Smoky BBQ chicken with onions and BBQ drizzle", category_slug: "pizza", price: 700, original_price: null, image_url: IMG.bbqPizza, is_available: true, is_featured: false, calories: 770, tags: ["chicken", "bbq"] },
  { name: "BBQ Pizza (Medium)", slug: "bbq-pizza-medium", description: "Medium BBQ chicken pizza", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.bbqPizza, is_available: true, is_featured: false, calories: 1260, tags: ["chicken", "bbq"] },
  { name: "BBQ Pizza (Large)", slug: "bbq-pizza-large", description: "Large BBQ chicken pizza", category_slug: "pizza", price: 1650, original_price: null, image_url: IMG.bbqPizza, is_available: true, is_featured: false, calories: 1840, tags: ["chicken", "bbq"] },
  { name: "Kabab Crust Pizza (Medium)", slug: "kabab-crust-pizza-medium", description: "Crust ringed with seekh kebab, topped with cheese blend", category_slug: "pizza", price: 1350, original_price: null, image_url: IMG.kababPizza, is_available: true, is_featured: false, calories: 1420, tags: ["beef", "signature"] },
  { name: "Kabab Crust Pizza (Large)", slug: "kabab-crust-pizza-large", description: "Large kebab crust pizza", category_slug: "pizza", price: 1990, original_price: null, image_url: IMG.kababPizza, is_available: true, is_featured: false, calories: 2050, tags: ["beef", "signature"] },
  { name: "Nawabi Pizza (Small)", slug: "nawabi-pizza-small", description: "Royal nawabi-spiced chicken with rich creamy base", category_slug: "pizza", price: 700, original_price: null, image_url: IMG.malaiBotiPizza, is_available: true, is_featured: false, calories: 790, tags: ["chicken"] },
  { name: "Nawabi Pizza (Medium)", slug: "nawabi-pizza-medium", description: "Medium nawabi chicken pizza", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.malaiBotiPizza, is_available: true, is_featured: false, calories: 1290, tags: ["chicken"] },
  { name: "Nawabi Pizza (Large)", slug: "nawabi-pizza-large", description: "Large nawabi chicken pizza", category_slug: "pizza", price: 1650, original_price: null, image_url: IMG.malaiBotiPizza, is_available: true, is_featured: false, calories: 1860, tags: ["chicken"] },
  { name: "Cheese Pizza (Small)", slug: "cheese-pizza-small", description: "Classic mozzarella on rich tomato base", category_slug: "pizza", price: 600, original_price: null, image_url: IMG.cheesePizza, is_available: true, is_featured: false, calories: 720, tags: ["cheese", "veggie"] },
  { name: "Cheese Pizza (Medium)", slug: "cheese-pizza-medium", description: "Medium classic cheese pizza", category_slug: "pizza", price: 1100, original_price: null, image_url: IMG.cheesePizza, is_available: true, is_featured: false, calories: 1180, tags: ["cheese", "veggie"] },
  { name: "Cheese Pizza (Large)", slug: "cheese-pizza-large", description: "Large classic cheese pizza", category_slug: "pizza", price: 1500, original_price: null, image_url: IMG.cheesePizza, is_available: true, is_featured: false, calories: 1720, tags: ["cheese", "veggie"] },

  // Sandwich
  { name: "404 Sando", slug: "404-sando", description: "Crispy chicken katsu-style sando you won't find anywhere else", category_slug: "sandwich", price: 750, original_price: null, image_url: IMG.sando, is_available: true, is_featured: true, calories: 720, tags: ["chicken", "signature", "bestseller"] },
  { name: "Club Sandwich", slug: "club-sandwich", description: "Triple-decker with chicken, egg, cheese and fresh veggies", category_slug: "sandwich", price: 700, original_price: null, image_url: IMG.clubSandwich, is_available: true, is_featured: false, calories: 680, tags: ["chicken", "classic"] },
  { name: "Grilled Sandwich", slug: "grilled-sandwich", description: "Buttery grilled sandwich with melted cheese and chicken filling", category_slug: "sandwich", price: 650, original_price: null, image_url: IMG.grilledSandwich, is_available: true, is_featured: false, calories: 590, tags: ["chicken", "cheese"] },
  { name: "Smash Beef Sandwich", slug: "smash-beef-sandwich", description: "Smashed beef, caramelized onions and melted cheese on grilled bread", category_slug: "sandwich", price: 990, original_price: null, image_url: IMG.beefSandwich, is_available: true, is_featured: false, calories: 820, tags: ["beef", "cheese"] },
  { name: "Panini Sandwich", slug: "panini-sandwich", description: "Pressed panini with grilled chicken, pesto and mozzarella", category_slug: "sandwich", price: 750, original_price: null, image_url: IMG.panini, is_available: true, is_featured: false, calories: 640, tags: ["chicken"] },

  // Drinks
  { name: "Sky Sip (Medium)", slug: "sky-sip-medium", description: "Signature refreshing chilled drink — medium", category_slug: "drinks", price: 350, original_price: null, image_url: IMG.skySip, is_available: true, is_featured: false, calories: 220, tags: ["refreshing", "signature"] },
  { name: "Sky Sip (Large)", slug: "sky-sip-large", description: "Signature refreshing chilled drink — large", category_slug: "drinks", price: 500, original_price: null, image_url: IMG.skySip, is_available: true, is_featured: false, calories: 320, tags: ["refreshing", "signature"] },
  { name: "Soft Drink Tin", slug: "soft-drink-tin", description: "Chilled canned soft drink of your choice", category_slug: "drinks", price: 150, original_price: null, image_url: IMG.softDrink, is_available: true, is_featured: false, calories: 140, tags: ["cold"] },
  { name: "Water (Small)", slug: "water-small", description: "Small bottled mineral water", category_slug: "drinks", price: 60, original_price: null, image_url: IMG.water, is_available: true, is_featured: false, calories: 0, tags: ["water"] },
  { name: "Water (Large)", slug: "water-large", description: "Large bottled mineral water", category_slug: "drinks", price: 120, original_price: null, image_url: IMG.water, is_available: true, is_featured: false, calories: 0, tags: ["water"] },
  { name: "Regular Drink", slug: "regular-drink", description: "Chilled fountain soft drink", category_slug: "drinks", price: 120, original_price: null, image_url: IMG.regularDrink, is_available: true, is_featured: false, calories: 180, tags: ["cold"] },
];

export const seedDeals: SeedDeal[] = [];

export const HERO_IMAGE = IMG.hero;
