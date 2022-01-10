import React from "react";

function CellViewer({ cell }) {
  if (!cell) return "";

  return (
    <h3 className = 'cell'>
      {cell.result}:<br />
      {cell.supportVotes} vs {cell.opposeVotes}
    </h3>
  );
}

export default function MatrixViewer({ results }) {
  //const matrix = results.matrix;
  return (
    <div>
      <h2>Head-to-Head Voter Preferences</h2>
      <table className = 'matrix'>
        <thead className = 'matrix'>
          <tr className = 'matrix'>
            <th className = 'matrix'></th>
            {results.candidates.map((c, n) => (
              <th className = 'matrix' key={`h${n}`} >{c.name} </th>
            ))}
          </tr>
        </thead>
        <tbody className = 'matrix'>
          {results.matrix.map((row, i) => (
            <tr className = 'matrix' key={`d${i}`}>
              <th className = 'matrix' key={`dh${i}`} >{results.candidates[i].name}</th>
              {row.map((col, j) => (
                <td className = 'matrix' key={`c${i},${j}`}>
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
