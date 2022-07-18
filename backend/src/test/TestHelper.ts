import { Election } from "../../../domain_model/Election";
import makeApp from "../app";
import Logger from "../Services/Logging/Logger";
import { TestLoggerImpl } from "../Services/Logging/TestLoggerImpl";
const request = require("supertest");

type ElectionResponse = {
  statusCode: number;
  err: Object | null;
  election: Election;
};

export class TestHelper {
  public expressApp;
  public logger: TestLoggerImpl;

  private ctx = Logger.createContext("testHelper");

  constructor() {
    this.expressApp = makeApp();
    this.logger = new TestLoggerImpl().setup();
  }

  getRequest(url: string, userToken: string | null) {
    var r = request(this.expressApp).get(url).set("Accept", "application/json");
    if (userToken != null) {
      r = r.set("Cookie", ["id_token=" + userToken]);
    }
    return r;
  }

  postRequest(url: string, body: Object, userToken: string | null) {
    var r = request(this.expressApp)
      .post(url)
      .set("Accept", "application/json");

    if (userToken != null) {
      r = r.set("Cookie", ["id_token=" + userToken]);
    }
    return r.send(body);
  }

  async createElection(
    election: Election,
    voterRoll: string[],
    userToken: string | null
  ): Promise<ElectionResponse> {
    const res = await this.postRequest(
      "/API/Elections",
      {
        Election: election,
        VoterIDList: voterRoll,
      },
      userToken
    );
    return this.electionResponse(res);
  }

  async editElection(
    election: Election,
    voterRoll: string[],
    userToken: string | null
  ): Promise<ElectionResponse> {
    const res = await this.postRequest(
      `/API/Election/${election.election_id}/edit`,
      {
        Election: election,
        VoterIDList: voterRoll,
      },
      userToken
    );
    return this.electionResponse(res);
  }

  private electionResponse(res: any): ElectionResponse {
    if (res.statusCode != 200) {
      return {
        statusCode: res.statusCode,
        err: res.body,
        election: res.body.election,
      };
    }
    return {
      statusCode: res.statusCode,
      err: null,
      election: res.body.election,
    };
  }

  async fetchElectionById(
    electionId: string | number,
    userToken: string | null
  ): Promise<ElectionResponse> {
    const res = await this.getRequest(`/API/Election/${electionId}`, userToken);
    return this.electionResponse(res);
  }

  afterEach() {
    this.logger.print();
    this.logger.clear();
  }

  testComplete() {
    this.logger.clear();
  }
}
