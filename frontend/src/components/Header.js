import PropTypes from 'prop-types'
// import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router'
// import Button from './Button'
import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'


const Header = ({authSession}) => {
    const navigate = useNavigate()
    return (
        <AppBar position="static">
            <Toolbar>
                <Button color='inherit' href="/">
                    <Typography variant="h6" color="inherit">
                        STAR Vote 2.0
                    </Typography>
                </Button>
            {window.location.pathname !== '/Login' && !authSession.isLoggedIn() && 
                <Button
                    color='inherit'
                    onClick={() => authSession.openLogin()}
                >
                    Login 
                </Button>
            }
            {authSession.isLoggedIn() && 
                <Button
                    color='inherit'
                    onClick={() => authSession.openLogout()}
                >
                    Logout 
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
            {authSession.isLoggedIn() && 
                <Button color='inherit' href= '/CreateElection'>
                    Quick Poll
                </Button>
            }
            {authSession.isLoggedIn() && 
                <Button color='inherit' href= '/CreateElection'>
                    New Election
                </Button>
            }
            {authSession.isLoggedIn() && 
                <Button
                    color='inherit'
                    onClick={
                        () => {
                            navigate({pathname:'/', search:`?filter=owner_id:${authSession.getIdField('sub')}`});
                            window.location.reload();
                        } 
                    }
                >
                    My Elections
                </Button>
            }
            <Button color='inherit' href= '/sandbox' >
                Sandbox
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
