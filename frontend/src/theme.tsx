import React, { useContext } from 'react'
import { PaletteOptions, Theme, createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles'
import { createContext } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { useMediaQuery } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }

  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/styles' {

  interface PaletteColor {
    purple?: string;
    ltblue?: string;
    blue?: string;
    gold?: string;
    red?: string;
    orange?: string;
    green?: string;
    black?: string;
    white?: string;
    gray5?: string;
    gray4?: string;
    gray3?: string;
    gray2?: string;
    gray1?: string;
    grayAlpha?: string;
  }

  interface SimplePaletteColorOptions {
    purple?: string;
    ltblue?: string;
    blue?: string;
    gold?: string;
    red?: string;
    orange?: string;
    green?: string;
    black?: string;
    white?: string;
    gray5?: string;
    gray4?: string;
    gray3?: string;
    gray2?: string;
    gray1?: string;
    grayAlpha?: string;
  }

}
const brandPalette: PaletteOptions = {
  brand: {
    main: '#000000',
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
}

const brandTypeography: TypographyOptions = {
  fontFamily: 'Verdana',
  h1: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  h2: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  h3: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  h4: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  h5: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  h6: {
    marginTop: '1rem',
    marginBottom: '1rem',
  }
}

const themes = {
  base: responsiveFontSizes(createTheme({
    palette: {
      brand: brandPalette.brand
    },
    typography: brandTypeography
  }
  )),
  turquoise: responsiveFontSizes(createTheme({
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
      brand: brandPalette.brand
    },
    typography: brandTypeography
  })),
  darkMode: responsiveFontSizes(createTheme({
    palette: {
      mode: 'dark',
      brand: brandPalette.brand
    },
    
    typography: brandTypeography
  })),
}

type mode = keyof typeof themes | 'browserDefault'
type ThemeContextType = {
  mode: mode,
  modes: mode[],
  selectColorMode: (mode: mode) => void,
  theme: Theme,
}

export const ThemeContext = createContext<ThemeContextType>({ mode: 'base', modes: Object.keys(themes) as mode[], selectColorMode: () => { }, theme: themes.turquoise })

export const ThemeContextProvider = ({ children }) => {
  // https://mui.com/material-ui/customization/dark-mode/#system-preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useLocalStorage<mode>('themeMode', 'browserDefault');
  let theme;
  if(mode === 'browserDefault'){
    theme = themes[prefersDarkMode? 'darkMode' : 'base'];
  }else{
    theme = themes[mode];
  }

  const value: ThemeContextType = {
    mode: mode,
    modes: Object.keys(themes) as mode[],
    selectColorMode: newMode => setMode(newMode),
    theme
  }

  return (
    <ThemeContext.Provider value={value} >
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useThemeSelector() {
  return useContext(ThemeContext)
} 