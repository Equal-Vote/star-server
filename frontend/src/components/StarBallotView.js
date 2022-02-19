import React from "react";
import { useState } from 'react'
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Slider from "@material-ui/core/Slider";
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton'
import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ProfilePic from '../images/blank-profile.png'
import { Link } from "@material-ui/core";
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import Box from '@material-ui/core/Box';

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

// Represents a single ranking of a single candidate
const Choice = ({ divKey, score, filled, onClick }) => (
  <div
    key={divKey}
    className={`circle ${filled ? "filled" : ""}`}
    onClick={onClick}
  >
    <p> {score} </p>
  </div>
);

// Represents the set of possible rankings for a single candidate
const Choices = ({ rowIndex, onClick, ranking }) =>
  Array(6)
    .fill(0)
    .map((elem, n) => (
      <Grid item xs={1} align='center'>
        <Choice
          key={`starChoice${rowIndex}-${n}`}
          divKey={`starDiv${rowIndex}-${n}`}
          score={n}
          filled={n + 1 === ranking}
          onClick={() => onClick(n + 1)}

        />
      </Grid>
    ));

// Represents the row of all data for a single candidate
const Row = ({ rowIndex, candidate, party, ranking, onClick }) => {

  const [expanded, setExpanded] = useState(false)
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
          {!expanded &&
            <IconButton aria-label="Home" onClick={() => { setExpanded(true) }}>
              <ExpandMore />
            </IconButton>}
          {expanded &&
            <IconButton aria-label="Home" onClick={() => { setExpanded(false) }}>
              <ExpandLess />
            </IconButton>}
        </Grid>
        <Grid item xs={4}>
          <Typography align='left' variant="h6" component="h6">
            {candidate.shortName}
          </Typography>
        </Grid>
        <Choices
          key={`starChoices${rowIndex}`}
          rowIndex={rowIndex}
          ranking={ranking}
          onClick={onClick}
        />

      </Grid>
      {expanded &&
        <Grid container style={{ backgroundColor: rowColor }}>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={5}>
            <Typography align='left'  component="h6">
              {candidate.fullName}
            </Typography>
            <Link color="inherit" href={candidate.candidateUrl} target="_blank" underline="always">
              <Typography align='left' component="h6">
                Candidate URL
              </Typography>
            </Link>
            <Typography align='left' s component="h6">
              {`Party: ${candidate.party}`}
            </Typography>
            <Link color="inherit" href={candidate.partyUrl} target="_blank" underline="always">
              <Typography align='left' component="h6">
                Party URL
              </Typography>
            </Link>


          </Grid>
          <Grid item xs={6}>
            <img src={ProfilePic} style={{ width: 200, height: 200 }} />
          </Grid>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={8}>
            <Typography align='left' s component="p">
              {candidate.bio}
            </Typography>


          </Grid>
        </Grid>
      }

    </>
  )
};

// Represents the list of rows corresponding to the list of candidates
const Rows = ({ candidates, rankings, onClick }) =>
  candidates.map((row, n) => (
    <>

      <Row
        rowIndex={n}
        key={`starRow${n}`}
        candidate={row}
        party={row.party}
        ranking={rankings[n]}
        onClick={(ranking) => onClick(n, ranking)}
      />
      <Divider style={{ width: '100%' }} />
    </>
  ));

// Represents the list of column headings for all possible rankings
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
export default function StarBallotView({
  race,
  candidates,
  rankings,
  onClick,
  readonly,
  onSubmitBallot
}) {
  return (
    <Container maxWidth="sm">
      <Box border={2} sx={{ mt: 5, width: '100%' }}>
        <Grid container alignItems="center" justify="center" direction="column">

          <Grid item style={{ padding: '0.8cm 0cm 0cm 0cm' }}>
            <Typography align='center' gutterBottom variant="h2" component="h6">
              {race.title}
            </Typography>
          </Grid>
          <Grid item>
            <Typography align='center' gutterBottom variant="h6" component="h6">
              {race.description}
            </Typography>
          </Grid>

          <Grid item xs={8} style={{ padding: '0cm 0cm 1cm 0cm' }}>
            <SingleWinnerInstructions />
          </Grid>

          <ColumnHeadings />
          <Divider style={{ width: '100%' }} />
          <Rows candidates={candidates} rankings={rankings} onClick={onClick} />


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
      <Button variant = 'outlined' onClick={onSubmitBallot}>Submit Ballot</Button>
    </Container>
  );
}
