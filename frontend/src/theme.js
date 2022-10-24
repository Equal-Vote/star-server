import { createTheme } from '@mui/material/styles'
import { teal, orange } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      light: '#8eacbb',
      main: '#607d8b',
      dark: '#34515e',
      contrastText: '#000000',
    },
    secondary: {
      light: '#f4511e',
      main: '#f4511e',
      dark: '#b91400',
      contrastText: '#000',
    }
  },
})

export default theme  