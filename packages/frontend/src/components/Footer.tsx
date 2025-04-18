import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { Facebook, Instagram, X, GitHub, ContentCopy } from '@mui/icons-material';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import { useThemeSelector } from '../theme';
import { useSubstitutedTranslation } from './util';
export default function Footer() {
	const themeSelector = useThemeSelector();
	const { t } = useSubstitutedTranslation();
	return (
		<Box
			sx={{
				backgroundColor: 'black',
				color: 'white',
				p: 6,
				width: '100%',
				mt: 'auto',
				'@media print': {
					display: 'none'
				}
			}}
		>
			<Container maxWidth="lg">
				<Grid container spacing={5}>
					<Grid item xs={12} md={4}>
						<Typography
							variant="h6"
              component="h2"
							gutterBottom
							sx={{
								textAlign: { xs: 'center', md: 'left' },
							}}
						>
							{t('footer.project_title')}
						</Typography>
						<Typography
							variant="body2"
							sx={{ textAlign: 'left' }}
						>
							{t('footer.project_description')}
						</Typography>
            <br/>
						<Link
							href="https://www.starvoting.org/"
							sx={{
								color: 'var(--brand-pop)',
								textDecoration: 'underline',
							}}
						>
							starvoting.org
						</Link>
						<br />
            <Tooltip title="Equal Vote Coalition" arrow placement="top">
              <Link
                href="https://www.equal.vote/"
                sx={{ 
                  color: 'var(--brand-pop)',
                  textDecoration: 'underline',
                }}
              >
                equal.vote
              </Link>
            </Tooltip>
            <br />
              <Link
                href="mailto:elections@bettervoting.com"
                sx={{
                  color: 'var(--brand-pop)',
                  textDecoration: 'underline'
                }}
              >
                elections@bettervoting.com
              </Link>
					</Grid>
					<Grid item xs={12} md={4}>
						<Typography
							variant="h6"
              component="h2"
							gutterBottom
							sx={{
								pl: 1,
								pr: 1,
								textAlign: { xs: 'center', md: 'left' },
							}}
						>
							{t('footer.about_us_title')}
						</Typography>
						<Typography
							variant="body2"
							sx={{
								pl: 1,
								pr: 1,
							}}
						>
							{t('footer.about_us_description')}
						</Typography>
					</Grid>
					<Grid item xs={12} md={4}>
						<Box
							component="img"
							alt="Equal Vote Coalition Logo"
							src="https://assets.nationbuilder.com/unifiedprimary/sites/1/meta_images/original/evc_logo.png?1730324377"
							sx={{
								width: '100%',
								padding: 2,
								background: 'black',
							}}
						/>
						<Typography
							variant="body2"
							gutterBottom
							sx={{
								pl: 1,
								pr: 1,
								textAlign: {
									xs: 'center',
									md: 'left',
								},
								marginTop: 2,
							}}
						>
							{t('footer.social_action')}
						</Typography>
						<Box
							sx={{
								display: 'flex',
								justifyContent: {
									xs: 'center',
									md: 'flex-start',
								},
							}}
						>
							<Link
								aria-label="STAR Voting Facebook page"
								href="https://www.facebook.com/STARVoting"
								color="inherit"
								sx={{ pl: 1, pr: 1 }}
							>
								<Facebook />
							</Link>
							<Link
								aria-label="STAR Voting Instagram page"
								href="https://www.instagram.com/starvoting/"
								color="inherit"
								sx={{ pl: 1, pr: 1 }}
							>
								<Instagram />
							</Link>
							<Link
								aria-label="STAR Voting X page"
								href="https://twitter.com/5starvoting"
								color="inherit"
								sx={{ pl: 1, pr: 1 }}
							>
								<X />
							</Link>
							<Link
								aria-label="Equal Vote GitHub"
								href="https://github.com/Equal-Vote"
								color="inherit"
								sx={{ pl: 1, pr: 1 }}
							>
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
		</Box>
	);
}