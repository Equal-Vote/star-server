import { StyledButton } from "~/components/styles";
import { CSVLink } from "react-csv";
import { useState } from "react";
import { Election } from "@equal-vote/star-vote-shared/domain_model/Election";
import { Ballot } from "@equal-vote/star-vote-shared/domain_model/Ballot";

interface Props {
	data: {
		election: Election;
		ballots: Ballot[];
	};
}
export const DownloadCSV = ({data}: Props) => {
	const [csvData, setcsvData] = useState([])
    const [csvHeaders, setcsvHeaders] = useState([])
	const buildCsvData = () => {
        let header = [
            { label: 'ballot_id', key: 'ballot_id' },
            ...data.election.races.map(race => race.candidates.map(c => ({ label: `${race.title}!!${c.candidate_name}`, key: `${race.race_id}-${c.candidate_id}` })))
        ]
		header = header.flat()
        let tempCsvData = data.ballots.map(ballot => {
            let row = {ballot_id: ballot.ballot_id}
            ballot.votes.forEach(vote => vote.scores.forEach(score => {
                row[`${vote.race_id}-${score.candidate_id}`] = score.score
            }));
            return row
        })
        setcsvHeaders(header)
        setcsvData(tempCsvData)
        return false
    }
	const limit = (string = '', limit = 0) => {
        if (!string) return ''
        return string.substring(0, limit)
    }

	return (
		<StyledButton
			type="button"
			variant="contained"
			fullwidth
		>
			<CSVLink
				data={csvData}
				headers={csvHeaders}
				target="_blank"
				filename={`Ballot Data - ${limit(
					data.election.title,
					50
				)}.csv`}
				enclosingCharacter={``}
				onClick={() => {
					buildCsvData();
				}}
				style={{ textDecoration: 'none',  color: 'inherit' }}
			>
				Download CSV
			</CSVLink>
		</StyledButton>
	);
};
