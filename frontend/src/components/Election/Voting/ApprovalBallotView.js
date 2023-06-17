import React from "react";
import GenericBallotView from "./GenericBallotView.js";
import Typography from '@mui/material/Typography';

// Renders a complete RCV ballot for a single race
export default function ApprovalBallotView({
  race,
  candidates,
  onUpdate
}) {
  const instructions = (
    <>
      <Typography align='left' component="li">
        Fill in the bubble next to your favorite
      </Typography>
      <Typography align='left' component="li">
        You can select as many candidates as you like
      </Typography>
    </>
  )
  return (
    <GenericBallotView
      key="approvalBallot"
      race={race}
      candidates={candidates}
      columns={[1]}
      instructions={instructions}
      onClick={(row, score) => {
        const newScores = candidates.map(c => c.score);
        newScores[row] = newScores[row] === score ? null : score;
        onUpdate(newScores);
      }}
      footer="The candidate with the most votes wins"
    />
  );
}
