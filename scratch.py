import re

with open("app/login/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'async function handleGoogle() {\n    if (!isLoaded) return',
    'async function handleGoogle() {\n    console.log("handleGoogle called, isLoaded:", isLoaded, "signIn:", !!signIn)\n    if (!isLoaded) return'
)

with open("app/login/page.tsx", "w") as f:
    f.write(content)

with open("app/auth/register/page.tsx", "r") as f:
    content2 = f.read()

content2 = content2.replace(
    'const handleGoogle = async () => {\n    if (!isLoaded) return',
    'const handleGoogle = async () => {\n    console.log("handleGoogle register called, isLoaded:", isLoaded, "signUp:", !!signUp)\n    if (!isLoaded) return'
)

with open("app/auth/register/page.tsx", "w") as f:
    f.write(content2)
