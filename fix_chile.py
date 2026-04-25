import os

replacements = {
    '35€–60€': '$35.000–$60.000',
    '<span className="curr">€</span><span>0</span>': '<span className="curr">$</span><span>0</span>',
    '<span className="curr">€</span><span>29</span>': '<span className="curr">$</span><span>29.990</span>',
    'Psicóloga clínica · Madrid': 'Psicóloga clínica · Santiago',
    'Clinical psychologist · Madrid': 'Clinical psychologist · Santiago',
    'Madrid y Ciudad de México': 'Santiago, Chile',
    'S.L.': 'SpA', # typical Chilean company type
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return
        
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    # Also handle some edge cases if needed

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root or '.next' in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.html', '.css', '.md')):
            fix_file(os.path.join(root, file))
