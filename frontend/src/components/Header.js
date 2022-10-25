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
import { useLocalStorage } from '../hooks/useLocalStorage'
import { v4 } from 'uuid'


const Header = ({ authSession }) => {
    const navigate = useNavigate()
    const [tempID, setTempID] = useLocalStorage('tempID', v4())
    const [anchorElNav, setAnchorElNav] = useState(null)
    const [anchorElUser, setAnchorElUser] = useState(null)

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <AppBar position="sticky" sx={{backgroundColor:"primary.main"}}>
            <Toolbar>
                <Box sx={{ flexGrow: 1.5, display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
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
                        <MenuItem
                            component={Link}
                            href='/CreateElection'>
                            Quick Poll
                        </MenuItem>
                        {authSession.isLoggedIn() &&
                            <>
                                <MenuItem
                                    component={Link}
                                    href='/CreateElection'>
                                    New Election
                                </MenuItem>

                                <MenuItem
                                    onClick={
                                        () => {
                                            navigate({ pathname: '/Elections', search: `?filter=owner_id:${authSession.getIdField('sub')}` });
                                            window.location.reload();
                                        }
                                    } >
                                    My Elections
                                </MenuItem>
                            </>
                        }
                        <MenuItem
                            component={Link}
                            href='/sandbox' >
                            Sandbox
                        </MenuItem>

                    </Menu>
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                    <Button color='inherit' href="/">
                        <Typography variant="h6" color="inherit">
                            STAR Vote 2.0
                        </Typography>
                    </Button>
                </Box>
                <Box 
                    sx={{ flexGrow: 100, display: { xs: 'none', md: 'flex' } }}>
                    <Button color='inherit' href='https://www.starvoting.us' target="_blank">
                        About
                    </Button>
                    {authSession.isLoggedIn() &&
                        <Button color='inherit' href='/CreateElection'>
                            Quick Poll
                        </Button>
                    }
                    {authSession.isLoggedIn() &&
                        <Button color='inherit' href='/CreateElection'>
                            New Election
                        </Button>
                    }
                    {authSession.isLoggedIn() &&
                        <Button
                            color='inherit'
                            onClick={
                                () => {
                                    navigate({ pathname: '/Elections', search: `?filter=owner_id:${authSession.getIdField('sub')}` });
                                    window.location.reload();
                                }
                            }
                        >
                            My Elections
                        </Button>
                    }
                    <Button color='inherit' href='/sandbox' >
                        Sandbox
                    </Button>
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                    {authSession.isLoggedIn() ?
                        <Button
                            color='inherit'

                            onClick={() => authSession.openLogout()}
                        >
                            Logout
                        </Button>
                        :
                        <Button
                            color='inherit'
                            onClick={() => authSession.openLogin()}
                        >
                            Login
                        </Button>
                    }
                </Box>

            </Toolbar>
        </AppBar>
    )
}

export default Header
