import Logger from "../Services/Logging/Logger";
import BallotsDB from "../Models/__mocks__/Ballots";
import ElectionsDB from "../Models/__mocks__/Elections";
import ElectionRollDB from "../Models/__mocks__/ElectionRolls";

var _ballotsDb:BallotsDB;
var _electionsDb:ElectionsDB;
var _electionRollDb:ElectionRollDB;

function ballotsDb():BallotsDB {
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

function electionRollDb():ElectionRollDB {
    if (_electionRollDb == null){
        _electionRollDb = new ElectionRollDB();
    }
    return _electionRollDb;
}


export  default { ballotsDb, electionsDb, electionRollDb };