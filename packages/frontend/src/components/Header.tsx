import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'
import React, { useContext, useState } from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import { Avatar, Box, IconButton, InputAdornment, InputBase, Link, Menu, MenuItem, Paper, TextField } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Search from '@mui/icons-material/Search';
import { useCookie } from '../hooks/useCookie'
import { v4 } from 'uuid'
import useAuthSession from './AuthSessionContextProvider';
import { useThemeSelector } from '../theme';
import useFeatureFlags from './FeatureFlagContextProvider';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CreateElectionContext, CreateElectionContextProvider } from './ElectionForm/CreateElectionDialog';
import { openFeedback } from './util';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const headerTextColor = 'primary.contrastText'
const Header = () => {
    const flags = useFeatureFlags();
    const themeSelector = useThemeSelector()
    const authSession = useAuthSession()
    const navigate = useNavigate()
    const [tempID, setTempID] = useCookie('temp_id', v4())
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)

    const createElectionContext = useContext(CreateElectionContext);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const navTextSx = {fontWeight: 'bold', fontSize: '1rem'};

    const navItems = [
        {
            text: 'About',
            href: '/About',
        },
        {
            text: 'Help',
            href: 'https://equal-vote.github.io/star-server/'
        },
        {
            text: 'Public Elections',
            href: '/OpenElections'
        }
    ];

    const [title, _] = useLocalStorage('title_override', process.env.REACT_APP_TITLE);

    return (
        <AppBar className="navbar" position="sticky" sx={{ backgroundColor: "black", '@media print': {display: 'none', boxShadow: 'none'}}}>
            <Toolbar>
                {/**** MOBILE HAMBURGER MENU ****/}
                <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                        size="large"
                        aria-label="nav-menu"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit">
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                        }}
                    >
                        {navItems.map((item, i) => 
                            <MenuItem
                                key={`mobile-nav-${i}`}
                                component={Link}
                                href={item.href}
                            >
                                {item.text}
                            </MenuItem>
                        )}
                        <MenuItem onClick={openFeedback}>
                            Feedback?
                        </MenuItem>
                    </Menu>
                </Box>

                {/**** Title ****/}
                <IconButton
                    size="large"
                    href="/"
                    sx={{display: 'flex', gap: 1, flexGrow: {xs: '1', md: '0'}}}>
                        <Avatar src='/favicon.png'/>
                </IconButton>

                {/**** DESKTOP OPTIONS ****/}
                <Box
                    sx={{ flexGrow: 100, flexWrap: 'wrap', display: { xs: 'none', md: 'flex' }, gap: 2, rowGap: 0 }}>
                    {navItems.map((item, i) => 
                        <Button key={`desktop-nav-${i}`} href={item.href}>
                            <Typography sx={navTextSx} color={headerTextColor}>
                                {item.text}
                            </Typography>
                        </Button>
                    )}
                    {/* Saving this for when we have a search bar
                    <Paper sx={{display: 'flex', alignItems: 'center', background: 'white', align: 'center', marginTop: 'auto', marginBottom: 'auto', padding: 1}}>
                        <Search />
                        <InputBase placeholder="Search Public Elections"/>
                    </Paper>
                    */}
                </Box>

                {/**** ACCOUNT OPTIONS ****/}
                <Box sx={{ flexGrow: 0, display: 'flex' }}>
                    {authSession.isLoggedIn() && <>
                        <Button color='inherit' onClick={() => createElectionContext.openDialog()} sx={{display: { xs: 'none', md: 'flex' }}}>
                            <Typography sx={navTextSx} color={headerTextColor}>
                                New Election
                            </Typography>
                        </Button>
                        <Button color='inherit' onClick={handleOpenUserMenu} sx={{display: { xs: 'none', md: 'flex' }}}>
                            <Typography sx={navTextSx} color={headerTextColor}>
                                Hello, {authSession.getIdField('given_name')}
                            </Typography>
                            <KeyboardArrowDownRoundedIcon />
                        </Button>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                            sx={{ display: 'block'}}
                        >
                            <MenuItem component={Link} href={authSession.accountUrl} target='_blank'>
                                Your Account
                            </MenuItem>
                            <MenuItem component={Link} onClick={() => createElectionContext.openDialog()}>
                                New Election
                            </MenuItem>
                            {/*<MenuItem component={Link} href='/ElectionInvitations'>
                                Election Invitations
                        </MenuItem>*/}
                            <MenuItem component={Link} href='/ElectionsYouManage'>
                                Elections you Manage
                            </MenuItem>
                            <MenuItem component={Link} href='/ElectionsYouVotedIn'>
                                Past Elections
                            </MenuItem>
                            <MenuItem
                                color='inherit'
                                onClick={() => authSession.openLogout()}
                            >
                                Logout
                            </MenuItem>
                            {flags.isSet('THEMES') && <>
                                <br/>
                                <br/>
                                <br/>
                                <MenuItem
                                    color='inherit'
                                    onClick={() => themeSelector.selectColorMode('browserDefault')}
                                >
                                    browser default
                                </MenuItem>
                                {themeSelector.modes.map((mode, i) => (
                                    <MenuItem
                                        color='inherit'
                                        onClick={() => themeSelector.selectColorMode(mode)}
                                        key={`color-${i}`}
                                    >
                                        {mode}
                                    </MenuItem>
                                ))}
                            </>}
                        </Menu>
                    </>}
                    {!authSession.isLoggedIn() &&
                        <Button color='inherit' onClick={() => authSession.openLogin()} >
                            <Typography sx={navTextSx} color={headerTextColor}>
                                Sign In
                            </Typography>
                        </Button>
                    }
                </Box>

            </Toolbar>
        </AppBar >
    )
}

export default Header
