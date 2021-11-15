import { useState } from "react"
import React from 'react'
import { useHistory } from "react-router"

const AddElection = ( {  }) => {
    const [electionName, setElectionName] = useState('')
    const [candidateNames, setCandidateNames] = useState(['','','','',''])
    const updateArray = index => e => {
        let newArray = [...candidateNames]
        newArray[index] = e.target.value
        setCandidateNames(newArray)

    }
    const history = useHistory()
    const onAddElection = (election) => {

        fetch('/Elections',{
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              Election: election,
            })
          }).then(response =>
            response.json().then(
                history.push('/')
            ))
    }


    const onSubmit = (e) => {
        e.preventDefault()

        if(!electionName) {
            alert('Please add election name')
            return
        }

        onAddElection({electionName,candidateNames})
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
