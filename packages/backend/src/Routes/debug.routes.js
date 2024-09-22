const express = require('express');
const router = express.Router();
import { tempTestSuite } from '../test/TempTestSuite';

const voterRollController = require('../Controllers/registerVoterController')

// Just for debugging
router.get('/', (req, res) => {
    res.json("19:40")
})

router.get('/test', (req, res) => {
    tempTestSuite().then(
        val => {
            res.json(val);
        }
    ).catch(
        err => {
            console.err(err);
            res.json(err);
        }
    )
})

export default router