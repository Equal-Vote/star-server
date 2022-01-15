import { useState } from "react"
import React from 'react'
import { useNavigate } from "react-router"
import {Election} from './../../../domain_model/Election'
import { Poll } from "../../../domain_model/Poll"
import { Candidate} from "../../../domain_model/Candidate"
import AddCandidate from "./AddCandidate"
import Button from "./Button"

const AddElection = () => {
    const [electionName, setElectionName] = useState('')
    const [candidateNames, setCandidateNames] = useState(['','','','',''])
    const [startDate,setStartDate] = useState('')
    const [stopDate,setStopDate] = useState('')
    const [votingMethod,setVotingMethod] = useState('STAR')
    const [numWinners,setNumWinners] = useState(1)
    const [candidates, setCandidates] = useState([] as Candidate[])

    const navigate = useNavigate()
    
    const onAddElection = (election) => {

        fetch('/API/Elections',{
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Election: election,
            })
          })
          navigate('/')
    } 


    const onSubmit = (e) => {
        e.preventDefault()

        if(!electionName) {
            alert('Please add election name')
            return
        }
        const NewPoll : Poll = {
            pollId: '0',
            title: electionName,
            voting_method: votingMethod,
            num_winners: numWinners,
            candidates: candidates
        }

        const NewElection : Election = {
            electionId:    '0', // identifier assigned by the system
            frontendUrl:   '', // base URL for the frontend
            title:         electionName, // one-line election title
            description:  '', // mark-up text describing the election
            startUtc:     new Date(startDate),   // when the election starts 
            endUtc:      new Date(stopDate),   // when the election ends
            polls: [NewPoll]
        }

        // console.log(NewElection)
        onAddElection(NewElection)
        setElectionName('')
        setCandidateNames(['','','','',''])
    }

    
    const onAddCandidate = () => {
        const newCandidates = [...candidates]
        const EmptyCandidate: Candidate = {
        candidateId: String(newCandidates.length),
        shortName: '', // short mnemonic for the candidate
        fullName: '',
        }
        newCandidates.push(EmptyCandidate)
        setCandidates(newCandidates)
    }

    const onSaveCandidate = (candidate:Candidate,index) => {
        const newCandidates = [...candidates]
        newCandidates[index] = candidate
        setCandidates(newCandidates)
        console.log(candidates)
    }

    return (
        <form className = 'add-form' onSubmit={onSubmit}>
            <div className = 'form-control'>
                <label>Election Name</label>
                <input type='text' placeholder='Election Name' value={electionName} onChange={ (e) => setElectionName(e.target.value)} />
            </div>
            <div className = 'form-control'>
                <label>Start Date</label>
                <input type='datetime-local' placeholder='Add Name' value={startDate} onChange={ (e) => setStartDate(e.target.value) }/>
            </div>
            <div className = 'form-control'>
                <label>Stop Date</label>
                <input type='datetime-local' placeholder='Add Name' value={stopDate} onChange={ (e) => setStopDate(e.target.value) }/>
            </div>
            <div className = 'form-control'>
                <label>Voting Method</label>
                <select value={votingMethod} onChange={ (e) => setVotingMethod(e.target.value)}>
                    <option value="STAR"> STAR </option>
                    <option value="STAR-PR"> STAR-PR </option>
                </select>
            </div>
            <div className = 'form-control'>
                <label>Number Of Winners</label>
                <input type='number' placeholder='Number Of Winners' value={numWinners} onChange={ (e) => setNumWinners(parseInt(e.target.value))}/>
            </div>
            <h2> Candidates </h2>
            {candidates.map((candidate,index) => (
                <AddCandidate onSaveCandidate = {(newCandidate) => onSaveCandidate(newCandidate,index)} candidate={candidate} index={index}/>
            ))}
            <Button text='Add Candidate' onClick={() => onAddCandidate()}/>
            <input type='submit' value='Create Election' className = 'btn btn-block'/>
            
        </form>
    )
}

export default AddElection
