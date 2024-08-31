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
            padding: 3,
            borderRadius: 6,
            marginX: 3,

        }
    }

    , [chipColor]);


  return (
    <Chip
      label={<Typography variant="h4">{state}</Typography>}
      sx={chipStyle}
      variant="outlined"
    />
  );
}
