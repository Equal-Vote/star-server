import React from "react";
import MatrixViewer from "./MatrixViewer";

function CandidateViewer({ candidate }) {
  return (
    <p>
      <b>{candidate.name}</b>: Total Score: {candidate.totalScore}, Average
      Score: {candidate.averageScore}
    </p>
  );
}
function ResultViewer({ title, results }) {
  return (
    <div key={title} className="resultViewer">
      <h2>{title}</h2>
      {results.sections.map((section) => (
        <>
          <h3>{section.title}</h3>
          <>
            {section.candidates.length === 0 && (
              <p>
                <i>None</i>
              </p>
            )}
            {section.candidates.map((index, n) => (
              <CandidateViewer key={n} candidate={results.candidates[index]} />
            ))}
          </>
        </>
      ))}
      <MatrixViewer results={results} />
    </div>
  );
}

function SummaryViewer({ cvr }) {
  const candidates = cvr.candidates.length;
  const voters = cvr.voters.length;
  const underVotes = cvr.undervotes.length;
  const summaryMessage = `${candidates} candidates, ${voters} voters, ${underVotes} underVotes.`;
  const instructions =
    "STAR results for single-winner and multi-winner elections are shown below.";

  return (
    <>
      <h2>Summary</h2>
      <p>
        <b>{summaryMessage}</b>
      </p>
      <p>{instructions}</p>
    </>
  );
}

export default function Results({data}) {
  console.log(data)
  return (
    <div>
      <SummaryViewer cvr={data.cvr} />
      <div className="flexContainer">
        <ResultViewer title="Single-Winner Results" results={data.single} />
        <ResultViewer title="Multi-Winner Results" results={data.multi} />
      </div>
    </div>
  );
}
