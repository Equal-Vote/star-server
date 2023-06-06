import React from "react";
import GenericBallotView from "./GenericBallotView.js";
import Typography from '@mui/material/Typography';

function scoresAreUnderVote({ scores }) {
  let five_selected = false
  let zero_selected = false
  let all_null = true
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] != null) all_null = false
    if (scores[i] == null || scores[i] == 0) zero_selected = true
    if (scores[i] == 5) five_selected = true
  }
  return !(all_null || (five_selected && zero_selected))
}

// Renders a complete RCV ballot for a single race
export default function StarPRBallotView({
  race,
  candidates,
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
    <Typography align='center' component="p">
      Winners in Proportional STAR Voting are selected in rounds. Each round elects the candidate with the highest total score, then designates that candidate's strongest supporters are represented. Subsequent rounds include all voters who are not yet fully represented.
    </Typography>
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
      race={race}
      candidates={candidates}
      columns={[0, 1, 2, 3, 4, 5]}
      instructions={instructions}
      leftTitle='Worst'
      rightTitle='Best'
      onClick={(i, j) => {
        const newScores = candidates.map(c => c.score);
        newScores[i] = newScores[i] === j ? null : j;
        onUpdate(newScores);
      }}
      footer={footer}
      starHeadings={true}
      warning={warning}
    />
  );
}

