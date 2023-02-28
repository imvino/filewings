import { withAuth } from "next-auth/middleware";
// Check Auth to secure page
export default withAuth(
    function middleware(req, res) {
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                token ? console.log("Authorized") : console.log("UnAuthorized");
                return !!token;
            },
        },
        secret: process.env.NEXT_PUBLIC_NEXT_AUTH_SECRET,
    });
export const config = { matcher: ['/', '/upload', '/shared', '/account'] }




