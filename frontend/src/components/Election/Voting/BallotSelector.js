import React, { useState } from "react";
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";
import RankedBallotView from "./RankedBallotView.js";
import ApprovalBallotView from "./ApprovalBallotView.js";
import StarPRBallotView from "./StarPRBallotView";

export default function BallotSelector({
  race,
  candidates,
  onUpdate,
  scores
}) {
  // TODO: it would be more scalable if we selected the class from a dictionary, but I'm not sure how to do that in react
  return (
    <>
    {race.voting_method == 'STAR' &&
      <StarBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    {race.voting_method == 'STAR_PR' &&
      <StarPRBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    {race.voting_method == 'Plurality' && 
      <PluralityBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    {(race.voting_method == 'RankedRobin' || race.voting_method == "IRV") && 
      <RankedBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    {(race.voting_method == 'Approval') && 
      <ApprovalBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    </>
  );
}
