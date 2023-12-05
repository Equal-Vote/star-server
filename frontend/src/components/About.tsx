import { Button, Container, Divider, Paper, Typography } from '@mui/material'
import React from 'react'
import { StyledButton } from './styles'

const About = () => {
  return (
    <Container>
      <Paper elevation={6} sx={{margin: 'auto', maxWidth: '1300px', marginTop: '4rem', marginBottom: '8rem', padding: '1rem 2rem 2rem 2rem'}}>
        <h1>About WEBSITE_NAME</h1>

        <Typography>
        WEBSITE_NAME gives you an easy way to create secure elections with voting methods that don't spoil the vote
        </Typography>
        <br/>
        <Typography>
        The tool is open source and supports a variety of single winner methods such as STAR, Approval, and Ranked Robin, as well as
        multi-winner proportional methods such as STAR-PR
        </Typography>
        <br/>
        <Typography>
        It's also flexible to fit your voting scenario, whether massive public poll, a high stakes board election, or just a casual poll picking a restaurant
        WEBSITE_NAME can fit your needs and provide a secure, auditable election
        </Typography>

        <h1>The Team</h1>
        <h2>Core Team</h2>
        <ul>
          <li>Mike Franze (<a href='https://github.com/mikefranze'>@mikefranze</a>): Software Developer & Project Lead</li>
          <li>Arend Peter Castelein (<a href='https://github.com/ArendPeter'>@ArendPeter</a>): Software Developer</li>
          <li>Evans Tucker (<a href='https://github.com/evanstucker-hates-2fa'>@evanstucker-hates-2fa</a>): Infrastructure</li>
          <li>Sara Wolk (<a href='https://github.com/SaraWolk'>@SaraWolk</a>): Equal Vote Director & Project Consultant</li>
        </ul>

        <h2>Alumni</h2>
        <ul>
          <li>Scott Arnold (<a href='https://github.com/scottPlusPlus'>@scottPlusPlus</a>): Software Developer</li>
        </ul>
          
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