import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from './Button'
import React from 'react'


const Header = (props) => {
    
    return (
        <header class='header'>
            
            <Link to ='/'> <h1>{props.title}</h1></Link>
                
            
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
