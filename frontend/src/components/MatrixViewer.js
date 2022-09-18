import React from "react";

function CellViewer({ cell }) {
  if (!cell) return "";

  return (
    <h3 className = 'cell'>
      {cell}
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
            {results.summaryData.candidates.map((c, n) => (
              <th className = 'matrix' key={`h${n}`} >{c.name} </th>
            ))}
          </tr>
        </thead>
        <tbody className = 'matrix'>
          {results.summaryData.preferenceMatrix.map((row, i) => (
            <tr className = 'matrix' key={`d${i}`}>
              <th className = 'matrix' key={`dh${i}`} >{results.summaryData.candidates[i].name}</th>
              {row.map((col, j) => (
                results.summaryData.pairwiseMatrix[i][j]===1 ?
                <td className = 'highlight' key={`c${i},${j}`}>
                  <CellViewer cell={col} />
                </td>
                :
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
