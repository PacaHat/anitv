import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next"; // <-- Add this import

const AniListProvider = {
  id: "anilist",
  name: "AniList",
  type: "oauth",
  authorization: {
    url: "https://anilist.co/api/v2/oauth/authorize",
    params: { scope: "" }
  },
  token: "https://anilist.co/api/v2/oauth/token",
  userinfo: {
    url: "https://graphql.anilist.co",
    async request(context) {
      const { data } = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${context.tokens.access_token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: `
            query {
              Viewer {
                id
                name
                avatar {
                  large
                  medium
                }
                bannerImage
                createdAt
                mediaListOptions {
                  animeList {
                    customLists
                  }
                }
              }
            }
          `,
        }),
      }).then((res) => res.json());

      const userLists = data.Viewer?.mediaListOptions.animeList.customLists;
      let customLists = userLists || [];

      if (!userLists?.includes("Watched Via Airin")) {
        customLists.push("Watched Via Airin");
        await modifiedLists(customLists, context.tokens.access_token);
      }

      return {
        token: context.tokens.access_token,
        name: data.Viewer.name,
        sub: data.Viewer.id,
        image: data.Viewer.avatar,
        createdAt: data.Viewer.createdAt,
        list: data.Viewer?.mediaListOptions.animeList.customLists,
      };
    }
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      image: profile.image,
      createdAt: profile.createdAt,
      list: profile.list,
    }
  },
  clientId: process.env.ANILIST_CLIENT_ID,
  clientSecret: process.env.ANILIST_CLIENT_SECRET
}

async function modifiedLists(lists, accessToken) {
  const setList = `
    mutation($lists: [String]) {
      UpdateUser(animeListOptions: { customLists: $lists }) {
        id
      }
    }
  `;
  await fetchGraphQL(setList, { lists }, accessToken);
}

async function fetchGraphQL(query, variables, accessToken) {
  const response = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [AniListProvider],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
          name: user.name,
          image: user.image,
          createdAt: user.createdAt,
          list: user.list,
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;
      session.user.name = token.name;
      session.user.image = token.image;
      session.user.createdAt = token.createdAt;
      session.user.list = token.list;
      return session;
    },
  },
}

const handler = NextAuth(authOptions);

export const getAuthSession = () => getServerSession(authOptions);

export { handler as GET, handler as POST };
