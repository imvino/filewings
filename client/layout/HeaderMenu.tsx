import { FC } from 'react';
import {
  Avatar,
  ActionIcon,
  createStyles,
  Header,
  Group,
  UnstyledButton,
  Text,
  Box, Image,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconMoonStars,
  IconSun,
} from '@tabler/icons';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';


const useStyles = createStyles((theme) => ({
  logo: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: 42,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

const ThemeSwitch: FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <Group position="center" my="md">
      <ActionIcon
        onClick={() => toggleColorScheme()}
        size="lg"
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
          color:
            theme.colorScheme === 'dark'
              ? theme.colors.yellow[4]
              : theme.colors.blue[6],
        })}
      >
        {colorScheme === 'dark' ? (
          <IconSun size={18} />
        ) : (
          <IconMoonStars size={18} />
        )}
      </ActionIcon>
    </Group>
  );
};

const UserMenu = ({ user }) => {
  const { classes } = useStyles();
  const nxtRouter = useRouter();

  return (
    <UnstyledButton
      onClick={() => nxtRouter?.push('/account')}
    >
      <Group spacing={7}>
        <Avatar
          src={user.image}
          alt={user.name}
          radius="xl"
          size={30}
        />
        <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3} className={classes.hiddenMobile}>
          {user.name}
        </Text>
      </Group>
    </UnstyledButton>
  );
};

const Logo: FC = () => {
  const { theme } = useStyles();
  return (
    <Group position="left" sx={{ height: '100%' }}>
      <Image src="/favicon.svg" alt="logo" width={40} />
      <Text fw={700} c={theme.colorScheme === 'dark' ? theme.white : theme.colors.indigo[7]}>FileWings</Text>
    </Group>
  );

}

export function HeaderMenu() {
  const { data: session } = useSession()

  return (
    <Box>
      <Header height={60} px="md">
        <Group position="apart" sx={{ height: '100%' }}>
          <Logo />
          <Group>
            <ThemeSwitch />
            {session && <UserMenu user={session.user} />}
          </Group>
        </Group>
      </Header>
    </Box>

  );
}
