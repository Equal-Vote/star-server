import { Star } from "./Star";
import { Approval } from "./Approval";
import { Plurality } from "./Plurality";
import { IRV } from "./IRV";
import { RankedRobin } from "./RankedRobin";
const AllocatedScoreResults = require('../Tabulators/AllocatedScore')

export const VotingMethods: { [id: string]: Function } = {
    STAR: Star,
    STAR_PR: AllocatedScoreResults,
    Approval: Approval,
    Plurality: Plurality,
    IRV: IRV,
    RankedRobin: RankedRobin
}