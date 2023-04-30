import React, { useState } from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import StarBallotView from "./StarBallotView";
import PluralityBallotView from "./PluralityBallotView.js";
import RankedBallotView from "./RankedBallotView.js";
import ApprovalBallotView from "./ApprovalBallotView.js";

export default function BallotPageSelector({page, races, onUpdate}) {
  var race, candidates, scores; 
  if(page.type == "ballot"){
    race = races[page.race_index];
    candidates = races[page.race_index].candidates;
    scores = page.scores;
  }
  // TODO: it would be more scalable if we selected the class from a dictionary, but I'm not sure how to do that in react
  return (
    <>
    {page.type == 'info' &&
      <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%', padding: '10%', minHeight: '500px' }} className="ballot">
        {page.voting_method == 'STAR' &&
          <>
          The next race uses STAR Voting, here's how it works
          <img style={{maxWidth: '100%'}} src="https://assets.nationbuilder.com/unifiedprimary/pages/227/features/original/How_Does_STAR_Voting_Work___04_17_23.png?1681784554"/>
          <hr/>
          <iframe width="480" height="270" src="https://www.youtube.com/embed/3-mOeUXAkV0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </>
        }
        {page.voting_method == 'Plurality' &&
          <>
          The next race uses Plurality Voting, just fill in 1 bubble
          <hr/>
          <iframe width="480" height="270" src="https://www.youtube.com/embed/Nu4eTUafuSc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </>
        }
        {page.voting_method == 'IRV' &&
          <>
          The next race uses Ranked Choice Voting
          <hr/>
          <iframe width="480" height="270" src="https://www.youtube.com/embed/Nu4eTUafuSc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </>
        }
        {page.voting_method == 'Ranked-Robin' &&
          <>
          The next race uses Ranked-Robin, here's how it works
          <img style={{maxWidth: '100%'}} src="https://assets.nationbuilder.com/unifiedprimary/pages/815/attachments/original/1673647821/How_Does_Ranked_Robin_Work_.png?1673647821"/>
          </>
        }
        {page.voting_method == 'Approval' &&
          <>
          The next race uses Approval Voting, here's how it works
          <iframe width="480" height="270" src="https://www.youtube.com/embed/db6Syys2fmE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </>
        }
      </Box>
    }
    {page.type == 'ballot' &&
      <>
        {page.voting_method == 'STAR' &&
          <StarBallotView
            race={race}
            candidates={candidates}
            scores={scores}
            onUpdate={onUpdate}
            />
        }
        {page.voting_method == 'Plurality' && 
          <PluralityBallotView
            race={race}
            candidates={candidates}
            scores={scores}
            onUpdate={onUpdate}
            />
        }
        {(page.voting_method == 'Ranked-Robin' || race.voting_method == "IRV") && 
          <RankedBallotView
            race={race}
            candidates={candidates}
            scores={scores}
            onUpdate={onUpdate}
            />
        }
        {(page.voting_method == 'Approval') && 
          <ApprovalBallotView
            race={race}
            candidates={candidates}
            scores={scores}
            onUpdate={onUpdate}
            />
        }
      </>
    }
    </>
  );
}
