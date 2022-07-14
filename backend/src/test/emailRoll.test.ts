require('dotenv').config();
const request = require('supertest');
import makeApp from '../app';
import testInputs from './testInputs';

const app = makeApp()

// Mocks databases for testing app
// Uses mocks defined in ./../Models/__Mocks__/
jest.mock('./../Models/Ballots')
jest.mock('./../Models/Elections')
jest.mock('./../Models/ElectionRolls')

afterEach(() => {
    jest.clearAllMocks();
});


describe("Email Roll", () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });
    var electionId = 0;
    test("Create election, responds 200", async () => {
        const response = await request(app)
            .post('/API/Elections')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ Election: testInputs.EmailRollElection, VoterIDList: testInputs.EmailRoll });
        //console.log(response.body)
        expect(response.statusCode).toBe(200)
        const responseObject = response.body;
        electionId = responseObject.election.election_id
    })
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Authorized voter submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 });
        expect(response.statusCode).toBe(200)
    })
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(true)
    })
    test("Authorized voter re-submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(false)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Unauthorized voter submits ballot", async () => {
        const response = await request(app)
            .post(`/API/Election/${electionId}/vote`)
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
})