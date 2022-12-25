import {
    ElectionRoll,
    ElectionRollAction,
} from "../../../domain_model/ElectionRoll";
import { ILoggingContext } from "../Services/Logging/ILogger";
import Logger from "../Services/Logging/Logger";
import { IElectionRollStore } from "./IElectionRollStore";
import ModelUtils from "./ModelUtils";
var format = require("pg-format");

export default class ElectionRollDB implements IElectionRollStore {
    _postgresClient;
    _tableName: string;

    constructor(postgresClient: any) {
        this._postgresClient = postgresClient;
        this._tableName = "electionrolldb";
        this.init();
    }

    async init(): Promise<ElectionRollDB> {
        var appInitContext = Logger.createContext("appInit");
        Logger.debug(appInitContext, "-> ElectionRollDB.init");
        //await this.dropTable(appInitContext);
        var createQuery = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            voter_id        VARCHAR NOT NULL PRIMARY KEY,
            election_id     VARCHAR NOT NULL,
            email           VARCHAR,
            submitted       BOOLEAN NOT NULL,
            ballot_id       VARCHAR,
            ip_address      VARCHAR,
            address         VARCHAR,
            state           VARCHAR NOT NULL,
            history         json,
            registration    json,
            precinct        VARCHAR
          );
        `;
        Logger.debug(appInitContext, createQuery);
        var p = this._postgresClient.query(createQuery);
        return p
            .then((_: any) => {
                //This will add the new field to the live DB in prod.  Once that's done we can remove this
                var historyQuery = `
            ALTER TABLE ${this._tableName} ADD COLUMN IF NOT EXISTS precinct VARCHAR
            `;
                return this._postgresClient
                    .query(historyQuery)
                    .catch((err: any) => {
                        console.log(
                            "err adding precinct column to DB: " + err.message
                        );
                        return err;
                    });
            })
            .then((_: any) => {
                return ModelUtils.assertTableCorrect(
                    this._postgresClient,
                    this._tableName,
                    createQuery
                );
            });
    }

    async dropTable(ctx: ILoggingContext): Promise<void> {
        var query = `DROP TABLE IF EXISTS ${this._tableName};`;
        var p = this._postgresClient.query({
            text: query,
        });
        return p.then((_: any) => {
            Logger.debug(ctx, `Dropped it (like its hot)`);
        });
    }

    submitElectionRoll(
        electionRolls: ElectionRoll[],
        ctx: ILoggingContext,
        reason: string
    ): Promise<boolean> {
        Logger.debug(ctx, `ElectionRollDB.submit`);
        var values = electionRolls.map((electionRoll) => [
            electionRoll.voter_id,
            electionRoll.election_id,
            electionRoll.email,
            electionRoll.ip_address,
            electionRoll.submitted,
            electionRoll.state,
            JSON.stringify(electionRoll.history),
            JSON.stringify(electionRoll.registration),
            electionRoll.precinct,
        ]);
        var sqlString = format(
            `INSERT INTO ${this._tableName} (voter_id,election_id,email,ip_address,submitted,state,history,registration,precinct)
        VALUES %L;`,
            values
        );
        Logger.debug(ctx, sqlString);
        Logger.debug(ctx, values);
        var p = this._postgresClient.query(sqlString);
        return p
            .then((res: any) => {
                Logger.state(ctx, `Submit Election Roll: `, {
                    reason: reason,
                    electionRoll: electionRolls,
                });
                return true;
            })
            .catch((err: any) => {
                Logger.error(
                    ctx,
                    `Error with postgres submitElectionRoll:  ${err.message}`
                );
            });
    }

    getRollsByElectionID(
        election_id: string,
        ctx: ILoggingContext
    ): Promise<ElectionRoll[] | null> {
        Logger.debug(ctx, `ElectionRollDB.getByElectionID`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id],
        });
        return p.then((response: any) => {
            const resRolls = response.rows;
            Logger.debug(ctx, "", resRolls);
            if (resRolls.length == 0) {
                Logger.debug(ctx, ".get null");
                return [];
            }
            return resRolls;
        });
    }

    getByVoterID(
        election_id: string,
        voter_id: string,
        ctx: ILoggingContext
    ): Promise<ElectionRoll | null> {
        Logger.debug(
            ctx,
            `ElectionRollDB.getByVoterID election:${election_id}, voter:${voter_id}`
        );
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND voter_id = $2`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id, voter_id],
        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, rows[0]);
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return null;
            }
            return rows[0];
        });
    }

    getElectionRoll(
        election_id: string,
        voter_id: string | null,
        email: string | null,
        ip_address: string | null,
        ctx: ILoggingContext
    ): Promise<[ElectionRoll] | null> {
        Logger.debug(
            ctx,
            `ElectionRollDB.get election:${election_id}, voter:${voter_id}`
        );
        let sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1 AND ( `;
        let values = [election_id];
        if (voter_id) {
            values.push(voter_id);
            sqlString += `voter_id = $${values.length}`;
        }
        if (email) {
            if (voter_id) {
                sqlString += " OR ";
            }
            values.push(email);
            sqlString += `email = $${values.length}`;
        }
        if (ip_address) {
            if (voter_id || email) {
                sqlString += " OR ";
            }
            values.push(ip_address);
            sqlString += `ip_address = $${values.length}`;
        }
        sqlString += ")";
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: values,
        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, rows[0]);
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return null;
            }
            return rows;
        });
    }

    update(
        election_roll: ElectionRoll,
        ctx: ILoggingContext,
        reason: string
    ): Promise<ElectionRoll | null> {
        Logger.debug(ctx, `ElectionRollDB.updateRoll`);
        var sqlString = `UPDATE ${this._tableName} SET ballot_id=$1, submitted=$2, state=$3, history=$4, registration=$5 WHERE election_id = $6 AND voter_id=$7`;
        Logger.debug(ctx, sqlString);
        Logger.debug(ctx, "", election_roll);
        var p = this._postgresClient.query({
            text: sqlString,

            values: [
                election_roll.ballot_id,
                election_roll.submitted,
                election_roll.state,
                JSON.stringify(election_roll.history),
                JSON.stringify(election_roll.registration),
                election_roll.election_id,
                election_roll.voter_id,
            ],
        });
        return p.then((response: any) => {
            var rows = response.rows;
            Logger.debug(ctx, "", response);
            if (rows.length == 0) {
                Logger.debug(ctx, ".get null");
                return [] as ElectionRoll[];
            }
            const newElectionRoll = rows;
            Logger.state(ctx, `Update Election Roll: `, {
                reason: reason,
                electionRoll: newElectionRoll,
            });
            return newElectionRoll;
        });
    }

    delete(
        election_roll: ElectionRoll,
        ctx: ILoggingContext,
        reason: string
    ): Promise<boolean> {
        Logger.debug(ctx, `ElectionRollDB.delete`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1 AND voter_id=$2`;
        Logger.debug(ctx, sqlString);

        var p = this._postgresClient.query({
            rowMode: "array",
            text: sqlString,
            values: [election_roll.election_id, election_roll.voter_id],
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                Logger.state(ctx, `Delete ElectionRoll`, {
                    reason: reason,
                    electionId: election_roll.election_id,
                });
                return true;
            }
            return false;
        });
    }
}
