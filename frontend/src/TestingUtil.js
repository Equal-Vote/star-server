// Q: why js files?
// A: I couldn't figure out how to load the jest expect/it/test/etc when using .ts or .tsx

import React from "react";
import Election from './components/Election/Election'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import App from "./App"
import { makeServer } from "./server";
import { render, waitForElementToBeRemoved, prettyDOM } from "@testing-library/react"
import '@testing-library/jest-dom/extend-expect' // toBeInDocument wouldn't work without this function

makeServer({environment: 'test'})

const mockAuth = () => {
    const isLoggedIn = () => {
        return false;
    }
    const openLogin = () => {}
    const openLogout = () => {}
    const getIdField = () => {}
    return {isLoggedIn, openLogin, openLogout, getIdField}
}

export const voterOpensElection = async (electionId) => {

    // This gives the following error: Invalid hook call. Hooks can only be called inside of the body of a function component.
    // const authSession = useAuthSession;

    // This sets authSession to undefined
    // const authSession = (<App/>).props.authSession

    // Ideally I'd like to avoid a mock here, but it's the only way I got it to work
    const authSession = mockAuth()

    const page = render(
        // NOTE: this was the best way I found to start the test on a subpage, but ideally I'd like to use an approach that doesn't use a more black box approach
        <MemoryRouter initialEntries={[`/Election/${electionId}`]}>
            <Routes>
                <Route path="/Election/:id/*" element={<Election authSession={authSession}/>} />
            </Routes>
        </MemoryRouter>
    )

    await waitForElementToBeRemoved(() => page.getByText(/Loading Election.../))

    expect(page.getByText("Vote")).toBeInTheDocument();

    return page
}