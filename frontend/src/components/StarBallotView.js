import React from "react";

function RowHeading({ candidate, party, className }) {
  return (
    <td className={`rowHeading ${className}`}>
      <span className="candidate">{candidate}</span>
      {party && (
        <>
          <br />
          {party}
        </>
      )}
    </td>
  );
}

// Represents a single ranking of a single candidate
const Choice = ({ divKey, score, filled, onClick }) => (
  <div
    key={divKey}
    className={`circle ${filled ? "filled" : ""}`}
    onClick={onClick}
  >
    <p>{score}</p>
  </div>
);

// Represents the set of possible rankings for a single candidate
const Choices = ({ rowIndex, onClick, ranking }) =>
  Array(6)
    .fill(0)
    .map((elem, n) => (
      <td key={n} className="starScore">
        <Choice
          key={`starChoice${rowIndex}-${n}`}
          divKey={`starDiv${rowIndex}-${n}`}
          score={n}
          filled={n + 1 === ranking}
          onClick={() => onClick(n + 1)}
        />
      </td>
    ));

// Represents the row of all data for a single candidate
const Row = ({ rowIndex, candidate, party, ranking, onClick }) => (
  <tr key={`starRow${rowIndex}`}>
    <RowHeading className="starScore" candidate={candidate} party={party} />
    <Choices
      key={`starChoices${rowIndex}`}
      rowIndex={rowIndex}
      ranking={ranking}
      onClick={onClick}
    />
  </tr>
);

// Represents the list of rows corresponding to the list of candidates
const Rows = ({ candidates, rankings, onClick }) =>
  candidates.map((row, n) => (
    <Row
      rowIndex={n}
      key={`starRow${n}`}
      candidate={row.shortName}
      party={row.party}
      ranking={rankings[n]}
      onClick={(ranking) => onClick(n, ranking)}
    />
  ));

// Represents the list of column headings for all possible rankings
const ColumnHeadings = () => (
  <>
    <td className="starLabel">Score Candidates:</td>
    <td className="starHeading">
      <p>0</p>
    </td>
    <td className="starHeading">
      <p>1</p>
    </td>
    <td className="starHeading">
      <p>2</p>
    </td>
    <td className="starHeading">
      <p>3</p>
    </td>
    <td className="starHeading">
      <p>4</p>
    </td>
    <td className="starHeading">
      <p>5</p>
    </td>
  </>
);

// Renders a complete RCV ballot for a single race
export default function StarBallotView({
  race,
  candidates,
  rankings,
  onClick,
  readonly
}) {
  return (
    <div className={`ballot ${readonly ? "noHover" : ""}`}>
      <table>
        <thead>
          <tr>
            <td colSpan="7" className="title">
              {race}
            </td>
          </tr>
          <tr>
            <th colSpan="7" className="instructions">
              <ul>
                <li>Give your favorite(s) five stars.</li>
                <li>Give your last choice(s) zero stars.</li>
                <li>Show preference order and level of support.</li>
                <li>Equal scores indicate no preference.</li>
                <li>Those left blank receive zero stars.</li>
              </ul>
            </th>
          </tr>
          <tr>
            <td />
            <td colSpan="6">
              <div className="starWorst">Worst</div>
              <div className="starBest">Best</div>
            </td>
          </tr>
          <tr>
            <ColumnHeadings />
          </tr>
        </thead>
        <tbody>
          <Rows candidates={candidates} rankings={rankings} onClick={onClick} />
          <tr>
            <th colSpan="7" className="instructions">
              <p>
                The two highest scoring candidates are finalists.
                <br />
                The finalist preferred by the majority wins.
              </p>
            </th>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
