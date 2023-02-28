import { useEffect, useState } from 'react';
import { Navbar, Tooltip, UnstyledButton, createStyles, Stack } from '@mantine/core';
import {
    IconUser,
    IconGauge,
    IconLogout,
} from '@tabler/icons';
import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from "next-auth/react"

const useStyles = createStyles((theme) => ({
    link: {
        width: 50,
        height: 50,
        borderRadius: theme.radius.md,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],

        '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
        },
    },

    active: {
        '&, &:hover': {
            backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
            color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
        },
    },
}));


function NavbarLink({ icon: Icon, label, active, onClick }) {
    const { classes, cx } = useStyles();
    return (
        <Tooltip label={label} position="right" transitionDuration={0}>
            <UnstyledButton onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
                <Icon stroke={1.5} />
            </UnstyledButton>
        </Tooltip>
    );
}

const iconList = [
    { icon: IconGauge, label: 'Dashboard', url: '/' },
    { icon: IconUser, label: 'Account', url: '/account' },
];

export function SidebarMenu({ router }) {
    const [active, setActive] = useState('/');
    const nxtRouter = useRouter();
    const { data: session } = useSession()

    useEffect(() => {
        setActive(router);
    }, [router])

    useEffect(() => {
        //force exit
        const now = parseInt(Date.now() / 1000);
        if (session?.account) {
            if (session.account.expires_at < now) {
                signOut()
            }
        }
    }, [session])

    let links = iconList.map((link, index) => (
        <NavbarLink
            {...link}
            key={link.label}
            active={active == link.url}
            onClick={() => nxtRouter?.push(link.url)}
        />
    ));


    if (!session) return <></>
    return (
        <Navbar width={{ base: 80 }} p="md">
            <Navbar.Section grow mt={50}>
                <Stack justify="center" spacing={0}>
                    {links}
                </Stack>
            </Navbar.Section>
            <Navbar.Section>
                <Stack justify="center" spacing={0}>
                    <NavbarLink icon={IconLogout} onClick={() => signOut()} label="Logout" />
                </Stack>
            </Navbar.Section>
        </Navbar>
    );
}
