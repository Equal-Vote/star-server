import { ElectionTable } from "./IElection";
import { ElectionRollTable } from "./IElectionRoll";


export interface Database {
    electiondb: ElectionTable,
    electionRollDB: ElectionRollTable
}