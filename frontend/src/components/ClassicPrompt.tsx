import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNavigate } from 'react-router'

const ClassicPrompt = () => {
    const navigate = useNavigate()

    const [prevClassicPrompt, setPrevClassicPrompt] = useLocalStorage('prev_classic_prompt', '')
    const [rememberPrompt, setRememberPrompt] = useState(false)

    function goToOriginal(){
        if(rememberPrompt) setPrevClassicPrompt('classic')

        window.location.href = 'https://www.star.vote';
    }

    function goToNewVersion(){

        // navigate({ pathname: '/Landing'});

        window.location.href = 'Landing';

        if(rememberPrompt) setPrevClassicPrompt('new_version')
    }

    function handleCheckbox(event){
       setRememberPrompt(event.target.checked) 
    }

    useEffect(() => {
        if(prevClassicPrompt == 'classic'){
            goToOriginal()
        }

        if(prevClassicPrompt == 'new_version'){
            goToNewVersion()
        }
    });

    if(prevClassicPrompt != '') return <></> // save on rendering time so the redirect is faster

    return (
        <>
            <div className="classicPageWrapper">
                <iframe src='classic_star_vote.html' style={{width: '100%', height: '100%'}} scrolling="no"></iframe>
            </div>
            <div className="classicPopupBkg">
                <div className="classicPopupInner">
                    We're working on a new and improved version of star.vote!
                    <br/>
                    Want to try it?
                    <br/>
                    <button onClick={goToOriginal}>Continue to Original</button>
                    <button onClick={goToNewVersion}>Try New Verison</button>
                    <br/>
                    <input type="checkbox" onChange={handleCheckbox}/> Remember my selection
                </div>
            </div>
        </>
    )
}

export default ClassicPrompt
