require("dotenv").config();
const request = require("supertest");
import { TestHelper } from "./TestHelper";
import testInputs from "./testInputs";

// Uses the mock service locator in place of the production one
// Which users mock databases
jest.mock("./../ServiceLocator");

const th = new TestHelper();

afterEach(() => {
    jest.clearAllMocks();
    th.afterEach();
});

describe("Email Roll", () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });
    var electionId = 0;
    test("Create election, responds 200", async () => {
        const response = await th.createElection(
            testInputs.EmailRollElection,
            testInputs.EmailRoll,
            testInputs.user1token
        );

        expect(response.statusCode).toBe(200);
        electionId = response.election.election_id;
        th.testComplete();
    });
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await th.requestBallot(
            electionId,
            testInputs.user1token
        );

        expect(response.statusCode).toBe(200);
        expect(response.voterAuth.authorized_voter).toBe(true);
        expect(response.voterAuth.has_voted).toBe(false);
        th.testComplete();
    });
    test("Authorized voter submits ballot", async () => {
        const response = await th.submitBallot(
            electionId,
            testInputs.Ballot1,
            testInputs.user1token
        );

        // console.log(response)
        expect(response.statusCode).toBe(200);
        th.testComplete();
    });
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await th.requestBallot(
            electionId,
            testInputs.user1token
        );

        expect(response.statusCode).toBe(200);
        expect(response.voterAuth.authorized_voter).toBe(true);
        expect(response.voterAuth.has_voted).toBe(true);
        th.testComplete();
    });
    test("Authorized voter re-submits ballot", async () => {
        const response = await th.submitBallot(
            electionId,
            testInputs.Ballot1,
            testInputs.user1token
        );
        // console.log(response)
        expect(response.statusCode).toBe(400);
        th.testComplete();
    });

    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await th.requestBallot(
            electionId,
            testInputs.user3token
        );

        expect(response.statusCode).toBe(200);
        expect(response.voterAuth.authorized_voter).toBe(false);
        expect(response.voterAuth.has_voted).toBe(false);
        th.testComplete();
    });
    test("Unauthorized voter submits ballot", async () => {
        const response = await th.submitBallot(
            electionId,
            testInputs.Ballot1,
            testInputs.user3token
        );
        // console.log(response)
        expect(response.statusCode).toBe(400);
        th.testComplete();
    });
});
