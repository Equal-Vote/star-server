import useAnonymizedBallots from "~/components/AnonymizedBallotsContextProvider";
import useElection from "~/components/ElectionContextProvider";
import { useSubstitutedTranslation } from "~/components/util"
import Widget from "./Widget";

export default ({ranked=false}) => {
    const { election } = useElection();
    const {ballots} = useAnonymizedBallots();
    const {t} = useSubstitutedTranslation(election?.settings?.term_type ?? 'poll');

    const refCandidate = '037f4498-a167-4f7c-bdd5-d292d49d4760';
    return <Widget title={t('results.head_to_head_title')}>
        blah
    </Widget>
}