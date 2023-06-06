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