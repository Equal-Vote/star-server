import { prettyDOM, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { makeServer } from "../server";
import {
    openElection,
    getUser,
    initUser,
    userClickButton,
    clickButton
} from "../TestingUtil"

import userEvent from "@testing-library/user-event"
import App from "../App";



let server
beforeEach(() => {
    server = makeServer({environment: 'test'})
})

afterEach(() => {
    server.shutdown()
})

test("voting in poll", async () => {
    //////// GIVEN ////////
    server.create('election', 'fruit-election')

    ////////// WHEN ////////
    // let user = getUser()
    let user = userEvent.setup()
    // render(<App />) 

    //await user.clickButton("Sandbox")

    await openElection('fruit-election')
    await user.click(screen.getByRole('link', {name: "Sandbox"}))

    screen.debug()

    expect(screen.getByText("Number of Winners")).toBeInTheDocument();
    // await openElection('fruit-election')

    // await user.clickButton("Vote")

    // screen.debug()

    // expect(screen.getByText("Submit")).toBeInTheDocument();

    // render(
    //     <a href="https://www.example.com" onClick={() => { console.log('test'); }}>Click me</a>
    // );
    // await userEvent.click(screen.getByText('Click me'));

    // await waitFor(() => expect(window.location.href).toBe('https://www.example.com/'));

    //user.fillBallot({
    //    'Banana': 5,
    //    'Strawberry': 3,
    //    'Apple': 0
    //})

    //user.clickButton("Submit")

    ////////// THEN ////////
    //expect(server.db.votes).toBe(1)
})