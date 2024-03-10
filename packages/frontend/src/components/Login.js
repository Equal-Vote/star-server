import { useState } from 'react'
import React from 'react'

const Login = () => {
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    const [registerEmail, setRegisterEmail] = useState('')
    const [registerPassword, setRegisterPassword] = useState('')
    // TODO: we'll probably eventually need more fields than this for register


    const clearInputs = (e) => {
        setLoginEmail('')
        setLoginPassword('')

        setRegisterEmail('')
        setRegisterPassword('')
    }

    const onLoginSubmit = (e) => {
        e.preventDefault()

        if(!loginEmail){
            alert('Please specify email');
            return
        }

        // TODO: call authorize endpoint

        clearInputs();

        console.log("Login");
    }

    const onRegisterSubmit = (e) => {
        e.preventDefault()

        if(!registerEmail){
            alert('Please specify email');
            return
        }

        // TODO: call register endpoint? still need to figure that one out

        clearInputs();

        console.log("Register");
    }

    return (
        <div className="login-components">
            <form className='login-form' onSubmit={onLoginSubmit}>
                <h2> Login </h2>
                <div className='form-control'>
                    <label>Email</label>
                    <input
                        type='text'
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                </div>
                <div className='form-control'>
                    <label>Password</label>
                    <input
                        type='password'
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />
                </div>
                <input type='submit' value='Login' className='btn btn-block' />
            </form>
            <form className='register-form' onSubmit={onRegisterSubmit}>
                <h2> Register </h2>
                <div className='form-control'>
                    <label>Email</label>
                    <input
                        type='text'
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                    />
                </div>
                <div className='form-control'>
                    <label>Password</label>
                    <input
                        type='password'
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                </div>
                <input type='submit' value='Sign Up' className='btn btn-block' />
            </form>
        </div>
    )
}

export default Login
