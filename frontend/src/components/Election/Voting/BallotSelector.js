import React, { useState } from "react";
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";

export default function BallotSelector({
  race,
  candidates,
  onUpdate,
  scores
}) {

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
    </>
  );
}
