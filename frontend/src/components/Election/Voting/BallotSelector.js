import React, { useState } from "react";
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";
import RankedBallotView from "./RankedBallotView.js";

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
    {race.voting_method == 'Plurality' && 
      <PluralityBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    {(race.voting_method == 'Ranked-Robin' || race.voting_method == "IRV") && 
      <RankedBallotView
        race={race}
        candidates={candidates}
        scores={scores}
        onUpdate={onUpdate}
        />
    }
    </>
  );
}
