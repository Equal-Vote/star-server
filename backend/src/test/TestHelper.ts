import { Ballot } from "../../../domain_model/Ballot";
import { Election } from "../../../domain_model/Election";
import { Uid } from "../../../domain_model/Uid";
import { VoterAuth } from "../../../domain_model/VoterAuth";
import makeApp from "../app";
import Logger from "../Services/Logging/Logger";
import { TestLoggerImpl } from "../Services/Logging/TestLoggerImpl";
import ServiceLocator  from "../__mocks__/ServiceLocator"
const request = require("supertest");

type ElectionResponse = {
    statusCode: number;
    err: Object | null;
    election: Election;
};

type BallotResponse = {
    statusCode: number;
    err: Object | null;
    election: Election;
    voterAuth: VoterAuth;
};

export class TestHelper {
    public expressApp;
    public logger: TestLoggerImpl;
    public emailService: any

    private ctx = Logger.createContext("testHelper");

    constructor() {
        this.emailService = ServiceLocator.emailService()
        this.expressApp = makeApp();
        this.logger = new TestLoggerImpl().setup();
    }

    getRequest(url: string, userToken: string | null) {
        var r = request(this.expressApp)
            .get(url)
            .set("Accept", "application/json");
        if (userToken != null) {
            r = r.set("Cookie", ["id_token=" + userToken]);
        }
        return r;
    }

    postRequest(url: string, body: Object, userToken: string | null) {
        var r = request(this.expressApp)
            .post(url)
            .set("Accept", "application/json");

        if (userToken != null) {
            r = r.set("Cookie", ["id_token=" + userToken]);
        }
        return r.send(body);
    }

    async createElection(
        election: Election,
        voterRoll: string[],
        userToken: string | null
    ): Promise<ElectionResponse> {
        const res = await this.postRequest(
            "/API/Elections",
            {
                Election: election,
                VoterIDList: voterRoll,
            },
            userToken
        );
        return this.electionResponse(res);
    }

    async editElection(
        election: Election,
        voterRoll: string[],
        userToken: string | null
    ): Promise<ElectionResponse> {
        const res = await this.postRequest(
            `/API/Election/${election.election_id}/edit`,
            {
                Election: election,
                VoterIDList: voterRoll,
            },
            userToken
        );
        return this.electionResponse(res);
    }

    async finalizeElection(
        election_id: Uid,
        userToken: string | null
    ): Promise<ElectionResponse> {
        const res = await this.postRequest(
            `/API/Election/${election_id}/finalize`,
            {},
            userToken
        );
        return this.electionResponse(res);
    }

    private electionResponse(res: any): ElectionResponse {
        if (res.statusCode != 200) {
            return {
                statusCode: res.statusCode,
                err: res.body,
                election: res.body.election,
            };
        }
        return {
            statusCode: res.statusCode,
            err: null,
            election: res.body.election,
        };
    }

    async fetchElectionById(
        electionId: Uid,
        userToken: string | null
    ): Promise<ElectionResponse> {
        const res = await this.getRequest(
            `/API/Election/${electionId}`,
            userToken
        );
        return this.electionResponse(res);
    }

    async submitBallot(
        electionId: Uid,
        ballot: Ballot,
        userToken: string | null
    ): Promise<any> {
        return this.postRequest(
            `/API/Election/${electionId}/vote`,
            { ballot: ballot },
            userToken
        );
    }

    async requestBallot(
        electionId: Uid,
        userToken: string | null
    ): Promise<BallotResponse> {
        const res = await this.postRequest(
            `/API/Election/${electionId}/ballot`,
            {},
            userToken
        );
        var err = null;
        if (res.statusCode != 200) {
            err = res.body;
        }
        return {
            statusCode: res.statusCode,
            err: err,
            election: res.body.election,
            voterAuth: res.body.voterAuth,
        };
    }

    async requestBallotWithId(
        electionId: Uid,
        userToken: string | null,
        voterId: string | null
    ): Promise<BallotResponse> {
        var req = request(this.expressApp)
            .post(`/API/Election/${electionId}/ballot`)
            .set("Accept", "application/json");

        req = this.addUserTokenVoterIdCookie(req, userToken, voterId);

        const res = await req.send({});
        var err = null;
        if (res.statusCode != 200) {
            err = res.body;
        }
        return {
            statusCode: res.statusCode,
            err: err,
            election: res.body.election,
            voterAuth: res.body.voterAuth,
        };
    }

    async submitBallotWithId(
        electionId: Uid,
        ballot: Ballot,
        userToken: string | null,
        voterId: string | null
    ): Promise<any> {
        var r = request(this.expressApp)
            .post(`/API/Election/${electionId}/vote`)
            .set("Accept", "application/json");

        r = this.addUserTokenVoterIdCookie(r, userToken, voterId);
        return r.send({ ballot: ballot });
    }

    private addUserTokenVoterIdCookie(
        req: any,
        userToken: string | null,
        voterId: string | null
    ): any {
        var cookies = "";
        if (userToken != null) {
            cookies = "id_token=" + userToken;
        }
        if (voterId != null) {
            if (cookies.length > 0) {
                cookies += "; ";
            }
            cookies += "voter_id=" + voterId;
        }
        console.log("cookies:  " + cookies);
        if (cookies.length > 0) {
            req = req.set("Cookie", [cookies]);
        }
        return req;
    }

    afterEach() {
        this.logger.print();
        this.logger.clear();
        // this.emailService.clear();
    }

    testComplete() {
        this.logger.clear();
        // this.emailService.clear();
    }
}
