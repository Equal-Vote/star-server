import React, { useContext } from "react";
import GenericBallotView from "./GenericBallotView.js";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";

function scoresAreUnderVote({scores}){
  let five_selected = false
  let zero_selected = false
  let all_null = true
  for(let i = 0; i < scores.length; i++){
    if(scores[i] != null) all_null = false
    if(scores[i] == null || scores[i] == 0) zero_selected = true
    if(scores[i] == 5) five_selected = true
  }
  return !(all_null || (five_selected && zero_selected))
}

// Renders a complete RCV ballot for a single race
export default function StarBallotView() {
  const ballotContext = useContext(BallotContext);

  const instructions = (
    <>
      <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }} component="li">
        Give your favorite(s) five stars.
      </Typography>
      <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }} component="li">
        Give your last choice(s) zero stars or leave blank.
      </Typography>
      <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }} component="li">
        Score other candidates as desired.
      </Typography>
      <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }} component="li">
        Equal scores indicate no preference.
      </Typography>
    </>
  )
  const footer = (
    <>
    {ballotContext.race.num_winners == 1 &&
      <Typography align='center' component="p">
        The two highest scoring candidates are finalists.<br/>Your full vote goes to the finalist you prefer.
      </Typography>
    }
    {ballotContext.race.num_winners > 1 && 
      <Typography align='center' component="p">
        {`This election uses STAR Voting and will elect ${ballotContext.race.num_winners} winners. In STAR Voting the two highest scoring candidates are finalists and the finalist preferred by more voters wins.`}
      </Typography>
    }
    </>
  )
  let warning = null;

  // disabling warnings until we have a better solution, see slack convo
  // https://starvoting.slack.com/archives/C01EBAT283H/p1677023113477139
  //if(scoresAreUnderVote({scores: scores})){
  //  warning=(
  //    <>
  //    Under STAR voting it's recommended to leverage the full voting scale in order to maximize the power of your vote
  //    </>
  //  )
  //}
  return (
    <GenericBallotView
      key="starBallot"
      columns={[0, 1, 2, 3, 4, 5]}
      instructions={instructions}
      leftTitle='Worst'
      rightTitle='Best'
      onClick={(i, j) => {
        const newScores = ballotContext.candidates.map(c => c.score);
        newScores[i] = newScores[i] === j ? null : j;
        ballotContext.onUpdate(newScores);
      }}
      footer={footer}
      starHeadings={true}
      warning={warning}
    />
  );
}

