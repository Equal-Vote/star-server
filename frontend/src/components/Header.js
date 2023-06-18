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

const headerTextColor = 'primary.contrastText'
const Header = ({ authSession }) => {
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
                            href='https://www.starvoting.us'
                            target="_blank">
                            About
                        </MenuItem>
                        {authSession.isLoggedIn() &&
                            <>
                                <MenuItem
                                    component={Link}
                                    href='/CreateElection'>
                                    New Election
                                </MenuItem>
                            </>
                        }
                        <MenuItem
                            onClick={
                                () => {
                                    navigate({ pathname: '/Elections'});
                                    // navigate({ pathname: '/Elections', search: `?filter=owner_id:${authSession.getIdField('sub')}` });
                                    window.location.reload();
                                }
                            } >
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
                    <Button color='inherit' href='https://www.starvoting.us' target="_blank">
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
                    <Button
                        color='inherit'
                        onClick={
                            () => {
                                navigate({ pathname: '/Elections'});
                                // navigate({ pathname: '/Elections', search: `?filter=owner_id:${authSession.getIdField('sub')}` });
                                window.location.reload();
                            }
                        }
                    >
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
                <Box variant="h5" sx={{ alignItems: 'center', flexWrap: 'wrap', flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>

                    {authSession.isLoggedIn() ?
                        <>
                            <Typography variant={navVariant} sx={{ fontWeight: 'medium' }} color={headerTextColor}>
                                {authSession.getIdField('email')}
                            </Typography>
                            <Button
                                color='inherit'
                                onClick={() => authSession.openLogout()}
                            >
                                <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                                    Log Out
                                </Typography>
                            </Button>
                        </>
                        :
                        <Button
                            color='inherit'
                            onClick={() => authSession.openLogin()}
                        >

                            <Typography variant={navVariant} sx={{ fontWeight: 'bold' }} color={headerTextColor}>
                                Log In
                            </Typography>
                        </Button>
                    }
                </Box>
                <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
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
                        sx={{
                            display: { xs: 'block', md: 'none' },
                        }}
                    >
                        {authSession.isLoggedIn() ?
                            <>
                                <MenuItem>
                                    {authSession.getIdField('email')}
                                </MenuItem>
                                <MenuItem
                                    color='inherit'
                                    onClick={() => authSession.openLogout()}
                                >
                                    Logout
                                </MenuItem>
                            </>
                            :
                            <>
                                <MenuItem
                                    color='inherit'
                                    onClick={() => authSession.openLogin()}
                                >
                                    Login
                                </MenuItem>
                            </>
                        }

                    </Menu>
                </Box>

            </Toolbar>
        </AppBar >
    )
}

export default Header
