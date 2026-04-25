import re

with open("app/login/page.tsx", "r") as f:
    content = f.read()

# Add e.preventDefault() and change relative to absolute urls
new_content = content.replace(
    '  async function handleGoogle() {\n    console.log("handleGoogle called, isLoaded:", isLoaded, "signIn:", !!signIn)\n    if (!isLoaded) return',
    '  async function handleGoogle(e?: React.MouseEvent) {\n    if (e) e.preventDefault()\n    if (!isLoaded) return'
)
new_content = new_content.replace(
    '        redirectUrl: "/sso-callback",',
    '        redirectUrl: `${window.location.origin}/sso-callback`,'
)

new_content = new_content.replace(
    '  async function handleApple() {\n    if (!isLoaded) return',
    '  async function handleApple(e?: React.MouseEvent) {\n    if (e) e.preventDefault()\n    if (!isLoaded) return'
)

with open("app/login/page.tsx", "w") as f:
    f.write(new_content)

with open("app/auth/register/page.tsx", "r") as f:
    content2 = f.read()

new_content2 = content2.replace(
    '  const handleGoogle = async () => {\n    console.log("handleGoogle register called, isLoaded:", isLoaded, "signUp:", !!signUp)\n    if (!isLoaded) return',
    '  const handleGoogle = async (e?: React.MouseEvent) => {\n    if (e) e.preventDefault()\n    if (!isLoaded) return'
)
new_content2 = new_content2.replace(
    '        redirectUrl: "/sso-callback",',
    '        redirectUrl: `${window.location.origin}/sso-callback`,'
)

new_content2 = new_content2.replace(
    '  const handleApple = async () => {\n    if (!isLoaded) return',
    '  const handleApple = async (e?: React.MouseEvent) => {\n    if (e) e.preventDefault()\n    if (!isLoaded) return'
)

with open("app/auth/register/page.tsx", "w") as f:
    f.write(new_content2)
