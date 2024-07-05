import React, { useContext } from "react";
import Typography from '@mui/material/Typography';
import { BallotContext } from "./VotePage";
import GenericBallotView from "./GenericBallotView";
import { useSubstitutedTranslation } from "~/components/util";

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
export default function RankedBallotView({onlyGrid=false}) {
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


  const { t } = useSubstitutedTranslation();

  let columnValues = ballotContext.candidates.slice(0, Number(process.env.REACT_APP_MAX_BALLOT_RANKS??999999)).map((c, i) => i+1)
  let columns = columnValues.map(v => t('number.rank', {count: v, ordinal: true}))

  return (
    <GenericBallotView
      key="rankedBallot"
      methodName={
        (ballotContext.race.voting_method == 'IRV' ? 'Ranked Choice Voting' : '') + 
        (ballotContext.race.voting_method == 'RankedRobin' ? 'Ranked Robin Voting' : '')
      }
      learnMoreLink={
        (ballotContext.race.voting_method == 'IRV' ? 'https://www.starvoting.org/rcv_v_star' : '') + 
        (ballotContext.race.voting_method == 'RankedRobin' ? 'https://www.equal.vote/ranked_robin' : '')
      }
      columnValues={columnValues}
      columns={columns}
      instructions={instructions}
      onClick={(i, j) => {
        const newScores = ballotContext.candidates.map(c => c.score);
        newScores[i] = newScores[i] === j ? null : j;
        ballotContext.onUpdate(newScores);
      }}
      headingPrefix="Rank Candidates:"
      footer={footer}
      warning={warning}
      onlyGrid={onlyGrid}
    />
  );
}
