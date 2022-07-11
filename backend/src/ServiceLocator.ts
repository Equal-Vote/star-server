import Logger from "./Services/Logging/Logger";

const { Pool } = require('pg');

var _postgresClient:any;
var _appInitContext = Logger.createContext("appInit");

function postgres():any {
    if (_postgresClient == null){
        var connectionStr = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';
        var devDB = process.env.DEV_DATABASE;
        Logger.debug(_appInitContext, `Postgres Config:  dev_db == ${devDB}, connectionString == ${connectionStr}`);
        if (devDB === 'TRUE') {
            _postgresClient = new Pool({
                connectionString: connectionStr,
                ssl: {
                    rejectUnauthorized: false
                }
            });
        } else {
            _postgresClient = new Pool({
                connectionString: connectionStr,
                ssl: false
            });
        }
    }
    return _postgresClient;
}

export  default { postgres };