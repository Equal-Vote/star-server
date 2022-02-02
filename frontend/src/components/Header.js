import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from './Button'
import React from 'react'

const Header = ({title, authSession}) => {
    return (
        <header className='header'>
            <Link to ='/'> <h1>{title}</h1></Link>
            {window.location.pathname !== '/Login' && !authSession.isLoggedIn() && 
                <Button
                    color='steelblue'
                    text='Login'
                    // I'm using window.location instead of navigate since loginUrl could be external, and navigate only supports local
                    onClick={() => authSession.openLogin()}
                />
            }
            {window.location.pathname !== '/Login' && authSession.isLoggedIn() && 
                <Button
                    color='steelblue'
                    text='Logout'
                    // I'm using window.location instead of navigate since loginUrl could be external, and navigate only supports local
                    onClick={() => authSession.openLogout()}
                />
            }
            {authSession.isLoggedIn() && 
                `Hi ${authSession.getIdField('email')}!`
            }
        </header>
    )
}
Header.defaultProps = {
    title: 'STAR Vote 2.0',
}
Header.propTypes = {
    title: PropTypes.string,

}

export default Header
