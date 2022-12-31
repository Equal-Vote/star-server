import { createTheme } from '@mui/material/styles'
import { teal, orange } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      light: '#5ac7d6',
      main: '#2aa2b3',
      dark: '#02627c',
      contrastText: '#000000',
    },
    secondary: {
      light: '#ffca47',
      main: '#ff9900',
      dark: '#c66a00',
      contrastText: '#000',
    }
  },
})

export default theme  