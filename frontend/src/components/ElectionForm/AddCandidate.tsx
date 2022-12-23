// import Button from "./Button"
import { useRef, useState, useCallback } from 'react'
import { Candidate } from "../../../../domain_model/Candidate"
import React from 'react'
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Cropper from 'react-easy-crop';
import getCroppedImg from './PhotoCropper';

type CandidateProps = {
    onEditCandidate: Function,
    candidate: Candidate,
    index: number
}

const AddCandidate = ({ onEditCandidate, candidate, index }: CandidateProps) => {

    const [editCandidate, setEditCandidate] = useState(false)
    const [candidatePhotoFile, setCandidatePhotoFile] = useState(null)
    const inputRef = useRef(null)

    const onApplyEditCandidate = (updateFunc) => {
        const newCandidate = { ...candidate }
        console.log(newCandidate)
        updateFunc(newCandidate)
        onEditCandidate(newCandidate)
    }
    const handleEnter = (e) => {
        // Go to next entry instead of submitting form
        const form = e.target.form;
        const index = Array.prototype.indexOf.call(form, e.target);
        form.elements[index + 3].focus();
        e.preventDefault();
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }
    const handleOnDrop = (e) => {
        e.preventDefault()
        setCandidatePhotoFile(URL.createObjectURL(e.dataTransfer.files[0]))
    }

    const [zoom, setZoom] = useState(1)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const onCropChange = (crop) => { setCrop(crop) }
    const onZoomChange = (zoom) => { setZoom(zoom) }
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const postImage = async (image) => {
        const url = '/API/images'

        var fileOfBlob = new File([image], 'image.jpg', { type: "image/jpeg" });
        var formData = new FormData()
        formData.append('file', fileOfBlob)
        const options = {
            method: 'post',
            body: formData
        }
        const response = await fetch(url, options)
        if (!response.ok) {
            return false
        }
        const data = await response.json()
        onApplyEditCandidate((candidate) => { candidate.photo_filename = data.photo_filename })
        return true
    }
    const saveImage = async () => {
        const image = await getCroppedImg(
            candidatePhotoFile,
            croppedAreaPixels
        )
        if (await postImage(image)) {
            setCandidatePhotoFile(null)
        }
    }

    return (
        <>
            <Grid item xs={10} sx={{ display: "flex", alignItems: "center", m: 0, p: 1 }}>
                <TextField
                    id={`candidate-name-${String(index)}`}
                    name="new-candidate-name"
                    label="Name"
                    type="text"
                    value={candidate.candidate_name}
                    fullWidth
                    sx={{
                        px: 0,
                        boxShadow: 2,
                    }}
                    onChange={(e) => onApplyEditCandidate((candidate) => { candidate.candidate_name = e.target.value })}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleEnter(e)
                        }
                    }}
                />
            </Grid>
            {editCandidate ?
                <Grid item xs={2} sx={{ display: "flex", alignItems: "center", m: 0, p: 1 }}>
                    <Button
                        onClick={() => setEditCandidate(false)}
                    >
                        <Typography variant="h6" component="h6"> Save </Typography>
                    </Button>
                </Grid>
                :
                <Grid item xs={2} sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                        onClick={() => setEditCandidate(true)}
                    >
                        <Typography variant="h6" component="h6"> Add Bio </Typography>
                    </Button>
                </Grid>}
            {editCandidate &&
                <>
                    <Grid item xs={10} sx={{ m: 0, p: 1, pl: 3 }}>
                        <TextField
                            id="bio"
                            name="bio"
                            label="Bio"
                            type="text"
                            multiline
                            fullWidth
                            value={candidate.bio}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.bio = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sx={{ m: 0, p: 1, pl: 3 }}>
                        <TextField
                            id="long-name"
                            name="long name"
                            label="Full Name"
                            type="text"
                            fullWidth
                            value={candidate.full_name}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.full_name = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sx={{ m: 0, p: 1, pl: 3}}>
                        <TextField
                            id="candidate url"
                            name="candidate url"
                            label="Candidate URL"
                            type="url"
                            fullWidth
                            value={candidate.candidate_url}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.candidate_url = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sx={{ m: 0, p: 1, pl: 3 }}>
                        <TextField
                            id="Party"
                            name="Party"
                            label="Party"
                            type="text"
                            fullWidth
                            value={candidate.party}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.party = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={10} sx={{ m: 0, p: 1, pl: 3 }}>
                        <TextField
                            id="party url"
                            name="party url"
                            label="Party URL"
                            type="url"
                            fullWidth
                            value={candidate.partyUrl}
                            sx={{
                                m: 0,
                                p: 0,
                                boxShadow: 2,
                            }}
                            onChange={(e) => onApplyEditCandidate((candidate) => { candidate.partyUrl = e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} sx={{ m: 0, p: 1, pl: 3}}>
                        <Typography variant="h6" component="h6">
                            Candidate Photo
                        </Typography>
                    </Grid>
                    {!candidatePhotoFile &&
                        <Grid item xs={10} md={5} sx={{ display: "flex", alignItems: "center", m: 0, p: 1, pl: 3 }}>
                            <Box
                                display={'flex'}
                                flexDirection={'column'}
                                justifyContent={'center'}
                                alignItems={'center'}
                                height={'200px'}
                                border={'4px dashed rgb(112,112,112)'}
                                sx={{ p: 1 }}
                                onDragOver={handleDragOver}
                                onDrop={handleOnDrop}>
                                <Typography variant="h6" component="h6">
                                    Drag and Drop
                                </Typography>
                                <Typography variant="h6" component="h6">
                                    Or
                                </Typography>
                                <input
                                    type='file'
                                    onChange={(e) => setCandidatePhotoFile(URL.createObjectURL(e.target.files[0]))}
                                    hidden
                                    ref={inputRef} />
                                <Button variant='outlined'
                                    onClick={() => inputRef.current.click()} >
                                    <Typography variant="h6" component="h6">
                                        Select File
                                    </Typography>
                                </Button>

                            </Box>
                        </Grid>
                    }

                    {!candidatePhotoFile && candidate.photo_filename &&
                        <Grid item xs={10} md={5} sx={{ display: "flex", alignItems: "center", m: 0, p: 1, pl: 3 }}>
                            <img src={candidate.photo_filename} style={{ width: 200, height: 200 }} />
                        </Grid>
                    }
                    {candidatePhotoFile &&
                        <Grid item xs={12} sx={{ m: 0, p: 1, pl: 3 }}>
                            <Box
                                position='relative'
                                width={'100%'}
                                height={'300px'}
                            >
                                <Cropper
                                    image={candidatePhotoFile}
                                    zoom={zoom}
                                    crop={crop}
                                    onCropChange={onCropChange}
                                    onZoomChange={onZoomChange}
                                    onCropComplete={onCropComplete}
                                    aspect={1}
                                />
                            </Box>
                            <Button variant='outlined'
                                onClick={() => saveImage()} >
                                <Typography variant="h6" component="h6">
                                    Save
                                </Typography>
                            </Button>
                            <Button variant='outlined'
                                onClick={() => setCandidatePhotoFile(null)} >
                                <Typography variant="h6" component="h6">
                                    Cancel
                                </Typography>
                            </Button>
                        </Grid>}
                </>
            }
        </>
    )
}

export default AddCandidate
