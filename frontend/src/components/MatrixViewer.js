import React from "react";

function CellViewer({ cell }) {
  if (!cell) return "";

  return (
    <h3 class = 'cell'>
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
      <table class = 'matrix'>
        <thead class = 'matrix'>
          <tr class = 'matrix'>
            <th class = 'matrix'></th>
            {results.candidates.map((c, n) => (
              <th class = 'matrix' key={`h${n}`} >{c.name} </th>
            ))}
          </tr>
        </thead>
        <tbody class = 'matrix'>
          {results.matrix.map((row, i) => (
            <tr class = 'matrix' key={`d${i}`}>
              <th class = 'matrix' key={`dh${i}`} >{results.candidates[i].name}</th>
              {row.map((col, j) => (
                <td class = 'matrix' key={`c${i},${j}`}>
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
