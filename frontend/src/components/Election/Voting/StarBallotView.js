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
  const footer = (
    <>
    {race.num_winners == 1 &&
      <Typography align='center' component="p">
        The two highest scoring candidates are finalists.<br/>Your full vote goes to the finalist you prefer.
      </Typography>
    }
    {race.num_winners > 1 && 
      <Typography align='center' component="p">
        {`This election uses STAR Voting and will elect ${race.num_winners} winners. In STAR Voting the two highest scoring candidates are finalists and the finalist preferred by more voters wins.`}
      </Typography>
    }
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
      leftTitle='Worst'
      rightTitle='Best'
      onClick={(i, j) => {
        const newScores = [...scores];
        newScores[i] = newScores[i] === j ? null : j;
        onUpdate(newScores);
      }}
      footer={footer}
      starHeadings={true}
    />
  );
}

