// This is a migration script for adding currency field to User model
// Run this with: npx prisma migrate dev --name add_currency_field

/**
 * Migration steps:
 * 1. Add currency field to User model with default value 'EUR'
 * 2. Run prisma migrate dev
 * 3. Update any code that uses User model to include currency field
 */

console.log("Migration script for adding currency field to User model");
console.log("Run this with: npx prisma migrate dev --name add_currency_field"); 