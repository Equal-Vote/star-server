import { Box, Typography } from '@mui/material';
import { Candidate } from '@equal-vote/star-vote-shared/domain_model/Candidate';
interface CandidateLabelProps {
    candidate: Candidate;
    gridArea: string;
}
export default function CandidateLabel ({candidate, gridArea}: CandidateLabelProps) {
    return (
        <Box
         sx={{
            gridArea: gridArea
          }}>
            <Typography className="rowHeading" align='left' variant="h6" component="h6" sx={{
              wordwrap: "break-word",
              mx: '10px',
            }}>
              {candidate.candidate_name}
            </Typography>
          </Box>
    );
}