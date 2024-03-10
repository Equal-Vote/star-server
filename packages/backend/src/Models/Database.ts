import { Ballot } from "shared/domain_model/Ballot";
import { Election } from "shared/domain_model/Election";
import { ElectionRoll } from "shared/domain_model/ElectionRoll";

export interface Database {
    electionDB: Election,
    electionRollDB: ElectionRoll
    ballotDB: Ballot
}