import React, { useContext } from "react";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";
import GenericBallotView from "./GenericBallotView.js";

function scoresAreOverVote({scores}){
  let uniqueScores = new Set();
  for(let i = 0; i < scores.length; i++){
    if(scores[i] == null) continue;
    if(uniqueScores.has(scores[i])) return true;
    uniqueScores.add(scores[i]);
  }
  return false;
}

// Renders a complete RCV ballot for a single race
export default function RankedBallotView() {
  const ballotContext = useContext(BallotContext);
  const instructions = (
    <>
      <Typography align='left' component="li">
        Rank the candidates in order of preference.
      </Typography>
      { ballotContext.race.voting_method === 'RankedRobin' &&
        <Typography align='left' component="li">
          Equal ranks are allowed
        </Typography>
      }
      { ballotContext.race.voting_method === 'IRV' &&
        <Typography align='left' component="li">
          Equal ranks are not recommended, since they risk your vote being exhausted early
        </Typography>
      }
      <Typography align='left' component="li">
        Candidates left blank are ranked last
      </Typography>
    </>
  )

  const footer = (
    <>
    { ballotContext.race.voting_method === 'RankedRobin' &&
      <Typography align='left' component="li">
        Candidates are compared in 1-on-1 match-ups.<br/>
        A candidates wins a match-up if they are ranked
        higher than the opponent by more voters <br/>
      </Typography>
    }
    { ballotContext.race.voting_method == 'IRV' &&
    <>
      <Typography align='left' component="li">
        The winner is selected after a series of elimination rounds.
      </Typography>
      <Typography align='left' component="li">
        Each round the candidate with the least first-choice votes is eliminated and 
        their voters will be distributed to their next preference
      </Typography>
    </>
    }
    </>
  )

  let warning = null;

  // disabling warnings until we have a better solution, see slack convo
  // https://starvoting.slack.com/archives/C01EBAT283H/p1677023113477139
  //if(race.voting_method == 'IRV' && scoresAreOverVote({scores: scores})){
  //  warning=(
  //    <>
  //    Giving multiple candidates the same ranking is not recommended in IRV.<br/>
  //    This could result in your ballot getting exhausted early
  //    </>
  //  )
  //}

  return (
    <GenericBallotView
      key="rankedBallot"
      columns={['1st', '2nd', '3rd', '4th', '5th']}
      columnValues={[1, 2, 3, 4, 5]}
      instructions={instructions}
      onClick={(i, j) => {
        const newScores = ballotContext.candidates.map(c => c.score);
        newScores[i] = newScores[i] === j ? null : j;
        ballotContext.onUpdate(newScores);
      }}
      headingPrefix="Rank Candidates:"
      footer={footer}
      warning={warning}
    />
  );
}
