import React from 'react'
import { useState } from "react"
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { Checkbox, FormControlLabel, FormGroup, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material"
import { StyledButton } from '../styles';
import { Input } from '@mui/material';
import { DateTime } from 'luxon'
import { timeZones } from './TimeZones'
import { Election } from '../../../../domain_model/Election';


type Props = {
    election: Election
    applyElectionUpdate: (updateFunc: (election: Election) => any) => void,
    getStyle: any,
    onBack: Function,
    onNext: Function,
}

export default function ElectionDetails({ election, applyElectionUpdate, getStyle, onBack, onNext }: Props) {
    const dateToLocalLuxonDate = (date: Date | string | null | undefined, timeZone: string) => {
        // Converts either string date or date object to ISO string in input time zone
        if (date == null || date == '') return ''
        date = new Date(date)
        // Convert to luxon date and apply time zone offset, then convert to ISO string for input component
        return DateTime.fromJSDate(date)
            .setZone(timeZone)
            .startOf("minute")
            .toISO({ includeOffset: false, suppressSeconds: true, suppressMilliseconds: true })
    }

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
    })


    const isValidDate = (d: any) => {
        if (d instanceof Date) return !isNaN(d.valueOf())
        if (typeof (d) === 'string') return !isNaN(new Date(d).valueOf())
        return false
    }

    const timeZone = election.settings.time_zone ? election.settings.time_zone : DateTime.now().zone.name

    const [enableStartEndTime, setEnableStartEndTime] = useState(isValidDate(election.start_time) || isValidDate(election.end_time))
    const [defaultStartTime, setDefaultStartTime] = useState(isValidDate(election.start_time) ? election.start_time : DateTime.now().setZone(timeZone, { keepLocalTime: true }).toJSDate())
    const [defaultEndTime, setDefaultEndTime] = useState(isValidDate(election.end_time) ? election.end_time : DateTime.now().plus({ days: 1 }).setZone(timeZone, { keepLocalTime: true }).toJSDate())

    const validatePage = () => {
        let isValid = 1
        let newErrors = { ...errors }

        if (!election.title) {
            newErrors.title = 'Election title required';
            isValid = 0;
        }
        else if (election.title.length < 3 || election.title.length > 256) {
            newErrors.title = 'Election title must be between 3 and 256 characters';
            isValid = 0;
        }
        if (election.description && election.description.length > 1000) {
            newErrors.description = 'Description must be less than 1000 characters';
            isValid = 0;
        }
        if (election.start_time) {
            if (!isValidDate(election.start_time)) {
                newErrors.startTime = 'Invalid date';
                isValid = 0;
            }
        }

        if (election.end_time) {
            if (!isValidDate(election.end_time)) {
                newErrors.endTime = 'Invalid date';
                isValid = 0;
            }
            else if (election.end_time < new Date()) {
                newErrors.endTime = 'Start date must be in the future';
                isValid = 0;
            }
            else if (election.start_time && newErrors.startTime === '') {
                // If start date exists, has no errors, and is after the end date
                if (election.start_time >= election.end_time) {
                    newErrors.endTime = 'End date must be after the start date';
                    isValid = 0;
                }
            }
        }
        setErrors(errors => ({ ...errors, ...newErrors }))
        return isValid
    }


    return (
        <Grid container
            sx={{
                m: 0,
                p: 1,
            }}
        >
            <Grid item xs={12} sx={{ m: 0, p: 1 }}>
                <TextField
                    inputProps={{ pattern: "[a-z]{1,15}" }}
                    error={errors.title !== ''}
                    required
                    id="election-name"
                    name="name"
                    // TODO: This bolding method only works for the text fields, if we like it we should figure out a way to add it to other fields as well
                    // inputProps={getStyle('title')}
                    label="Election Title"
                    type="text"
                    value={election.title}
                    sx={{
                        m: 0,
                        p: 0,
                        boxShadow: 2,
                    }}
                    fullWidth
                    onChange={(e) => {
                        setErrors({ ...errors, title: '' })
                        applyElectionUpdate(election => { election.title = e.target.value })
                    }}
                />
                <FormHelperText error sx={{ pl: 1, pt: 0 }}>
                    {errors.title}
                </FormHelperText>
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
                    value={election.description}
                    sx={{
                        mx: { xs: 0, },
                        my: { xs: 0 },
                        boxShadow: 2,
                    }}
                    onChange={(e) => {
                        setErrors({ ...errors, description: '' })
                        applyElectionUpdate(election => { election.description = e.target.value })
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
                                        applyElectionUpdate(election => {
                                            election.start_time = defaultStartTime
                                            election.end_time = defaultEndTime
                                        })
                                    }
                                    else {
                                        applyElectionUpdate(election => {
                                        election.start_time = undefined
                                        election.end_time = undefined
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
                                onChange={(e) => applyElectionUpdate(election => { election.settings.time_zone = e.target.value })}
                            >
                                <MenuItem value={timeZone}>{timeZone}</MenuItem>
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
                                value={dateToLocalLuxonDate(election.start_time, timeZone)}
                                onChange={(e) => {
                                    setErrors({ ...errors, startTime: '' })
                                    if (e.target.value == null || e.target.value == '') {
                                        applyElectionUpdate(election => election.start_time = undefined)
                                    } else {
                                        applyElectionUpdate(election =>
                                            election.start_time = DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate())
                                            setDefaultStartTime( DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate() )
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
                                value={dateToLocalLuxonDate(election.end_time, timeZone)}
                                onChange={(e) => {
                                    setErrors({ ...errors, endTime: '' })
                                    if (e.target.value == null || e.target.value == '') {
                                        applyElectionUpdate(election => { election.end_time = undefined })
                                    } else {
                                        applyElectionUpdate(election =>
                                            election.end_time = DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate())
                                            setDefaultEndTime( DateTime.fromISO(e.target.value).setZone(timeZone, { keepLocalTime: true }).toJSDate() )
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
            <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    width="100%"
                    disabled={true}
                    onClick={() => {
                        if (validatePage()) {
                            onBack()
                        }
                    }}>
                    Back
                </StyledButton>
            </Grid>
            <Grid item xs={6}></Grid>
            <Grid item xs={3} sx={{ m: 0, p: 1, pt: 2 }}>
                <StyledButton
                    type='button'
                    variant="contained"
                    fullWidth
                    onClick={() => {
                        if (validatePage()) {
                            onNext()
                        }
                    }}>
                    Next
                </StyledButton>
            </Grid>
        </Grid>

    )
}
