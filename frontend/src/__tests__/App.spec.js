import React from "react";
import {
    voterOpensElection
} from "../TestingUtil"

test("voting in poll", async () => {
    await voterOpensElection('premade-fruit-election')
})
