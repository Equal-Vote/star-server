import { BorderColor } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import { useMemo } from 'react';

export default function ElectionStateChip({ state }: { state: 'draft' | 'finalized' | 'open' | 'closed' | 'archived' }) {
  const chipColor = useMemo(() => {
    switch (state) {
        case 'draft':
            return 'purple';
        case 'finalized':
            return 'green';
        case 'open':
            return 'blue';
        case 'closed':
            return 'red';
        case 'archived':
            return 'gray4';
        }
    }
    , [state]);
    const chipStyle = useMemo(() => {
        return {
            backgroundColor: `brand.${chipColor}Transparent20`,
            color: `brand.${chipColor}`,
            borderColor: `brand.${chipColor}`,
            marginX: 2,

        }
    }

    , [chipColor]);


  return (
    <Chip
      label={
        <Typography variant="h5" component="span">
          {state}
        </Typography>
      }
      sx={chipStyle}
      variant="outlined"
    />
  );
}
