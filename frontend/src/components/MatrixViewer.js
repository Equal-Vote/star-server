import React from "react";

function CellViewer({ cell }) {
  if (!cell) return "";

  return (
    <p>
      {cell.result}:<br />
      {cell.supportVotes} vs {cell.opposeVotes}
    </p>
  );
}

export default function MatrixViewer({ results }) {
  //const matrix = results.matrix;
  return (
    <div>
      <h2>Head-to-Head Voter Preferences</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            {results.candidates.map((c, n) => (
              <th key={`h${n}`}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.matrix.map((row, i) => (
            <tr key={`d${i}`}>
              <th key={`dh${i}`}>{results.candidates[i].name}</th>
              {row.map((col, j) => (
                <td key={`c${i},${j}`}>
                  <CellViewer cell={col} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
