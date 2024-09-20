import { Star } from "./Star";
import { Approval } from "./Approval";
import { Plurality } from "./Plurality";
import { IRV, STV } from "./IRV";
import { RankedRobin } from "./RankedRobin";
import { AllocatedScore } from "./AllocatedScore";

export const VotingMethods: { [id: string]: Function } = {
    STAR: Star,
    STAR_PR: AllocatedScore,
    Approval: Approval,
    Plurality: Plurality,
    IRV: IRV,
    STV: STV,
    RankedRobin: RankedRobin
}