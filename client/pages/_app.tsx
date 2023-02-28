import { useState } from 'react';
import NextApp, { AppProps, AppContext } from 'next/app';
import { getCookie, setCookie } from 'cookies-next';
import Head from 'next/head';
import { AppShell, MantineProvider, ColorScheme, ColorSchemeProvider } from '@mantine/core';
import { SidebarMenu, HeaderMenu } from '../layout'
import { SessionProvider } from "next-auth/react"
import 'react-toastify/dist/ReactToastify.css';



export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
  };


  return (
    <>
      <Head>
        <title>FileWings | Cloud Hosting</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{
          colorScheme,
          components: {
            Container: {
              defaultProps: {
                sizes: {
                  xs: 540,
                  sm: 720,
                  md: 960,
                  lg: 1140,
                  xl: 1425,
                },
              },
            },
          },
          globalStyles: (theme) => ({
            '*, *::before, *::after': {
              boxSizing: 'border-box',
            },

            body: {
              ...theme.fn.fontStyles(),
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
              color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
              lineHeight: theme.lineHeight,
            },
            '.widgetLink': {
              display: 'grid',
              width: '100%',
              padding: theme.spacing.md,
              color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

              // '&:hover': {
              //   backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
              //   border: '0',
              //   borderRadius: '8px'
              // },
            },

            '.your-class': {
              backgroundColor: 'red',
            },

            '#your-id > [data-active]': {
              backgroundColor: 'pink',
            },

          }),
        }} withGlobalStyles withNormalizeCSS>
          <SessionProvider session={session}>
            <AppShell
              padding="md"
              fixed={false}
              navbar={<SidebarMenu router={props.router.state?.route} />}
              header={<HeaderMenu />}
              styles={(theme) => ({
                main: {
                  backgroundColor:
                    theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                },
              })}
            >
              <Component {...pageProps} />
            </AppShell>
          </SessionProvider>
        </MantineProvider>
      </ColorSchemeProvider>

    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie('mantine-color-scheme', appContext.ctx) || 'dark',
  };
};

