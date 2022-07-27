require("dotenv").config();
const request = require("supertest");

import { Election, electionValidation } from "../../../domain_model/Election";
import testInputs from "./testInputs";
import { TestHelper } from "./TestHelper";
import Logger from "../Services/Logging/Logger";

const th = new TestHelper();

// Mocks databases for testing app
// Uses mocks defined in ./../Models/__Mocks__/
jest.mock("./../Models/Ballots");
jest.mock("./../Models/Elections");
jest.mock("./../Models/ElectionRolls");

afterEach(() => {
  jest.clearAllMocks();
  th.afterEach();
});

describe("Create Election", () => {
  describe("Good Election data provided", () => {
    var electionRes: Election;
    test("responds with 200 status", async () => {
      const response = await th.createElection(
        testInputs.Election1,
        [],
        testInputs.user1token
      );

      expect(response.statusCode).toBe(200);
      expect(response.election).toBeTruthy();

      electionRes = response.election;
      expect(electionRes.title).toEqual(testInputs.Election1.title);
      expect(electionValidation(electionRes)).toBeNull();
      Logger.info(Logger.createContext("foo"), "Election response:  " + electionRes.election_id);
      //th.testComplete();
    });

    test("Get responds with 200 status", async () => {
      const response = await th.fetchElectionById(
        electionRes.election_id.toString(),
        testInputs.user1token
      );

      expect(response.statusCode).toBe(200);
      expect(response.election).toBeTruthy();
      expect(response.election.title).toEqual(testInputs.Election1.title);
      th.testComplete();
    });
  });

  describe("Election not provided/incorrect format", () => {
    test("responds with 400 status", async () => {
      const response = await th.createElection(
        {} as Election,
        [],
        testInputs.user1token
      );
      expect(response.statusCode).toBe(400);
      th.testComplete();
    });
  });

  describe("User is not logged in", () => {
    test("responds with 401 status", async () => {
      const response = await th.createElection(testInputs.Election1, [], null);
      expect(response.statusCode).toBe(401);
      th.testComplete();
    });
  });
});
