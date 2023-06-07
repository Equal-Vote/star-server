import { createTheme, responsiveFontSizes  } from '@mui/material/styles'
import { teal, orange } from '@mui/material/colors'

let theme = createTheme({
  palette: {
    primary: {
      light: '#5ac7d6',
      main: '#2aa2b3',
      dark: '#02627c',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#ffca47',
      main: '#ff9900',
      dark: '#c66a00',
      contrastText: '#000',
    },
    brand: {
      /* https://docs.google.com/presentation/d/1NSAirKzmq4YyUPB56NR3pKiRTn3W9btwnUtHi_zteeU/edit#slide=id.g827b1a2992_5_86*/
      purple: '#4D2586',
      ltblue: '#2AA2B3',
      blue: '#02627C',
      gold: '#FFE156',
      red: '#EE2C53',
      orange: '#FF9900',
      green: '#60B33C',
      black: '#000000',
      white: '#FFFFFF',

      /* https://docs.google.com/presentation/d/1NSAirKzmq4YyUPB56NR3pKiRTn3W9btwnUtHi_zteeU/edit#slide=id.g177cd3ac88b_0_0 */
      gray5: '#1F1F1F', /* Charcoal used in "How does STAR Voting Work?" graphic */
      gray4: '#666666', /* Bubbles on ballots */
      gray3: '#999999', /* Lines separating candidates on ballot */
      gray2: '#CCCCCC', /* Stars on STAR ballots */
      gray1: '#ECECEC', /* Highlight for alternating candidates on ballots */
      grayAlpha: '#7B7B7B7D', /* For graying out candidates for the "How does STAR Voting Work?" Graphic (has transparency)*/
    }
  },
  typography: {
    fontFamily: [
      'Montserrat',
      'Verdana'
    ].join(','),
  }
})

theme = responsiveFontSizes(theme);

export default theme  