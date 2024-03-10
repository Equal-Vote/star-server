require("dotenv").config();
const request = require("supertest");

import { Election, electionValidation } from "shared/domain_model/Election";
import testInputs from "./testInputs";
import { TestHelper } from "./TestHelper";

const th = new TestHelper();

// Uses the mock service locator in place of the production one
// Which users mock databases
jest.mock("./../ServiceLocator");

afterEach(() => {
  jest.clearAllMocks();
  th.afterEach();
});

describe("Multi Race Election", () => {
  var electionRes: Election;
  test("responds with 200 status", async () => {
    const response = await th.createElection(
      testInputs.MultiRaceElection,
      testInputs.user1token
    );

    expect(response.statusCode).toBe(200);
    expect(response.election).toBeTruthy();

    electionRes = response.election;
    expect(electionRes.title).toEqual(testInputs.MultiRaceElection.title);
    expect(electionRes.races.length).toEqual(2)
    expect(electionValidation(electionRes)).toBeNull();
    th.testComplete();
  });

  test("Valid ballot with subset of races", async () => {
    // Tests that a voter can cast a ballot for a subset of races in election
    const response = await th.submitBallot(
      electionRes.election_id,
      testInputs.MultiRaceBallotValid1,
      testInputs.user1token
    );
    expect(response.statusCode).toBe(200);
    th.testComplete();
  });
  test("Valid ballot with full set of races", async () => {
    // Tests that a voter can cast a ballot for all races in election
    const response = await th.submitBallot(
      electionRes.election_id,
      testInputs.MultiRaceBallotValid2,
      testInputs.user1token
    );
    expect(response.statusCode).toBe(200);
    th.testComplete();
  });
  test("Invalid ballot with duplicate races", async () => {
    // Tests that a voter can cast a ballot for all races in election
    const response = await th.submitBallot(
      electionRes.election_id,
      testInputs.MultiRaceBallotInvalid1,
      testInputs.user1token
    );
    expect(response.statusCode).toBe(400);
    th.testComplete();
  });
  test("Invalid ballot with invalid race ids", async () => {
    // Tests that a voter can cast a ballot for all races in election
    const response = await th.submitBallot(
      electionRes.election_id,
      testInputs.MultiRaceBallotInvalid2,
      testInputs.user1token
    );
    expect(response.statusCode).toBe(400);
    th.testComplete();
  });
})
