import { VotingMethod } from "@equal-vote/star-vote-shared/domain_model/Race";
import { Box, Button, Checkbox, FormControlLabel, FormGroup, MenuItem, Paper, Select, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useSubstitutedTranslation } from "./util";

export default () => {
    const [votingMethod, setVotingMethod] = useState('IRV')
    const [addToPublicArchive, setAddToPublicArchive] = useState(false)
    const [cvrs, setCvrs] = useState([])
    const {t} = useSubstitutedTranslation();
    const inputRef = useRef(null)

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleOnDrop = (e) => {
        e.preventDefault()
        addCvrs(e.dataTransfer.files)
    }

    const addCvrs = (files: FileList) => {
        // NOTE: FileList does not support map
        console.log(files)
        let new_files = [];
        for(let i = 0; i < files.length; i++){
            new_files.push({
                name: files[i].name,
                url: URL.createObjectURL(files[i])
            });
        }

        setCvrs([...cvrs, ...new_files])
    }

    return <Box
        display='flex'
        justifyContent="center"
        alignItems="center"
        flexDirection='column'
        sx={{ width: '100%', maxWidth: 800, margin: 'auto', mb: 1 }}
        gap={2}
    >
        <Typography variant='h3'>Upload Election(s)</Typography>        
        <Select
            name="Voting Method"
            label="Voting Method"
            value={votingMethod}
            onChange={(e) => setVotingMethod(e.target.value as VotingMethod)}
            disabled
        >
            <MenuItem key="IRV" value="IRV">
                Ranked Choice Voting (IRV)
            </MenuItem>
        </Select>

        {/* TODO: add a sys admin permission check*/ }
        <FormGroup>
            <FormControlLabel
            control={
                <Checkbox
                disabled={false}
                checked={addToPublicArchive}
                onChange={(e) => setAddToPublicArchive(e.target.checked)}
                />
            }
            label={t('upload_elections.add_to_public_archive')}
            />
        </FormGroup>

        <Box
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            border='4px dashed rgb(112,112,112)'
            sx={{ width: '100%', m: 0, p: 2 }}
            onDragOver={handleDragOver}
            onDrop={handleOnDrop}
        >
            <Typography variant="h6" component="h6" style={{ marginTop: 0 }}>
                Add Election CVR
            </Typography>
            <Box display='flex' flexDirection='row' alignItems='center'>
                <Typography variant="h6" component="h6" sx={{ m: 0 }} style={{}} >
                    Drag and Drop or&nbsp;
                </Typography>
                <input
                    type='file'
                    onChange={(e) => addCvrs(e.target.files)}
                    hidden
                    ref={inputRef} />
                <Button variant='outlined'
                    onClick={() => inputRef.current.click()} >
                    <Typography variant="h6" sx={{ m: 0 }}>
                        Select File(s)
                    </Typography>
                </Button>
            </Box>
        </Box>

        {cvrs.map((cvr, i) => 
            <Paper sx={{width: '100%', p: 1}}>
                <Typography key={i} component="p">{cvr.name}</Typography> 
            </Paper>
        )}

        <Button variant='contained'>Add (or update) elections</Button>
    </Box>
}