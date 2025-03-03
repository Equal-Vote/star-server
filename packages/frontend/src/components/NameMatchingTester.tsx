import React, { useEffect, useState } from 'react'
import { Container, FormHelperText, Grid, Paper, Stack, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { Box, InputLabel } from "@mui/material";
import levenshtein from 'fast-levenshtein';
import { DragHandle, SortableList } from './DragAndDrop';


type group = {
    id: number,
    groupName: string,
    names: string[]
}

type SimilarityFn = (a: string, b: string) => number;

type MatchingMethods = 'levenshtein' | 'dice'

function groupStrictClusters(items: string[], similarityFn: SimilarityFn, threshold: number): string[][] {
    // Basic clustering function, clusters items such all items in cluster are within threshold of similarity function of each other
    // Not optimal clustering, so the first cluster an item can join it will

    let clusters: string[][] = [];
    let visited = new Set<string>();

    for (let item of items) {
        if (visited.has(item)) continue;

        let newCluster = [item];
        let toCheck = [item];
        visited.add(item);

        while (toCheck.length > 0) {
            toCheck.pop();
            for (let other of items) {
                if (!visited.has(other) && newCluster.every(member => similarityFn(member, other) <= threshold)) {
                    newCluster.push(other);
                    toCheck.push(other);
                    visited.add(other);
                }
            }
        }

        clusters.push(newCluster);
    }

    return clusters;
}

const NameMatchingTester = () => {

    const [names, setNames] = useState('Jack Smith\nJak Smith\nJames Smith\nBill\nCarl')
    const [groups, setGroups] = useState(new Array<group>())
    const [method, setMethod] = useState<MatchingMethods>('levenshtein')
    const [levenshteinThreshold, sestLevenshteinThreshold] = useState(2)

    const groupNames = () => {
        const ungroupedNames = names.split('\n')
        const groupedNames = groupStrictClusters(ungroupedNames, levenshtein.get, levenshteinThreshold)

        setGroups(groupedNames.map((g, i) => {
            return {
                id: i,
                groupName: g[0],
                names: g,
            }
        }
        ))
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                flexDirection: 'column',
                backgroundColor: 'lightShade.main',
                padding: 3,
                maxWidth: 800
            }}
        >
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                Names
            </InputLabel>
            <TextField
                id="cvr"
                name="cvr"
                multiline
                rows="10"
                type="text"
                value={names}
                helperText="List of names to group, one name per liness"
                onChange={(e) => setNames(e.target.value)}
            />
            <FormControl fullWidth>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                    Matching Method
                </InputLabel>
                <Select
                    name="Matching Method"
                    label="Matching Method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as MatchingMethods)}
                >
                    <MenuItem key="levenshtein" value="levenshtein">
                        levenshtein
                    </MenuItem>

                </Select>
            </FormControl>

            <Typography gutterBottom component="p" sx={{ marginTop: 2 }}>
                Threshold
            </Typography>
            <TextField
                id={'levenshtein-threshold'}
                name="Levenshtein Threshold"
                type="number"
                InputProps={{
                    inputProps: {
                        min: 1
                    }
                }}
                fullWidth
                value={levenshteinThreshold}
                sx={{
                    p: 0,
                    boxShadow: 2,
                }}
                onChange={(e) => sestLevenshteinThreshold(parseInt(e.target.value))}
            />
            <Button variant='outlined' onClick={() => groupNames()} > Group Names </Button>
            {groups.map(group => <>
                <Typography variant="h6" >
                    {group.groupName}
                </Typography>

                {group.names.map(name => <li> {name} </li>)}

            </>
            )}

            <Stack spacing={2}>
                {
                    <SortableList
                        items={groups}
                        identifierKey="groupName"
                        onChange={(newGroups) => setGroups(newGroups)}
                        renderItem={(group, index) => (
                            <SortableList.Item id={group.groupName}>
                                <Paper elevation={4} sx={{ width: '40%' }}>
                                    <Box
                                        sx={{ display: 'flex', justifyContent: 'left', bgcolor: 'background.paper', borderRadius: 10 }}
                                        alignItems={'center'}
                                    >
                                        <DragHandle style={{ marginLeft: 5 }} />
                                        <p>{group.groupName}</p>
                                    </Box>
                                </Paper>
                            </SortableList.Item>
                        )}
                    />
                }
            </Stack>
        </Box>
    )
}
export default NameMatchingTester

