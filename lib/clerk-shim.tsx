// Stub file to make imports work
export const useUser = () => ({ user: null, isLoaded: true, isSignedIn: false })
export const useAuth = () => ({ userId: null, isLoaded: true, isSignedIn: false })
export const AuthProvider = ({ children }: { children: React.ReactNode }) => children
export const useSignIn = () => ({})
export const useSignUp = () => ({})
export const SignUp = () => null
export const SignIn = () => null
export const AuthenticateWithRedirectCallback = () => null