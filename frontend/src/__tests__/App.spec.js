import { prettyDOM, render, screen } from "@testing-library/react";
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

    //////// WHEN ////////
    let user = getUser()

    await openElection('fruit-election')

    user.clickButton("Vote")

    user.fillBallot({
        'Banana': 5,
        'Strawberry': 3,
        'Apple': 0
    })

    user.clickButton("Submit")

    //////// THNE ////////
    expect(server.db.votes).toBe(1)
})

/*
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('clicking a hyperlink', () => {
  render(
    <a href="https://www.example.com">Click me</a>
  );
  userEvent.click(screen.getByText('Click me'));
  expect(window.location.href).toBe('https://www.example.com/');
});
*/
