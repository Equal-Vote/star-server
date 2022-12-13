import { Election } from "../../../domain_model/Election";
import { ElectionRoll, ElectionRollState } from "../../../domain_model/ElectionRoll";
import { IRequest } from "../IRequest";
import ServiceLocator from "../ServiceLocator";
import Logger from "../Services/Logging/Logger";
import { BadRequest, InternalServerError, Unauthorized } from "@curveball/http-errors";
import { ILoggingContext } from "../Services/Logging/ILogger";
import { randomUUID } from "crypto";

const ElectionRollModel = ServiceLocator.electionRollDb();

export async function getOrCreateElectionRoll(req: IRequest, election: Election, ctx: ILoggingContext): Promise<ElectionRoll | null> {
    // Checks for existing election roll for user
    Logger.info(req, `getOrCreateElectionRoll`)

    // Get data that is used for voter authentication
    const ip_address = election.settings.voter_authentication.ip_address ? req.ip : null
    const email = election.settings.voter_authentication.email ? req.user?.email : null
    let voter_id = election.settings.voter_authentication.voter_id ? req.cookies?.voter_id : null

    // Get all election roll entries that match any of the voter authentication fields
    // This is an odd way of going about this, rather than getting a roll that matches all three we get all that match any of the fields and
    // check the output for a number of edge cases.
    const electionRollEntries = await ElectionRollModel.getElectionRoll(String(election.election_id), voter_id, email, ip_address, ctx);


    if (electionRollEntries == null) {
        // No election roll found, create one if voter access is open and election state is open
        if (election.settings.voter_access !== 'open') {
            return null
        }
        if (election.state !== 'open') {
            return null
        }
        Logger.info(req, "Creating new roll");
        voter_id = randomUUID()
        const history = [{
            action_type: ElectionRollState.approved,
            actor: voter_id,
            timestamp: Date.now(),
        }]
        const roll: ElectionRoll[] = [{
            election_id: String(election.election_id),
            email: req.user?.email ? req.user.email : undefined,
            voter_id: voter_id,
            ip_address: req.ip,
            submitted: false,
            state: ElectionRollState.approved,
            history: history,
        }]

        const newElectionRoll = await ElectionRollModel.submitElectionRoll(roll, ctx, `User requesting Roll and is authorized`)
        if (!newElectionRoll) {
            Logger.error(ctx, "Failed to update ElectionRoll");
            throw new InternalServerError();
        }
        return roll[0];
    }


    if (electionRollEntries.length > 1) {
        // Multiple election rolls match some of the authentication fields, shouldn't occur but throw error if it does
        // Maybe could happen if someone submits valid voter ID seperate valid email
        Logger.error(req, "Multiple election roll entries found", electionRollEntries);
        throw new InternalServerError('Multiple election roll entries found');
    }
    if (election.settings.voter_authentication.ip_address && electionRollEntries[0].ip_address) {
        if (electionRollEntries[0].ip_address !== ip_address) {
            Logger.error(req, "IP Address does not match saved voter roll", electionRollEntries);
            throw new Unauthorized('IP Address does not match saved voter roll');
        }
    }
    if (election.settings.voter_authentication.email && electionRollEntries[0].email !== email) {
        // Email doesn't match saved election roll, for example if email and voter ID are selected but email doesn't match the voter ID 
        Logger.error(req, "Email does not match saved election roll", electionRollEntries);
        throw new Unauthorized('Email does not match saved election roll');
    }
    if (election.settings.voter_authentication.voter_id && electionRollEntries[0].voter_id !== voter_id) {
        // Voter ID does not match saved election roll, for example if email and voter ID are selected but email doesn't match the voter ID 
        Logger.error(req, "Voter ID does not match saved election roll", electionRollEntries);
        throw new Unauthorized('Voter ID does not match saved voter roll');
    }

    return electionRollEntries[0]

}

export function checkForMissingAuthenticationData(req: IRequest, election: Election, ctx: ILoggingContext): string | null {
    // Checks that user has provided all data needed for authentication
    Logger.info(req, `checkForMissingAuthenticationData`)
    if (election.settings.voter_authentication.voter_id && !(req.cookies?.voter_id)) {
        return 'Voter ID Required'
    }
    if (election.settings.voter_authentication.email && !(req.user?.email)) {
        return 'Email Validation Required'
    }
    return null
}

export function getVoterAuthorization(roll: ElectionRoll | null, missingAuthData: string | null) {
    Logger.info(undefined, `getVoterAuthorization`)
    if (missingAuthData !== null) {
        return {
            authorized_voter: false,
            required: missingAuthData,
            has_voted: false,
        }
    }
    if (roll === null) {
        return {
            authorized_voter: false,
            has_voted: false,
        }
    }
    return {
        authorized_voter: true,
        has_voted: roll.submitted,
    }
} 