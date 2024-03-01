import React, { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";
import RankedBallotView from "./RankedBallotView.js";
import ApprovalBallotView from "./ApprovalBallotView.js";
import StarPRBallotView from "./StarPRBallotView";
import { DetailExpander } from '../../util';

export default function BallotPageSelector({votingMethod}) {
  // TODO: it would be more scalable if we selected the class from a dictionary, but I'm not sure how to do that in react
  return (
    <>
      {votingMethod == 'STAR' && <StarBallotView/>}
      {votingMethod == 'STAR_PR' && <StarPRBallotView/>}
      {votingMethod == 'Plurality' && <PluralityBallotView/>}
      {(votingMethod == 'RankedRobin' || votingMethod == 'IRV') && <RankedBallotView/>}
      {votingMethod == 'Approval' && <ApprovalBallotView/>}
    </>
  );
}
