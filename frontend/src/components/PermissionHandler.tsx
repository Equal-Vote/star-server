import React from 'react'

type PermissionHandlerProps = {
    permissions: string[],
    requiredPermission: string,
    children: any
}

const PermissionHandler = ({permissions,requiredPermission,children}:PermissionHandlerProps) => {
    if (permissions && permissions.includes(requiredPermission)){
        return children
    }
    return <></>
}

export default PermissionHandler
