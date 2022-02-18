import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
// import Button from './Button'
import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'

const Header = ({authSession}) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" color="inherit">
                    STAR Vote 2.0
                </Typography>
                {/* <Link to='/'> <h1> STAR Vote 2.0 </h1></Link> */}
                <Link to="/">
                    <IconButton aria-label="Home" >
                        <HomeIcon />
                    </IconButton>
                </Link>
            {window.location.pathname !== '/Login' && !authSession.isLoggedIn() && 
                <Button
                    color='inherit'
                    
                    // I'm using window.location instead of navigate since loginUrl could be external, and navigate only supports local
                    onClick={() => authSession.openLogin()}
                >
                    Login 
                    </Button>
            }
            {window.location.pathname !== '/Login' && authSession.isLoggedIn() && 
                <Button
                    color='steelblue'
                    text='Logout'
                    // I'm using window.location instead of navigate since loginUrl could be external, and navigate only supports local
                    onClick={() => authSession.openLogout()}
                />
            }
            <Button color='inherit' href= 'https://www.starvoting.us' target="_blank">
                    About
                </Button>
                <Button color='inherit' href= '/CreateElection'>
                    Quick Poll
                </Button>
                <Button color='inherit' href= '/CreateElection'>
                    New Election
                </Button>
                <Button color='inherit' href= '/'>
                    My Elections
                </Button>
            {authSession.isLoggedIn() && 
                `Hi ${authSession.getIdField('email')}!`
            }
        
        </Toolbar>
        </AppBar>
    )
}
// Header.defaultProps = {
//     title: 'STAR Vote 2.0',
// }
// Header.propTypes = {
//     title: PropTypes.string,

// }

export default Header
