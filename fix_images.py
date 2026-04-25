import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content.replace(
        ' style={{ objectFit: "contain", width: "auto" }}',
        ''
    )
    new_content = new_content.replace(
        " style={{ objectFit: 'contain', width: 'auto' }}",
        ""
    )

    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('app'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))
