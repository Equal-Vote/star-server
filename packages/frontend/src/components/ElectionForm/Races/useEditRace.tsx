import React, { useEffect } from 'react'
import { useState } from "react"

import { scrollToElement } from '../../util';
import useElection from '../../ElectionContextProvider';
import { Race as iRace } from '@equal-vote/star-vote-shared/domain_model/Race';
import structuredClone from '@ungap/structured-clone';
import useConfirm from '../../ConfirmationDialogProvider';
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '@equal-vote/star-vote-shared/domain_model/Candidate';

export const useEditRace = (race, race_index) => {
    const { election, refreshElection, permissions, updateElection } = useElection()
    const confirm = useConfirm();
    const defaultRace = {
        title: '',
        race_id: '',
        num_winners: 1,
        voting_method: 'STAR',
        candidates: [] as Candidate[],
        precincts: undefined,
    }
    const [editedRace, setEditedRace] = useState(race !== null ? race : defaultRace)

    const [errors, setErrors] = useState({
        raceTitle: '',
        raceDescription: '',
        raceNumWinners: '',
        candidates: ''
    })

    useEffect(() => {
        setEditedRace(race !== null ? race : defaultRace)
        setErrors({
            raceTitle: '',
            raceDescription: '',
            raceNumWinners: '',
            candidates: ''
        })
    }, [race_index])

    const applyRaceUpdate = (updateFunc: (race: iRace) => any) => {
        const raceCopy: iRace = structuredClone(editedRace)
        updateFunc(raceCopy)
        setEditedRace(raceCopy)
    };

    const validatePage = () => {
        let isValid = true
        let newErrors: any = {}
        if (election.races.length > 1) {
            if (!editedRace.title) {
                newErrors.raceTitle = 'Race title required';
                isValid = false;
            }
            else if (editedRace.title.length < 3 || editedRace.title.length > 256) {
                newErrors.raceTitle = 'Race title must be between 3 and 256 characters';
                isValid = false;
            }
            if (editedRace.description && editedRace.description.length > 1000) {
                newErrors.raceDescription = 'Race title must be less than 1000 characters';
                isValid = false;
            }
        }
        if (editedRace.num_winners < 1) {
            newErrors.raceNumWinners = 'Must have at least one winner';
            isValid = false;
        }
        const numCandidates = editedRace.candidates.filter(candidate => candidate.candidate_name !== '').length
        if (editedRace.num_winners > numCandidates) {
            newErrors.raceNumWinners = 'Cannot have more winners than candidates';
            isValid = false;
        }
        if (numCandidates < 2) {
            newErrors.candidates = 'Must have at least 2 candidates';
            isValid = false;
        }
        const uniqueCandidates = new Set(editedRace.candidates.filter(candidate => candidate.candidate_name !== '').map(candidate => candidate.candidate_name))
        if (numCandidates !== uniqueCandidates.size) {
            newErrors.candidates = 'Candidates must have unique names';
            isValid = false;
        }
        setErrors(errors => ({ ...errors, ...newErrors }))

        // NOTE: I'm passing the element as a function so that we can delay the query until the elements have been updated
        scrollToElement(() => document.querySelectorAll('.Mui-error'))

        return isValid
    }

    const onAddRace = async () => {
        if (!validatePage()) return false
        const success = await updateElection(election => {
            election.races.push({
                ...editedRace,
                race_id: uuidv4()
            })
        })
        if (!success) return false
        await refreshElection()
        setEditedRace(defaultRace)
        return true
    }

    const onSaveRace = async () => {
        if (!validatePage()) return false
        const success = await updateElection(election => {
            election.races[race_index] = editedRace
        })
        if (!success) return false
        await refreshElection()
        return true
    }

    const onDeleteRace = async () => {
        const confirmed = await confirm({ title: 'Confirm', message: 'Are you sure?' })
        if (!confirmed) return false
        const success = await updateElection(election => {
            election.races.splice(race_index, 1)
        })
        if (!success) return true
        await refreshElection()
        return true
    }

    return { editedRace, errors, setErrors, applyRaceUpdate, onSaveRace, onDeleteRace, onAddRace }

}