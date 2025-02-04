import { VotingMethod } from "@equal-vote/star-vote-shared/domain_model/Race";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, MenuItem, Paper, Select, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSubstitutedTranslation } from "./util";
import EnhancedTable from "./EnhancedTable";
import { rankColumnCSV } from "./cvrParsers";
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import useAuthSession from "./AuthSessionContextProvider";
import { defaultElection } from "./ElectionForm/CreateElectionDialog";
import { Candidate } from "@equal-vote/star-vote-shared/domain_model/Candidate";
import { Election, NewElection } from '@equal-vote/star-vote-shared/domain_model/Election';
import { useGetElections } from "~/hooks/useAPI";

export default () => {
    const [addToPublicArchive, setAddToPublicArchive] = useState(true)
    const { data: electionData, isPending, error, makeRequest: fetchElections } = useGetElections();
    const [cvrs, setCvrs] = useState([])
    const [elections, setElections] = useState({})
    const {t} = useSubstitutedTranslation();
    const inputRef = useRef(null)
    const [electionsSubmitted, setElectionsSubmitted] = useState(false);
    const authSession = useAuthSession()

    useEffect(() => {fetchElections()}, []);

    const updateElection = (key, getter) => {
        elections[key] = getter(elections[key])
        setElections({...elections})
    }

    const submitElections = () => {
        setElectionsSubmitted(true)

        cvrs.forEach(cvr => {
            // #1: Parse CSV
            const post_process = async (parsed_csv) => {
                const start_time = performance.now();
                updateElection(cvr.name, (e) => ({
                    ...e,
                    upload_status: 'In Progress',
                    message: `processing...`
                }))

                // #2 : Infer Election Settings
                const errorRows = new Set(parsed_csv.errors.map(error => error.row))
                // NOTE: this assumes rank_column_csv, may not work with other formats
                const rankFields = parsed_csv.meta.fields.filter((field:string) => field.startsWith('rank'));
                const maxRankings = rankFields.length;
                let candidateNames = new Set();
                parsed_csv.data.forEach((row, i) => {
                    if(errorRows.has(i)) return;
                    candidateNames = candidateNames.union(new Set(rankFields.map(rankField => row[rankField])))
                })
                candidateNames.delete('skipped');
                candidateNames.delete('overvote');
                // TODO: infer num winners

                // #3 : Create (or update) Election 
                let newElection: NewElection = {
                    ...defaultElection,
                    title: cvr.name.split('.')[0],
                    state: 'closed',
                    owner_id: authSession.getIdField('sub'),
                    ballot_source: 'prior_election',
                    public_archive_id: addToPublicArchive? cvr.name.split('.')[0] : undefined,
                    settings: {
                        ...defaultElection.settings,
                        max_rankings: maxRankings,
                        voter_access: 'open'
                    },
                    races: [
                        {
                            race_id: uuidv4(),
                            voting_method: 'IRV', 
                            title: cvr.name.split('.')[0],
                            candidates: [...candidateNames].map(name => ({ 
                                candidate_id: uuidv4(),
                                candidate_name: name
                            })) as Candidate[],
                            num_winners: 1
                        }
                    ]
                };

                let updateExistingElection = elections[cvr.name].election_id && addToPublicArchive;

                let updatedElection: Election = undefined;
                if(updateExistingElection){
                    let prevElection = electionData.public_archive_elections.find((e) => e.election_id == elections[cvr.name].election_id);
                    updatedElection = {
                        ...newElection,
                        election_id: prevElection.election_id,
                        create_date: prevElection.create_date,
                        update_date: prevElection.update_date,
                        head: prevElection.head,
                    }
                }

                // NOTE: I'm not using usePostElection because I need to handle multiple requests
                const endpoint = updateExistingElection ? 
                    `/API/Election/${elections[cvr.name].election_id}/edit`
                :
                    '/API/Elections';

                const postElectionRes = await fetch(endpoint, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        Election: updateExistingElection? updatedElection : newElection
                    })
                })

                if (!postElectionRes.ok){
                    const code = updateExistingElection ? 'ElectionUpdateFailed' : 'ElectionCreateFailed';
                    parsed_csv.errors.push({
                        code: code,
                        message: `Error making request: ${postElectionRes.status.toString()}`,
                        row: -1,
                        type: code,
                    })
                    return;
                };

                let {election} = await postElectionRes.json()

                // #4 : Clear previous ballots (if needed)
                if(updateExistingElection){
                    await fetch(`/API/Election/${election.election_id}/ballots`, {
                        method: 'delete',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                    })
                }

                // #5 : Convert Rows to Ballots
                let {ballots, errors} = rankColumnCSV(parsed_csv, election)

                // #6 : Upload Ballots
                let batchSize = 100;
                let nextIndex = 0;
                let responses = [];
                // TODO: this batching isn't ideal since it'll be tricky to recovered from a partial failure
                //       that said this will mainly be relevant when uploading batches for an existing election so I'll leave it for now
                let filteredBallots = ballots.filter((b, i) => !errorRows.has(i));
                while(nextIndex+1 < ballots.length && nextIndex < 100000 /* a dummy check to avoid infinite loops*/){
                    updateElection(cvr.name, (e) => ({
                        ...e,
                        message: `uploading ${nextIndex}/${parsed_csv.data.length}...`
                    }))

                    let uploadRes;
                    do{
                        uploadRes = await fetch(`/API/Election/${election.election_id}/uploadBallots`, {
                            method: 'post',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ballots: filteredBallots.slice(nextIndex, nextIndex+batchSize)})
                        })

                        if (!uploadRes.ok){
                            errors.push({
                                code: "UploadBallotsFailed",
                                message: `Error making request: ${uploadRes.status.toString()}`,
                                row: -1,
                                type: "UploadBallotsFailed"
                            })
                            batchSize = Math.round(batchSize / 2);
                            if(batchSize < 10){
                                console.log(cvr.name, errors);
                                updateElection(cvr.name, e => ({
                                    ...e,
                                    upload_status: "Error",
                                    message: "(see console)"
                                }))
                                return;
                            }
                        }
                    }while(!uploadRes.ok);
                    nextIndex += batchSize;

                    let res = await uploadRes.json();
                    responses = [...responses, ...res.responses];
                }

                updateElection(cvr.name, (e) => ({
                    ...e,
                    election_id: election.election_id,
                    upload_status: 'Done',
                    message: `${Math.round((performance.now()-start_time))/1000}s`
                }))
            }
            Papa.parse(cvr.url, {
                header: true,
                download: true,
                dynamicTyping: true,
                complete: post_process
            })
        })
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleOnDrop = (e) => {
        e.preventDefault()
        addCvrs(e.dataTransfer.files)
    }

    const addCvrs = (files: FileList) => {
        // NOTE: FileList does not support Array.map
        let new_files = [];
        for(let i = 0; i < files.length; i++){
            new_files.push({
                name: files[i].name,
                url: URL.createObjectURL(files[i])
            });

            let tag = files[i].name.split('.')[0];
            let election = electionData.public_archive_elections.find(e => e.public_archive_id == tag)
            updateElection(files[i].name, () => ({
                file_name: files[i].name,
                election_id: election?.election_id,
                upload_status: 'Pending',
                message: '...',
            }))
        }

        setCvrs([...cvrs, ...new_files])
    }

    return <Box
        display='flex'
        justifyContent="center"
        alignItems="center"
        flexDirection='column'
        sx={{ width: '100%', maxWidth: 1000, margin: 'auto', mb: 1 }}
        gap={2}
    >
        <Typography variant='h3'>Upload Election(s)</Typography>        

        {/* TODO: add a sys admin permission check*/ }
        <FormGroup>
            <FormControlLabel
            control={
                <Checkbox
                disabled={false}
                checked={addToPublicArchive}
                onChange={(e) => setAddToPublicArchive(e.target.checked)}
                />
            }
            label={t('upload_elections.add_to_public_archive')}
            />
        </FormGroup>

        <Box
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            border='4px dashed rgb(112,112,112)'
            sx={{ width: '100%', m: 0, p: 2 }}
            onDragOver={handleDragOver}
            onDrop={handleOnDrop}
        >
            <Typography variant="h6" component="h6" style={{ marginTop: 0 }}>
                Add Election CVRs
            </Typography>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Typography variant="h6" component="h6" sx={{ m: 0 }} style={{}} >
                    Drag and Drop or&nbsp;
                </Typography>
                <input
                    type='file'
                    onChange={(e) => addCvrs(e.target.files)}
                    multiple
                    hidden
                    ref={inputRef} />
                <Button variant='outlined'
                    onClick={() => inputRef.current.click()} >
                    <Typography variant="h6" sx={{ m: 0 }}>
                        Select File(s)
                    </Typography>
                </Button>
            </Box>
        </Box>

        <EnhancedTable
            headKeys={['file_name', 'election_id', 'upload_status', 'message']}
            data={Object.values(elections)}
            isPending={false}
            pendingMessage=''
            defaultSortBy={'file_name'}
            title="CVRs to Upload"
            handleOnClick={() => {}}
            emptyContent={<p>No files selected</p>}
        />

        <Button variant='contained' disabled={electionsSubmitted} onClick={submitElections}>Add (or update) elections</Button>
    </Box>
}