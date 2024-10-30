import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import _uniqueId from "lodash/uniqueId";
import { useRef, useState } from "react";
import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import { scrollToElement, useSubstitutedTranslation } from "~/components/util";

export default ({ children, level = 0 }) => {
  const [viewDetails, setViewDetails] = useState(false);
  const expanderId = useRef(_uniqueId("detailExpander")).current;
  const {ballots, fetchBallots} = useAnonymizedBallots();

  let { t } = useSubstitutedTranslation();
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
          //fetchBallots();
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
      {viewDetails && children}
    </>
  );
}