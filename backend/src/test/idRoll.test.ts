require('dotenv').config();
const request = require('supertest');
import makeApp from '../app';
import { TestLoggerImpl } from '../Services/Logging/TestLoggerImpl';
import testInputs from './testInputs';

const app = makeApp()

// Mocks databases for testing app
// Uses mocks defined in ./../Models/__Mocks__/
jest.mock('./../Models/Ballots')
jest.mock('./../Models/Elections')
jest.mock('./../Models/ElectionRolls')

var logger = new TestLoggerImpl().setup();

afterEach(() => {
    jest.clearAllMocks();
    logger.print();
    logger.clear();
});


describe("ID Roll", () => {
    beforeAll(() => {
        jest.resetAllMocks();
    });
    var ID = 0;
    test("Create election, responds 200", async () => {
        const response = await request(app)
            .post('/API/Elections')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ Election: testInputs.IDRollElection, VoterIDList: testInputs.IDRoll })
        expect(response.statusCode).toBe(200)
        const responseObject = response.body;
        ID = responseObject.election.election_id;
        logger.clear();
    })
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token + '; voter_id=' + testInputs.IDRoll[0]])
            .set('Accept', 'application/json')
            .send({})
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(false)
        logger.clear();
    })
    test("Authorized voter submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user1token + '; voter_id=' + testInputs.IDRoll[0]])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2})
        // console.log(response)
        expect(response.statusCode).toBe(200)
        logger.clear();
    })
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token + '; voter_id=' + testInputs.IDRoll[0]])
            .set('Accept', 'application/json')
            .send({})
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(true)
        logger.clear();
    })
    test("Authorized voter re-submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user1token + '; voter_id=' + testInputs.IDRoll[0]])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2})
        // console.log(response)
        expect(response.statusCode).toBe(400)
        logger.clear();
    })
    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user3token + '; voter_id=' + 'FakeVoterID'])
            .set('Accept', 'application/json')
            .send({})
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(false)
        expect(response.body.voterAuth.has_voted).toBe(false)
        logger.clear();
    })
    test("Unauthorized voter submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${ID}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user3token + '; voter_id=' + 'FakeVoterID'])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2})
        // console.log(response)
        expect(response.statusCode).toBe(400)
        logger.clear();
    })
    logger.clear();
})
