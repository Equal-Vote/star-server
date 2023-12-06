import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router'
// import Button from './Button'
import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'
import { Box, IconButton, Link, Menu, MenuItem } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useCookie } from '../hooks/useCookie'
import { v4 } from 'uuid'
import useAuthSession from './AuthSessionContextProvider';
import { useThemeSelector } from '../theme';

const headerTextColor = 'primary.contrastText'
const Header = () => {
    const themeSelector = useThemeSelector()
    const authSession = useAuthSession()
    const navigate = useNavigate()
    const [tempID, setTempID] = useCookie('temp_id', v4())
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)

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

    const navVariant = 'h6';

    return (
        <AppBar position="sticky" sx={{ backgroundColor: "primary.main" }}>
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
                        <MenuItem
                            component={Link}
                            href='/About'
                            target="_blank">
                            About
                        </MenuItem>
                        {authSession.isLoggedIn() &&
                            <MenuItem
                                component={Link}
                                href='/CreateElection'>
                                New Election
                            </MenuItem>
                        }
                        <MenuItem
                            component={Link}
                            href='/Elections'
                            target="_blank">
                            Elections
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            href='/sandbox' >
                            Sandbox
                        </MenuItem>

                    </Menu>
                </Box>

                {/**** TITLE ****/}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: "center", marginRight: 2 }}
                >
                    <Button color='inherit' href="/">
                        <Typography align='center' variant={navVariant} color={headerTextColor} sx={{ fontWeight: 'bold' }}>
                            STAR Vote 2.0
                        </Typography>
                    </Button>
                </Box>

                {/**** DESKTOP OPTIONS ****/}
                <Box
                    sx={{ flexGrow: 100, flexWrap: 'wrap', display: { xs: 'none', md: 'flex' }, gap: 2, rowGap: 0 }}>
                    <Button color='inherit' href='/About' target="_blank">
                        <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                            About
                        </Typography>
                    </Button>
                    {authSession.isLoggedIn() &&
                        <Button color='inherit' href='/CreateElection'>
                            <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                                New Election
                            </Typography>
                        </Button>
                    }
                    <Button color='inherit' href='/Elections' target="_blank">
                        <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                            Elections
                        </Typography>
                    </Button>
                    <Button color='inherit' href='/sandbox' >
                        <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                            Sandbox
                        </Typography>
                    </Button>
                </Box>

                {/**** LOG IN/OUT ****/}
                <Box sx={{ flexGrow: 0, display: 'flex' }}>
                    {authSession.isLoggedIn() && <>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenUserMenu}
                            color="inherit">
                            <AccountCircleIcon />
                        </IconButton>
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
                            <MenuItem>
                                {authSession.getIdField('email')}
                            </MenuItem>
                            <MenuItem
                                color='inherit'
                                onClick={() => authSession.openLogout()}
                            >
                                Logout
                            </MenuItem>
                            {themeSelector.modes.map(mode => (
                                <MenuItem
                                    color='inherit'
                                    onClick={() => themeSelector.selectColorMode(mode)}
                                >
                                    {mode}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>}
                    {!authSession.isLoggedIn() &&
                        <Button color='inherit' onClick={() => authSession.openLogin()} >
                            <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                                Login
                            </Typography>
                        </Button>
                    }
                </Box>

            </Toolbar>
        </AppBar >
    )
}

export default Header
