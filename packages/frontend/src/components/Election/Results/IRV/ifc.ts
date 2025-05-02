/* Front-end interfaces for IRV */

import {
  irvRoundResults
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";

export interface irvContext {
  candidatesByIndex: {name: string}[],
  t: Function /* international translator */
}

export interface irvWinnerSearch {
  firstRound: irvRoundResults,
  lastRound: irvRoundResults | null
};
