import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('electiondb')
    .addColumn('election_id', 'varchar', (col) => col.primaryKey())
    .addColumn('title', 'varchar')
    .addColumn('description', 'text')
    .addColumn('frontend_url', 'varchar')
    .addColumn('start_time', 'varchar')
    .addColumn('end_time', 'varchar')
    .addColumn('support_email', 'varchar')
    .addColumn('owner_id', 'varchar')
    .addColumn('audit_ids', 'json')
    .addColumn('admin_ids', 'json')
    .addColumn('credential_ids', 'json')
    .addColumn('state', 'varchar')
    .addColumn('races', 'json', (col) => col.notNull())
    .addColumn('settings', 'json')
    .addColumn('auth_key', 'varchar')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('electiondb').execute()
  await db.schema.dropTable('person').execute()
}

