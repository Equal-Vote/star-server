require('dotenv').config();
const request = require('supertest');
import { TestHelper } from './TestHelper';
import testInputs from './testInputs';


// Mocks databases for testing app
// Uses mocks defined in ./../Models/__Mocks__/
jest.mock('./../Models/Ballots')
jest.mock('./../Models/Elections')
jest.mock('./../Models/ElectionRolls')

const th = new TestHelper();

afterEach(() => {
    jest.clearAllMocks();
    th.afterEach();
});


describe("ID Roll", () => {
    beforeAll(() => {
        jest.resetAllMocks();
    });
    var ID = "";
    test("Create election, responds 200", async () => {
        const response = await th.createElection(testInputs.IDRollElection,  testInputs.IDRoll, testInputs.user1token);

        expect(response.statusCode).toBe(200)
        ID = response.election.election_id;
        th.testComplete();
    })
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await th.requestBallotWithId(ID, testInputs.user1token, testInputs.IDRoll[0]);
        expect(response.statusCode).toBe(200)

        expect(response.voterAuth.authorized_voter).toBe(true)
        expect(response.voterAuth.has_voted).toBe(false)
        th.testComplete();
    })
    test("Authorized voter submits ballot", async () => {
        const response = await th.submitBallotWithId(ID, testInputs.Ballot2, testInputs.user1token, testInputs.IDRoll[0]);
        // console.log(response)
        expect(response.statusCode).toBe(200)
        th.testComplete();
    })
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await th.requestBallotWithId(ID, testInputs.user1token, testInputs.IDRoll[0]);

        expect(response.statusCode).toBe(200)
        expect(response.voterAuth.authorized_voter).toBe(true)
        expect(response.voterAuth.has_voted).toBe(true)
        th.testComplete();
    })
    test("Authorized voter re-submits ballot", async () => {
        const response = await th.submitBallotWithId(ID, testInputs.Ballot2, testInputs.user1token,  testInputs.IDRoll[0]);

        expect(response.statusCode).toBe(400)
        th.testComplete();
    })
    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await th.requestBallotWithId(ID, testInputs.user3token, "FakeVoterID");
        expect(response.statusCode).toBe(200)
        expect(response.voterAuth.authorized_voter).toBe(false)
        expect(response.voterAuth.has_voted).toBe(false)
        th.testComplete();
    })
    test("Unauthorized voter submits ballot", async () => {
        const response = await th.submitBallotWithId(ID, testInputs.Ballot2, testInputs.user3token,  'FakeVoterID');

        // console.log(response)
        expect(response.statusCode).toBe(400)
        th.testComplete();
    })
})
