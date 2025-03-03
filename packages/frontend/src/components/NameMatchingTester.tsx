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

type MatchingMethods = 'levenshtein' | 'dice' | 'hybrid'

const groupStrictClusters = (items: string[], similarityFn: SimilarityFn, threshold: number): string[][] => {
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
                if (!visited.has(other) && newCluster.every(member => similarityFn(member, other) >= threshold)) {
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

const levenshteinScore = (string1: string, string2: string) => {
    const distance = levenshtein.get(string1.toLowerCase(), string2.toLowerCase());
    const maxLength = Math.max(string1.length, string2.length);
    const similarity = 1 - distance / maxLength;
    return similarity
}


// Function to extract tokens and initials from a name
const extractTokens = (name: string): { words: string[]; initials: string[]; initialized: boolean } => {
    const tokens = name
        .replace(/\./g, "")
        .replace(/[^a-zA-Z\s.]/g, "") // Remove non-letters except spaces and periods
        .split(/\s+/); // Split by spaces

    let words: string[] = [];
    let initials: string[] = [];

    let initialized = false
    if (tokens.length === 1) {
        words.push(tokens[0]);
        initials.push(tokens[0])
    } else {
        words.push(...tokens)
        initials.push(words.map(word => word.charAt(0)).join(''))
        initialized = true
    }

    return { words, initials, initialized };
}

// Levenshtein-based token comparison
const compareTokenSets = (set1: string[], set2: string[]): number => {
    if (set1.length === 0 || set2.length === 0) return 0;

    let totalScore = 0;
    let comparisons = 0;

    for (const token1 of set1) {
        let bestMatch = 0;
        for (const token2 of set2) {
            if (token1.toLowerCase() === token2.toLowerCase()) {
                bestMatch = 1.0; // Exact match
            } else {
                if (token1.length>1 && token2.length>1){
                    const distance = levenshtein.get(token1.toLowerCase(), token2.toLowerCase())
                    const maxLength = Math.max(token1.length, token2.length)
                    const similarity = 1 - distance / maxLength
                    bestMatch = Math.max(bestMatch, similarity)
                } else if (token1.charAt(0) === token2.charAt(0)) {
                    bestMatch = Math.max(bestMatch,0.5)
                }
            }
        }
        totalScore += bestMatch;
        comparisons++;
    }

    return totalScore / Math.max(comparisons, 1); // Normalize score
}

// Initial comparison 
const compareInitials = (initials1: string[], initials2: string[]): number => {
    let bestScore = 0;
    // Check if the sets of initials match
    for (const initial1 of initials1) {
        for (const initial2 of initials2) {
            let score = levenshteinScore(initial1, initial2)
            if (score > bestScore) {
                bestScore = score
            }
        }
    }

    return bestScore
}

// Hybrid string similarity function
// Uses levenshteinScore score and token matching
const computeHybridSimilarity = (name1: string, name2: string): number => {
    const tokens1 = extractTokens(name1);
    const tokens2 = extractTokens(name2);

    const wordScore = compareTokenSets(tokens1.words, tokens2.words);

    const bothInitialized = tokens1.initialized && tokens2.initialized;
    const initialScore = bothInitialized ? 0 : compareInitials(tokens1.initials, tokens2.initials);

    const bonus = wordScore > 0 && initialScore > 0 ? 0.1 : 0; // 10% bonus if both match
    console.log(name1, name2)
    console.log(tokens1, tokens2)
    console.log('wordScore')
    console.log(wordScore)
    console.log('initialScore')
    console.log(initialScore)
    console.log('bonus')
    console.log(bonus)
    return Math.max(wordScore, initialScore) + bonus;
}

const NameMatchingTester = () => {

    const [names, setNames] = useState('John Fitzgerald Kennedy\nJFK\nJ.F.K\nJohn Kennedy\nJohn F. Kennedy\nJohn F. Kennedy Jr.\nJack Franklin Knight\nRobert\nRobbert')
    const [groups, setGroups] = useState(new Array<group>())
    const [method, setMethod] = useState<MatchingMethods>('hybrid')
    const [threshold, setThreshold] = useState(0.6)

    const groupNames = () => {
        const ungroupedNames = names.split('\n')
        let groupedNames: string[][] = []
        if (method === 'hybrid'){
            groupedNames = groupStrictClusters(ungroupedNames, computeHybridSimilarity, threshold)
        } else if (method === 'levenshtein') {
             groupStrictClusters(ungroupedNames, levenshteinScore, threshold)
        }
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

                    <MenuItem key="hybrid" value="hybrid">
                        hybrid
                    </MenuItem>

                </Select>
            </FormControl>

            <Typography gutterBottom component="p" sx={{ marginTop: 2 }}>
                Score Threshold
            </Typography>
            <TextField
                id={'levenshtein-threshold'}
                name="Levenshtein Threshold"
                type="number"
                InputProps={{
                    inputProps: {
                        min: 0,
                        max: 1,
                        step: 0.05
                    }
                }}
                fullWidth
                value={threshold}
                sx={{
                    p: 0,
                    boxShadow: 2,
                }}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
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

