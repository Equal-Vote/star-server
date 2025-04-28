import { Star } from "./Star";
import { Approval } from "./Approval";
import { Plurality } from "./Plurality";
import { IRV, STV } from "./IRV";
import { RankedRobin } from "./RankedRobin";
import { AllocatedScore } from "./AllocatedScore";
import { ElectionSettings, electionSettingsValidation } from "@equal-vote/star-vote-shared/domain_model/ElectionSettings";
import { allocatedScoreResults, approvalResults, candi, candidate, genericResults, irvResults, pluralityResults, rankedRobinResults, starCandidate, starResults, vote } from "@equal-vote/star-vote-shared/domain_model/ITabulators";

type TabulatorFunction<resultsType extends genericResults,> = (
    candidates: candi[],
    votes: vote[],
    nWinners?: number,
    electionSettings?: ElectionSettings
) => resultsType;

export const VotingMethods: {
    'STAR': TabulatorFunction<starResults>,
    'Approval': TabulatorFunction<approvalResults>,
    'STAR_PR': TabulatorFunction<allocatedScoreResults>,
    'Plurality': TabulatorFunction<pluralityResults>,
    'IRV': TabulatorFunction<irvResults>,
    'STV': TabulatorFunction<irvResults>,
    'RankedRobin': TabulatorFunction<rankedRobinResults>,
} = {
    STAR: Star,
    Approval: Approval,
    STAR_PR: AllocatedScore,
    Plurality: Plurality,
    IRV: IRV,
    STV: STV,
    RankedRobin: RankedRobin
}