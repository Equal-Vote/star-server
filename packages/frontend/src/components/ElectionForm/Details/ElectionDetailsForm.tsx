import React from 'react'
import { useState } from "react"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { Checkbox, Divider, FormControlLabel, FormGroup, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material"
import { Input } from '@mui/material';
import { DateTime } from 'luxon'
import { timeZones } from './TimeZones'
import { isValidDate } from '../../util';
import { dateToLocalLuxonDate } from './useEditElectionDetails';

export const ElectionTitleField = ({value, onUpdateValue, errors, setErrors, showLabel=true}) => <>
    <TextField
        inputProps={{ pattern: "[a-z]{3,15}" }}
        error={errors.title !== ''}
        required
        id="election-name"
        name="name"
        // TODO: This bolding method only works for the text fields, if we like it we should figure out a way to add it to other fields as well
        // inputProps={getStyle('title')}
        label={showLabel? "Election Title" : ""}
        type="text"
        value={value}
        sx={{
            m: 0,
            p: 0,
            boxShadow: 2,
        }}
        fullWidth
        onChange={(e) => {
            setErrors({ ...errors, title: '' });
            onUpdateValue(e.target.value);
        }}
        
    />
    <FormHelperText error sx={{ pl: 1, pt: 0 }}>
        {errors.title}
    </FormHelperText>
</>;


export default function ElectionDetailsForm({editedElection, applyUpdate, errors, setErrors}) {

    const timeZone = editedElection.settings.time_zone ? editedElection.settings.time_zone : DateTime.now().zone.name

    const [enableStartEndTime, setEnableStartEndTime] = useState(isValidDate(editedElection.start_time) || isValidDate(editedElection.end_time))
    const [defaultStartTime, setDefaultStartTime] = useState(isValidDate(editedElection.start_time) ? editedElection.start_time : DateTime.now().setZone(timeZone, { keepLocalTime: true }).toJSDate())
    const [defaultEndTime, setDefaultEndTime] = useState(isValidDate(editedElection.end_time) ? editedElection.end_time : DateTime.now().plus({ days: 1 }).setZone(timeZone, { keepLocalTime: true }).toJSDate())
    
    return (
        <Grid container sx={{p: 4}}>
            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                <ElectionTitleField
                    value={editedElection.title}
                    onUpdateValue={
                        (value) => applyUpdate(election => { election.title = value })
                    }
                    errors={errors}
                    setErrors={setErrors}
                />
            </Grid>
            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                <TextField
                    id="election-description"
                    name="description"
                    label="Description"
                    multiline
                    fullWidth
                    type="text"
                    error={errors.description !== ''}
                    value={editedElection.description}
                    sx={{
                        mx: { xs: 0, },
                        my: { xs: 0 },
                        boxShadow: 2,
                    }}
                    onChange={(e) => {
                        setErrors({ ...errors, description: '' })
                        applyUpdate(election => { election.description = e.target.value })
                    }}
                />
                <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                    {errors.description}
                </FormHelperText>
            </Grid>

            <Grid item xs={12} sx={{ m: 0, p: 1 }}>

                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={enableStartEndTime}
                                onChange={(e) => {
                                    setEnableStartEndTime(e.target.checked)
                                    if (e.target.checked) {
                                        applyUpdate(election => { 
                                            election.start_time = defaultStartTime;
                                            election.end_time = defaultEndTime;
                                        })
                                    }
                                    else {
                                        applyUpdate(election => { 
                                            election.start_time = undefined;
                                            election.end_time = undefined;
                                        })
                                    }
                                }
                                }
                            />
                        }
                        label="Enable Start/End Times?" />
                </FormGroup>
            </Grid>

            {enableStartEndTime &&
                <>
                    <Grid item xs={4} sx={{ m: 0, p: 1 }} justifyContent='center'>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Time Zone</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={timeZone}
                                label="Time Zone"
                                onChange={(e) => applyUpdate(election => { election.settings.time_zone = e.target.value })}
                            >
                                <MenuItem value={DateTime.now().zone.name}>{DateTime.now().zone.name}</MenuItem>
                                <Divider />
                                {timeZones.map(tz =>
                                    <MenuItem value={tz.ID}>{tz.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={8}></Grid>
                    <Grid item xs={6} sx={{ m: 0, p: 1 }} justifyContent='center' >
                        <FormControl fullWidth>
                            <InputLabel shrink>
                                Start Date
                            </InputLabel>
                            <Input
                                type='datetime-local'
                                error={errors.startTime !== ''}
                                value={dateToLocalLuxonDate(editedElection.start_time, timeZone)}
                                onChange={(e) => {
                                    setErrors({ ...errors, startTime: '' })
                                    if (e.target.value == null || e.target.value == '') {
                                        applyUpdate(election => { election.start_time = undefined })
                                    } else {
                                        applyUpdate(election => { election.start_time = DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate()})
                                        setDefaultStartTime(DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate())
                                    }

                                }}
                            />
                            <FormHelperText error sx={{ pl: 0, mt: 0 }}>
                                {errors.startTime}
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sx={{ m: 0, p: 1 }} justifyContent='center'>
                        <FormControl fullWidth>
                            <InputLabel shrink>
                                Stop Date
                            </InputLabel>
                            <Input
                                type='datetime-local'
                                error={errors.endTime !== ''}
                                value={dateToLocalLuxonDate(editedElection.end_time, timeZone)}
                                onChange={(e) => {
                                    setErrors({ ...errors, endTime: '' })
                                    if (e.target.value == null || e.target.value == '') {
                                        applyUpdate(election => { election.end_time = undefined})
                                    } else {
                                        applyUpdate(election => { election.end_time = DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate()})
                                        setDefaultEndTime(DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate())
                                    }
                                }}
                            />
                            <FormHelperText error sx={{ pl: 0, mt: 0 }}>
                                {errors.endTime}
                            </FormHelperText>
                        </FormControl>
                    </Grid>

                </>

            }
        </Grid>
    )
}
