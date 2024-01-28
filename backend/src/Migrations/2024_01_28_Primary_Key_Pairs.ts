import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('electionRollDB')
        .dropConstraint('electionRollDB_pkey')
        .execute()

    await db.schema.alterTable('electionRollDB')
        .addPrimaryKeyConstraint('electionRollDB_pkey',['election_id','voter_id'])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('electionRollDB')
        .dropConstraint('electionRollDB_pkey')
        .execute()

    await db.schema.alterTable('electionRollDB')

        // .addPrimaryKeyConstraint('electionRollDB_pkey',['voter_id'])
        // .execute()
}