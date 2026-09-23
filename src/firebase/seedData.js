// ============================================================
//  THE KRUNCHEEZ — Real Menu Data
//  Source: Official Restaurant Menu
//  Updated: 2026-09-23
// ============================================================

export const menuCategories = [
  { id: 'starters',    name: 'Starters',       icon: '🍟', color: '#e67e22', order: 1  },
  { id: 'sandwich',    name: 'Sandwich',        icon: '🥪', color: '#2ecc71', order: 2  },
  { id: 'friedchicken',name: 'Fried Chicken',   icon: '🍗', color: '#e74c3c', order: 3  },
  { id: 'soup',        name: 'Soup',            icon: '🍲', color: '#3498db', order: 4  },
  { id: 'burger',      name: 'Burger',          icon: '🍔', color: '#e74c3c', order: 5  },
  { id: 'wraproll',    name: 'Wrap & Roll',     icon: '🌯', color: '#1abc9c', order: 6  },
  { id: 'pizza',       name: 'Pizza',           icon: '🍕', color: '#9b59b6', order: 7  },
  { id: 'stuffpizza',  name: 'Stuff Pizza',     icon: '🍕', color: '#8e44ad', order: 8  },
  { id: 'trendpizza',  name: 'Top Trending Pizza', icon: '🔥', color: '#c0392b', order: 9 },
  { id: 'chinese',     name: 'Chinese',         icon: '🥡', color: '#f39c12', order: 10 },
  { id: 'pasta',       name: 'Pasta',           icon: '🍝', color: '#e74c3c', order: 11 },
  { id: 'bbq',         name: 'B.B.Q',           icon: '🔥', color: '#c0392b', order: 12 },
  { id: 'platter',     name: 'Platter',         icon: '🍱', color: '#8e44ad', order: 13 },
  { id: 'deals',       name: 'Deals',           icon: '🎯', color: '#e63946', order: 14 },
  { id: 'drinks',      name: 'Drinks',          icon: '🥤', color: '#2980b9', order: 15 },
]

export const menuItems = [

  // ── STARTERS ──────────────────────────────────────────
  { name: 'Texas Nacho\'s',              categoryId: 'starters', price: 450,  available: true, description: 'Crispy nachos with dip' },
  { name: 'Fish & Chips',               categoryId: 'starters', price: 899,  available: true, description: 'Golden fried fish with fries' },
  { name: 'Finger Fish (with Fries)',    categoryId: 'starters', price: 799,  available: true, description: 'Crispy finger fish with fries' },
  { name: 'Sweet Chilli Wings (4pc)',    categoryId: 'starters', price: 499,  available: true, description: '4 pieces sweet chilli wings' },
  { name: 'Sweet Chilli Wings (8pc)',    categoryId: 'starters', price: 799,  available: true, description: '8 pieces sweet chilli wings' },
  { name: 'Crispy Wings (4pc)',          categoryId: 'starters', price: 450,  available: true, description: '4 pieces crispy wings' },
  { name: 'Crispy Wings (8pc)',          categoryId: 'starters', price: 699,  available: true, description: '8 pieces crispy wings' },
  { name: 'B.B.Q Wings (4pc)',           categoryId: 'starters', price: 499,  available: true, description: '4 pieces BBQ wings' },
  { name: 'B.B.Q Wings (8pc)',           categoryId: 'starters', price: 799,  available: true, description: '8 pieces BBQ wings' },
  { name: 'Chicken Strips (with Fries)', categoryId: 'starters', price: 499,  available: true, description: 'Crispy chicken strips with fries' },
  { name: 'Chicken Nuggets (with Fries)',categoryId: 'starters', price: 399,  available: true, description: 'Chicken nuggets with fries' },
  { name: 'Loaded Fries (Reg)',          categoryId: 'starters', price: 450,  available: true, description: 'Regular loaded fries' },
  { name: 'Loaded Fries (Large)',        categoryId: 'starters', price: 650,  available: true, description: 'Large loaded fries' },
  { name: 'Plain Fries (Reg)',           categoryId: 'starters', price: 200,  available: true, description: 'Regular plain fries' },
  { name: 'Plain Fries (Large)',         categoryId: 'starters', price: 300,  available: true, description: 'Large plain fries' },

  // ── SANDWICH ──────────────────────────────────────────
  { name: 'Club Sandwich',      categoryId: 'sandwich', price: 599, available: true, description: 'Classic club sandwich' },
  { name: 'Grill Sandwich',     categoryId: 'sandwich', price: 499, available: true, description: 'Grilled chicken sandwich' },
  { name: 'Maxican Sandwich',   categoryId: 'sandwich', price: 750, available: true, description: 'Spicy Mexican style sandwich' },
  { name: 'Euro Sandwich',      categoryId: 'sandwich', price: 750, available: true, description: 'Euro style sandwich' },

  // ── FRIED CHICKEN ─────────────────────────────────────
  { name: 'Fried Chicken 1 Piece', categoryId: 'friedchicken', price: 200,  available: true, description: '1 piece crispy fried chicken' },
  { name: 'Fried Chicken 2 Piece', categoryId: 'friedchicken', price: 499,  available: true, description: '2 pieces crispy fried chicken' },
  { name: 'Fried Chicken 4 Piece', categoryId: 'friedchicken', price: 950,  available: true, description: '4 pieces crispy fried chicken' },
  { name: 'Fried Chicken 8 Piece', categoryId: 'friedchicken', price: 1799, available: true, description: '8 pieces crispy fried chicken' },

  // ── SOUP ──────────────────────────────────────────────
  { name: 'Chicken Corn Soup (Single)', categoryId: 'soup', price: 299, available: true, description: 'Single serving chicken corn soup' },
  { name: 'Chicken Corn Soup (Family)', categoryId: 'soup', price: 550, available: true, description: 'Family serving chicken corn soup' },
  { name: 'Hot & Sour Soup (Single)',   categoryId: 'soup', price: 299, available: true, description: 'Single serving hot & sour soup' },
  { name: 'Hot & Sour Soup (Family)',   categoryId: 'soup', price: 550, available: true, description: 'Family serving hot & sour soup' },
  { name: 'Kruncheez Special Soup (Single)', categoryId: 'soup', price: 399, available: true, description: 'Single serving special soup' },
  { name: 'Kruncheez Special Soup (Family)', categoryId: 'soup', price: 650, available: true, description: 'Family serving special soup' },

  // ── BURGER ────────────────────────────────────────────
  { name: 'Zinger Burger',              categoryId: 'burger', price: 390, available: true, description: 'Crispy spicy zinger burger' },
  { name: 'Zinger Burger with Cheese',  categoryId: 'burger', price: 450, available: true, description: 'Zinger burger with cheese' },
  { name: 'Chicken Patty Burger',       categoryId: 'burger', price: 340, available: true, description: 'Classic chicken patty burger' },
  { name: 'Parmesan Cheese Burger',     categoryId: 'burger', price: 490, available: true, description: 'Parmesan coated cheese burger' },
  { name: 'Grill Burger with Cheese',   categoryId: 'burger', price: 490, available: true, description: 'Grilled chicken burger with cheese' },
  { name: 'Tower Burger with Cheese',   categoryId: 'burger', price: 590, available: true, description: 'Tall tower burger with cheese' },

  // ── WRAP & ROLL ───────────────────────────────────────
  { name: 'Chicken Shawarma',     categoryId: 'wraproll', price: 230, available: true, description: 'Classic chicken shawarma' },
  { name: 'Special Shawarma',     categoryId: 'wraproll', price: 350, available: true, description: 'Special loaded shawarma' },
  { name: 'Classic Chicken Wrap', categoryId: 'wraproll', price: 350, available: true, description: 'Classic chicken wrap' },
  { name: 'Mexican Chicken Wrap', categoryId: 'wraproll', price: 390, available: true, description: 'Spicy Mexican chicken wrap' },
  { name: 'Chicken Paratha Roll', categoryId: 'wraproll', price: 350, available: true, description: 'Chicken paratha roll' },
  { name: 'Zinger Paratha Roll',  categoryId: 'wraproll', price: 390, available: true, description: 'Zinger paratha roll' },
  { name: 'Twister Roll',         categoryId: 'wraproll', price: 390, available: true, description: 'Twisted chicken roll' },
  { name: 'Behari Roll',          categoryId: 'wraproll', price: 390, available: true, description: 'Behari style roll' },
  { name: 'Afghani Special Roll', categoryId: 'wraproll', price: 550, available: true, description: 'Afghani special roll' },

  // ── PIZZA (Regular sizes: S/M/L/XL) ──────────────────
  { name: 'Chicken Tikka B.B.Q (Small)',   categoryId: 'pizza', price: 599,  available: true, description: 'Chicken tikka BBQ pizza small' },
  { name: 'Chicken Tikka B.B.Q (Medium)',  categoryId: 'pizza', price: 1099, available: true, description: 'Chicken tikka BBQ pizza medium' },
  { name: 'Chicken Tikka B.B.Q (Large)',   categoryId: 'pizza', price: 1399, available: true, description: 'Chicken tikka BBQ pizza large' },
  { name: 'Chicken Tikka B.B.Q (XL)',      categoryId: 'pizza', price: 1799, available: true, description: 'Chicken tikka BBQ pizza XL' },

  { name: 'Chicken Fajita (Small)',   categoryId: 'pizza', price: 599,  available: true, description: 'Chicken fajita pizza small' },
  { name: 'Chicken Fajita (Medium)',  categoryId: 'pizza', price: 1099, available: true, description: 'Chicken fajita pizza medium' },
  { name: 'Chicken Fajita (Large)',   categoryId: 'pizza', price: 1399, available: true, description: 'Chicken fajita pizza large' },
  { name: 'Chicken Fajita (XL)',      categoryId: 'pizza', price: 1799, available: true, description: 'Chicken fajita pizza XL' },

  { name: 'Chicken Supreme (Small)',  categoryId: 'pizza', price: 599,  available: true, description: 'Chicken supreme pizza small' },
  { name: 'Chicken Supreme (Medium)', categoryId: 'pizza', price: 1099, available: true, description: 'Chicken supreme pizza medium' },
  { name: 'Chicken Supreme (Large)',  categoryId: 'pizza', price: 1399, available: true, description: 'Chicken supreme pizza large' },
  { name: 'Chicken Supreme (XL)',     categoryId: 'pizza', price: 1799, available: true, description: 'Chicken supreme pizza XL' },

  { name: 'Hot & Spicy (Small)',   categoryId: 'pizza', price: 599,  available: true, description: 'Hot & spicy pizza small' },
  { name: 'Hot & Spicy (Medium)',  categoryId: 'pizza', price: 1099, available: true, description: 'Hot & spicy pizza medium' },
  { name: 'Hot & Spicy (Large)',   categoryId: 'pizza', price: 1399, available: true, description: 'Hot & spicy pizza large' },
  { name: 'Hot & Spicy (XL)',      categoryId: 'pizza', price: 1799, available: true, description: 'Hot & spicy pizza XL' },

  { name: 'Classic Peproni (Small)',  categoryId: 'pizza', price: 599,  available: true, description: 'Classic peproni pizza small' },
  { name: 'Classic Peproni (Medium)', categoryId: 'pizza', price: 1099, available: true, description: 'Classic peproni pizza medium' },
  { name: 'Classic Peproni (Large)',  categoryId: 'pizza', price: 1399, available: true, description: 'Classic peproni pizza large' },
  { name: 'Classic Peproni (XL)',     categoryId: 'pizza', price: 1799, available: true, description: 'Classic peproni pizza XL' },

  { name: 'Creamy Milt (Small)',   categoryId: 'pizza', price: 699,  available: true, description: 'Creamy milt pizza small' },
  { name: 'Creamy Milt (Medium)',  categoryId: 'pizza', price: 1199, available: true, description: 'Creamy milt pizza medium' },
  { name: 'Creamy Milt (Large)',   categoryId: 'pizza', price: 1499, available: true, description: 'Creamy milt pizza large' },
  { name: 'Creamy Milt (XL)',      categoryId: 'pizza', price: 1899, available: true, description: 'Creamy milt pizza XL' },

  // ── STUFF PIZZA ───────────────────────────────────────
  { name: 'Cheesy Stuff Crust (Medium)',  categoryId: 'stuffpizza', price: 1299, available: true, description: 'Cheesy stuff crust pizza medium' },
  { name: 'Cheesy Stuff Crust (Large)',   categoryId: 'stuffpizza', price: 1550, available: true, description: 'Cheesy stuff crust pizza large' },
  { name: 'Cheesy Stuff Crust (XL)',      categoryId: 'stuffpizza', price: 1950, available: true, description: 'Cheesy stuff crust pizza XL' },

  { name: 'Chicken Stuff Crust (Medium)', categoryId: 'stuffpizza', price: 1299, available: true, description: 'Chicken stuff crust pizza medium' },
  { name: 'Chicken Stuff Crust (Large)',  categoryId: 'stuffpizza', price: 1550, available: true, description: 'Chicken stuff crust pizza large' },
  { name: 'Chicken Stuff Crust (XL)',     categoryId: 'stuffpizza', price: 1950, available: true, description: 'Chicken stuff crust pizza XL' },

  { name: 'Crown Crust (Medium)', categoryId: 'stuffpizza', price: 1299, available: true, description: 'Crown crust pizza medium' },
  { name: 'Crown Crust (Large)',  categoryId: 'stuffpizza', price: 1550, available: true, description: 'Crown crust pizza large' },
  { name: 'Crown Crust (XL)',     categoryId: 'stuffpizza', price: 1950, available: true, description: 'Crown crust pizza XL' },

  { name: 'Kabab Crust (Medium)', categoryId: 'stuffpizza', price: 1299, available: true, description: 'Kabab crust pizza medium' },
  { name: 'Kabab Crust (Large)',  categoryId: 'stuffpizza', price: 1550, available: true, description: 'Kabab crust pizza large' },
  { name: 'Kabab Crust (XL)',     categoryId: 'stuffpizza', price: 1950, available: true, description: 'Kabab crust pizza XL' },

  { name: 'Double Stuff (Medium)', categoryId: 'stuffpizza', price: 1299, available: true, description: 'Double stuff pizza medium' },
  { name: 'Double Stuff (Large)',  categoryId: 'stuffpizza', price: 1550, available: true, description: 'Double stuff pizza large' },
  { name: 'Double Stuff (XL)',     categoryId: 'stuffpizza', price: 1950, available: true, description: 'Double stuff pizza XL' },

  // ── TOP TRENDING PIZZA ────────────────────────────────
  { name: 'Meat Feast (Medium)',       categoryId: 'trendpizza', price: 1350, available: true, description: 'Meat feast pizza medium' },
  { name: 'Meat Feast (Large)',        categoryId: 'trendpizza', price: 1650, available: true, description: 'Meat feast pizza large' },
  { name: 'Meat Feast (XL)',           categoryId: 'trendpizza', price: 2099, available: true, description: 'Meat feast pizza XL' },

  { name: 'Asian Style (Medium)',      categoryId: 'trendpizza', price: 1350, available: true, description: 'Asian style pizza medium' },
  { name: 'Asian Style (Large)',       categoryId: 'trendpizza', price: 1650, available: true, description: 'Asian style pizza large' },
  { name: 'Asian Style (XL)',          categoryId: 'trendpizza', price: 2099, available: true, description: 'Asian style pizza XL' },

  { name: 'Kruncheez Special (Medium)',categoryId: 'trendpizza', price: 1350, available: true, description: 'Kruncheez special pizza medium' },
  { name: 'Kruncheez Special (Large)', categoryId: 'trendpizza', price: 1650, available: true, description: 'Kruncheez special pizza large' },
  { name: 'Kruncheez Special (XL)',    categoryId: 'trendpizza', price: 2099, available: true, description: 'Kruncheez special pizza XL' },

  { name: '4 Season (Medium)',         categoryId: 'trendpizza', price: 1350, available: true, description: '4 season pizza medium' },
  { name: '4 Season (Large)',          categoryId: 'trendpizza', price: 1650, available: true, description: '4 season pizza large' },
  { name: '4 Season (XL)',             categoryId: 'trendpizza', price: 2099, available: true, description: '4 season pizza XL' },

  { name: 'Kebab Della (Medium)',      categoryId: 'trendpizza', price: 1350, available: true, description: 'Kebab della pizza medium' },
  { name: 'Kebab Della (Large)',       categoryId: 'trendpizza', price: 1650, available: true, description: 'Kebab della pizza large' },
  { name: 'Kebab Della (XL)',          categoryId: 'trendpizza', price: 2099, available: true, description: 'Kebab della pizza XL' },

  // Pizza Extras
  { name: 'Extra Topping (Small)',  categoryId: 'pizza', price: 100, available: true, description: 'Extra topping small pizza' },
  { name: 'Extra Topping (Medium)', categoryId: 'pizza', price: 150, available: true, description: 'Extra topping medium pizza' },
  { name: 'Extra Topping (Large)',  categoryId: 'pizza', price: 250, available: true, description: 'Extra topping large pizza' },
  { name: 'Extra Topping (XL)',     categoryId: 'pizza', price: 300, available: true, description: 'Extra topping XL pizza' },
  { name: 'Dip Sauce',              categoryId: 'pizza', price: 100, available: true, description: 'Dip sauce' },

  // ── CHINESE ───────────────────────────────────────────
  { name: 'Chicken Chowmein',    categoryId: 'chinese', price: 590, available: true, description: 'Stir fried chicken noodles' },
  { name: 'Vegetable Chowmein',  categoryId: 'chinese', price: 490, available: true, description: 'Stir fried vegetable noodles' },
  { name: 'Special Chowmein',    categoryId: 'chinese', price: 690, available: true, description: 'Special mix chowmein' },
  { name: 'Egg Fried Rice',      categoryId: 'chinese', price: 490, available: true, description: 'Classic egg fried rice' },
  { name: 'Special Fried Rice',  categoryId: 'chinese', price: 590, available: true, description: 'Special wok fried rice' },

  // ── PASTA ─────────────────────────────────────────────
  { name: 'Fettucine Alfredo Pasta', categoryId: 'pasta', price: 690, available: true, description: 'Creamy alfredo pasta' },
  { name: 'Oven Baked Pasta',        categoryId: 'pasta', price: 850, available: true, description: 'Baked pasta with cheese' },
  { name: 'Chicken Lasagne (Reg)',   categoryId: 'pasta', price: 590, available: true, description: 'Regular chicken lasagne' },
  { name: 'Chicken Lasagne (Large)', categoryId: 'pasta', price: 890, available: true, description: 'Large chicken lasagne' },

  // ── B.B.Q ─────────────────────────────────────────────
  { name: '1 Chicken Piece',      categoryId: 'bbq', price: 350,  available: true, description: '1 piece BBQ chicken' },
  { name: 'Chicken Boti Plate',   categoryId: 'bbq', price: 490,  available: true, description: 'Chicken boti plate' },
  { name: 'Malai Boti Plate',     categoryId: 'bbq', price: 550,  available: true, description: 'Malai boti plate' },
  { name: 'Achari Boti',          categoryId: 'bbq', price: 490,  available: true, description: 'Achari marinated boti' },
  { name: 'Beef Tikka Plate',     categoryId: 'bbq', price: 650,  available: true, description: 'Beef tikka plate' },
  { name: 'Beef Kabab Plate',     categoryId: 'bbq', price: 600,  available: true, description: 'Beef kabab plate' },
  { name: 'Reshmi Kabab Plate',   categoryId: 'bbq', price: 550,  available: true, description: 'Reshmi kabab plate' },
  { name: 'Karachi Angara (Spicy)',categoryId: 'bbq', price: 1500, available: true, description: 'Spicy Karachi angara' },
  { name: 'White Chicken Angara', categoryId: 'bbq', price: 1600, available: true, description: 'White chicken angara' },
  { name: 'Bater (1 Piece)',      categoryId: 'bbq', price: 150,  available: true, description: '1 piece bater' },
  { name: 'Grill Fish',           categoryId: 'bbq', price: 950,  available: true, description: 'Grilled fish' },
  { name: 'Kabli Pulao',          categoryId: 'bbq', price: 600,  available: true, description: 'Kabli pulao' },
  { name: 'Raita',                categoryId: 'bbq', price: 100,  available: true, description: 'Fresh raita' },
  { name: 'Salad',                categoryId: 'bbq', price: 100,  available: true, description: 'Fresh salad' },

  // ── PLATTER ───────────────────────────────────────────
  { name: 'Platter 1 Person',  categoryId: 'platter', price: 600,  available: true,
    description: 'Chicken Boti Piece + Malai Boti Piece + Reshmi Kabab Piece + Pulao + Raita + Salad + Regular Drink' },
  { name: 'Platter 2 Person',  categoryId: 'platter', price: 1190, available: true,
    description: '1 Chicken Piece + 2 Piece Malai Boti + 1 Beef Kabab + 1 Reshmi Kabab + Pulao + Raita + Salad + 1 Ltr Drink' },
  { name: 'Platter 4 Person',  categoryId: 'platter', price: 4000, available: true,
    description: 'Half Angara + 4 Piece Malai Boti + Beef Tikka Half Plate + Beef Kabab Half Plate + Reshmi Kabab Half Plate + Bater 4 Piece + Finger Fish + Pulao + Raita + Salad + 1 Ltr Drink' },
  { name: 'Platter 8 Person',  categoryId: 'platter', price: 6500, available: true,
    description: 'Full Angara + Malai Boti Plate + Beef Tikka Plate + Reshmi Kabab Plate + Beef Kabab Plate + Finger Fish + Bater 6 Piece + Pulao + Salad + Raita + 1.5 Ltr Drink' },

  // ── DEALS ─────────────────────────────────────────────
  { name: 'Deal 1',  categoryId: 'deals', price: 590,  available: true,
    description: 'Zinger Burger + Regular Fries + Regular Drink' },
  { name: 'Deal 2',  categoryId: 'deals', price: 1190, available: true,
    description: 'Small Pizza + 5 Hot Wings + Regular Fries + Sting' },
  { name: 'Deal 3',  categoryId: 'deals', price: 1350, available: true,
    description: 'Classic Chicken Wrap + Chicken Paratha Roll + 10 Hot Wings + 1 Ltr Drink' },
  { name: 'Deal 4',  categoryId: 'deals', price: 1720, available: true,
    description: '2 Zinger Burger + 2 Chicken Shawarma + 2 Chicken Piece + 1 Ltr Drink' },
  { name: 'Deal 5',  categoryId: 'deals', price: 2450, available: true,
    description: 'Medium Pizza + 2 Zinger Burger + 10 Hot Wings + 1.5 Ltr Drink' },
  { name: 'Deal 6',  categoryId: 'deals', price: 2650, available: true,
    description: '1 Large Pizza + 4 Chicken Piece + 4 Chicken Strip + 1.5 Ltr Drink' },
  { name: 'Deal 7',  categoryId: 'deals', price: 3300, available: true,
    description: '4 Zinger Burger + 1 Loaded Fries + 10 Hot Wings + Classic Wrap + Zinger Paratha Roll + 1.5 Ltr Drink' },
  { name: 'Deal 8',  categoryId: 'deals', price: 1650, available: true,
    description: '3 Small Pizza + 1 Ltr Drink' },
  { name: 'Deal 9',  categoryId: 'deals', price: 2950, available: true,
    description: '3 Medium Pizza + 1.5 Ltr Drink' },
  { name: 'Deal 10', categoryId: 'deals', price: 3800, available: true,
    description: '3 Large Pizza + 1.5 Ltr Drink' },

  // ── DRINKS ────────────────────────────────────────────
  { name: 'Regular Drink',     categoryId: 'drinks', price: 80,  available: true, description: 'Regular cold drink' },
  { name: 'Sting',             categoryId: 'drinks', price: 120, available: true, description: 'Sting energy drink' },
  { name: '1 Ltr Drink',       categoryId: 'drinks', price: 180, available: true, description: '1 litre cold drink' },
  { name: '1.5 Ltr Drink',     categoryId: 'drinks', price: 220, available: true, description: '1.5 litre cold drink' },
  { name: 'Mineral Water',     categoryId: 'drinks', price: 60,  available: true, description: 'Mineral water bottle' },
]

export const tablesData = Array.from({ length: 20 }, (_, i) => ({
  number:         i + 1,
  capacity:       i < 10 ? 4 : i < 16 ? 6 : 8,
  status:         'available',
  floor:          i < 10 ? 'Ground Floor' : 'First Floor',
  currentOrderId: null,
}))

export const staffRoles = [
  { id: 'admin',   name: 'Admin',   permissions: ['all'] },
  { id: 'manager', name: 'Manager', permissions: ['dashboard','orders','menu','tables','inventory','reports','employees','customers','expenses'] },
  { id: 'cashier', name: 'Cashier', permissions: ['orders','tables','customers','billing'] },
  { id: 'waiter',  name: 'Waiter',  permissions: ['orders','tables'] },
  { id: 'kitchen', name: 'Kitchen', permissions: ['kitchen'] },
]

export const expenseCategories = [
  'Rent', 'Utilities', 'Salaries', 'Raw Material',
  'Maintenance', 'Marketing', 'Packaging', 'Miscellaneous'
]
