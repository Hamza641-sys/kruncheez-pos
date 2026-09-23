// ============================================================
//  KRUNCHEEZ POS - Firestore Seed Data
//  Run once from Settings > Seed Database
// ============================================================

export const menuCategories = [
  { id: 'starters',   name: 'Starters',       icon: '🍟', color: '#e67e22', order: 1 },
  { id: 'soup',       name: 'Soup',            icon: '🍲', color: '#3498db', order: 2 },
  { id: 'friedchicken', name: 'Fried Chicken', icon: '🍗', color: '#e74c3c', order: 3 },
  { id: 'sandwich',   name: 'Sandwich',        icon: '🥪', color: '#2ecc71', order: 4 },
  { id: 'pizza',      name: 'Pizza',           icon: '🍕', color: '#9b59b6', order: 5 },
  { id: 'burger',     name: 'Burger',          icon: '🍔', color: '#e74c3c', order: 6 },
  { id: 'wraproll',   name: 'Wrap & Roll',     icon: '🌯', color: '#1abc9c', order: 7 },
  { id: 'chinese',    name: 'Chinese',         icon: '🥡', color: '#f39c12', order: 8 },
  { id: 'pasta',      name: 'Pasta',           icon: '🍝', color: '#e74c3c', order: 9 },
  { id: 'platter',    name: 'Platter',         icon: '🍱', color: '#8e44ad', order: 10 },
  { id: 'deals',      name: 'Deals',           icon: '🔥', color: '#c0392b', order: 11 },
  { id: 'drinks',     name: 'Drinks',          icon: '🥤', color: '#2980b9', order: 12 },
]

export const menuItems = [
  // ── STARTERS ──────────────────────────────────────────────
  { name: 'Texas Nachos',          categoryId: 'starters',    price: 450,  available: true, description: 'Crispy nachos with salsa & cheese dip' },
  { name: 'Fish & Chips',          categoryId: 'starters',    price: 550,  available: true, description: 'Golden fried fish with fries' },
  { name: 'BBQ Wings',             categoryId: 'starters',    price: 650,  available: true, description: '6 pcs smoky BBQ chicken wings' },
  { name: 'Crispy Chilli Wings',   categoryId: 'starters',    price: 650,  available: true, description: '6 pcs chilli glazed crispy wings' },
  { name: 'Chicken Nuggets',       categoryId: 'starters',    price: 400,  available: true, description: '8 pcs golden chicken nuggets' },
  { name: 'Chicken Strips',        categoryId: 'starters',    price: 500,  available: true, description: '4 pcs crispy chicken strips' },
  { name: 'French Fries',          categoryId: 'starters',    price: 250,  available: true, description: 'Crispy golden fries' },
  { name: 'Loaded Fries',          categoryId: 'starters',    price: 400,  available: true, description: 'Fries topped with cheese & sauce' },
  { name: 'Onion Rings',           categoryId: 'starters',    price: 300,  available: true, description: 'Crispy battered onion rings' },
  { name: 'Garlic Bread',          categoryId: 'starters',    price: 200,  available: true, description: 'Toasted garlic buttered bread' },

  // ── SOUP ──────────────────────────────────────────────────
  { name: 'Chicken Corn Soup',     categoryId: 'soup',        price: 280,  available: true, description: 'Classic sweet corn chicken soup' },
  { name: 'Hot & Sour Soup',       categoryId: 'soup',        price: 280,  available: true, description: 'Spicy tangy hot & sour soup' },
  { name: 'Kruncheez Special Soup',categoryId: 'soup',        price: 350,  available: true, description: 'Chef\'s special signature soup' },

  // ── FRIED CHICKEN ─────────────────────────────────────────
  { name: 'Fried Chicken 1 Pc',    categoryId: 'friedchicken', price: 350, available: true, description: '1 piece crispy fried chicken' },
  { name: 'Fried Chicken 2 Pc',    categoryId: 'friedchicken', price: 650, available: true, description: '2 pieces crispy fried chicken' },
  { name: 'Fried Chicken 3 Pc',    categoryId: 'friedchicken', price: 950, available: true, description: '3 pieces crispy fried chicken' },

  // ── SANDWICH ──────────────────────────────────────────────
  { name: 'Club Sandwich',         categoryId: 'sandwich',    price: 450,  available: true, description: 'Triple-decker club sandwich' },
  { name: 'Grilled Sandwich',      categoryId: 'sandwich',    price: 380,  available: true, description: 'Grilled chicken sandwich' },
  { name: 'Mexican Sandwich',      categoryId: 'sandwich',    price: 480,  available: true, description: 'Spicy Mexican style sandwich' },
  { name: 'Bun Makhani',           categoryId: 'sandwich',    price: 320,  available: true, description: 'Buttery soft bun makhani' },

  // ── PIZZA ─────────────────────────────────────────────────
  { name: 'Classic Pizza',         categoryId: 'pizza',       price: 850,  available: true, description: 'Classic cheese & tomato pizza' },
  { name: 'Hot & Spicy Pizza',     categoryId: 'pizza',       price: 950,  available: true, description: 'Spicy jalapeño loaded pizza' },
  { name: 'Chicken BBQ Pizza',     categoryId: 'pizza',       price: 1050, available: true, description: 'Smoky BBQ chicken pizza' },
  { name: 'Stuff Pizza - Chicken', categoryId: 'pizza',       price: 1200, available: true, description: 'Stuffed crust chicken pizza' },
  { name: 'Stuff Pizza - Beef',    categoryId: 'pizza',       price: 1300, available: true, description: 'Stuffed crust beef pizza' },
  { name: 'Stuff Pizza - Mix',     categoryId: 'pizza',       price: 1350, available: true, description: 'Stuffed crust mix pizza' },

  // ── BURGER ────────────────────────────────────────────────
  { name: 'Zinger Burger',         categoryId: 'burger',      price: 550,  available: true, description: 'Crispy spicy zinger burger' },
  { name: 'Grill Chicken Burger',  categoryId: 'burger',      price: 580,  available: true, description: 'Juicy grilled chicken burger' },
  { name: 'Tower Burger',          categoryId: 'burger',      price: 750,  available: true, description: 'Tall tower double patty burger' },
  { name: 'Parmesan Burger',       categoryId: 'burger',      price: 680,  available: true, description: 'Parmesan coated chicken burger' },
  { name: 'Cheese Burger',         categoryId: 'burger',      price: 620,  available: true, description: 'Double cheese beef burger' },
  { name: 'Double Cheese Burger',  categoryId: 'burger',      price: 780,  available: true, description: 'Extra double cheese burger' },

  // ── WRAP & ROLL ───────────────────────────────────────────
  { name: 'Mexican Wrap',          categoryId: 'wraproll',    price: 480,  available: true, description: 'Spicy Mexican chicken wrap' },
  { name: 'Classic Roll',          categoryId: 'wraproll',    price: 420,  available: true, description: 'Classic chicken roll' },
  { name: 'Zinger Wrap',           categoryId: 'wraproll',    price: 500,  available: true, description: 'Zinger chicken wrap' },
  { name: 'Roman Roll',            categoryId: 'wraproll',    price: 460,  available: true, description: 'Roman style chicken roll' },

  // ── CHINESE ───────────────────────────────────────────────
  { name: 'Chowmein Chicken',      categoryId: 'chinese',     price: 450,  available: true, description: 'Stir fried chicken noodles' },
  { name: 'Chowmein Beef',         categoryId: 'chinese',     price: 480,  available: true, description: 'Stir fried beef noodles' },
  { name: 'Chowmein Mix',          categoryId: 'chinese',     price: 500,  available: true, description: 'Mixed chicken & beef noodles' },
  { name: 'Special Fried Rice',    categoryId: 'chinese',     price: 500,  available: true, description: 'Wok tossed special fried rice' },
  { name: 'Egg Fried Rice',        categoryId: 'chinese',     price: 400,  available: true, description: 'Classic egg fried rice' },
  { name: 'Chicken Fried Rice',    categoryId: 'chinese',     price: 450,  available: true, description: 'Chicken wok fried rice' },

  // ── PASTA ─────────────────────────────────────────────────
  { name: 'Fettuccine Alfredo',    categoryId: 'pasta',       price: 680,  available: true, description: 'Creamy alfredo fettuccine pasta' },
  { name: 'Oven Baked Pasta',      categoryId: 'pasta',       price: 720,  available: true, description: 'Baked pasta with cheese topping' },
  { name: 'Chicken Lasagne',       categoryId: 'pasta',       price: 750,  available: true, description: 'Layered chicken lasagne' },
  { name: 'Penne Arabiata',        categoryId: 'pasta',       price: 620,  available: true, description: 'Spicy penne arabiata' },

  // ── PLATTER ───────────────────────────────────────────────
  { name: 'Platter - 1 Person',    categoryId: 'platter',     price: 950,  available: true, description: '1-person mixed platter' },
  { name: 'Platter - 4 Person',    categoryId: 'platter',     price: 3200, available: true, description: '4-person sharing platter' },
  { name: 'Platter - 9 Person',    categoryId: 'platter',     price: 6500, available: true, description: '9-person large sharing platter' },

  // ── DEALS ─────────────────────────────────────────────────
  { name: 'Deal 1',  categoryId: 'deals', price: 850,  available: true, description: 'Zinger Burger + Fries + Drink' },
  { name: 'Deal 2',  categoryId: 'deals', price: 1200, available: true, description: '2 Zinger Burgers + 2 Drinks' },
  { name: 'Deal 3',  categoryId: 'deals', price: 1500, available: true, description: 'Pizza + 2 Drinks' },
  { name: 'Deal 4',  categoryId: 'deals', price: 1800, available: true, description: 'Platter 1P + Fries + 2 Drinks' },
  { name: 'Deal 5',  categoryId: 'deals', price: 2200, available: true, description: '2 Burgers + Fries + Nuggets + 2 Drinks' },
  { name: 'Deal 6',  categoryId: 'deals', price: 2500, available: true, description: 'Family Meal Deal for 2' },
  { name: 'Deal 7',  categoryId: 'deals', price: 3000, available: true, description: 'Pizza + Pasta + 4 Drinks' },
  { name: 'Deal 8',  categoryId: 'deals', price: 3500, available: true, description: 'BBQ Wings + Pizza + 4 Drinks' },
  { name: 'Deal 9',  categoryId: 'deals', price: 4500, available: true, description: 'Full Family Meal for 4' },
  { name: 'Deal 10', categoryId: 'deals', price: 6000, available: true, description: 'Mega Party Deal for 6' },

  // ── DRINKS ────────────────────────────────────────────────
  { name: 'Pepsi 250ml',           categoryId: 'drinks',      price: 80,   available: true, description: 'Chilled Pepsi can' },
  { name: 'Pepsi 1.5L',            categoryId: 'drinks',      price: 180,  available: true, description: 'Large Pepsi bottle' },
  { name: '7UP 250ml',             categoryId: 'drinks',      price: 80,   available: true, description: 'Chilled 7UP can' },
  { name: 'Mineral Water',         categoryId: 'drinks',      price: 60,   available: true, description: 'Fresh mineral water' },
  { name: 'Fresh Juice',           categoryId: 'drinks',      price: 200,  available: true, description: 'Freshly squeezed juice' },
  { name: 'Milkshake',             categoryId: 'drinks',      price: 350,  available: true, description: 'Thick creamy milkshake' },
]

export const tablesData = Array.from({ length: 20 }, (_, i) => ({
  number: i + 1,
  capacity: i < 10 ? 4 : i < 16 ? 6 : 8,
  status: 'available', // available | occupied | reserved | cleaning
  floor: i < 10 ? 'Ground Floor' : 'First Floor',
  currentOrderId: null,
}))

export const staffRoles = [
  { id: 'admin',    name: 'Admin',    permissions: ['all'] },
  { id: 'manager',  name: 'Manager',  permissions: ['dashboard','orders','menu','tables','inventory','reports','employees','customers','expenses'] },
  { id: 'cashier',  name: 'Cashier',  permissions: ['orders','tables','customers','billing'] },
  { id: 'waiter',   name: 'Waiter',   permissions: ['orders','tables'] },
  { id: 'kitchen',  name: 'Kitchen',  permissions: ['kitchen'] },
]

export const expenseCategories = [
  'Rent', 'Utilities', 'Salaries', 'Raw Material',
  'Maintenance', 'Marketing', 'Packaging', 'Miscellaneous'
]
