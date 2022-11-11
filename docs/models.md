---
layout: default
title: Data Object Docs
nav_order: 8000
---

# Election
Object containing election data


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| election_id | string | required | UUID created by the server when election is created |
| owner_id | string | required | UUID of user who created election |
| title | string | required | Election title |
| description | string | optional | Election description |
| start_time | date | optional | Election start time when election state transitions from finalized to open and ballots will be accepted |
| end_time | date | optional | Election end time when election state transitions from open to closed and ballots will no longer be accepted |
| support_email | string | optional | Email available to voters for support |
| audit_ids | string[] | optional | Array of email addresses for users with auditor role |
| admin_ids | string[] | optional | Array of email addresses for users with admin role |
| credential_ids | string[] | optional | Array of email addresses for users with credentialer role |
| state | string | required | Election state, can be: draft, finalized, open, closed| 
| races | Race[] | required | Array of race objects | 
| settings | ElectionSettings | required | Election settings object | 
| auth_key | string | optional | Alternative authentication key submitted when election is created by third party app | 

## Race
Object containing race data


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| race_id | string | required | Unique race ID, just needs to be unique for this election, not universally unique |
| title | string | required | Race title |
| description | string | optional | Race description |
| voting_method | string | required | Voting method for race, currently supports: STAR, STAR-PR |
| num_winners | number | required | number of winners, must be integer between 1 and number of candidates |
| candidates | Candidate[] | required | list of Candidate objects |
| precincts | string[] | optiona | list of precincts that can vote in this race |

## Candidate
Object containing candidate data


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| candidate_id | string | required | Unique candidate ID, just needs to be unique for this race, not universally unique |
| candidate_name | string | required | Short candidate name, what appears on the ballot |
| full_name | string | optional | Full name of candidate |
| bio | string | optional | Mark-up text descripting the candidate |
| party | string | optional | Candidate affiliation |
| party_url | string | optional | Candidate affiliation url |
| candidate_url | string | optional | Candidate info url |
| photo_filename | string | optional | Candidate photo filename uploaded to server (Not currently supported) |

## ElectionSettings
Object containing election settings


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| election_roll_type | string | required | Type of election roll of allowed voters, can be: none (anyone can vote), email (list of emails of allowed voters will be provided), voter_id (list of voter IDs of allowed voters will be provided) |
| voter_id_type | string | required | Type of voter ID that will differentiate voters. If election_roll_type = none can be: none (users can submit multiple ballots), IP address (limited to one per IP address). If election_roll_type =/= none, set to same value as election_roll_type |


## Example Election
```
        {
            title: 'Example Election',
            election_id: '0',
            owner_id: '1234abcd',
            state: 'open',
            races: [
                {
                    race_id: '0',
                    num_winners: 1,
                    voting_method: 'STAR',
                    candidates: [
                        {
                            candidate_id: '0',
                            candidate_name: 'Alice',
                        },
                        {
                            candidate_id: '1',
                            candidate_name: 'Bob',
                        },
                        {
                            candidate_id: '2',
                            candidate_name: 'Carol',
                        }
                    ],
                    precincts: undefined,
                }
            ],
            settings: {
                voter_id_type: 'IP Address',
                election_roll_type: 'None'
            }
        }
```

# Ballot
Object containing ballot data


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| ballot_id | string | required | UUID created by the server |
| election_id | string | required | UUID created by the server when election is created |
| user_id | string | optional | UUID of user who submitted ballot |
| status | string | required | Status of ballot, can be: saved, submitted |
| date_submitted | number | required | Date ballot submitted represented as unix timestamp (Date.now()), set by server |
| ip_address | string | optional | IP address of submitted ballot, set by server |
| votes | Vote[] | required | Array of Vote objects, one per race |
| history | BallotAction[] | optional | Array of BallotAction objects that show the ballot history, set by server |
| precinct | string | optional | Precinct of voter |

## Vote
Object containing Vote data

| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| race_id | string | required | Race id for this vote |
| scores | Score[] | required | Array of Score objects |


## Score
Object containing Scor data

| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| candidate_id | string | required | Candidate ID for this score |
| score | number | required | Score for this candidate |


## BallotAction
Object containing Scor data

| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| action_type | string | required | Description of action |
| actor | string | required | UUID of actor that makes action |
| timestamp | number | required | timestamp of action |


## Example Ballot
```
{
    ballot_id: '1234',
    election_id: 'abcd',
    status: 'submitted',
    votes: [
        race_id: '0',
        scores: [
            {
                candidate_id: '0',
                score: 5,
            },
            {
                candidate_id: '1',
                score: 3,
            },
            {
                candidate_id: '2',
                score: 0,
            }
        ]
    ]

}
```

# Voter Auth
Object containing voter authorization data


| Parameter | Type | Required? | Description |
| --------- | --------- | --------- | --------- |
| authorized_voter | bool | required | Is user authorized to vote in given election |
| required | string | optional | String description of what is required to vote such as "voter_id", "login"  |
| has_voted | bool | required | Has voter already voted |
| roles | string[] | required | Array of the user's roles |

## Example Voter Auth
```
{
  authorized_voter: true,
  has_voted: false,
  roles: ['owner']
}
```
