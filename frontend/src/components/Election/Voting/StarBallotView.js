import React from "react";
import GenericBallotView from "./GenericBallotView.js";
import Typography from '@mui/material/Typography';

// Renders a complete RCV ballot for a single race
export default function PluralityBallotView({
  race,
  candidates,
  scores,
  onUpdate
}) {
  const instructions = (
    <>
      <Typography align='left' component="li">
        Give your favorite(s) five stars.
      </Typography>
      <Typography align='left' component="li">
        Give your last choice(s) zero stars.
      </Typography>
      <Typography align='left' component="li">
        Show preference order and level of support.
      </Typography>
      <Typography align='left' component="li">
        Equal scores indicate no preference.
      </Typography>
      <Typography align='left' component="li">
        Those left blank receive zero stars.
      </Typography>
    </>
  )
  return (
    <GenericBallotView
      key="starBallot"
      race={race}
      candidates={candidates}
      scores={scores}
      columns={[0, 1, 2, 3, 4, 5]}
      instructions={instructions}
      onClick={(i, j) => {
        const newScores = [...scores];
        newScores[i] = newScores[i] === j ? null : j;
        onUpdate(newScores);
      }}
    />
  );
}

