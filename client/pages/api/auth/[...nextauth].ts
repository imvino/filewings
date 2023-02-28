import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

// google gives refresh token only for the 1st time login so user have to login
//again after 1hr in case to force refresh token below refreshAccessToken() can be called again
async function refreshAccessToken(token) {
  try {
    const url =
      'https://oauth2.googleapis.com/token?' +
      new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refresh_token,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // console.log(refreshedTokens,'refreshedTokens');
    refreshedTokens.refresh_token ?? token.refresh_token;

    return {
      ...token,
      account: refreshedTokens, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        const isAllowedToSignIn = await axios.post(
          `${process.env.NEXT_PUBLIC_NODE_URL}/api/auth/signin`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${account.id_token}`,
              Origin: process.env.NEXT_PUBLIC_APP_URL,
            },
          }
        );
        if (isAllowedToSignIn.status) {
          return true;
        } else {
          // Return false to display a default error message
          return false;
          // Or you can return a URL to redirect to:
          // return '/unauthorized'
        }
      } catch (err) {
        console.log(err);
      }
    },
    async session({ session, token, user }) {
      if (token.account) {
        session.account = token.account;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account) {
        token.account = account;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
