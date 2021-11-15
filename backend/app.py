from flask import Flask, json, jsonify, request
from flask.wrappers import Request
from flask_sqlalchemy import SQLAlchemy, sqlalchemy
import random

import time
app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:''@localhost/flask'
#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = 'False'

db = SQLAlchemy(app)



class User(db.Model):
    id              = db.Column(db.Integer,primary_key=True)
    name            = db.Column(db.String(100), nullable=False)
    #email            = db.Column(db.String(100), nullable=False)

    # Parent of
    hosted_elections = db.relationship('Election', backref='host', lazy=True)

    def __repr__(self):
        return f"User( '{self.name}' )"

class Election(db.Model):
    id              = db.Column(db.Integer,primary_key=True)
    name            = db.Column(db.String(100), nullable=False)
    
    # Parent of
    candidates      = db.relationship('Candidate', backref='election', lazy=True)
    ballots         = db.relationship('Ballot', backref='election', lazy=True)

    # Child of
    host_id         = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"Election( '{self.name}' )"

class Candidate(db.Model):
    id              = db.Column(db.Integer,primary_key=True)
    name            = db.Column(db.String(100), nullable=False)

    # Child of
    election_id     = db.Column(db.Integer, db.ForeignKey('election.id'), nullable=False)

    def __repr__(self):
        return f"Candidate( '{self.name}' )"


class Ballot(db.Model):
    id              = db.Column(db.Integer,primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Parent of
    scores          = db.relationship('Score', backref='ballot', lazy=True)
    
    # Child of
    election_id     = db.Column(db.Integer, db.ForeignKey('election.id'), nullable=False)

    def __repr__(self):
        return f"Ballot( '{self.scores}' )"

class Score(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    
    # Child of
    user_id         = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    candidate_id    = db.Column(db.Integer, db.ForeignKey('candidate.id'), nullable=False)
    ballot_id       = db.Column(db.Integer, db.ForeignKey('ballot.id'), nullable=False)
    election_id     = db.Column(db.Integer, db.ForeignKey('election.id'), nullable=False)
    score           = db.Column(db.Integer, default = 0)


    def __repr__(self):
        return f"Score( '{self.score}' )"


#Database Functions
def CreateUser(UserName):
    newUser = User(name = UserName)
    db.session.add(newUser)
    db.session.commit()
    return newUser.id


def CreateElection(hostUserID,ElectionName,candidates):
    newElection = Election(name = ElectionName, host_id = hostUserID)
    db.session.add(newElection)
    db.session.commit()
    for i in range(len(candidates)):
        candidateId = AddCandidates(newElection.id,candidates[i])
    return newElection.id

def AddCandidates(electionID,candidateName):
    newCandidate = Candidate(name = candidateName, election_id = electionID)
    db.session.add(newCandidate)
    db.session.commit()
    return newCandidate.id

def AddBallot(userID,electionID):
    newBallot = Ballot(user_id = userID,election_id = electionID)
    db.session.add(newBallot)
    db.session.commit()
    return newBallot.id

def AddScore(ballotID,candidateID,score):
    userID = Ballot.query.get(ballotID).user_id
    electionID = Ballot.query.get(ballotID).election_id
    newScore = Score(user_id = userID, candidate_id = candidateID,ballot_id = ballotID, score = score, election_id = electionID)
    
    db.session.add(newScore)
    db.session.commit()
    return newScore.id

def GetTotalScores(electionID):
    candidates = Election.query.get(electionID).candidates
    totalScores = []
    candidateIDs = []
    index = 0
    for candidate in candidates:
        scores = Score.query.filter_by(candidate_id = candidate.id).all()
        totalScore = 0
        for score in scores:
            totalScore += score.score
        index +=1
        totalScores.append(totalScore)
        candidateIDs.append(candidate.id)
    return candidateIDs, totalScores

def GetCvr(electionID):
    election = Election.query.get(electionID)
    ballots = election.ballots

    candidates = election.candidates
    candidateIDs = [candidate.id for candidate in candidates]
    candidateNames = [candidate.name for candidate in candidates]
    ballotIDs = [ballot.id for ballot in ballots]
    cvrData = [ [0] * len(candidates) for _ in range(len(ballots)) ]
    row = 0

    scores = Score.query.filter_by(election_id = electionID).all()
    scoreCandidateIndexes = [candidateIDs.index(score.candidate_id) for score in scores]
    scoreBallotIndexes = [ballotIDs.index(score.ballot_id) for score in scores]
    for i in range(len(scores)):
        cvrData[scoreBallotIndexes[i]][scoreCandidateIndexes[i]] = scores[i].score

    return cvrData, candidateIDs,candidateNames

# Election processing functions
def processCvr(cvrData):
    nVoters = len(cvrData)
    nCandidates = len(cvrData[0])
    totalScores = [0] * nCandidates
    for i in range(nVoters): 
        for j in range(nCandidates): 
            totalScores[j] += cvrData[i][j]  
    preferenceMatrix = [ [0] * nCandidates for _ in range(nCandidates) ]

    for vote in range(nVoters):
        for c1 in range(nCandidates-1):
            for c2 in range(c1+1,nCandidates):
                c1Score = cvrData[vote][c1]
                c2Score = cvrData[vote][c2]
                if c1Score>c2Score:
                    preferenceMatrix[c1][c2] +=1
                elif c1Score<c2Score:
                    preferenceMatrix[c2][c1] +=1
    
    return totalScores, preferenceMatrix

def getSortedScores(totalScores):
    sortedIndexes = sorted(range(len(totalScores)), key=lambda k: totalScores[k])
    sortedIndexes.reverse()
    sortedScores = [totalScores[i] for i in sortedIndexes]
    return sortedScores, sortedIndexes

def getSortedPreferenceMatrix(preferenceMatrix,sortedIndexes):
    nCandidates = len(preferenceMatrix)
    sortedPreferenceMatrix = [ [0] * nCandidates for _ in range(nCandidates) ]
    for i in range(nCandidates):
        for j in range(nCandidates):
            sortedPreferenceMatrix[i][j] = preferenceMatrix[sortedIndexes[i]][sortedIndexes[j]]
    return sortedPreferenceMatrix

def getSortedCandidateIDs(sortedIndexes,candidateIDs):
    return [candidateIDs[i] for i in sortedIndexes]

def getWinner(sortedScores,sortedIndexes,sortedPreferenceMatrix,sortedCandidateIDs):
    if sortedPreferenceMatrix[0][1] > sortedPreferenceMatrix[1][0]:
        winner = sortedCandidateIDs[0]
    elif sortedPreferenceMatrix[0][1] < sortedPreferenceMatrix[1][0]:
        winner = sortedCandidateIDs[1]
    elif sortedScores[0] > sortedScores[1]:
        winner = sortedCandidateIDs[0]
    elif sortedScores[0] < sortedScores[1]:
        winner = sortedCandidateIDs[1]
    else:
        winner = []
    return winner
def getElectionResults(electionID):
        print('Getting Scores')
        cvrData, candidateIDs,candidateNames = GetCvr(electionID)
        candidates = getCandidates(electionID)
        #candidatesNames = [candidate['candidateName'] for candidate in candidates]
        print('Processing Results')
        totalScores, preferenceMatrix = processCvr(cvrData)
        sortedScores, sortedIndexes = getSortedScores(totalScores)
        sortedPreferenceMatrix = getSortedPreferenceMatrix(preferenceMatrix,sortedIndexes)
        sortedCandidateIDs = getSortedCandidateIDs(sortedIndexes,candidateIDs)
        sortedCandidateNames = [candidateNames[candidateIDs.index(i)] for i in sortedCandidateIDs]
        winner = getWinner(sortedScores,sortedIndexes,sortedPreferenceMatrix,sortedCandidateIDs)
        winnerName = candidateNames[candidateIDs.index(winner)]
        print('Winner: ', winnerName)
        print(sortedCandidateNames)
        print(sortedScores)
        [print(sortedPreferenceMatrix[i]) for i in range(len(sortedPreferenceMatrix))]
        results = {
            'scores': sortedScores,
            'preferenceMatrix': sortedPreferenceMatrix,
            'candidateIDs': sortedCandidateIDs,
            'candidateNames': sortedCandidateNames,
            'winnerID':winner,
            'winnerName': winnerName}
        return results 

def getAllElections():
    elections = Election.query.all()
    return [{'id': election.id, 'ElectionName': election.name} for election in elections]

def getCandidates(electionID):
    election = Election.query.get(electionID)
    candidates = election.candidates
    return [{'id': candidate.id, 'CandidateName': candidate.name} for candidate in candidates]
def getElectionByID(electionID):
    election = Election.query.get(electionID)
    candidates = getCandidates(electionID)
    return {'id': election.id, 'ElectionName': election.name, 'Candidates': candidates}
    
def submitBallot(userID,electionID,candidateScores):
    ballotID = AddBallot(userID,electionID)
    for candidateScore in candidateScores:
         AddScore(ballotID,candidateScore['id'],candidateScore['score'])

# App Routes
@app.route('/Elections', methods = ['GET', 'POST'])
def get_elections():
    if request.method == 'GET':
        return jsonify(getAllElections())
    elif request.method == 'POST':
        requestData = request.get_json()
        electionName = requestData['Election']['electionName']
        candidates = requestData['Election']['candidateNames']
        print(candidates)
        print('Creating New Election:')
        print(electionName)
        CreateElection(0,electionName,candidates)
        print('Election Created')
        print(getAllElections())
        return jsonify(getAllElections())


@app.route('/Election/<id>', methods = ['GET', 'POST'])
def get_election(id):
    if request.method == 'GET':
        requestData = request.get_json()
        print(requestData)
        return jsonify(getElectionByID(id))
    elif request.method == 'POST':
        requestData = request.get_json()
        print(requestData)
        id = requestData['ElectionID']
        candidateScores = requestData['candidateScores']
        submitBallot(0,id,candidateScores)
        return 'Vote Cast'

@app.route('/ElectionResult/<id>', methods = ['GET'])
def get_results(id):
    return jsonify(getElectionResults(id))


def createFakeElection():
    print('Creating Election')
    userID = CreateUser('Bill')
    candidateIDs = [1,2,3,4,5,6,7,8,9,10]
    candidateNames = ['Alice','Bob','Cindy','Dan','Eric','Fin','Greg','Helen','Indy','Jen']
    print('Adding Candidates: ', candidateNames)
    electionID = CreateElection(userID,'My Election',candidateNames)

    for i in range(100):
        ballotID = AddBallot(userID,electionID)
        for j in range(10):
            AddScore(ballotID,candidateIDs[j],random.randint(0,5))

    getElectionResults(electionID)
    print(getCandidates(electionID))
    #print(json.dumps(getCandidates(electionID)))
    
if __name__ == "__main__":
    #Drops all previous data and creates a fake election
    #db.drop_all()
    #db.create_all()
    #createFakeElection()
    #db.drop_all()
    app.run(debug=True)
  