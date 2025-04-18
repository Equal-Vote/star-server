import { TableContainer } from "@mui/material";

export default ({ className='', data, minCellWidth = "120px", winningRows=1}) => {
  let c = `resultTable ${className}`;

  let winningStyle = {backgroundColor: 'var(--brand-gold)'}

  return (
    <TableContainer
      sx={{
        marginLeft: "auto",
        marginRight: "auto",
        maxHeight: 600,
        width: "100%",
      }}
    >
      <table className={c} style={{minWidth: '100%'}}>
        <thead className={c}>
          <tr>
            {data[0].map((header, i) => (
              <th key={i} className={c} style={{minWidth: i == 0 ? '125px' : '75px'}} >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, i) => (
            <tr className={c} key={i} style={i < winningRows ? winningStyle : {}}>
              {row.map((value, j) => (
                <td
                  key={j}
                  className={c}
                  style={{
                    paddingLeft: j == 0 ? "8px" : "0",
                  }}
                >
                  {isNaN(value/100) ? value : Math.round(100*value)/100}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableContainer>
  );
};