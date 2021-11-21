import { Poll } from "./Poll";
import { Uid } from "./Uid";

export interface Election {
    electionId:    Uid; // identifier assigned by the system
    frontendUrl:   string; // base URL for the frontend
    title:         string; // one-line election title
    description?:  string; // mark-up text describing the election
    startUtc?:     Date;   // when the election starts 
    endUtc?:       Date;   // when the election ends
    polls:         Poll[]; // one or more poll definitions
  }
