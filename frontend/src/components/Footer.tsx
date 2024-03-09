import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import { Facebook, Instagram, Twitter, GitHub } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { useThemeSelector } from "../theme";
export default function Footer() {
  const themeSelector = useThemeSelector()
  return (
    <Box
      sx={{
        backgroundColor: themeSelector.mode === 'darkMode' ? 'brand.gray5' : 'brand.gray1',
        p: 6,
        width: '100%',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          <Grid item xs={12} md={4} >
            <Typography variant="h6" color="text.primary" gutterBottom sx={{textAlign: {xs: 'center',md: 'left'}}}>
              STAR Elections
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: {xs: 'center',md: 'left'}}}>
              A project of the Equal Vote Coalition
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: {xs: 'center',md: 'left'}}}>
              PO Box 51245, Eugene, OR, USA 97405
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: {xs: 'center',md: 'left'}}}>
              <a target="blank" href='https://www.starvoting.org/'>starvoting.org</a> | <a target="blank" href='https://www.equal.vote/'>equal.vote</a>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: {xs: 'center',md: 'left'}}}>
              <a href="mailto:elections@star.vote">elections@star.vote</a>
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{
              pl: 1, pr: 1,
              textAlign: 'center'
            }}>
              About Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              pl: 1, pr: 1
            }}>
              STAR Elections is here to help make your dream election accessible to vote in and easy to officiate. Our mission is to support and empower the adoption and use of STAR Voting and better voting methods for polling, surveys, and real elections at any scale and for any scenario.
              <br /><br />STAR Elections is a project of the Equal Vote Coalition 501c3.  <a target="blank" href='https://www.equal.vote/donate'>Donations</a> are the best way to support our work. All proceeds from the STAR Elections project go directly to helping fund and support the adoption and use of STAR Voting.
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
        {/* Commenting out copyright until that's figured out */}
        {/* <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {"Copyright © "}
            <Link color="inherit" href="https://your-website.com/">
              Your Website
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box> */}
      </Container>
    </Box >
  );
}