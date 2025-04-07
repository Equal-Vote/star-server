/*
  Describe, to the default level of detail, how the IRV tally found a winner.
*/

import { Box } from "@mui/material";
import Typography from '@mui/material/Typography';
import WidgetContainer from '../components/WidgetContainer';
import Widget from '../components/Widget';
import { irvContext, irvWinnerSearch } from "./ifc";
import { IRVRoundView } from "./round";

export function IRVWinnerView ( {win, context}:{
  win: irvWinnerSearch, context: irvContext
}) {
  const {t} = context;

  if (win.firstRound === win.lastRound) {
    return <Box className="resultWidget"><WidgetContainer>
      <Widget title="Winner found on first round (TODO: i18n)">
        <IRVRoundView round={win.firstRound} context={context}/>
      </Widget>
    </WidgetContainer></Box>
  }

  return <Box className="resultWidget"><WidgetContainer>
    <Widget title={t('results.rcv.first_choice_title')}>
      <IRVRoundView round={win.firstRound} context={context}/>
    </Widget>
    <Widget title={t('results.rcv.final_round_title')}>
      <IRVRoundView round={win.lastRound} context={context}/>
    </Widget>
  </WidgetContainer></Box>

}
