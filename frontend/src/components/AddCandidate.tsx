import Button from "./Button"
import { Link } from "react-router-dom"
import { useState } from 'react'
import { Candidate } from "../../../domain_model/Candidate"
import React from 'react'
import { MouseEventHandler } from 'react'

type CandidateProps = {
    onSaveCandidate: Function,
    candidate: Candidate,
    index: Number
}

const AddCandidate = ({ onSaveCandidate, candidate, index }: CandidateProps) => {
    const [candidateIndex, setCandidateIndex] = useState(index)
    const [shortName, setShortName] = useState(candidate.shortName)
    const [fullName, setFullName] = useState(candidate.fullName)
    const [party, setParty] = useState(candidate.party)
    const [candidateUrl, setCandidateUrl] = useState(candidate.candidateUrl)
    const [partyUrl, setPartyUrl] = useState(candidate.partyUrl)
    const [bio, setBio] = useState(candidate.bio)

    const [editCandidate, setEditCandidate] = useState(true)

    const saveCandidate = () => {
        const newCandidate: Candidate = {
            candidateId: String(candidateIndex),
            shortName: shortName,
            fullName: fullName,
            party: party,
            candidateUrl: candidateUrl,
            partyUrl: partyUrl,
            bio: bio
        }
        console.log(newCandidate)
        setEditCandidate(false)
        onSaveCandidate(newCandidate)
    }
    

    return (
        <div>
            {editCandidate &&
            <div className="card">
                <div className='form-control'>
                    <label>Short Name</label>
                    <input type='text' placeholder='Add Short name' value={shortName} onChange={(e) => setShortName(e.target.value)} />
                </div>
                <div className='form-control'>
                    <label>Bio</label>
                    <textarea placeholder='Add Bio' value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
                <div className='form-control'>
                    <label>Long Name</label>
                    <input type='text' placeholder='Add Full name' value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className='form-control'>
                    <label>Party</label>
                    <input type='text' placeholder='Add Party' value={party} onChange={(e) => setParty(e.target.value)} />
                </div>
                <div className='form-control'>
                    <label>Candidate URL</label>
                    <input type='url' placeholder='Add Candidate URL' value={candidateUrl} onChange={(e) => setCandidateUrl(e.target.value)} />
                </div>
                <div className='form-control'>
                    <label>Party URL</label>
                    <input type='url' placeholder='Add Party URL' value={partyUrl} onChange={(e) => setPartyUrl(e.target.value)} />
                </div>
                <Button onClick= { () => saveCandidate() } text= 'Save Candidate'/>
            </div>
            }
            {!editCandidate &&
            <div className="card">
                <h3 className = "card__cover"> {shortName} </h3>
                <div className = "card__content">
                <Button onClick= { () => setEditCandidate(true) } text= 'Edit'/>
                </div>
                </div>
            }
        </div>

    )
}

export default AddCandidate
