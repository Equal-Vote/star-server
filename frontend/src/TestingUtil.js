// Q: why js files?
// A: I couldn't figure out how to load the jest expect/it/test/etc when using .ts or .tsx

import React from "react";
import Election from './components/Election/Election'
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router-dom'
import App from "./App"
import { screen, render, waitForElementToBeRemoved, prettyDOM } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import '@testing-library/jest-dom/extend-expect' // toBeInDocument wouldn't work without this function


export function getUser(){
    let user = userEvent.setup()

    async function clickButton(text){
        await user.click(screen.getByText(text))
    }

    async function fillBallot(data){
        await waitForElementToBeRemoved(() => screen.getByText(/loading election.../i))
        screen.debug()
        for( const [candidate, vote_value] of Object.entries(data) ){
            console.log(candidate)
            console.log(screen.getByText('Banana'));
            const cell = screen.getByRole('cell', {name: 'Banana'});
            console.log(cell)
            const row = cell.closest('.MuiGrid-root');
        }
    }

    return { clickButton, fillBallot}
}

const mockAuth = () => {
    const isLoggedIn = () => {
        return false
    }
    const openLogin = () => {}
    const openLogout = () => {}
    const getIdField = () => {}
    return {isLoggedIn, openLogin, openLogout, getIdField}
}

export const openElection = async (electionId) => {

    // This gives the following error: Invalid hook call. Hooks can only be called inside of the body of a function component.
    // const authSession = useAuthSession;

    // This sets authSession to undefined
    // const authSession = (<App/>).props.authSession

    // Ideally I'd like to avoid a mock here, but it's the only way I got it to work
    const authSession = mockAuth()

    //render(
    //    <MemoryRouter initialEntries={[`/Election/${electionId}`]}>
    //        {makeRoutes(authSession)}
    //    </MemoryRouter>
    //)
    //render(<App />) 
    render(<App authSession={authSession}/>, {wrapper: BrowserRouter})

    //window.history.pushState({}, '/Election/${electionId}')

    //await waitForElementToBeRemoved(() => screen.getByText(/loading election.../i))

    //expect(screen.getByText("Vote")).toBeInTheDocument();
}