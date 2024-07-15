import React, { useState } from 'react'
import { FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, Typography } from "@mui/material"
import useElection from '../../ElectionContextProvider';

export default function ElectionAuthForm() {

    const { election, refreshElection, permissions, updateElection } = useElection()
    const ip = election.settings.voter_authentication.ip_address == true
    const device_id = election.settings.voter_authentication.voter_id == true
    const email = election.settings.voter_authentication.email == true
    const none = !(ip || device_id || email)

    const handleUpdate = async (voter_authentication) => {
        await updateElection(election => election.settings.voter_authentication = voter_authentication)
        await refreshElection()
    }

    return (
        <Paper elevation={3}>
            <Grid container
                sx={{
                    m: 0,
                    p: 1,
                }}
            >
                <Grid xs={12}>
                    <Typography gutterBottom variant="h4" component="h4">
                        Voter Authentication
                    </Typography>
                </Grid>
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Limit to one vote per...</FormLabel>
                    <FormControlLabel value="female" control={
                        <Radio
                            disabled = {election.state !== 'draft'}
                            checked={none}
                            onChange={() => handleUpdate({})}
                            value="none"
                        />}
                        label="No Limit" />
                    <FormControlLabel value="female" control={
                        <Radio
                            disabled = {election.state !== 'draft'}
                            checked={ip}
                            onChange={() => handleUpdate({ ip_address: true })}
                            value="ip"
                        />}
                        label="IP Address" />
                    <FormControlLabel value="female" control={
                        <Radio
                            disabled = {election.state !== 'draft'}
                            checked={device_id}
                            onChange={() => handleUpdate({ voter_id: true })}
                            value="device_id"
                        />}
                        label="Device" />

                    <FormControlLabel value="female" control={
                        <Radio
                            disabled = {election.state !== 'draft'}
                            checked={email}
                            onChange={() => handleUpdate({ email: true })}
                            value="email"
                        />}
                        label="Login Email Address" />
                </FormControl>
            </Grid>
        </Paper>
    )
}