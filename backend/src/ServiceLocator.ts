import Logger from "./Services/Logging/Logger";
import BallotsDB from "./Models/Ballots";
import ElectionsDB from "./Models/Elections";
import ElectionRollDB from "./Models/ElectionRolls";
import CastVoteStore from "./Models/CastVoteStore";
import EmailService from "./Services/Email/EmailService";
import MockEmailService from "./Services/Email/__mocks__/MockEmailService";
import { IBallotStore } from "./Models/IBallotStore";
import { IEventQueue } from "./Services/EventQueue/IEventQueue";
import PGBossEventQueue from "./Services/EventQueue/PGBossEventQueue";

import AccountService from "./Services/Account/AccountService"
import GlobalData from "./Services/GlobalData";
import { IEmailService } from "./Services/Email/IEmailService";
const { Pool } = require('pg');

var _postgresClient:any;
var _appInitContext = Logger.createContext("appInit");
var _ballotsDb:IBallotStore;
var _electionsDb:ElectionsDB;
var _electionRollDb:ElectionRollDB;
var _castVoteStore:CastVoteStore;
var _emailService:IEmailService;
var _eventQueue:IEventQueue;

var _accountService:AccountService;
var _globalData:GlobalData;

function postgres():any {
    if (_postgresClient == null){
        var connectionConfig = pgConnectionObject();
        Logger.debug(_appInitContext, `Postgres Config:  ${JSON.stringify(connectionConfig)}}`);
        _postgresClient  = new Pool(connectionConfig);
    }
    return _postgresClient;
}

function pgConnectionObject():any {
    var connectionStr = pgConnectionString();
    var devDB = process.env.DEV_DATABASE;
    if (devDB === 'TRUE') {
        return {
            connectionString: connectionStr,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }
    return {
        connectionString: connectionStr,
        ssl: false
    };
}

function pgConnectionString():string {
    return process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';
}

async function eventQueue():Promise<IEventQueue> {
    if (_eventQueue == null){
        const eq = new PGBossEventQueue();
        await eq.init(pgConnectionObject(), Logger.createContext("appInit"));
        _eventQueue = eq;
    }

    return _eventQueue;
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


function emailService():IEmailService {
    if (_emailService == null){
        const sgApiKey = process.env.SENDGRID_API_KEY;
        if (sgApiKey != null){
            return _emailService = new EmailService(sgApiKey);
        }
        Logger.warn(_appInitContext, `No SendGrid API Key.  Using Mock Email Service`);
        return new MockEmailService();
    }
    return _emailService;
}

function accountService():AccountService {
    if (_accountService == null){
        _accountService = new AccountService();
    }
    return _accountService;
}

function globalData():GlobalData {
    if (_globalData == null){
        _globalData = new GlobalData();
    }
    return _globalData;
}

export  default { ballotsDb, electionsDb, electionRollDb, emailService, accountService, castVoteStore, globalData, eventQueue};
