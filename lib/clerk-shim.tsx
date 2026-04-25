"use client"

/**
 * Compatibility shim that mimics Clerk's `useUser` / `useAuth` hooks but
 * delegates to Supabase auth.
 */

export { useUser } from "@/hooks/use-user"
export { useAuth } from "@/hooks/use-auth"

/* — The rest are inert components kept for import compatibility — */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => children
export const useSignIn = () => ({})
export const useSignUp = () => ({})
export const SignUp = () => null
export const SignIn = () => null
export const AuthenticateWithRedirectCallback = () => null
