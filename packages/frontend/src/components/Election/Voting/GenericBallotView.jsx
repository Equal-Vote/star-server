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
import { useSubstitutedTranslation } from "~/components/util";
import BubbleGrid from "./BubbleGrid";

const ScoreIcon = ({opacity, value, fontSX}) => (
  <Box align='center' sx={{ position: 'relative', aspectRatio: '1 / 1'}}>
    <Box component="img" src="/images/star_icon.png" sx={{opacity: opacity, aspectRatio: '1 / 1', height: {xs: '100%', sm: '80%'}}} className="starIcon"/>
    <Typography className="scoreColumnHeading" sx={{...fontSX}}>
      {value}
    </Typography>
  </Box>
)

const GenericBallotGrid = ({
  ballotContext,
  starHeadings,
  columns,
  headingPrefix,
  onClick,
  columnValues,
  leftTitle,
  rightTitle,
  warningColumns,
  alertBubbles,
}) => {
  const numHeaderRows = (leftTitle != '') + (columns.length > 1);
  const dividerHeight = '2px';  //  Note that we can't use gap here
  const makeArea = (row, column, width=1, height=1) => {
    return `${row} / ${column} / ${row+height} / ${column+width}`
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

  /* TODO: this code was refactored to use CSS grid. This made it cleaner on an structural level, but the code looks messy and could be cleaned up*/
  return <Box sx={{
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
        <Box key={i} className={(i == numHeaderRows + 2*ballotContext.candidates.length || (i == 0 && numHeaderRows==0)) && 'hiddenInHero'} sx={{gridArea: makeArea(i+1, 1, 2+columns.length), mx: '-500px', background: rowColor(i)}}/>
      )}
      {/* Column Warnings */}
      {warningColumns.map((columnValue, index) =>
        <Box key={index} backgroundColor="brand.goldTransparent20" sx={{gridArea: makeArea(1, 1+columnValue, 1, numHeaderRows + 1 + ballotContext.candidates.length * 2), height: '100%'}}/>
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

      {/* Candidates */}
      {ballotContext.candidates.map((candidate,i) =>
        <Box key={i} sx={{
          gridArea: makeArea(numHeaderRows+1+2*i+1, 1),
        }}>
          <Typography wrap='true' className="rowHeading" align='left' variant="h6" component="h6" sx={{
            wordwrap: "break-word",
            mx: '10px',
          }}>
            {candidate.candidate_name}
          </Typography>
        </Box>
      )}

      {/* Bubble Grid */}
      <BubbleGrid
        candidates={ballotContext.candidates}
        columnValues={columnValues}
        columns={columns}
        numHeaderRows={numHeaderRows}
        instructionsRead={ballotContext.instructionsRead}
        onClick={onClick}
        makeArea={makeArea}
        fontSX = {fontSX}
        alertBubbles={alertBubbles}
        />
    </Box>
  </Box>
}

export default function GenericBallotView({
  onClick,
  columns,
  methodKey,
  columnValues=null,
  starHeadings=false,
  warning,
  onlyGrid=false,
  warningColumns=[],
  alertBubbles=[],
}) {
  if(columnValues == null){
    columnValues = columns
  }
  
  const flags = useFeatureFlags();
  const { election } = useElection();

  const ballotContext = useContext(BallotContext);

  const {t} = useSubstitutedTranslation(election?.settings.term_type ?? 'election');

  const methodName = t(`methods.${methodKey}.full_name`);

  const leftKey = `ballot.methods.${methodKey}.left_title`;
  const leftTitle = (t(leftKey) == leftKey)? '' : t(leftKey);
  const rightTitle = (t(leftKey) == leftKey)? '' : t(`ballot.methods.${methodKey}.right_title`);

  const headingPrefixKey = `ballot.methods.${methodKey}.heading_prefix`;
  const headingPrefix = (t(headingPrefixKey) == headingPrefixKey)? '' : t(headingPrefixKey);

  const learnLinkKey = `methods.${methodKey}.learn_link`
  const learnLink = (t(learnLinkKey) == learnLinkKey)? '' : t(learnLinkKey);


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
        warningColumns={warningColumns}
        alertBubbles={alertBubbles}
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
              {t('ballot.this_election_uses', {voting_method: methodName})}
            </Typography>

            {t(`ballot.methods.${methodKey}.instruction_bullets`).map(bullet => 
              <Typography align='left' sx={{ typography: { sm: 'body1', xs: 'body2' } }} component="li">
                {bullet}
              </Typography>
            )}
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
                label={t('ballot.instructions_checkbox')}
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
            warningColumns={warningColumns}
            alertBubbles={alertBubbles}
          />

          <Grid item xs={10} sx={{ p:5, px:4 }} className="footer">
            {t(`ballot.methods.${methodKey}.footer_${ballotContext.race.num_winners == 1 ? 'single_winner' : 'multi_winner'}`,
              {n: ballotContext.race.num_winners})
            }
            <br/>
            {learnLink != '' && <Link href={learnLink} target='_blank'>{t('ballot.learn_more', {voting_method: methodName})}</Link>}
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
