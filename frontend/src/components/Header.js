import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from './Button'
import React from 'react'

const Header = ({title, authConfig}) => {
    const queryString = Object.entries(authConfig['params'])
                              .map(([key, value]) => `${key}=${value}`)
                              .join('&')
    return (
        <header class='header'>
            <Link to ='/'> <h1>{title}</h1></Link>
            {window.location.pathname !== '/Login' &&
                <Button
                    color='steelblue'
                    text='Login'
                    // I'm using window.open instead of navigate since loginUrl could be external, and navigate only supports local
                    onClick={() => (
                        window.location = authConfig['endpoints']['login']+"?"+queryString
                    )}
                />
            }
            {/* {<Button color='steelblue' text='Home' onClick={props.onClick}/>} */}

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
