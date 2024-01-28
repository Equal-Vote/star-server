import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('electionDB')
        .addColumn('claim_key_hash','varchar')
        .addColumn('is_public', 'boolean')
        .addColumn('create_date', 'varchar')
        .execute()

    await db.updateTable('electionDB')
        .set({create_date: new Date().toISOString()})
        .execute()

    await db.schema.alterTable('electionDB')
        .alterColumn('create_date',(col) => col.setNotNull())
        .execute()

    await db.schema.alterTable('electionRollDB')
        .dropColumn('ip_address')
        .addColumn('ip_hash','varchar')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('electionDB')
        .dropColumn('claim_key_hash')
        .dropColumn('is_public')
        .dropColumn('create_date')
        .execute()

    await db.schema.alterTable('electionRollDB')
        .dropColumn('ip_hash')
        .addColumn('ip_address','varchar')
        .execute()
  }