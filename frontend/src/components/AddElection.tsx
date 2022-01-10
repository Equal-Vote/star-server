import { useState } from "react"
import React from 'react'
import { useNavigate } from "react-router"
import {Election} from './../../../domain_model/Election'
import { Poll } from "../../../domain_model/Poll"
import { Candidate} from "../../../domain_model/Candidate"

const AddElection = () => {
    const [electionName, setElectionName] = useState('')
    const [candidateNames, setCandidateNames] = useState(['','','','',''])

    const updateArray = index => e => {
        let newArray = [...candidateNames]
        newArray[index] = e.target.value
        setCandidateNames(newArray)

    }
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
            candidates: candidateNames.map( (name,ind) => {
                return {
                    candidateId:   String(ind),
                    shortName:     name, // short mnemonic for the candidate
                    fullName:      name,
                    } as Candidate;
            })
        }

        const NewElection : Election = {
            electionId:    '0', // identifier assigned by the system
            frontendUrl:   '', // base URL for the frontend
            title:         electionName, // one-line election title
            description:  '', // mark-up text describing the election
            startUtc:     new Date(),   // when the election starts 
            endUtc:      new Date(),   // when the election ends
            polls: [NewPoll]
        }

        // console.log(NewElection)
        onAddElection(NewElection)
        setElectionName('')
        setCandidateNames(['','','','',''])
    }

    return (
        <form className = 'add-form' onSubmit={onSubmit}>
            <div className = 'form-control'>
                <label>Election Name</label>
                <input type='text' placeholder='Election Name' value={electionName} onChange={ (e) => setElectionName(e.target.value)} />
            </div>
            <div className = 'form-control'>
                <label>Candidate 1</label>
                <input type='text' placeholder='Add Name' value={candidateNames[0]} onChange={ updateArray(0) }/>
            </div>
            <div className = 'form-control'>
                <label>Candidate 2</label>
                <input type='text' placeholder='Add Name' value={candidateNames[1]} onChange={ updateArray(1) }/>
            </div>
            <div className = 'form-control'>
                <label>Candidate 3</label>
                <input type='text' placeholder='Add Name'  value={candidateNames[2]} onChange={ updateArray(2) }/>
            </div>
            <div className = 'form-control'>
                <label>Candidate 4</label>
                <input type='text' placeholder='Add Name'  value={candidateNames[3]} onChange={ updateArray(3) }/>
            </div>
            <div className = 'form-control'>
                <label>Candidate 5</label>
                <input type='text' placeholder='Add Name'  value={candidateNames[4]} onChange={ updateArray(4) }/>
            </div>

            <input type='submit' value='Create Election' className = 'btn btn-block'/>
            
        </form>
    )
}

export default AddElection
