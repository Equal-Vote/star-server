import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import { formatDate } from './util';
import { Checkbox, FormControl, ListItemText, MenuItem, Select, TextField } from '@mui/material';

export type HeadKey = keyof typeof headCellPool;

type Order = 'asc' | 'desc';

interface TableData {
  [key: string]: string | number
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  tableTitle: string;
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof TableData;
  label: string;
  numeric: boolean;
  filterType?: 'search' | 'groups';
  filterGroups?: {
    [key: string]: boolean
  };
  formatter?: Function;
}

interface EnhancedTableHeadProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof TableData) => void;
  order: Order;
  orderBy: string;
  headCells: HeadCell[];
  filters: any[];
  setFilters: Function
}


const headCellPool = {
    voter_id: {
        id: 'voter_id',
        numeric: false,
        disablePadding: false,
        label: 'Voter ID',
        filterType: 'search',
        formatter: a => a,
    },
    email: {
        id: 'email',
        numeric: false,
        disablePadding: false,
        label: 'Email',
        filterType: 'search',
        formatter: a => a || '',
    },
    invite_status: {
        id: 'invite_status',
        numeric: false,
        disablePadding: false,
        label: 'Email Invites',
        filterType: 'groups',
        filterGroups: {
            'Not Sent': true,
            'Sent': true,
            'Failed': true,
        },
        formatter: (_, roll) => {
          if (!roll?.email_data?.inviteResponse) return 'Not Sent';
          if (roll.email_data.inviteResponse.length == 0 || roll.email_data.inviteResponse[0].statusCode >= 400) return 'Failed'
          return 'Sent'
        }
    },
    has_voted: {
        id: 'has_voted',
        numeric: false,
        disablePadding: false,
        label: 'Has Voted',
        filterType: 'groups',
        filterGroups: {
            'false': true,
            'true': true,
        },
        formatter: (_, roll) => roll.submitted.toString(),
    },
    voter_state: {
        id: 'voter_state',
        numeric: false,
        disablePadding: false,
        label: 'State',
        filterType: 'groups',
        filterGroups: {
            approved: true,
            registered: true,
        },
        formatter: (_, roll) => roll.state.toString(),
    },
    precinct: {
        id: 'precinct',
        numeric: false,
        disablePadding: false,
        label: 'Precinct',
        filterType: 'search',
        formatter: a => a || '',
    },
    ip: {
        id: 'ip',
        numeric: false,
        disablePadding: false,
        label: 'IP',
        filterType: 'search',
        formatter: (_, roll) => roll.ip_hash || '',
    },
    title: {
        id: 'title',
        numeric: false,
        disablePadding: false,
        label: 'Election Title',
        filterType: 'search',
        formatter: a => a
    },
    roles: {
        id: 'roles',
        numeric: false,
        disablePadding: false,
        label: 'Role',
        filterType: 'search',
        formatter: a => a
    },
    election_state: {
        id: 'election_state',
        numeric: false,
        disablePadding: false,
        label: 'State',
        filterType: 'groups',
        filterGroups: {
            draft: true,
            finalized: true,
            open: true,
            closed: true,
            archived: false
        },
        formatter: (_, election) => {
          return election.state || ''
        }
    },
    start_time: {
        id: 'start_time',
        numeric: false,
        disablePadding: false,
        label: 'Start Time',
        filterType: 'search',
        formatter: formatDate
    },
    end_time: {
        id: 'end_time',
        numeric: false,
        disablePadding: false,
        label: 'End Time',
        filterType: 'search',
        formatter: formatDate
    },
    description: {
        id: 'description',
        numeric: false,
        disablePadding: false,
        label: 'Description',
        filterType: 'search',
        formatter: descr => limit(descr, 30)
    },
}


interface EnhancedTableProps {
  title: string,
  headKeys: HeadKey[]
  data: any[] // we'll use a formatter to convert it to TableData
  defaultSortBy: Extract<keyof TableData, string>
  handleOnClick: Function
  isPending: boolean
  pendingMessage: string,
  emptyContent: any
}

const limit = (string = '', limit = 0) => {
    if (!string) return ''
    return string.substring(0, limit)
}

const formatTableData = (headKeys, data) => {
    let fData = data.map(item => {
        let fItem = {};
        headKeys.forEach( key => {
            fItem[key] = key in headCellPool ? headCellPool[key].formatter(item[key], item) : item[key];
        });
        fItem['raw'] = item;
        return fItem;
    });
    return fData;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

type filterTypes = 'search' | 'groups' | null

function filterData<T>(array: readonly T[], headCells: HeadCell[], filters: any[]) {

  return array.filter(row => {
    return headCells.every((col, colInd) => {
      if (!col.filterType) return true
      if (col.filterType === 'search') {
        if (filters[colInd] == '') return true
        return row[col.id].toLowerCase().includes(filters[colInd].toLowerCase())
      }
      if (col.filterType === 'groups') {
        return filters[colInd][row[col.id]]
      }
      return true
    })
  })
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { order, orderBy, onRequestSort } = props;

  const createSortHandler =
    (property: keyof TableData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  const handleSearchFilterChange = (ind: number, value: string) => {
    props.setFilters(filters => {
      let newFilters = [...filters]
      newFilters[ind] = value
      return newFilters
    })
  }

  const handleGroupFilterChange = (ind: number, group: string, value: boolean) => {
    props.setFilters(filters => {
      let newFilters = [...filters]
      newFilters[ind][group] = value
      return newFilters
    })
  }

  return (
    <TableHead>
      <TableRow>
        {props.headCells.map((headCell, cellInd) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
            {headCell.filterType === 'search' &&
              <TextField
                sx={{ my: 1, minWidth: 120 }}
                size="small"
                value={props.filters[cellInd]}
                onChange={(e) => handleSearchFilterChange(cellInd, e.target.value)}
                placeholder='Search'
              />
            }
            {headCell.filterType === 'groups' &&
              <FormControl
                sx={{ my: 1, width: 120 }} size="small"
              >
                <Select
                  multiple
                  value={Object.keys(props.filters[cellInd]).filter(group => props.filters[cellInd][group])}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {Object.keys(headCell.filterGroups).map((group, i) => (
                    <MenuItem 
                      onClick={(e) => handleGroupFilterChange(cellInd, group, !props.filters[cellInd][group])}
                      key={`group-${i}`}
                    >
                      <Checkbox
                        checked={props.filters[cellInd][group] == true}
                      />
                      <ListItemText primary={group} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}



function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >

      <Typography
        sx={{ flex: '1 1 100%' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        {props.tableTitle}
      </Typography>
    </Toolbar>
  );
}



export default function EnhancedTable(props: EnhancedTableProps) {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<Extract<keyof TableData, string>>(props.defaultSortBy);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const headCells: HeadCell[] = props.headKeys.map(key => headCellPool[key] as HeadCell);
  const [filters, setFilters] = React.useState(headCells.map(col => {
    if (!col.filterType) {
      return null
    }
    else if (col.filterType === 'groups') {
      return (col as HeadCell).filterGroups
    }
    else if (col.filterType === 'search') {
      return ''
    }
  }))

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: Extract<keyof TableData, string>,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const filteredRows = React.useMemo(
    () => {
      setPage(0);
      return filterData(formatTableData(props.headKeys, props.data), headCells, filters);
    },
    [filters, props.data],
  );

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;


  const visibleRows = React.useMemo(
    () =>
      stableSort(filteredRows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );


  return (
    <Container>
    <Box 
        display='flex'
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{ pt: 2, width: '100%' }}>
      {props.isPending && <Typography align='center' variant="h3" component="h2"> {props.pendingMessage} </Typography> }
      {!props.isPending && <Paper elevation={8} sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} tableTitle={props.title} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
              filters={filters}
              setFilters={setFilters}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;
                return (
                  <TableRow
                    hover
                    onClick={() => props.handleOnClick(row)}
                    tabIndex={-1}
                    key={labelId}
                    sx={{ cursor: 'pointer' }}
                  >
                    {headCells.map((col, colInd) => {
                      if (colInd == 0) {
                        return <TableCell
                          component="th"
                          id={labelId}
                          key={`${labelId}-${colInd}`}
                          scope="row">
                          {row[col.id]}
                        </TableCell>
                      } else {
                        return <TableCell
                          align={col.numeric ? 'right' : 'left'}
                          key={`${labelId}-${colInd}`}
                        >
                          {row[col.id]}
                        </TableCell>
                      }
                    }
                    )}
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper> }
    </Box>
  </Container>
  );
}