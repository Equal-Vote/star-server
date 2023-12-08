import React, { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";
import RankedBallotView from "./RankedBallotView.js";
import ApprovalBallotView from "./ApprovalBallotView.js";
import StarPRBallotView from "./StarPRBallotView";
import { DetailExpander } from '../../util';

export default function BallotPageSelector({page, races, onUpdate}) {
  let race = races[page.race_index];
  let candidates = page.candidates;
  // TODO: it would be more scalable if we selected the class from a dictionary, but I'm not sure how to do that in react
  return (
    <>
      {page.voting_method == 'STAR' &&
        <StarBallotView
          race={race}
          candidates={candidates}
          onUpdate={onUpdate}
          />
      }
      {page.voting_method == 'STAR_PR' &&
        <StarPRBallotView
          race={race}
          candidates={candidates}
          onUpdate={onUpdate}
          />
      }
      {page.voting_method == 'Plurality' && 
        <PluralityBallotView
          race={race}
          candidates={candidates}
          onUpdate={onUpdate}
          />
      }
      {(page.voting_method == 'RankedRobin' || race.voting_method == "IRV") && 
        <RankedBallotView
          race={race}
          candidates={candidates}
          onUpdate={onUpdate}
          />
      }
      {(page.voting_method == 'Approval') && 
        <ApprovalBallotView
          race={race}
          candidates={candidates}
          onUpdate={onUpdate}
          />
      }
    </>
  );
}
