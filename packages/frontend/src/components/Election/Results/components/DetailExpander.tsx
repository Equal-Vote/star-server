import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, MenuItem, Select, Typography } from "@mui/material";
import _uniqueId from "lodash/uniqueId";
import { useEffect, useRef, useState } from "react";
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import { scrollToElement, useSubstitutedTranslation } from "~/components/util";
import WidgetContainer from "./WidgetContainer";
import HeadToHeadWidget from "./HeadToHeadWidget";
import VoterProfileWidget from "./VoterProfileWidget";
import VoterIntentWidget from "./VoterIntentWidget";
import VoterErrorStatsWidget from "./VoterErrorStatsWidget";
import ColumnDistributionWidget from "./ColumnDistributionWidget";
import ScoreRangeWidget from "./ScoreRangeWidget";
import NameRecognitionWidget from "./NameRecognitionWidget";
import useRace from "~/components/RaceContextProvider";

export default ({ children, level = 0 }) => {
  const [viewDetails, setViewDetails] = useState(false);
  const expanderId = useRef(_uniqueId("detailExpander")).current;
  const {ballots, fetchBallots} = useAnonymizedBallots();
  const [selector, setSelector] = useState(0);
  const selectorTitleKeys = new Map();
  selectorTitleKeys.set(VoterProfileWidget, 'results_ext.voter_profile_title');
  selectorTitleKeys.set(HeadToHeadWidget, 'results_ext.head_to_head_title');
  selectorTitleKeys.set(VoterIntentWidget, 'results_ext.voter_intent_title');
  selectorTitleKeys.set(VoterErrorStatsWidget, 'results_ext.voter_error_title');
  selectorTitleKeys.set(ColumnDistributionWidget, 'results_ext.column_distribution_title');
  selectorTitleKeys.set(ScoreRangeWidget, 'results_ext.score_range_title');
  selectorTitleKeys.set(NameRecognitionWidget, 'results_ext.name_recognition_title');

  let { t } = useRace();

  let title = [
    t("results.details"),
    t("results.additional_info"),
  ][level];

  return (
    <>
      <Box
        className={`detailExpander ${expanderId}`}
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
          justifyContent: "center",
          cursor: "pointer",
          alignItems: "center",
        }}
        onClick={() => {
          if (!viewDetails)
            scrollToElement(document.querySelector(`.${expanderId}`));
          fetchBallots();
          setViewDetails(!viewDetails);
        }}
      >
        <Typography variant="h6" sx={{ "@media print": { display: "none" } }}>
          {title}
        </Typography>
        {!viewDetails && (
          <ExpandMore sx={{ "@media print": { display: "none" } }} />
        )}
        {viewDetails && (
          <ExpandLess sx={{ "@media print": { display: "none" } }} />
        )}
      </Box>
      {viewDetails && ballots && level == 0 && children}
      {viewDetails && ballots && level == 1 && <>
        <Select
          value={selector}
          label={t('results_ext.candidateSelector')}
          onChange={(e) => setSelector(e.target.value as number)}
          sx={{mb: 2, width: '300px', textAlign: 'left'}}
        >
            {children.map((c, i) => <MenuItem key={i} value={i}>{t(selectorTitleKeys.get(c.type), {includeTips: false})}</MenuItem>)}
        </Select>
        {/*<Select
          native
          value={selector}
          label={t('results_ext.candidateSelector')}
          onChange={(e) => setSelector(e.target.value as number)}
          sx={{mb: 2, width: '300px', textAlign: 'left'}}
        >
          <optgroup label='Detailed Results'>
            {children.slice(0,2).map((c, i) => <option key={i} value={i}>{t(selectorTitleKeys.get(c.type), {includeTips: false})}</option>)}
          </optgroup>
          <optgroup label='Stats for Nerds'>
            {children.slice(2).map((c, i) => <option key={i} value={i}>{t(selectorTitleKeys.get(c.type), {includeTips: false})}</option>)}
          </optgroup>
        </Select>*/}
        <WidgetContainer >
          {children[selector]}
        </WidgetContainer>
      </>}
      {viewDetails && !ballots && 'Loading...'}
    </>
  );
}