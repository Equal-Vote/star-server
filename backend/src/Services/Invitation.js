

module.exports = (election, voter, url) => {

    return {
        to: voter.voter_id, // Change to your recipient
        from: 'mike@equal.vote', // Change to your verified sender
        subject: `Invitation to Vote In ${election.title}`,
        text: `You have been invited to vote in ${election.title} ${url}/Election/${election.election_id}`,
        html: `<div> <h3> You have been invited to vote in ${election.title}</h3> <a clicktracking="off" href="${url}/Election/${election.election_id}" >Link to Election</a></div>`,
    }
}