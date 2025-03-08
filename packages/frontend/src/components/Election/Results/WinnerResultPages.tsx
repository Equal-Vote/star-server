import React from "react";
import { useState } from 'react';
import PaginatedBox from "./PaginatedBox";

const WinnerResultPages = ({ children, numWinners }) => {
  const [page, setPage] = useState(1);
  const currentTab = page - 1;

  /* if (Array.isArray(children))
    console.log("Already an array."); // bingo
  else
    console.log("`children` wasn't an array."); */
  
  const childArray = React.Children.toArray(children); // Ensure it's an array

  return (
    <PaginatedBox
      pageCount={numWinners} title={""} page={page} setPage={setPage}
    >
      {childArray.map((child, i) => (
        <div
          className={ i === currentTab ?
            'winnerResult activeWinnerResults' : 'winnerResult'
          }
          key={`winner-page-${i}`} // Ensure a stable, unique key
        >
          {child}
        </div>
      ))}
    </PaginatedBox>
  );
};

export default WinnerResultPages
