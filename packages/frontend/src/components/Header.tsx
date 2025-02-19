import { useNavigate } from 'react-router';
import { useContext, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Box, IconButton, Link, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import useAuthSession from './AuthSessionContextProvider';
import { useThemeSelector } from '../theme';
import useFeatureFlags from './FeatureFlagContextProvider';
import { CreateElectionContext } from './ElectionForm/CreateElectionDialog';
import { openFeedback, useSubstitutedTranslation } from './util';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { v4 } from 'uuid'

import { ReturnToClassicContext } from './ReturnToClassicDialog';
import { useCookie } from '~/hooks/useCookie';

const headerTextColor = 'primary.contrastText'
const Header = () => {
    const flags = useFeatureFlags();
    const themeSelector = useThemeSelector()
    const authSession = useAuthSession()
    // this is important for setting the default value
    useCookie('temp_id', v4())
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
        <AppBar className="navbar" position="sticky" sx={{ backgroundColor: /*"darkShade.main"*/"black", '@media print': {display: 'none', boxShadow: 'none'}}}>
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

                {/**** Title ****/}
                <IconButton
                    size="large"
                    href="/"
                    sx={{display: 'flex', gap: 1, flexGrow: {xs: '1', md: '0'}, mr: {xs: 0, md: 5}}}>
                        {/* I don't remember what the margin right 5 was for, but I added xs since it was breaking mobile*/}
                        {
                            /* I thought the favicon looked a bit too busy */
                            /*<Avatar src='/favicon-local.png'/>*/
                        }
                        {/* top should be 18.8% of the height*/}
                        <Box component="img" sx={{position: 'relative', height: '50px', top: '7px'}} src='/logo.png'/>
                </IconButton>

                {/**** DESKTOP OPTIONS ****/}
                <Box
                    sx={{ flexGrow: 100, flexWrap: 'wrap', display: { xs: 'none', md: 'flex' }, gap: 4, rowGap: 0 }}>
                    {navItems.map((item, i) => 
                        <Button key={`desktop-nav-${i}`} href={item.href} target={item.target}>
                            <Typography variant="h6" sx={navTextSx} color={headerTextColor} textTransform={'none'}>
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
                <Box sx={{ flexGrow: 0, display: 'flex', gap: 4 }}>
                    {authSession.isLoggedIn() && <>
                        <Button color='inherit' onClick={() => createElectionContext.openDialog()} sx={{display: { xs: 'none', md: 'flex' }}}>
                            <Typography variant="h6" sx={navTextSx} color={headerTextColor} textTransform={'none'}>
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
                            sx={{display: { xs: 'inline', md: 'none' }}}
                            >
                            <AccountCircleIcon />
                        </IconButton>
                        <Button color='inherit' onClick={handleOpenUserMenu} sx={{display: { xs: 'none', md: 'flex' }}}>
                            <Typography variant="h6" sx={navTextSx} color={headerTextColor} textTransform={'none'}>
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
        </AppBar >
    )
}

export default Header
