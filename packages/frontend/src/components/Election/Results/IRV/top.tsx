/*
  IRVTopResultsView --
  View the part of the IRV results that come at the top, above the optional
  extra details.
*/

import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { irvContext, irvWinnerSearch } from "./ifc";
import { IRVWinnerView } from "./winner";
import Pages from "../Pages";

export function IRVTopResultsView ( {wins, context}:
  {wins: irvWinnerSearch[], context: irvContext}
) {

  /* Only paginate if there is more than one page. */

  if (1 === wins.length)
    return IRVWinnerView({win: wins[0], context});

  const [page, setPage] = useState(1);
  const winIndex = page - 1;
  return <>
    <Typography variant="h5" component="h5">
      First and last round for finding each winner (TODO: i18n)
    </Typography>
    <Pages
      pageCount={wins.length} page={page} setPage={setPage} title={false}
    >
      <IRVWinnerView win={wins[winIndex]} context={context}/>
    </Pages>
  </>
}
