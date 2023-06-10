import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import { Facebook, Instagram, Twitter, GitHub } from "@mui/icons-material";
import { Box } from "@mui/material";
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.grey[200],//Make theme pallete for this
        p: 6,
        width: '100%'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{
              pl: 1, pr: 1,
              textAlign: {
                xs: 'center',
                md: 'left'
              }
            }}>
              About Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              STAR Elections mission is to ensure that anyone who wants to use STAR Voting can. We are a volunteer run coalition project with Equal Vote and STAR Voting Action which allows people to set up and host their own STAR Voting elections.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} >
            <Typography variant="h6" color="text.primary" gutterBottom align='center'>
              STAR Voting
            </Typography>
            <Typography variant="body2" color="text.secondary" align='center'>
              OR, United States
            </Typography>
            <Typography variant="body2" color="text.secondary" align='center'>
              elections@equal.vote
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} >
            <Typography variant="h6" color="text.primary" gutterBottom sx={{
              pl: 1, pr: 1,
              textAlign: {
                xs: 'center',
                md: 'right'
              }
            }} >
              Follow Us
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}>


              <Link href="https://www.facebook.com/STARVoting" color="inherit"
                sx={{ pl: 1, pr: 1 }}>
                <Facebook />
              </Link>
              <Link
                href="https://www.instagram.com/starvoting/"
                color="inherit"
                sx={{ pl: 1, pr: 1 }}
              >
                <Instagram />
              </Link>
              <Link href="https://twitter.com/5starvoting" color="inherit"
                sx={{ pl: 1, pr: 1 }}>
                <Twitter />
              </Link>
              <Link href="https://github.com/Equal-Vote" color="inherit"
                sx={{ pl: 1, pr: 1 }}>
                <GitHub />
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {"Copyright © "}
            <Link color="inherit" href="https://your-website.com/">
              Your Website
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}