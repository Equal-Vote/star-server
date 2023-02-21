import React, { useState } from "react";
import GenericBallotView from "./GenericBallotView";

export default function BallotSelector({
  race,
  candidates,
  onUpdate,
  scores
}) {

  return (
    // In the future if we add more ballot types we can select the appropriate one here
    <GenericBallotView
      key="starBallot"
      race={race}
      candidates={candidates}
      scores={scores}
      onClick={(i, j) => {
        const newScores = [...scores];
        newScores[i] = newScores[i] === j ? null : j;
        onUpdate(newScores);
      }}
    />
  );
}
