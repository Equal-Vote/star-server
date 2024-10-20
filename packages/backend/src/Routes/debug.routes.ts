import { Router } from 'express';
import { tempTestSuite } from '../test/TempTestSuite';

export const debugRouter = Router();

// Just for debugging
debugRouter.get('/', (req, res) => {
    res.json("19:40")
})

debugRouter.get('/test', (req, res) => {
    tempTestSuite().then(
        val => {
            res.json(val);
        }
    ).catch(
        err => {
            console.log(err);
            res.json(err);
        }
    )
})

