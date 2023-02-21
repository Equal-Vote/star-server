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
        Fill in the bubble next to your favorite
      </Typography>
    </>
  )
  return (
    <GenericBallotView
      key="pluralityBallot"
      race={race}
      candidates={candidates}
      scores={scores}
      columns={[1]}
      instructions={instructions}
      onClick={(row, score) => {
        const newScores = [...scores];
        // bubble becomes null
        if(newScores[row] === score){
          newScores[row] = 0

        // bubble becomes 1, all others become 0
        }else{
          for(let i = 0; i < newScores.length; i++){
            newScores[i] = (i===row)? score : null;
          }
        }
        onUpdate(newScores);
      }}
    />
  );
}
