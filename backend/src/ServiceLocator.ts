import Logger from "./Services/Logging/Logger";
import BallotsDB from "./Models/Ballots";
import ElectionsDB from "./Models/Elections";
import ElectionRollDB from "./Models/ElectionRolls";
import CastVoteStore from "./Models/CastVoteStore";
import EmailService from "./Services/Email/EmailService";
import { IBallotStore } from "./Models/IBallotStore";
import AccountService from "./Services/Account/AccountService"
const { Pool } = require('pg');

var _postgresClient:any;
var _appInitContext = Logger.createContext("appInit");
var _ballotsDb:IBallotStore;
var _electionsDb:ElectionsDB;
var _electionRollDb:ElectionRollDB;
var _castVoteStore:CastVoteStore;
var _emailService:EmailService;
var _accountService:AccountService;

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

function ballotsDb():IBallotStore {
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


function emailService():EmailService {
    if (_emailService == null){
        _emailService = new EmailService();
    }
    return _emailService;
}

function accountService():AccountService {
    if (_accountService == null){
        _accountService = new AccountService();
    }
    return _accountService;
}

export  default { ballotsDb, electionsDb, electionRollDb, emailService, accountService, castVoteStore};