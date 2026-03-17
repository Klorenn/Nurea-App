import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    Credentials({
      credentials: {
        rut: { label: "RUT", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.rut === "12345678-9") {
          return {
            id: "1",
            name: "Dr. Test",
            rut: "12345678-9",
            role: "professional",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

