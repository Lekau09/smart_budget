/**
 * confirmMLCategory.js
 * Call this from your CategoryPickerModal AFTER update-expense.php succeeds.
 * Tells the ML about the user's choice so it learns instantly.
 *
 * Usage:
 *   import confirmMLCategory from '../../utils/confirmMLCategory';
 *   await confirmMLCategory(item.description, selectedCategory, item.amount);
 */

const ML_API = 'http://localhost:5000';

export default async function confirmMLCategory(storeName, category, amount = 0) {
  try {
    const res = await fetch(`${ML_API}/confirm_category`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store:    storeName,   // e.g. "Kaycees"
        category: category,   // e.g. "Entertainment"
        amount:   amount,
      }),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`ML learned: "${storeName}" → ${category} (${data.memory_size} stores known)`);
      if (data.retrain_triggered) {
        console.log('ML background retrain triggered!');
      }
    }
  } catch (e) {
    // Non-critical — expense is already saved even if ML call fails
    console.warn('ML confirm failed (non-critical):', e.message);
  }
}