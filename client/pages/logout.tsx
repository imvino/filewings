import { signOut } from 'next-auth/react';
import React, { useEffect } from 'react';


export default function Logout() {

    useEffect(() => {
        signOut()
    }, [])

    return <></>

}