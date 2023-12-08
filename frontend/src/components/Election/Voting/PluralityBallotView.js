import React, { useContext } from "react";
import GenericBallotView from "./GenericBallotView.js";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";

// Renders a complete RCV ballot for a single race
export default function PluralityBallotView() {
  const ballotContext = useContext(BallotContext);
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
      columns={[1]}
      instructions={instructions}
      onClick={(row, score) => {
        const newScores = ballotContext.candidates.map(c => c.score);
        // bubble becomes null
        if(newScores[row] === score){
          newScores[row] = 0

        // bubble becomes 1, all others become 0
        }else{
          for(let i = 0; i < newScores.length; i++){
            newScores[i] = (i===row)? score : null;
          }
        }
        ballotContext.onUpdate(newScores);
      }}
      footer="The candidate with the most votes wins"
    />
  );
}
