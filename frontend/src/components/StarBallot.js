import React, { useState } from "react";
import StarBallotView from "./StarBallotView";

export default function StarBallot({
  race,
  candidates,
  onUpdate,
  defaultRankings,
  readonly,
  onSubmitBallot
}) {
  const [rankings, setRankings] = useState(
    defaultRankings ? defaultRankings : Array(candidates.length).fill(0)
  );


  return (
    <StarBallotView
      key="starBallot"
      race={race}
      candidates={candidates}
      rankings={rankings}
      onClick={(i, j) => {
        console.log(`${candidates[i].shortName} = ${j - 1}`);
        const newRankings = [...rankings];
        newRankings[i] = newRankings[i] === j ? 0 : j;
        setRankings(newRankings);
        // Internal ratings are one too large to differentiate a selected zero, from unselected.
        // We need to adjust for this before returning results to our parent.
        onUpdate(newRankings.map((x) => (x > 0 ? x - 1 : 0)));
      }}
      readonly={readonly}
      onSubmitBallot = {onSubmitBallot}
    />
  );
}
