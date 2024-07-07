import React from "react";
import { useState, useContext } from 'react'
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Checkbox, FormControlLabel, FormGroup, Link, Paper } from "@mui/material";
import Box from '@mui/material/Box';
import useSnackbar from "../../SnackbarContext";
import { BallotContext } from "./VotePage";
import useElection from "../../ElectionContextProvider";
import useFeatureFlags from "../../FeatureFlagContextProvider";

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
    <Grid item key={n} xs={1} align='center'>
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
          <Typography wrap='true' className="rowHeading" sx={{wordwrap: "break-word"}} align={columns.length==1? 'right' : 'left'} variant="h6" component="h6">
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
    <Box key={n}>
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
    </Box>
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
        <Box display='flex' flexDirection='column-reverse' sx={{height: '100%'}}>
          <Typography className="headingPrefix">
            {headingPrefix}
          </Typography>
        </Box>
        }
      </Grid>
      {columns.length > 1 &&
        <ScoreColumnHeadings starHeadings={starHeadings} columns={columns}/>
      }
    </Grid>
  </>
);

const ScoreIcon = ({opacity, value, fontSX}) => (
  <Box align='center' sx={{ position: 'relative', aspectRatio: '1 / 1'}}>
    <Box component="img" src="/images/star_icon.png" sx={{opacity: opacity, aspectRatio: '1 / 1', height: {xs: '100%', sm: '80%'}}} className="starIcon"/>
    <Typography className="scoreColumnHeading" sx={{...fontSX}}>
      {value}
    </Typography>
  </Box>
)

const ScoreColumnHeadings = ({starHeadings, columns}) =>
  columns.map((columnTitle, n) => (
    <Grid key={n} item xs={1}>
      { starHeadings &&
        <ScoreIcon
          // NOTE: I tried doing this in CSS with :first-child but it didn't work
          opacity={n == 0? '0' : '1'}
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

const GenericBallotGrid = ({
  ballotContext,
  starHeadings,
  columns,
  leftTitle,
  rightTitle,
  headingPrefix,
  onClick,
  columnValues,
}) => {
  const numHeaderRows = (leftTitle != '') + (columns.length > 1);
  const dividerHeight = '2px';  //  Note that we can't use gap here
  const makeArea = (row, column, width=1) => {
    return `${row} / ${column} / ${row+1} / ${column+width}`
  }
  const rowColor = (i) => {
    if(i < numHeaderRows) return 'var(--brand-white)';
    const colors = [
      'var(--ballot-border-teal)',
      'var(--ballot-even-row-teal)',
      'var(--ballot-border-teal)',
      'var(--brand-white)',
    ]
    return colors[(i-numHeaderRows)%4];
  }

  const fontSX = {fontSize: {xs: '.7rem', md: '.8rem'}}

  return <>
    <Box sx={{
      width: '100%',
      display: 'flex',
      /* this is for the gap color, it's not possible to set that directly https://stackoverflow.com/questions/45884630/css-grid-is-it-possible-to-apply-color-to-grid-gaps*/ 
      overflow: 'hidden',
    }}>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `fit-content(200px) repeat(${columns.length}, minmax(30px, 40px))`,
        gridTemplateRows: `${leftTitle != ''? 'auto' : ''} ${columns.length > 1? 'auto': ''} ${dividerHeight} ${[...Array(ballotContext.candidates.length)].map(_ => `auto ${dividerHeight}`).join(' ')}`,
        filter: ballotContext.instructionsRead? '' : 'blur(.4rem)',
        margin: 'auto',
        px: '10px',
        overflow: 'visible', // important for the row backgrounds
      }} onClick={() => {
        if(ballotContext.instructionsRead) return;
        setSnack({
          message: 'Must read instructions first',
          severity: 'info',
          open: true,
          autoHideDuration: 6000,
        })
      }}>
        
        {/* Row Backgrounds */}
        {/*not sure why the [...] is necessary but it is*/
        [...Array(numHeaderRows + 2*ballotContext.candidates.length + 1)].map((_,i) => 
          <Box sx={{gridArea: makeArea(i+1, 1, 2+columns.length), mx: '-500px', background: rowColor(i), height: '100%'}}/>
        )}

        {/* HEADING TITLES (i.e. worst best for STAR )*/}
        {leftTitle != '' && <>
          {/* 1 px / 100 px is a hack to make sure the titles don't affect the other boxes in the column */}
          <Box sx={{width: '1px', margin: 'auto', gridArea: makeArea(1, 2)}}>
            <Typography width='100px' align='center' className="columnDescriptor" sx={{transform: 'translate(-50%)'}}>{leftTitle}</Typography>
          </Box>
          <Box sx={{width: '1px', margin: 'auto', gridArea: makeArea(1, 1+columns.length)}}>
            <Typography width='100px' align='center' className="columnDescriptor" sx={{transform: 'translate(-50%)'}}>{rightTitle}</Typography>
          </Box>
        </>}

        {/* HEADINGS (i.e. stars, ranks, etc) */}
        {columns.length > 1 && <>
          <Box display='flex' flexDirection='column-reverse' sx={{height: '100%', gridArea: makeArea(numHeaderRows, 1)}} >
            <Typography className="headingPrefix" sx={{mx: '10px'}}>
              {headingPrefix}
            </Typography>
          </Box>
          {columns.map((columnTitle, j) => <Box key={j} sx={{gridArea: makeArea(numHeaderRows, 2+j)}}>
            { starHeadings &&
              <ScoreIcon
                // NOTE: I tried doing this in CSS with :first-child but it didn't work
                opacity={j == 0? '0' : '1'}
                value={columnTitle}
                fontSX={fontSX}
              />
            }
            { !starHeadings && 
              <Typography align='center' sx={{...fontSX}}>
                <b>{columnTitle}</b>
              </Typography>
            }
          </Box>)}
        </>}

        {/* Bubble Grid (i.e. candidate / bubble pairs) */}
        {ballotContext.candidates.map((candidate,i) => <>
          <Box sx={{
            gridArea: makeArea(numHeaderRows+1+2*i+1, 1)
          }}>
            <Typography wrap='true' className="rowHeading" align='left' variant="h6" component="h6" sx={{
              wordwrap: "break-word",
              mx: '10px',
            }}>
              {candidate.candidate_name}
            </Typography>
          </Box>
          {columnValues.map((columnValue, j) =>
            <Box 
              key={j}
              className={`circle ${columnValue === ballotContext.candidates.score ? "filled" : ""} ${ballotContext.instructionsRead? 'unblurred' : ''}`}
              onClick={() => onClick(columnValue)}
              sx={{
                margin: 'auto',
                gridArea: makeArea(numHeaderRows+1+2*i+1, 2+j),
              }}
            >
              <Typography varaint='p' sx={{...fontSX}}> {columns.length == 1 ? ' ' : columnValue} </Typography>
            </Box>
          )}
        </>
        )}
      </Box>
    </Box>

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
  </>
}

export default function GenericBallotView({
  onClick,
  columns,
  methodName,
  instructions,
  learnMoreLink,
  columnValues=null,
  leftTitle='',
  rightTitle='',
  headingPrefix='',
  footer='',
  starHeadings=false,
  warning=null,
  onlyGrid=false,
}) {
  if(columnValues == null){
    columnValues = columns
  }

  const flags = useFeatureFlags();
  const { election } = useElection();

  const ballotContext = useContext(BallotContext);

  if(onlyGrid)
    return <Box border={2} sx={{ mt: 0, ml: 0, mr: 0, width: '100%' }} className="ballot">
      <GenericBallotGrid
        ballotContext={ballotContext}
        starHeadings={starHeadings}
        columns={columns}
        leftTitle={leftTitle}
        rightTitle={rightTitle}
        headingPrefix={headingPrefix}
        onClick={onClick}
        columnValues={columnValues}
      />
    </Box>

  return (
      <Box border={2} sx={{ mt: 0, ml: 0, mr: 0, width: '100%' }} className="ballot">
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

          <Grid item xs={8} sx={{ pb:1, px:4 }} className="instructions">
            <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }}>
              This election uses {methodName}
            </Typography>

            {instructions}
            { !flags.isSet('FORCE_DISABLE_INSTRUCTION_CONFIRMATION') && election.settings.require_instruction_confirmation &&
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

          <GenericBallotGrid
            ballotContext={ballotContext}
            starHeadings={starHeadings}
            columns={columns}
            leftTitle={leftTitle}
            rightTitle={rightTitle}
            headingPrefix={headingPrefix}
            onClick={onClick}
            columnValues={columnValues}
          />

          <Grid item xs={10} sx={{ p:5, px:0 }} className="footer">
            {footer}
            <br/>
            <Link href={learnMoreLink} target='_blank'>Learn more about {methodName}</Link>
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
