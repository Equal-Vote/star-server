import { Election } from '../../../domain_model/Election';

class ElectionsDB {

    _postgresClient;
    _tableName: string;

    constructor(client: any, tableName: string) {
        this._postgresClient = client;
        this._tableName = tableName;
    }

    init(): Promise<ElectionsDB> {
        console.log("ElectionsDB.init");
        var query = `
        CREATE TABLE IF NOT EXISTS ${this._tableName} (
            election_id  SERIAL PRIMARY KEY,
            title       VARCHAR,
            description TEXT,
            frontend_url VARCHAR,
            start_time    VARCHAR, 
            end_time      VARCHAR, 
            support_email VARCHAR,
            owner_id      VARCHAR,
            audit_id      VARCHAR,
            admin_id      VARCHAR,
            state         VARCHAR,
            races         json NOT NULL,
            settings      json
          );
        `;
        console.log(query);
        var p = this._postgresClient.query(query);
        return p.then((_: any) => {
            return this;
        });
    }

    createElection(election: Election): Promise<string> {
        console.log(`ElectionDB.create`);
        var sqlString = `INSERT INTO ${this._tableName} (title,description,frontend_url,start_time,end_time,support_email,owner_id,audit_id,admin_id,state,races,settings)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`;

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election.title,
                election.description,
                election.frontend_url,
                election.start_time,
                election.end_time,
                election.support_email,
                election.owner_id,
                election.audit_id,
                election.admin_id,
                election.state,
                JSON.stringify(election.races),
                JSON.stringify(election.settings)]
        });

        return p.then((res: any) => {
            console.log("set response rows: " + JSON.stringify(res));
            return election;
        });
    }

    getElections(filter: string): Promise<Election[] | null> {
        // When I filter in trello it adds "filter=member:arendpetercastelein,overdue:true" to the URL, I'm following the same pattern here

        console.log(`ElectionDB.getAll`);
        var sqlString = `SELECT * FROM ${this._tableName}`;
        if(filter != ""){
            var filters = filter.split(',');
            if(filters.length > 0){
                sqlString = `${sqlString} WHERE`
            }
            for(var i = 0; i < filters.length; i++){
                var [key, value] = filters[i].split(':');
                sqlString = `${sqlString} ${key}='${value}'`
            }
        }
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: []
        });
        return p.then((response: any) => {
            var rows = response.rows;
            console.log(rows[0])
            if (rows.length == 0) {
                console.log(".get null");
                return [] as Election[];
            }
            return rows
        });
    }

    getElectionByID(election_id: string): Promise<string | null> {
        console.log(`ElectionDB.get ${election_id}`);
        var sqlString = `SELECT * FROM ${this._tableName} WHERE election_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            var rows = response.rows;
            if (rows.length == 0) {
                console.log(".get null");
                return null;
            }
            return  rows[0] as Election;
        });
    }

    delete(election_id: string): Promise<boolean> {
        console.log(`DemoPGStore.delete ${election_id}`);
        var sqlString = `DELETE FROM ${this._tableName} WHERE election_id = $1`;
        console.log(sqlString);

        var p = this._postgresClient.query({
            rowMode: 'array',
            text: sqlString,
            values: [election_id]
        });
        return p.then((response: any) => {
            if (response.rowCount == 1) {
                return true;
            }
            return false;
        });
    }
}

module.exports = ElectionsDB