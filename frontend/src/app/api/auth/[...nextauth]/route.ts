import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        console.error("No email returned from OAuth provider");
        return false;
      }

      try {
        const response = await axios.post(
          `${process.env.EXPRESS_API_URL}/social-login`,
          {
            email: user.email,
            username: user.name || "Unknown",
            provider: account?.provider,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        return response.status === 200;
      } catch (error: any) {
        console.error("Social login error:", error.response?.data || error.message);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.provider = account?.provider;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          email: token.email || "",
          name: token.name || "Unknown",
          provider: token.provider || "",
        },
      };
    },

//    async redirect({ url, baseUrl }) {
//      return "/dashboard"; // ✅ Redirect to dashboard after login
//    },
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
