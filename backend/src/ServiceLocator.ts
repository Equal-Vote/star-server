import Logger from "./Services/Logging/Logger";
import BallotsDB from "./Models/Ballots";
import ElectionsDB from "./Models/Elections";
import ElectionRollDB from "./Models/ElectionRolls";
import CastVoteStore from "./Models/CastVoteStore";

const { Pool } = require('pg');

var _postgresClient:any;
var _appInitContext = Logger.createContext("appInit");
var _ballotsDb:BallotsDB;
var _electionsDb:ElectionsDB;
var _electionRollDb:ElectionRollDB;
var _castVoteStore:CastVoteStore;

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

function ballotsDb():BallotsDB {
    if (_ballotsDb == null){
        _ballotsDb = new BallotsDB(postgres());
    }
    return _ballotsDb;
}

function electionsDb():ElectionsDB {
    if (_electionsDb == null){
        _electionsDb = new ElectionsDB(postgres());
    }
    return _electionsDb;
}

function electionRollDb():ElectionRollDB {
    if (_electionRollDb == null){
        _electionRollDb = new ElectionRollDB(postgres());
    }
    return _electionRollDb;
}

function castVoteStore():CastVoteStore {
    if (_castVoteStore == null){
        _castVoteStore = new CastVoteStore(postgres());
    }
    return _castVoteStore;
}


export  default { postgres, ballotsDb, electionsDb, electionRollDb, castVoteStore };