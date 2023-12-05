import { Container, Paper } from '@mui/material'
import React from 'react'

const About = () => {
  return (
    <Container>
      <Paper sx={{margin: 'auto', maxWidth: '1300px', marginTop: '4rem', marginBottom: '8rem', padding: '0 2rem 2rem 2rem'}}>
        <h1>About star.vote</h1>
        <div>Star voting is the Star of voting</div>
        key project points
        * supports equal voting methods
        * open source

        Contributor list

        <h1>The Team</h1>
          <h2>Core Team</h2>
          <ul>
            <li>Mike Franze (<a href='https://github.com/mikefranze'>@mikefranze</a>): Software Developer & Project Lead</li>
            <li>Arend Peter Castelein (<a href='https://github.com/arendpeter'>@arendpeter</a>): Software Developer & Project Lead</li>
            <li>Evans Tucker (<a href='https://github.com/evanstucker-hates-2fa'>@evanstucker-hates-2fa</a>): Software Developer & Project Lead</li>
            <li>Sara Wolk (<a href='https://github.com/evanstucker-hates-2fa'>@evanstucker-hates-2fa</a>): Equal Vote Director </li>
          </ul>

          <h2>Alumni</h2>
          <li>Scott Arnold (<a href='https://github.com/evanstucker-hates-2fa'>https://github.com/scottPlusPlus</a>)</li>
          

        <h1>Contribute?</h1>
        Pull requests and bug reports are welcome
        https://github.com/Equal-Vote/star-server

        https://www.starvoting.org/join

        <h1>Donate</h1>
        https://www.starvoting.org/donate
      </Paper>
    </Container>
  )
}

export default About