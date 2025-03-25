import { Box } from "@mui/material";
import React from "react";
import { useState } from 'react';
import Pages from "./Pages";

const WinnerResultPages = ({ children, numWinners }) => {
  const [page, setPage] = useState(1);
  const currentTab = page - 1;

  const childArray = React.Children.toArray(children); // Ensure it's an array

  return (
    < Pages
      pageCount={numWinners} page={page} setPage={setPage} title={false}
    >
      {childArray.map((child, i) => (
        <Box
          className={ i === currentTab ?
            'winnerResult activeWinnerResults' : 'winnerResult'
          }
          key={`winner-page-${i}`} // Ensure a stable, unique key
        >
          {child}
        </Box>
      ))}
    </Pages>
  );
};

export default WinnerResultPages
