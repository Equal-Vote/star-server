require('dotenv').config();
const request = require('supertest');
import makeApp from '../app';

const app = makeApp()

const testInputs = require('./testInputs')

// Mocks databases for testing app
// Uses mocks defined in ./../Models/__Mocks__/
jest.mock('./../Models/Ballots')
jest.mock('./../Models/Elections')
jest.mock('./../Models/VoterRolls')

afterEach(() => {
    jest.clearAllMocks();
});

describe("Post Election", () => {

    describe("Election data provided", () => {
        test("responds with 200 status", async () => {
            const response = await request(app)
                .post('/API/Elections')
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(200)
        })
        test("Get responds with 200 status", async () => {
            const response = await request(app)
                .get('/API/Election/0')
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
            // console.log(response)
            expect(response.statusCode).toBe(200)
        })
    })
    describe("Election not provided/incorrect format", () => {
        test("responds with 400 status", async () => {
            const response = await request(app)
                .post('/API/Elections')
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ VoterIDList: [] })

            expect(response.statusCode).toBe(400)
        })
        // TODO: Add validation in API inputs
        // test("responds with 400 status", async () => {
        //     const response = await request(app)
        //         .post('/API/Elections')
        //         .set('Cookie', ['id_token=' + testInputs.user1token])
        //         .set('Accept', 'application/json')
        //         .send({ Election: testInputs.IncompleteElection, VoterIDList: [] })

        //     expect(response.statusCode).toBe(400)
        // })

    })
    describe("User is not logged in", () => {
        test("responds with 200 status", async () => {
            const response = await request(app)
                .post('/API/Elections')
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(400)
        })

    })
})

describe("Email Roll", () => {
    beforeAll(() => {
        jest.resetAllMocks();
    });
    test("Create election, responds 200", async () => {
        const response = await request(app)
            .post('/API/Elections')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ Election: testInputs.EmailRollElection, VoterIDList: testInputs.EmailRoll })
        // console.log(response.body)
        expect(response.statusCode).toBe(200)
        // id = response.body.election.election_id
    })
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/1/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Authorized voter submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/1/vote')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 })
        // console.log(response)
        expect(response.statusCode).toBe(200)
    })
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await request(app)
            .post(`/API/Election/1/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(true)
    })
    test("Authorized voter re-submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/1/vote')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/1/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(false)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Unauthorized voter submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/1/vote')
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot1 })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
})

describe("ID Roll", () => {
    beforeAll(() => {
        jest.resetAllMocks();
    });
    test("Create election, responds 200", async () => {
        const response = await request(app)
            .post('/API/Elections')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ Election: testInputs.IDRollElection, VoterIDList: testInputs.IDRoll })
        // console.log(response.body)
        expect(response.statusCode).toBe(200)
        // id = response.body.election.election_id
    })
    test("Get voter auth, is authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/2/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ voter_id: testInputs.IDRoll[0] })
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Authorized voter submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/2/vote')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2, voter_id: testInputs.IDRoll[0] })
        // console.log(response)
        expect(response.statusCode).toBe(200)
    })
    test("Get voter auth, is authorized and has voted", async () => {
        const response = await request(app)
            .post(`/API/Election/2/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ voter_id: testInputs.IDRoll[0] })
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(true)
        expect(response.body.voterAuth.has_voted).toBe(true)
    })
    test("Authorized voter re-submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/2/vote')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2, voter_id: testInputs.IDRoll[0] })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
    test("Get voter auth, isn't authorized and hasn't voted", async () => {
        const response = await request(app)
            .post(`/API/Election/2/ballot`)
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
            .send({ voter_id: 'FakeVoterID' })
        expect(response.statusCode).toBe(200)
        expect(response.body.voterAuth.authorized_voter).toBe(false)
        expect(response.body.voterAuth.has_voted).toBe(false)
    })
    test("Unauthorized voter submits ballot", async () => {
        const response = await request(app)
            .post('/API/Election/2/vote')
            .set('Cookie', ['id_token=' + testInputs.user3token])
            .set('Accept', 'application/json')
            .send({ ballot: testInputs.Ballot2, voter_id: 'FakeVoterID' })
        // console.log(response)
        expect(response.statusCode).toBe(400)
    })
})