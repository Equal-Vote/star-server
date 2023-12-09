import React from "react";
import { useState, useContext } from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {FaRegStar} from 'react-icons/fa';
import { Checkbox, FormControlLabel, FormGroup, Link } from "@mui/material";
import Box from '@mui/material/Box';
import useSnackbar from "../../SnackbarContext";
import { BallotContext } from "./VotePage";
import Elections from "../../Elections";
import useElection from "../../ElectionContextProvider";

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
const Choice = ({ enabled, divKey, score, filled, onClick }) =>
  <div
    key={divKey}
    className={`circle ${filled ? "filled" : ""} ${enabled? 'unblurred' : ''}`}
    onClick={onClick}
  >
    <p> {score} </p>
  </div>

// Represents the set of possible scores for a single candidate
const Choices = ({ enabled, rowIndex, onClick, score, columns }) =>
  columns.map((columnValue, n) => (
    <Grid item xs={1} align='center'>
      <Choice
        key={`starChoice${rowIndex}-${n}`}
        divKey={`starDiv${rowIndex}-${n}`}
        score={columns.length == 1 ? ' ' : columnValue}
        filled={columnValue === score}
        enabled={enabled}
        onClick={() => onClick(columnValue)}
      />
    </Grid>
  ));

// Represents the row of all data for a single candidate
const Row = ({ enabled, rowIndex, candidate, onClick, columns }) => {
  const [expanded, setExpanded] = useState(false)
  const hasExpandedData = HasExpandedData(candidate)

  // NOTE: I tried doing this in css with the :nth-child(even) pseudo class but it didn't work
  var rowColor = 'white'
  if (rowIndex % 2 == 0) {
    rowColor = 'var(--ballot-even-row-teal)';
  } else {
    rowColor = 'var(--brand-white)';
  }
  return (
    <>
      <Grid container alignItems="center" style={{ backgroundColor: rowColor }} className="row">
        <Grid item xs={1} >
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
          <Typography wrap className="rowHeading" sx={{wordwrap: "break-word"}} align={columns.length==1? 'right' : 'left'} variant="h6" component="h6">
            {candidate.candidate_name}
          </Typography>
        </Grid>
        <Choices
          key={`starChoices${rowIndex}`}
          rowIndex={rowIndex}
          score={candidate.score}
          onClick={onClick}
          enabled={enabled}
          columns={columns}
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
const Rows = ({ enabled, candidates, onClick, columns }) =>
  candidates.map((row, n) => (
    <>
      <Row
        rowIndex={n}
        key={`starRow${n}`}
        candidate={row}
        party={row.party}
        enabled={enabled}
        onClick={(score) => onClick(n, score)}
        columns={columns}
      />
      <Divider className="rowDivider"/>
    </>
  ));

// Represents the list of column headings for all possible scores
const ColumnHeadings = ({starHeadings, columns, leftTitle, rightTitle, headingPrefix}) => (
  <>
  { leftTitle != '' &&
    <Grid container alignItems="stretch" >
      <Grid item xs={5}></Grid>
      <Grid item xs={1}>
        <Typography align='center' className="columnDescriptor">
          {leftTitle}
        </Typography>
      </Grid>
      <Grid item xs={columns.length-2}></Grid>
      <Grid item xs={1}>
        <Typography align='center' className="columnDescriptor">
          {rightTitle}
        </Typography>
      </Grid>
    </Grid>
  }
    <Grid container alignItems="stretch">
      <Grid item xs={5}>
        { headingPrefix != '' &&
          <Typography className="headingPrefix">
            {headingPrefix}
          </Typography>
        }
      </Grid>
      {columns.length > 1 &&
        <ScoreColumnHeadings starHeadings={starHeadings} columns={columns}/>
      }
    </Grid>
  </>
);

const ScoreIcon = ({color, value}) => (
  <div align='center' style={{ position: 'relative', height: '50px'}}>
    <FaRegStar style={{color: color}} className="starIcon"/>
    <Typography className="scoreColumnHeading">
      {value}
    </Typography>
  </div>
)

const ScoreColumnHeadings = ({starHeadings, columns}) =>
  columns.map((columnTitle, n) => (
    <Grid item xs={1}>
      { starHeadings &&
        <ScoreIcon
          // NOTE: I tried doing this in CSS with :first-child but it didn't work
          color={(n != 0)? 'var(--ballot-star-teal)' : 'var(--brand-white)'}
          value={columnTitle}
        />
      }
      { !starHeadings && 
        <Typography align='center' variant="h6" component="h6">
          <b>{columnTitle}</b>
        </Typography>
      }
    </Grid>
  ));

export default function GenericBallotView({
  onClick,
  columns,
  instructions,
  columnValues=null,
  leftTitle='',
  rightTitle='',
  headingPrefix='',
  footer='',
  starHeadings=false,
  warning=null,
}) {
  if(columnValues == null){
    columnValues = columns
  }

  const {snack, setSnack} = useSnackbar();

  const { election } = useElection();

  const ballotContext = useContext(BallotContext);

  return (
      <Box border={2} sx={{ mt: 5, ml: 0, mr: 0, width: '100%' }} className="ballot">
        <Grid container alignItems="center" justify="center" direction="column">

          <Grid item sx={{ p: 3 }}>
            <Typography align='center' variant="h5" component="h4" fontWeight={'bold'}>
              {ballotContext.race.title}
            </Typography>
          </Grid>
          {ballotContext.race.description && 
            <Grid item sx={{ pb: 5, px: 3 }}>
            <Typography align='center' component="p" style={{whiteSpace: 'pre-line'}}>
              {ballotContext.race.description}
            </Typography>
          </Grid>}

          <Grid item xs={8} sx={{ pb:1, px:0 }} className="instructions">
            {instructions}
            { election.settings.require_instruction_confirmation &&
            <FormGroup>
              <FormControlLabel
                sx={{pb:5, pl:4, pt: 1}}
                control={
                  <Checkbox
                    disabled={ballotContext.instructionsRead}
                    checked={ballotContext.instructionsRead}
                    onChange={() => ballotContext.setInstructionsRead()}
                  />
                }
                label="I have read the instructions"
              />
            </FormGroup>
            }
          </Grid>

          <Box sx={{width: '100%', filter: ballotContext.instructionsRead? '' : 'blur(.4rem)'}} onClick={() => {
            if(ballotContext.instructionsRead) return;
            setSnack({
              message: 'Must read instructions first',
              severity: 'info',
              open: true,
              autoHideDuration: 6000,
            })
          }}>
            <ColumnHeadings
              starHeadings={starHeadings}
              columns={columns}
              leftTitle={leftTitle}
              rightTitle={rightTitle}
              headingPrefix={headingPrefix}
            />
            <Divider className="rowDivider"/>
            <Rows candidates={ballotContext.candidates} enabled={ballotContext.instructionsRead} onClick={onClick} columns={columnValues}/>
          </Box>

          <Grid item xs={10} sx={{ p:5, px:0 }} className="footer">
            {footer}
          </Grid>

          { warning !== null &&
            <Box style={{backgroundColor: 'var(--brand-gold)', marginLeft:'10%', marginRight:'10%', marginBottom:'.4cm', padding: '.2cm'}}>
              <Typography>⚠️</Typography>
              <Typography style={{paddingLeft:'30px'}}>{warning}</Typography>
            </Box>
          }
        </Grid>
      </Box>
  );
}
