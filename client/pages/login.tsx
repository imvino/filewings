import React from 'react';
import {
    Paper,
    Button,
    Text, Container, Title
} from '@mantine/core';
import { signIn, getSession } from "next-auth/react"
import { IconBrandGoogle } from '@tabler/icons';

export default function Login(props) {

    return (
        <Container size={420} my={40} h='100vh'>
            <Title
                align="center"
                sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
            >
                Welcome back!
            </Title>
            <Text color="dimmed" size="sm" align="center" mt={5}>
                Login to start uploading your files
            </Text>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <Button leftIcon={<IconBrandGoogle size={18} />} fullWidth mt="xl" onClick={() => signIn("google")}>
                    Sign In with Google
                </Button>
            </Paper>
        </Container>
    );
}

export async function getServerSideProps({ req }) {
    //redirect user if already loggedIn
    const session = await getSession({ req });
    if (session) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
    return {
        props: {
            session,
        },
    };
}