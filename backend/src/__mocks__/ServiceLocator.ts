
import BallotsDB from "../Models/__mocks__/Ballots";
import ElectionsDB from "../Models/__mocks__/Elections";
import ElectionRollDB from "../Models/__mocks__/ElectionRolls";
import EmailService from "../Services/Email/__mocks__/EmailService";
import CastVoteStore from "../Models/__mocks__/CastVoteStore";
import { IBallotStore } from "../Models/IBallotStore";
import { IElectionRollStore } from "../Models/IElectionRollStore";
import { MockEventQueue } from "../Services/EventQueue/MockEventQueue";

var _ballotsDb:IBallotStore;
var _electionsDb:ElectionsDB;
var _electionRollDb:IElectionRollStore;
var _emailService:EmailService;
var _castVoteStore:CastVoteStore;
var _eventQueue:MockEventQueue;

function ballotsDb():IBallotStore {
    if (_ballotsDb == null){
        _ballotsDb = new BallotsDB();
    }
    return _ballotsDb;
}

function electionsDb():ElectionsDB {
    if (_electionsDb == null){
        _electionsDb = new ElectionsDB();
    }
    return _electionsDb;
}

function electionRollDb():IElectionRollStore {
    if (_electionRollDb == null){
        _electionRollDb = new ElectionRollDB();
    }
    return _electionRollDb;
}

function emailService():EmailService {
    if (_emailService == null){
        _emailService = new EmailService();
    }
    return _emailService;
}

function castVoteStore():CastVoteStore {
    if (_castVoteStore == null){
        _castVoteStore = new CastVoteStore(ballotsDb(), electionRollDb());
    }
    return _castVoteStore;
}

async function eventQueue():Promise<MockEventQueue> {
    if (_eventQueue == null){
        _eventQueue = new MockEventQueue();
    }
    return _eventQueue;
}


export  default { ballotsDb, electionsDb, electionRollDb, emailService, castVoteStore, eventQueue };