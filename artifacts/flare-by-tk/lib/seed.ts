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
  burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
  burger2:
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
  wrap: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
  pizza2:
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
  friedChicken:
    "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&q=80",
  wings:
    "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=500&q=80",
  bbq: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80",
  kebab:
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&q=80",
  sandwich:
    "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
  fries:
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80",
  loadedFries:
    "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80",
  biryani:
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
  karahi:
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80",
  dessert:
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80",
  shake:
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80",
  drink:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80",
  hero: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1600&q=80",
};

export const seedCategories: SeedCategory[] = [
  { name: "Burgers", slug: "burgers", description: "Flame-grilled and crispy fried burgers stacked high", image_url: IMG.burger, sort_order: 1 },
  { name: "Wraps & Rolls", slug: "wraps-rolls", description: "Paratha rolls and tortilla wraps packed with flavor", image_url: IMG.wrap, sort_order: 2 },
  { name: "Pizza", slug: "pizza", description: "Hand-tossed pizzas with generous toppings", image_url: IMG.pizza, sort_order: 3 },
  { name: "Fried Chicken", slug: "fried-chicken", description: "Crunchy golden fried chicken and wings", image_url: IMG.friedChicken, sort_order: 4 },
  { name: "BBQ & Grill", slug: "bbq-grill", description: "Charcoal-grilled tikka, kebabs and platters", image_url: IMG.bbq, sort_order: 5 },
  { name: "Sandwiches", slug: "sandwiches", description: "Club sandwiches and grilled melts", image_url: IMG.sandwich, sort_order: 6 },
  { name: "Fries & Sides", slug: "fries-sides", description: "Loaded fries, nuggets and all the extras", image_url: IMG.fries, sort_order: 7 },
  { name: "Desi Specials", slug: "desi-specials", description: "Biryani, karahi and homestyle favorites", image_url: IMG.biryani, sort_order: 8 },
  { name: "Desserts", slug: "desserts", description: "Sweet endings — cakes, brownies and more", image_url: IMG.dessert, sort_order: 9 },
  { name: "Beverages", slug: "beverages", description: "Shakes, sodas and fresh juices", image_url: IMG.drink, sort_order: 10 },
];

export const seedMenuItems: SeedMenuItem[] = [
  // Burgers (8)
  { name: "Flare Signature Smash", slug: "flare-signature-smash", description: "Double smashed beef patties, melted cheddar, flare sauce, caramelized onions", category_slug: "burgers", price: 650, original_price: null, image_url: IMG.burger, is_available: true, is_featured: true, calories: 780, tags: ["beef", "bestseller"] },
  { name: "Classic Beef Burger", slug: "classic-beef-burger", description: "Juicy beef patty, lettuce, tomato, pickles and house mayo", category_slug: "burgers", price: 450, original_price: null, image_url: IMG.burger2, is_available: true, is_featured: false, calories: 620, tags: ["beef"] },
  { name: "Zinger Burger", slug: "zinger-burger", description: "Crispy fried chicken fillet with spicy mayo and crunchy lettuce", category_slug: "burgers", price: 480, original_price: null, image_url: IMG.burger, is_available: true, is_featured: true, calories: 690, tags: ["chicken", "spicy", "bestseller"] },
  { name: "Double Decker Zinger", slug: "double-decker-zinger", description: "Two crispy zinger fillets, double cheese, jalapeño kick", category_slug: "burgers", price: 720, original_price: 780, image_url: IMG.burger2, is_available: true, is_featured: false, calories: 950, tags: ["chicken", "spicy"] },
  { name: "Grilled Chicken Burger", slug: "grilled-chicken-burger", description: "Char-grilled chicken breast, garlic aioli, fresh greens", category_slug: "burgers", price: 520, original_price: null, image_url: IMG.burger, is_available: true, is_featured: false, calories: 540, tags: ["chicken", "grilled"] },
  { name: "Smoky BBQ Beef Burger", slug: "smoky-bbq-beef-burger", description: "Beef patty glazed in smoky BBQ sauce with crispy onions", category_slug: "burgers", price: 590, original_price: null, image_url: IMG.burger2, is_available: true, is_featured: false, calories: 710, tags: ["beef", "bbq"] },
  { name: "Mighty Flare Tower", slug: "mighty-flare-tower", description: "Beef patty, zinger fillet, hash brown, triple cheese — the works", category_slug: "burgers", price: 850, original_price: 920, image_url: IMG.burger, is_available: true, is_featured: true, calories: 1150, tags: ["beef", "chicken", "bestseller"] },
  { name: "Crispy Chicken Slider Trio", slug: "crispy-chicken-slider-trio", description: "Three mini crispy chicken sliders with three signature sauces", category_slug: "burgers", price: 560, original_price: null, image_url: IMG.burger2, is_available: true, is_featured: false, calories: 680, tags: ["chicken", "sharing"] },
  // Wraps & Rolls (7)
  { name: "Chicken Tikka Paratha Roll", slug: "chicken-tikka-paratha-roll", description: "Charcoal tikka chunks, onions and chutney in a crispy paratha", category_slug: "wraps-rolls", price: 380, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: true, calories: 520, tags: ["chicken", "bestseller"] },
  { name: "Behari Kebab Roll", slug: "behari-kebab-roll", description: "Melt-in-mouth behari beef strips wrapped with mint raita", category_slug: "wraps-rolls", price: 420, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 560, tags: ["beef"] },
  { name: "Zinger Wrap", slug: "zinger-wrap", description: "Crispy zinger strips, jalapeños and cheese in a grilled tortilla", category_slug: "wraps-rolls", price: 440, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 610, tags: ["chicken", "spicy"] },
  { name: "Malai Boti Roll", slug: "malai-boti-roll", description: "Creamy malai chicken boti with garlic mayo in fresh paratha", category_slug: "wraps-rolls", price: 400, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 540, tags: ["chicken", "creamy"] },
  { name: "Kabab Cheese Roll", slug: "kabab-cheese-roll", description: "Seekh kebab with melted cheese and spicy ketchup", category_slug: "wraps-rolls", price: 390, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 580, tags: ["beef", "cheese"] },
  { name: "Grilled Veggie Wrap", slug: "grilled-veggie-wrap", description: "Chargrilled vegetables, hummus and feta in a whole wheat wrap", category_slug: "wraps-rolls", price: 350, original_price: null, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 430, tags: ["veggie"] },
  { name: "Double Chicken Cheese Roll", slug: "double-chicken-cheese-roll", description: "Double portion of tikka chicken with double cheese", category_slug: "wraps-rolls", price: 520, original_price: 560, image_url: IMG.wrap, is_available: true, is_featured: false, calories: 720, tags: ["chicken", "cheese"] },
  // Pizza (8)
  { name: "Chicken Tikka Pizza", slug: "chicken-tikka-pizza", description: "Desi-style tikka chunks, onions and green chilies on cheesy crust", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.pizza, is_available: true, is_featured: true, calories: 1280, tags: ["chicken", "bestseller"] },
  { name: "Chicken Fajita Pizza", slug: "chicken-fajita-pizza", description: "Fajita chicken, bell peppers, onions and signature sauce", category_slug: "pizza", price: 1150, original_price: null, image_url: IMG.pizza2, is_available: true, is_featured: false, calories: 1240, tags: ["chicken"] },
  { name: "Cheese Lovers Pizza", slug: "cheese-lovers-pizza", description: "Four-cheese blend on rich tomato base", category_slug: "pizza", price: 1050, original_price: null, image_url: IMG.pizza, is_available: true, is_featured: false, calories: 1190, tags: ["cheese", "veggie"] },
  { name: "Behari Kebab Pizza", slug: "behari-kebab-pizza", description: "Smoky behari beef strips with onions and special chutney drizzle", category_slug: "pizza", price: 1250, original_price: null, image_url: IMG.pizza2, is_available: true, is_featured: false, calories: 1320, tags: ["beef", "spicy"] },
  { name: "Pepperoni Blaze", slug: "pepperoni-blaze", description: "Loaded beef pepperoni with extra mozzarella", category_slug: "pizza", price: 1290, original_price: null, image_url: IMG.pizza, is_available: true, is_featured: false, calories: 1350, tags: ["beef"] },
  { name: "Hot & Spicy Ranch Pizza", slug: "hot-spicy-ranch-pizza", description: "Peri peri chicken, jalapeños and cool ranch swirl", category_slug: "pizza", price: 1200, original_price: 1300, image_url: IMG.pizza2, is_available: true, is_featured: false, calories: 1290, tags: ["chicken", "spicy"] },
  { name: "Veggie Supreme Pizza", slug: "veggie-supreme-pizza", description: "Mushrooms, olives, capsicum, sweet corn and onions", category_slug: "pizza", price: 980, original_price: null, image_url: IMG.pizza, is_available: true, is_featured: false, calories: 1050, tags: ["veggie"] },
  { name: "Crown Crust Special", slug: "crown-crust-special", description: "Kebab-stuffed crown crust topped with tikka and cheese blend", category_slug: "pizza", price: 1450, original_price: 1550, image_url: IMG.pizza2, is_available: true, is_featured: true, calories: 1520, tags: ["chicken", "beef", "bestseller"] },
  // Fried Chicken (6)
  { name: "Crispy Fried Chicken (2 Pcs)", slug: "crispy-fried-chicken-2pcs", description: "Two pieces of golden pressure-fried chicken with signature crunch", category_slug: "fried-chicken", price: 420, original_price: null, image_url: IMG.friedChicken, is_available: true, is_featured: false, calories: 640, tags: ["chicken"] },
  { name: "Crispy Fried Chicken (5 Pcs)", slug: "crispy-fried-chicken-5pcs", description: "Five-piece bucket with two dips of your choice", category_slug: "fried-chicken", price: 980, original_price: 1050, image_url: IMG.friedChicken, is_available: true, is_featured: true, calories: 1600, tags: ["chicken", "sharing", "bestseller"] },
  { name: "Spicy Buffalo Wings (6 Pcs)", slug: "spicy-buffalo-wings-6pcs", description: "Six wings tossed in fiery buffalo glaze", category_slug: "fried-chicken", price: 550, original_price: null, image_url: IMG.wings, is_available: true, is_featured: false, calories: 720, tags: ["chicken", "spicy"] },
  { name: "Honey BBQ Wings (6 Pcs)", slug: "honey-bbq-wings-6pcs", description: "Sticky-sweet honey BBQ glazed wings", category_slug: "fried-chicken", price: 550, original_price: null, image_url: IMG.wings, is_available: true, is_featured: false, calories: 750, tags: ["chicken", "bbq"] },
  { name: "Chicken Tenders (4 Pcs)", slug: "chicken-tenders-4pcs", description: "Hand-breaded juicy tenders with garlic dip", category_slug: "fried-chicken", price: 490, original_price: null, image_url: IMG.friedChicken, is_available: true, is_featured: false, calories: 580, tags: ["chicken"] },
  { name: "Nashville Hot Chicken", slug: "nashville-hot-chicken", description: "Cayenne-dusted fried chicken with pickles on toast", category_slug: "fried-chicken", price: 620, original_price: null, image_url: IMG.friedChicken, is_available: true, is_featured: false, calories: 810, tags: ["chicken", "spicy"] },
  // BBQ & Grill (6)
  { name: "Chicken Tikka (Leg)", slug: "chicken-tikka-leg", description: "Charcoal-grilled leg piece marinated overnight in tikka spices", category_slug: "bbq-grill", price: 350, original_price: null, image_url: IMG.bbq, is_available: true, is_featured: false, calories: 380, tags: ["chicken", "grilled"] },
  { name: "Seekh Kebab (4 Pcs)", slug: "seekh-kebab-4pcs", description: "Minced beef skewers with fresh herbs, grilled over coals", category_slug: "bbq-grill", price: 520, original_price: null, image_url: IMG.kebab, is_available: true, is_featured: true, calories: 560, tags: ["beef", "grilled", "bestseller"] },
  { name: "Malai Boti (8 Pcs)", slug: "malai-boti-8pcs", description: "Creamy, tender chicken cubes grilled to perfection", category_slug: "bbq-grill", price: 620, original_price: null, image_url: IMG.bbq, is_available: true, is_featured: false, calories: 520, tags: ["chicken", "creamy"] },
  { name: "Behari Boti (8 Pcs)", slug: "behari-boti-8pcs", description: "Signature behari-spiced beef cubes, smoky and tender", category_slug: "bbq-grill", price: 680, original_price: null, image_url: IMG.kebab, is_available: true, is_featured: false, calories: 590, tags: ["beef", "spicy"] },
  { name: "Mixed BBQ Platter", slug: "mixed-bbq-platter", description: "Tikka, seekh kebab, malai boti with naan, raita and salad", category_slug: "bbq-grill", price: 1650, original_price: 1800, image_url: IMG.bbq, is_available: true, is_featured: true, calories: 1750, tags: ["chicken", "beef", "sharing", "bestseller"] },
  { name: "Grilled Fish Tikka", slug: "grilled-fish-tikka", description: "River fish fillet in tangy tikka marinade, char-grilled", category_slug: "bbq-grill", price: 750, original_price: null, image_url: IMG.bbq, is_available: true, is_featured: false, calories: 420, tags: ["fish", "grilled"] },
  // Sandwiches (5)
  { name: "Triple Decker Club", slug: "triple-decker-club", description: "Chicken, egg, cheese and fresh veggies in three toasted layers", category_slug: "sandwiches", price: 550, original_price: null, image_url: IMG.sandwich, is_available: true, is_featured: false, calories: 680, tags: ["chicken", "classic"] },
  { name: "Grilled Cheese Melt", slug: "grilled-cheese-melt", description: "Buttery toast with three melted cheeses", category_slug: "sandwiches", price: 380, original_price: null, image_url: IMG.sandwich, is_available: true, is_featured: false, calories: 540, tags: ["cheese", "veggie"] },
  { name: "Peri Peri Chicken Sandwich", slug: "peri-peri-chicken-sandwich", description: "Flame-grilled peri peri chicken with spicy slaw", category_slug: "sandwiches", price: 490, original_price: null, image_url: IMG.sandwich, is_available: true, is_featured: false, calories: 610, tags: ["chicken", "spicy"] },
  { name: "Steak Cheese Melt", slug: "steak-cheese-melt", description: "Sliced beef steak, sautéed onions and cheese on grilled bread", category_slug: "sandwiches", price: 650, original_price: null, image_url: IMG.sandwich, is_available: true, is_featured: false, calories: 720, tags: ["beef", "cheese"] },
  { name: "Chicken Shawarma Sandwich", slug: "chicken-shawarma-sandwich", description: "Shawarma-spiced chicken with garlic sauce and pickles", category_slug: "sandwiches", price: 420, original_price: null, image_url: IMG.sandwich, is_available: true, is_featured: false, calories: 560, tags: ["chicken"] },
  // Fries & Sides (7)
  { name: "Classic Fries", slug: "classic-fries", description: "Crispy golden fries with signature seasoning", category_slug: "fries-sides", price: 250, original_price: null, image_url: IMG.fries, is_available: true, is_featured: false, calories: 380, tags: ["veggie"] },
  { name: "Masala Fries", slug: "masala-fries", description: "Fries tossed in tangy desi masala with chutney drizzle", category_slug: "fries-sides", price: 290, original_price: null, image_url: IMG.fries, is_available: true, is_featured: false, calories: 410, tags: ["veggie", "spicy"] },
  { name: "Loaded Cheese Fries", slug: "loaded-cheese-fries", description: "Fries buried in cheese sauce, crispy chicken bits and jalapeños", category_slug: "fries-sides", price: 480, original_price: null, image_url: IMG.loadedFries, is_available: true, is_featured: true, calories: 720, tags: ["cheese", "bestseller"] },
  { name: "Pizza Fries", slug: "pizza-fries", description: "Fries topped with pizza sauce, mozzarella and chicken chunks", category_slug: "fries-sides", price: 520, original_price: null, image_url: IMG.loadedFries, is_available: true, is_featured: false, calories: 760, tags: ["cheese", "chicken"] },
  { name: "Chicken Nuggets (8 Pcs)", slug: "chicken-nuggets-8pcs", description: "Crispy bite-sized nuggets with dip of choice", category_slug: "fries-sides", price: 390, original_price: null, image_url: IMG.friedChicken, is_available: true, is_featured: false, calories: 460, tags: ["chicken", "kids"] },
  { name: "Coleslaw", slug: "coleslaw", description: "Creamy, crunchy house-made coleslaw", category_slug: "fries-sides", price: 150, original_price: null, image_url: IMG.fries, is_available: true, is_featured: false, calories: 180, tags: ["veggie", "side"] },
  { name: "Garlic Mayo Dip Trio", slug: "garlic-mayo-dip-trio", description: "Garlic mayo, spicy ketchup and honey mustard", category_slug: "fries-sides", price: 180, original_price: null, image_url: IMG.fries, is_available: true, is_featured: false, calories: 290, tags: ["side"] },
  // Desi Specials (5)
  { name: "Chicken Biryani", slug: "chicken-biryani", description: "Fragrant basmati layered with spiced chicken, served with raita", category_slug: "desi-specials", price: 450, original_price: null, image_url: IMG.biryani, is_available: true, is_featured: true, calories: 780, tags: ["chicken", "rice", "bestseller"] },
  { name: "Beef Pulao", slug: "beef-pulao", description: "Aromatic rice slow-cooked in beef stock with tender shanks", category_slug: "desi-specials", price: 520, original_price: null, image_url: IMG.biryani, is_available: true, is_featured: false, calories: 820, tags: ["beef", "rice"] },
  { name: "Chicken Karahi (Half)", slug: "chicken-karahi-half", description: "Wok-tossed chicken in tomato-ginger gravy, served with naan", category_slug: "desi-specials", price: 850, original_price: null, image_url: IMG.karahi, is_available: true, is_featured: false, calories: 950, tags: ["chicken", "curry"] },
  { name: "Daal Makhani with Naan", slug: "daal-makhani-naan", description: "Slow-cooked buttery black lentils with fresh naan", category_slug: "desi-specials", price: 380, original_price: null, image_url: IMG.karahi, is_available: true, is_featured: false, calories: 620, tags: ["veggie", "curry"] },
  { name: "Chicken Haleem", slug: "chicken-haleem", description: "Rich, slow-simmered haleem topped with crispy onions and lemon", category_slug: "desi-specials", price: 400, original_price: null, image_url: IMG.karahi, is_available: true, is_featured: false, calories: 680, tags: ["chicken"] },
  // Desserts (4)
  { name: "Molten Lava Cake", slug: "molten-lava-cake", description: "Warm chocolate cake with a gooey molten center", category_slug: "desserts", price: 350, original_price: null, image_url: IMG.cake, is_available: true, is_featured: true, calories: 480, tags: ["chocolate", "bestseller"] },
  { name: "Fudge Brownie Sundae", slug: "fudge-brownie-sundae", description: "Warm brownie, vanilla scoop, hot fudge and nuts", category_slug: "desserts", price: 390, original_price: null, image_url: IMG.dessert, is_available: true, is_featured: false, calories: 560, tags: ["chocolate"] },
  { name: "Gulab Jamun (4 Pcs)", slug: "gulab-jamun-4pcs", description: "Soft, syrup-soaked classics served warm", category_slug: "desserts", price: 220, original_price: null, image_url: IMG.dessert, is_available: true, is_featured: false, calories: 420, tags: ["desi", "sweet"] },
  { name: "New York Cheesecake", slug: "new-york-cheesecake", description: "Creamy baked cheesecake with berry compote", category_slug: "desserts", price: 420, original_price: null, image_url: IMG.cake, is_available: true, is_featured: false, calories: 510, tags: ["sweet"] },
  // Beverages (5)
  { name: "Chocolate Shake", slug: "chocolate-shake", description: "Thick chocolate shake topped with whipped cream", category_slug: "beverages", price: 320, original_price: null, image_url: IMG.shake, is_available: true, is_featured: false, calories: 520, tags: ["shake", "chocolate"] },
  { name: "Oreo Crunch Shake", slug: "oreo-crunch-shake", description: "Cookies-and-cream shake with Oreo crumble", category_slug: "beverages", price: 350, original_price: null, image_url: IMG.shake, is_available: true, is_featured: true, calories: 580, tags: ["shake", "bestseller"] },
  { name: "Fresh Lime Soda", slug: "fresh-lime-soda", description: "Zesty lime with soda — sweet or salted", category_slug: "beverages", price: 180, original_price: null, image_url: IMG.drink, is_available: true, is_featured: false, calories: 120, tags: ["refreshing"] },
  { name: "Mango Lassi", slug: "mango-lassi", description: "Creamy yogurt blended with sweet mango pulp", category_slug: "beverages", price: 250, original_price: null, image_url: IMG.drink, is_available: true, is_featured: false, calories: 310, tags: ["desi", "refreshing"] },
  { name: "Soft Drink (500ml)", slug: "soft-drink-500ml", description: "Chilled soft drink of your choice", category_slug: "beverages", price: 120, original_price: null, image_url: IMG.drink, is_available: true, is_featured: false, calories: 210, tags: ["cold"] },
];

export const seedDeals: SeedDeal[] = [
  {
    title: "Flare Duo Deal",
    description: "2 Zinger Burgers + Classic Fries + 2 Soft Drinks",
    image_url: IMG.burger,
    original_price: 1450,
    deal_price: 1150,
    discount_type: "fixed",
    discount_value: 300,
  },
  {
    title: "Family Feast",
    description: "Large Chicken Tikka Pizza + 5 Pcs Fried Chicken + Loaded Fries + 1.5L Drink",
    image_url: IMG.pizza,
    original_price: 3100,
    deal_price: 2499,
    discount_type: "fixed",
    discount_value: 601,
  },
  {
    title: "Roll Mania",
    description: "3 Chicken Tikka Paratha Rolls + Masala Fries + 2 Soft Drinks",
    image_url: IMG.wrap,
    original_price: 1670,
    deal_price: 1299,
    discount_type: "fixed",
    discount_value: 371,
  },
  {
    title: "BBQ Night Special",
    description: "Mixed BBQ Platter + 2 Fresh Lime Sodas — perfect for two",
    image_url: IMG.bbq,
    original_price: 2010,
    deal_price: 1699,
    discount_type: "fixed",
    discount_value: 311,
  },
  {
    title: "Sweet Tooth Combo",
    description: "Molten Lava Cake + Oreo Crunch Shake",
    image_url: IMG.cake,
    original_price: 700,
    deal_price: 549,
    discount_type: "percentage",
    discount_value: 22,
  },
];

export const HERO_IMAGE = IMG.hero;
