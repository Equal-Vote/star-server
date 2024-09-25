import { CSVLink } from 'react-csv';
import { useState, useEffect } from 'react';
import { Election } from '@equal-vote/star-vote-shared/domain_model/Election';
import { AnonymizedBallot, Ballot } from '@equal-vote/star-vote-shared/domain_model/Ballot';
import { useGetAnonymizedBallots } from '~/hooks/useAPI';
import MenuItem from "@mui/material/MenuItem";
import BorderAll from '@mui/icons-material/BorderAll';
import DataObject from '@mui/icons-material/DataObject';
import { MenuButton } from '~/components/MenuButton';






interface Props {
    election: Election;
}

export const BallotDataExport = ({ election }: Props) => {
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
	const { data, error, isPending, makeRequest } = useGetAnonymizedBallots(election.election_id);
	useEffect(() => { makeRequest() }, [])
	const ballots: AnonymizedBallot[] = data?.ballots || [];
    const buildCsvData = () => {

        let header = [
            { label: 'ballot_id', key: 'ballot_id' },
            ...election.races.map((race) =>
                race.candidates.map((c) => ({
                    label: `${race.title}!!${c.candidate_name}`,
                    key: `${race.race_id}-${c.candidate_id}`,
                }))
            ),
        ];
        header = header.flat();
        let tempCsvData = ballots.map((ballot) => {
            let row = { ballot_id: ballot.ballot_id };
            ballot.votes.forEach((vote) =>
                vote.scores.forEach((score) => {
                    row[`${vote.race_id}-${score.candidate_id}`] = score.score;
                })
            );
            return row;
        });
        setCsvHeaders(header);
        setCsvData(tempCsvData);
    };

    const limit = (string = '', limit = 0) => {
        if (!string) return '';
        return string.substring(0, limit);
    };
    const downloadJson = () => {
        const ballotObject = { Election: election, Ballots: ballots };
        const ballotJson = JSON.stringify(ballotObject, null, 2);
        const blob = new Blob([ballotJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ballot Data - ${limit(election.title, 50)}-${election.election_id}.json`;
        a.click();
    }

    return (
        <>
            {!isPending && (
                <MenuButton 
                    label={"Download"}
                    menuItems={[
                        <MenuItem key="csv" onClick={buildCsvData}>
                            <BorderAll sx={{ marginRight: 1 }} />
                            <CSVLink
                                id="csv-download-link"
                                data={csvData}
                                headers={csvHeaders}
                                target="_blank"
                                filename={`Ballot Data - ${limit(election.title, 50)}-${election.election_id}.csv`}
                                enclosingCharacter={``}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                Download CSV
                            </CSVLink>
                        </MenuItem>,
                        <MenuItem key="json" onClick={downloadJson}>
                            <DataObject sx={{ marginRight: 1 }} />
                            Download JSON
                        </MenuItem>
                    ]}
                />
                    
       
            )}
        </>
    );
};