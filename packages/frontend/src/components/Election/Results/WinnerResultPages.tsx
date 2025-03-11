import React from "react";
import { useState } from 'react';
import Pages from "./Pages";

const WinnerResultPages = ({ children, numWinners }) => {
  const [page, setPage] = useState(1);
  const currentTab = page - 1;

  /* if (Array.isArray(children))
    console.log("Already an array."); // bingo
  else
    console.log("`children` wasn't an array."); */
  
  const childArray = React.Children.toArray(children); // Ensure it's an array

  return (
    < Pages
      pageCount={numWinners} page={page} setPage={setPage} title={false}
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
    </Pages>
  );
};

export default WinnerResultPages
