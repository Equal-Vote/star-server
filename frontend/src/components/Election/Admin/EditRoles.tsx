import { useState } from "react"
import React from 'react'
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useNavigate } from "react-router"
import PermissionHandler from "../../PermissionHandler";
import { usePutElectionRoles } from "../../../hooks/useAPI";

const EditRoles = ({ election, permissions }) => {
    const navigate = useNavigate()

    const [adminList, setAdminList] = useState(() => {
        if (election.admin_ids === null) return ''
        return election.admin_ids.join('\n')
    })

    const [auditorList, setAuditorList] = useState(() => {
        if (election.audit_ids === null) return ''
        return election.audit_ids.join('\n')
    })

    const [credentialList, setCredentialList] = useState(() => {
        if (election.credential_ids === null) return ''
        return election.credential_ids.join('\n')
    })

    const putRoles = usePutElectionRoles(election.election_id)

    const onSubmit = async (e) => {
        e.preventDefault()
        try {
            const admin_ids = adminList == '' ? null : adminList.split('\n')
            const audit_ids = auditorList == '' ? null : auditorList.split('\n')
            const credential_ids = credentialList == '' ? null : credentialList.split('\n')

            const newRoles = await putRoles.makeRequest({ admin_ids, audit_ids, credential_ids })
            console.log(newRoles)
            if (!newRoles) {
                throw Error("Error submitting rolls");
            }
            navigate(`/Election/${election.election_id}/admin`)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <Container maxWidth='sm'>
                <Grid container direction="column" >
                    <Grid item>
                        <TextField
                            id="admin-list"
                            name="admin-list"
                            label="Admin List"
                            multiline
                            fullWidth
                            type="text"
                            value={adminList}
                            onChange={(e) => setAdminList(e.target.value)}
                            helperText="Emails of election admins, one email per line"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="auditor-list"
                            name="id-list"
                            label="Auditor List"
                            multiline
                            fullWidth
                            type="text"
                            value={auditorList}
                            onChange={(e) => setAuditorList(e.target.value)}
                            helperText="Emails of election audotors, one email per line"
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            id="credentialer-list"
                            name="credentialer-list"
                            label="Credentialer List"
                            multiline
                            fullWidth
                            type="text"
                            value={credentialList}
                            onChange={(e) => setCredentialList(e.target.value)}
                            helperText="Emails of election audotors, one email per line"
                        />
                    </Grid>

                    <PermissionHandler permissions={permissions} requiredPermission={'canEditElectionRoles'}>
                        <input
                            type='submit'
                            value='Submit'
                            className='btn btn-block'
                            disabled={putRoles.isPending} />
                    </PermissionHandler>
                </Grid>
            </Container>
        </form>
    )
}

export default EditRoles