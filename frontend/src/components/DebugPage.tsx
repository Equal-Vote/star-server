import { useState } from 'react'
import React from 'react'
import authSession from '../authSession'

const DebugPage = (props) => {
    const [loginValue, setLoginValue] = useState('')
    const clearInputs = () => {
        setLoginValue('')
    }

    const onLoginSubmit = (e) => {
        e.preventDefault()

        if(!loginValue){
            alert('Please specify login');
            return
        }

        clearInputs();
        props.authSession.debugLogin(loginValue, loginValue);
        var sub = props.authSession.getIdField('sub');
        console.log("Logged in as: " + sub);
    }


    return (
        <div className="login-components">
            <form className='login-form' onSubmit={onLoginSubmit}>
                <h2> Login </h2>
                <div className='form-control'>
                    <label>Override the login token with a JWT.<br></br>(example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)</label>
                    <input
                        type='text'
                        value={loginValue}
                        onChange={(e) => setLoginValue(e.target.value)}
                    />
                </div>
                <input type='submit' value='Login' className='btn btn-block' />
            </form>
        </div>
    )
}

export default DebugPage
