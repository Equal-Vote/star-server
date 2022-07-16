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

describe("Create Election", () => {

    describe("Good Election data provided", () => {
        test("responds with 200 status", async () => {
            const response = await request(app)
                .post('/API/Elections')
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(200);
            var resObj = response.body;
            expect(resObj.election).toBeTruthy();
            expect(resObj.election.title).toEqual(testInputs.Election1.title);
            expect(resObj.election.election_id).toEqual(0);
            logger.clear();
        })
        test("Get responds with 200 status", async () => {
            const response = await request(app)
                .get('/API/Election/0')
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                expect(response.statusCode).toBe(200);

            var resObj = response.body;
            expect(resObj.election).toBeTruthy();
            expect(resObj.election.title).toEqual(testInputs.Election1.title);
            logger.clear();
        })
    })

    // describe("Election not provided/incorrect format", () => {
    //      // TODO: Add validation in API inputs
    //     test("responds with 400 status", async () => {
    //         const response = await request(app)
    //             .post('/API/Elections')
    //             .set('Cookie', ['id_token=' + testInputs.user1token])
    //             .set('Accept', 'application/json')
    //             .send({ VoterIDList: [] })

    //         expect(response.statusCode).toBe(400)
    //     })

    // })

    describe("User is not logged in", () => {
        test("responds with 401 status", async () => {
            const response = await request(app)
                .post('/API/Elections')
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(401)
            logger.clear();
        })
    })
})