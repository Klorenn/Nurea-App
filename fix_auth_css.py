import os

with open('app/auth.css', 'r') as f:
    css = f.read()

# Fix .auth
css = css.replace(
""".auth {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}""",
""".auth {
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
}"""
)

# Fix .auth-main
css = css.replace(
""".auth-main {
  padding: 40px 48px;
  display: flex; flex-direction: column;
  position: relative;
}""",
""".auth-main {
  padding: 40px 48px;
  display: flex; flex-direction: column;
  position: relative;
  height: 100vh;
  overflow-y: auto;
  /* Scrollbar estetica */
  scrollbar-width: thin;
  scrollbar-color: var(--sage-200) transparent;
}
.auth-main::-webkit-scrollbar {
  width: 6px;
}
.auth-main::-webkit-scrollbar-track {
  background: transparent;
}
.auth-main::-webkit-scrollbar-thumb {
  background: var(--sage-200);
  border-radius: 3px;
}"""
)

# Optional: Ensure responsiveness doesn't break
# Check media query
css = css.replace(
""".auth-main { padding: 24px; min-height: 100vh; }""",
""".auth-main { padding: 24px; height: auto; min-height: 100vh; overflow-y: visible; }"""
)

css = css.replace(
""".auth { grid-template-columns: 1fr; }""",
""".auth { grid-template-columns: 1fr; height: auto; overflow: visible; }"""
)

with open('app/auth.css', 'w') as f:
    f.write(css)

print("Fixed auth.css")
