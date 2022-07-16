require('dotenv').config();
const request = require('supertest');
import { Election } from '../../../domain_model/Election';
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

describe("Edit Election", () => {

    const setupInitialElection = async () => {
        const response = await request(app)
            .post('/API/Elections')
            .set('Cookie', ['id_token=' + testInputs.user1token])
            .set('Accept', 'application/json')
            .send({ Election: testInputs.Election1, VoterIDList: [] })
            .expect('Content-Type', /json/)
        const responseObject =  Object.assign({}, response.body);
        expect(responseObject).toHaveProperty("election.election_id");
        return responseObject.election.election_id
    }

    const fetchElectionById = async (electionId:number):Promise<Election> => {
        const response = await request(app)
        .get(`/API/Election/${electionId}`)
        .set('Cookie', ['id_token=' + testInputs.user1token])
        .set('Accept', 'application/json')
        expect(response.statusCode).toBe(200);

        var resObj = response.body;
        expect(resObj.election).toBeTruthy();
        return resObj.election;
    }

    describe("Election data provided", () => {
        test("responds with 200 status", async () => {
            const electionId = await setupInitialElection();
            console.log("electionId = "+electionId);

            const response = await request(app)
                .post(`/API/Election/${electionId}/edit`)
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })
            expect(response.statusCode).toBe(200);
            logger.clear();
        })
    })

    // describe("Election not provided/incorrect format", () => {
    //     test("responds with 400 status", async () => {
    //         const ID = await setupInitialElection()

    //         const response = await request(app)
    //             .post(`/API/Election/${ID}/edit`)
    //             .set('Cookie', ['id_token=' + testInputs.user1token])
    //             .set('Accept', 'application/json')
    //             .send({ VoterIDList: [] })
    //         expect(response.statusCode).toBe(400)
    //     })
    // })

    describe("User is not logged in", () => {
        test("responds with 401 status", async () => {
            const ID = await setupInitialElection()

            const response = await request(app)
                .post(`/API/Election/${ID}/edit`)
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(401)
            logger.clear();
        })
    })

    describe("User is not owner", () => {
        test("responds with 401 status", async () => {
            const ID = await setupInitialElection()

            const response = await request(app)
                .post(`/API/Election/${ID}/edit`)
                .set('Cookie', ['id_token=' + testInputs.user2token])
                .set('Accept', 'application/json')
                .send({ Election: testInputs.Election1, VoterIDList: [] })

            expect(response.statusCode).toBe(401)
            logger.clear();
        })
    })

    describe("User edits election", () => {
        test("edits title", async () => {
            const electionId = await setupInitialElection()

            var election1Copy = {...testInputs.Election1};
            var newTitle = `${election1Copy.title} - Edited`;
            election1Copy.election_id = electionId;
            election1Copy.title = newTitle;

            const response = await request(app)
                .post(`/API/Election/${electionId}/edit`)
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ Election: election1Copy, VoterIDList: [] })

            // expect(ElectionsDB.elections[election1Copy.election_id].title).toBe(newTitle)
            expect(response.statusCode).toBe(200);

            const reFetchedElection = await fetchElectionById(electionId);;
            expect(reFetchedElection.title).toEqual(newTitle);
            logger.clear();
        })

        test("edits roll type", async () => {
            // I'm testing roll type specifically to make sure nested fields are applied correctly        
            const ID = await setupInitialElection()
            // I wanted to use structuredClone here, but I had trouble getting it to work with jest :'(
            var election1Copy = {...testInputs.Election1, settings: {...testInputs.Election1.settings}}
            var newRollType = 'Some Other Roll Type'
            election1Copy.settings.election_roll_type = newRollType

            const response = await request(app)
                .post(`/API/Election/${ID}/edit`)
                .set('Cookie', ['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({ Election: election1Copy, VoterIDList: [] })

            // TODO: I couldn't figure out how to make this work, it kept saying that ElectionsDB.mock was undefined?
            // expect(ElectionsDB.mock.instances[0].elections[election1Copy.election_id].settings.election_roll_type).toBe(newRollType)
            expect(response.statusCode).toBe(200)
            logger.clear();
        })
        test("edits voter ids", async () => {
            // TODO
        })
    })
})