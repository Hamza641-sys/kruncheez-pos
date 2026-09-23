// ── Auto Inventory Deduct ─────────────────────────────────
// Called after every order placement
// Maps menu item categories to inventory ingredients
// ─────────────────────────────────────────────────────────
import { getCollection, updateDocument } from '../firebase/firestore'
import { where } from '../firebase/firestore'

// Category → ingredient mapping (per item unit)
const INGREDIENT_MAP = {
  burger:      [{ name: 'Chicken Breast', qty: 0.15, unit: 'kg' }, { name: 'Burger Bun', qty: 1, unit: 'pcs' }],
  pizza:       [{ name: 'Flour Dough',    qty: 0.25, unit: 'kg' }, { name: 'Cheese',     qty: 0.08, unit: 'kg' }],
  friedchicken:[{ name: 'Chicken Piece',  qty: 1,    unit: 'pcs' }],
  sandwich:    [{ name: 'Chicken Breast', qty: 0.12, unit: 'kg' }, { name: 'Bread',      qty: 2,    unit: 'pcs' }],
  wraproll:    [{ name: 'Chicken Breast', qty: 0.12, unit: 'kg' }, { name: 'Wrap Sheet', qty: 1,    unit: 'pcs' }],
  chinese:     [{ name: 'Noodles',        qty: 0.1,  unit: 'kg' }, { name: 'Vegetables', qty: 0.05, unit: 'kg' }],
  pasta:       [{ name: 'Pasta',          qty: 0.1,  unit: 'kg' }, { name: 'Cream',      qty: 0.05, unit: 'L'  }],
  starters:    [{ name: 'Vegetables',     qty: 0.05, unit: 'kg' }],
  soup:        [{ name: 'Chicken Stock',  qty: 0.2,  unit: 'L'  }],
  drinks:      [{ name: 'Mineral Water',  qty: 1,    unit: 'pcs' }],
}

export async function deductInventoryForOrder(orderItems) {
  try {
    // Get all inventory items
    const inventory = await getCollection('inventory')
    const inventoryMap = {}
    inventory.forEach(item => { inventoryMap[item.name] = item })

    // Calculate total deductions
    const deductions = {}
    orderItems.forEach(orderItem => {
      const ingredients = INGREDIENT_MAP[orderItem.categoryId] || []
      ingredients.forEach(ing => {
        const key = ing.name
        if (!deductions[key]) deductions[key] = 0
        deductions[key] += ing.qty * orderItem.qty
      })
    })

    // Apply deductions
    const updates = []
    for (const [name, qty] of Object.entries(deductions)) {
      const invItem = inventoryMap[name]
      if (invItem) {
        const newQty = Math.max(0, (invItem.quantity || 0) - qty)
        updates.push(updateDocument('inventory', invItem.id, { quantity: newQty }))
      }
    }
    await Promise.all(updates)
  } catch (err) {
    console.warn('Inventory deduct failed:', err.message)
    // Non-critical — don't throw
  }
}
