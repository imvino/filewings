import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react"
import { Avatar, Text, Paper } from '@mantine/core';


export default function Account() {
    const [userInfo, setUserInfo] = useState({ name: '', email: '', image: '' });
    const { data: session } = useSession()

    useEffect(() => {
        if (session) {
            let { name, email, image } = session.user
            return setUserInfo({ name, email, image });
        }
    }, [session])

    if (!userInfo) return <></>
    return (
        <>
            <h1>Account</h1>
            <Paper
                radius="md"
                withBorder
                p="lg"
                sx={(theme) => ({
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
                })}
            >
                <Avatar src={userInfo.image} size={120} radius={120} mx="auto" />
                <Text align="center" size="lg" weight={500} mt="md">
                    {userInfo.name}
                </Text>
                <Text align="center" color="dimmed" size="sm">
                    {userInfo.email}
                </Text>
            </Paper>
        </>
    );
}

