import React from 'react'
import { useParams } from "react-router";
import useFetch from "../useFetch";
import Results from './Results';

const ViewElectionResults = () => {

    const {id} = useParams();
    const {data, isPending, error} = useFetch(`/API/ElectionResult/${id}`)
    console.log(data)
    return (
        // <Results data = {electionResults}/>
        <>
            { error && <div> {error} </div>}
            { isPending && <div> Loading Election... </div>}
            {data && (
                <Results data = {data}/>)}
                
        </>
        //     <div>
        //         <h3>    {electionResults.ElectionName} </h3> 
        //         <h3>   Winner: {electionResults['winnerName']} </h3> 
        //         <header>
        //             {electionResults['candidateNames'].map(candidateName => {
        //             return <>{candidateName + '\t '}</>;
        //             })}
        //         </header>
        //         <header>
        //             {electionResults['scores'].map(score => {
        //             return <>{score + '\t \t'}</>;
        //             })}
        //         </header>
            
        //         <ul>
        //             {electionResults['preferenceMatrix'].map(row => {
        //                 return <header>
        //                     {row.map(score => {
        //                     return <>{score + '\t \t'}</>;
        //                     })}
        //                 </header>;
        //             })}
        //         </ul>
        //     </div>
        //     )}

        // </>
    )
}

export default ViewElectionResults
           // <>   {electionResults['candidateNames'].map((candidateName) => (<h3> {candidateName}</h3>))} </> 
