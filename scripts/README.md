# Migration and Maintenance Scripts

This folder contains important scripts for migration and maintenance of MoneyMind.

## 📁 Available Scripts

### `migrate-existing-transactions.js`

**Purpose:** Migrates existing transactions to the new category system.

```bash
# Analysis (without modifying data)
node scripts/migrate-existing-transactions.js

# Execute migration
node scripts/migrate-existing-transactions.js --execute
```

**What it does:**

- Analyzes transactions without `categoryId`
- Maps to default categories when possible
- Creates custom categories for unique names
- Automatic linking of transactions to categories

---

### `fix-category-ownership.js`

**Purpose:** Fixes ownership of orphaned custom categories.

```bash
# Analysis (without modifying data)
node scripts/fix-category-ownership.js

# Execute correction
node scripts/fix-category-ownership.js --execute
```

**What it does:**

- Identifies categories without owner (`userId: null`)
- Analyzes transaction history by user
- Assigns categories to correct users
- Removes orphaned duplicates without usage

---

### `verify-production.js`

**Purpose:** Verifies system integrity in production.

```bash
node scripts/verify-production.js
```

**What it verifies:**

- Count of users, transactions and categories
- Available default categories
- Orphaned transactions (without linked category)
- Overall system integrity

## 🔧 Prerequisites

1. **Prisma configured** with `DATABASE_URL` in `.env`
2. **Node.js** and dependencies installed
3. **Database access** (appropriate Neon branch)

## ⚠️ Important Warnings

- **Always** execute first without `--execute` for analysis
- **Make backup** before executing in production
- **Test** in development environment first
- Scripts are **idempotent** (safe for re-execution)

## 🗂️ Execution Order (New Setup)

1. `npx prisma db seed` - Create default categories
2. `migrate-existing-transactions.js --execute` - Migrate transactions
3. `fix-category-ownership.js --execute` - Fix ownership
4. `verify-production.js` - Verify result

## 📚 Historical Context

These scripts were created during the implementation of the hybrid category system (default + custom) in MoneyMind, migrating from a free-text category system to a structured system with database relations.
