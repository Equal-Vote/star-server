import React from "react";
import { useState } from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ProfilePic from '../../../images/blank-profile.png'
import { Link } from "@mui/material";
import Box from '@mui/material/Box';

function RowHeading({ candidate, party, className }) {
  return (
    <td className={`rowHeading ${className}`}>
      <span className="candidate">{candidate}</span>
      {party && (
        <>
          <br />
          {party}
        </>
      )}
    </td>
  );
}

function HasExpandedData(candidate) {
  if (candidate.full_name) return true
  if (candidate.candidate_url) return true
  if (candidate.party) return true
  if (candidate.partyUrl) return true
  if (candidate.photo_filename) return true
  if (candidate.bio) return true
  return false
}

// Represents a single score of a single candidate
const Choice = ({ divKey, score, filled, onClick }) => (
  <div
    key={divKey}
    className={`circle ${filled ? "filled" : ""}`}
    onClick={onClick}
  >
    <p> {score} </p>
  </div>
);

// Represents the set of possible scores for a single candidate
const Choices = ({ rowIndex, onClick, score }) =>
  Array(6)
    .fill(0)
    .map((elem, n) => (
      <Grid item xs={1} align='center'>
        <Choice
          key={`starChoice${rowIndex}-${n}`}
          divKey={`starDiv${rowIndex}-${n}`}
          score={n}
          filled={n === score}
          onClick={() => onClick(n)}

        />
      </Grid>
    ));

// Represents the row of all data for a single candidate
const Row = ({ rowIndex, candidate, party, score, onClick }) => {

  const [expanded, setExpanded] = useState(false)
  const hasExpandedData = HasExpandedData(candidate)
  var rowColor = 'white'
  if (rowIndex % 2 == 0) {
    rowColor = '#f8f8f8';
  } else {
    rowColor = 'white';
  }
  return (
    <>
      <Grid container alignItems="center" style={{ backgroundColor: rowColor }}>
        <Grid item xs={1}>
          {!expanded && hasExpandedData &&
            <IconButton aria-label="Home" onClick={() => { setExpanded(true) }}>
              <ExpandMore />
            </IconButton>}
          {expanded &&  hasExpandedData &&
            <IconButton aria-label="Home" onClick={() => { setExpanded(false) }}>
              <ExpandLess />
            </IconButton>}
        </Grid>
        <Grid item xs={4}>
          <Typography wrap sx={{wordwrap: "break-word"}} align='left' variant="h6" component="h6">
            {candidate.candidate_name}
          </Typography>
        </Grid>
        <Choices
          key={`starChoices${rowIndex}`}
          rowIndex={rowIndex}
          score={score}
          onClick={onClick}
        />

      </Grid>
      {expanded && hasExpandedData &&
      <>
        <Grid container style={{ backgroundColor: rowColor }}>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={5}>
            {candidate.full_name &&
            <Typography align='left' component="h6">
              {candidate.full_name}
            </Typography>}
            {candidate.candidate_url && <Link color="inherit" href={candidate.candidate_url} target="_blank" underline="always">
              <Typography align='left' component="h6">
                Candidate URL
              </Typography>
            </Link>}
            {candidate.party &&
              <Typography align='left' s component="h6">
                {`Party: ${candidate.party}`}
              </Typography>}
            {candidate.partyUrl &&
              <Link color="inherit" href={candidate.partyUrl} target="_blank" underline="always">
                <Typography align='left' component="h6">
                  Party URL
                </Typography>
              </Link>}


          </Grid>
          {candidate.photo_filename &&
          <Grid item xs={6}>
            <img src={candidate.photo_filename} style={{ width: 200, height: 200 }} />
          </Grid>}
          </Grid>
          
          <Grid container style={{ backgroundColor: rowColor }}>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={8}>
            <Typography align='left' s component="p" style={{whiteSpace: 'pre-line'}}>
              {candidate.bio}
            </Typography>
          </Grid>
        </Grid>
        </>
      }

    </>
  )
};

// Represents the list of rows corresponding to the list of candidates
const Rows = ({ candidates, scores, onClick }) =>
  candidates.map((row, n) => (
    <>

      <Row
        rowIndex={n}
        key={`starRow${n}`}
        candidate={row}
        party={row.party}
        score={scores[n]}
        onClick={(score) => onClick(n, score)}
      />
      <Divider style={{ width: '100%' }} />
    </>
  ));

// Represents the list of column headings for all possible scores
const ColumnHeadings = () => (
  <>
    <Grid container alignItems="stretch">
      <Grid item xs={5}>

      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          0
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          1
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          2
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          3
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          4
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Typography align='center' variant="h6" component="h6">
          5
        </Typography>
      </Grid>
    </Grid>
  </>
);
const SingleWinnerInstructions = () => (
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

// Renders a complete RCV ballot for a single race
export default function GenericBallotView({
  race,
  candidates,
  scores,
  onClick
}) {
  return (
      <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }}>
        <Grid container alignItems="center" justify="center" direction="column">

          <Grid item style={{ padding: '0.8cm 0cm 0cm 0cm' }}>
            <Typography align='center' gutterBottom variant="h2" component="h6">
              {race.title}
            </Typography>
          </Grid>
          <Grid item>
            <Typography align='center' gutterBottom variant="h6" component="h6" style={{whiteSpace: 'pre-line'}}>
              {race.description}
            </Typography>
          </Grid>

          <Grid item xs={8} style={{ padding: '0cm 0cm 1cm 0cm' }}>
            <SingleWinnerInstructions />
          </Grid>

          <ColumnHeadings />
          <Divider style={{ width: '100%' }} />
          <Rows candidates={candidates} scores={scores} onClick={onClick} />


          <Grid item xs={10} style={{ padding: '0.4cm 0cm' }}>
            {race.num_winners == 1 && race.voting_method == 'STAR' &&
              <Typography align='center' component="p">
                This election uses STAR Voting and will elect 1 winner. In STAR Voting the two highest scoring candidates are finalists and the finalist preferred by more voters wins.
              </Typography>
            }
            {race.num_winners > 1 && race.voting_method == 'STAR' &&
              <Typography align='center' component="p">
                {`This election uses STAR Voting and will elect ${race.num_winners} winners. In STAR Voting the two highest scoring candidates are finalists and the finalist preferred by more voters wins.`}
              </Typography>
            }
          </Grid>

        </Grid>
      </Box>
  );
}
