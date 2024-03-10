import { Box, Button, Container, Divider, Paper, Typography } from '@mui/material'
import React from 'react'
import { StyledButton } from './styles'
import { useLocalStorage } from '../hooks/useLocalStorage';

const About = () => {
  // The Id can be found by copying the image address of their gihtub profile
  const allContributors = [
    ['mikefranze', '41272412'],
    ['ArendPeter', '9289903'],
    ['ScottPlusPlus', '40651157'],
    ['SaraWolk', '75465271'],
    ['evanstucker-hates-2fa', '20584445'],
    ['masiarek', '857777'],
    ['arterro', '91045842'],
    ['Elitemoni', '13269513'],
    ['JonBlauvelt', '8998273'],
    ['AntonSax', '9059836'],
    ['mjpauly', '16432322'],
  ];

  const [title, _] = useLocalStorage('title_override', process.env.REACT_APP_TITLE);

  return (
    <Container>
      <Paper elevation={6} sx={{margin: 'auto', maxWidth: '1300px', marginTop: '4rem', marginBottom: '8rem', padding: '1rem 2rem 2rem 2rem'}}>
        <h1>About {title}</h1>

        <Typography>
        {title} is the successor to star.vote that's <b>currently under construction</b>.
        </Typography>
        <br/>
        <Typography>
        It gives you an easy way to create secure elections with voting methods that don't spoil the vote.
        </Typography>
        <br/>
        <Typography>
        The tool is open source and will eventually support a variety of single winner methods such as STAR, Approval, and Ranked Robin, as well as
        multi-winner proportional methods such as STAR-PR
        </Typography>
        <br/>
        <Typography>
        It's also flexible to fit your voting scenario, whether it's a massive public poll, a high stakes board election, or just a casual poll picking a restaurant
        {title} can fit your needs and provide a secure, auditable election
        </Typography>

        <h1>The Team</h1>
        <h2>Our Leads</h2>
        <ul>
          <li>Mike Franze (<a href='https://github.com/mikefranze'>@mikefranze</a>): Software Development Project Lead</li>
          <li>Arend Peter Castelein (<a href='https://github.com/ArendPeter'>@ArendPeter</a>): Equal Vote Production Lead</li>
          <li>Evans Tucker (<a href='https://github.com/evanstucker-hates-2fa'>@evanstucker-hates-2fa</a>): Infrastructure Lead</li>
          <li>Sara Wolk (<a href='https://github.com/SaraWolk'>@SaraWolk</a>): Equal Vote Director</li>
        </ul>

        <h2>All Contributors</h2>
        <Box display='flex' flexDirection='row' flexWrap='wrap' gap='10px' sx={{maxWidth: 800}}>
          {allContributors.map(([name, id]) => 
            <a href={`https://github.com/${name}`}>
              <Box component='img' src={`https://avatars.githubusercontent.com/u/${id}?v=4`} sx={{borderRadius: '100%', width: 80, heigth: 80}}/>
            </a>
          )}
        </Box>
          
        <h1>Contribute</h1>

        <Typography>
        Our source code is available on <a href='https://github.com/Equal-Vote/star-server'>GitHub</a>, Pull Requests and Bug Reports are appreciated
        </Typography>
        <br/>
        <Typography>
        <a href="https://www.starvoting.org/join">Join our community</a> for onboarding and to be involved in discussions
        </Typography>

        <h1>Donate</h1>

        <Typography>
          Help us to continue supporting the website
        </Typography>

        <Button
            variant="contained"
            sx={{
                p: 1,
                m: 2,
                boxShadow: 2,
                backgroundColor: 'primary.main',
                fontWeight: 'bold',
                fontSize: 18,
            }}
            href="https://www.starvoting.us/donate"
        >
          Donate
        </Button>
      </Paper>
    </Container>
  )
}

export default About