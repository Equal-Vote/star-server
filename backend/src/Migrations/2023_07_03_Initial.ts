import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('electionDB')
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

  await db.schema
    .createTable('electionRollDB')
    .addColumn('voter_id', 'varchar', (col) => col.primaryKey().notNull())
    .addColumn('election_id', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar')
    .addColumn('submitted', 'boolean', (col) => col.notNull())
    .addColumn('ballot_id', 'varchar')
    .addColumn('ip_address', 'varchar')
    .addColumn('address', 'varchar')
    .addColumn('state', 'varchar', (col) => col.notNull())
    .addColumn('history', 'json')
    .addColumn('registration', 'json')
    .addColumn('precinct', 'varchar')
    .addColumn('email_data', 'json')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('electiondb').execute()
  await db.schema.dropTable('electionRollDB').execute()
}

