require('dotenv').config();
const request = require('supertest');
import makeApp from '../app';

const app = makeApp()

const testInputs = require('./testInputs')

// Mocks databases for testing app
jest.mock('./../Models/Ballots')
jest.mock('./../Models/Elections')
jest.mock('./../Models/VoterRolls')

describe("Post Election", () =>{

    describe("Election data provided",  () => {
        test("responds with 200 status",async () =>{
            const response = await request(app)
                .post('/API/Elections')
                .set('Cookie',['id_token=' + testInputs.user1token])
                .set('Accept', 'application/json')
                .send({Election: testInputs.Election1, VoterIDList:[]})

            expect(response.statusCode).toBe(200)
        })
    })
    describe("Election not provided/incorrect format",() => {
        
    })
    describe("User is logged in",() => {
        
    })
    describe("User is not logged in",() => {
        
    })
})