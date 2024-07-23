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
import { openFeedback, useSubstitutedTranslation } from './util';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { ReturnToClassicContext } from './ReturnToClassicDialog';

const headerTextColor = 'primary.contrastText'
const Header = () => {
    const flags = useFeatureFlags();
    const themeSelector = useThemeSelector()
    const authSession = useAuthSession()
    const navigate = useNavigate()
    const [tempID, setTempID] = useCookie('temp_id', v4())
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)
    const {t} = useSubstitutedTranslation();

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
            text: t('nav.about'),
            href: '/About',
            target: '_self',
        },
        {
            text: t('nav.better_voting'),
            href: 'https://equal.vote',
            target: '_blank',
        },
        {
            text: t('nav.public_elections'),
            href: '/OpenElections',
            target: '_self',
        }
    ];

    const returnToClassicContext = useContext(ReturnToClassicContext);

    return (
        <AppBar className="navbar" position="sticky" sx={{ backgroundColor: "black", '@media print': {display: 'none', boxShadow: 'none'}}}>
            <Toolbar sx={{justifyContent: 'space-between'}}>
                {/**** MOBILE HAMBURGER MENU ****/}
                <Box sx={{ flexGrow: 0, display: { xs: 'flex', lg: 'none' } }}>
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
                            display: { xs: 'block', lg: 'none' },
                        }}
                    >
                        {navItems.map((item, i) => 
                            <MenuItem
                                key={`mobile-nav-${i}`}
                                component={Link}
                                href={item.href}
                                target={item.target}
                            >
                                {item.text}
                            </MenuItem>
                        )}
                        <MenuItem onClick={openFeedback}>
                            {t('nav.feedback')}
                        </MenuItem>
                        <MenuItem onClick={returnToClassicContext.openDialog}>
                            {t('return_to_classic.button')}
                        </MenuItem>
                    </Menu>
                </Box>

                {/**** DESKTOP OPTIONS ****/}
                <Box
                    sx={{ flexGrow: 100, flexWrap: 'wrap', display: { xs: 'none', lg: 'flex' }, gap: 2, rowGap: 0 }}>
                    {navItems.map((item, i) => 
                        <Button key={`desktop-nav-${i}`} href={item.href} target={item.target}>
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
                        <Button color='inherit' onClick={() => createElectionContext.openDialog()} sx={{display: { xs: 'none', lg: 'flex' }}}>
                            <Typography sx={navTextSx} color={headerTextColor}>
                                {t('nav.new_election')}
                            </Typography>
                        </Button>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenUserMenu}
                            color="inherit"
                            sx={{display: { xs: 'inline', lg: 'none' }}}
                            >
                            <AccountCircleIcon />
                        </IconButton>
                        <Button color='inherit' onClick={handleOpenUserMenu} sx={{display: { xs: 'none', lg: 'flex' }}}>
                            <Typography sx={navTextSx} color={headerTextColor}>
                                {t('nav.greeting', {name: authSession.getIdField('given_name')})}
                            </Typography>
                            <KeyboardArrowDownRoundedIcon sx={{transition: 'transform .2s', '&:hover': {transform: 'translateY(3px)'}}}/>
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
                                {t('nav.your_account')}
                            </MenuItem>
                            <MenuItem component={Link} onClick={() => createElectionContext.openDialog()}>
                                {t('nav.new_election')}
                            </MenuItem>
                            {/*<MenuItem component={Link} href='/ElectionInvitations'>
                                Election Invitations
                        </MenuItem>*/}
                            <MenuItem component={Link} href='/ElectionsYouManage'>
                                {t('nav.my_elections')}
                            </MenuItem>
                            <MenuItem component={Link} href='/ElectionsYouVotedIn'>
                                {t('nav.past_elections')}
                            </MenuItem>
                            <MenuItem
                                component={Link} 
                                href='https://equal-vote.github.io/star-server/'
                                target='_blank'
                            >
                                {t('nav.help')}
                            </MenuItem>
                            <MenuItem
                                color='inherit'
                                onClick={() => authSession.openLogout()}
                            >
                                {t('nav.logout')}
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
                                {t('nav.sign_in')}
                            </Typography>
                        </Button>
                    }
                </Box>
            </Toolbar>
            {/**** Title ****/}
            {/* Pull title outside of the flexbox toolbar so that it can be centered relative to the screen */}
            <IconButton
                size="large"
                href="/"
                sx={{position: 'fixed', width: '100%', margin: 'auto', pointerEvents: 'none' }}>
                    <Avatar src='/favicon-local.png' sx={{pointerEvents: 'auto' }}/>
            </IconButton>
        </AppBar >
    )
}

export default Header
