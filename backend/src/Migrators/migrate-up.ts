import { createMigrator, handleMigration } from "./migration-utils"

async function migrateToLatest() {
    const { migrator, db } = createMigrator()
    handleMigration(await migrator.migrateUp())
  
    await db.destroy()
  }
  
  migrateToLatest()