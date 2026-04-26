import os

def process():
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in root or '.git' in root or '.next' in root or '.venv' in root or 'dist' in root:
            continue
        for f in files:
            path = os.path.join(root, f)
            if not (f.endswith('.py') or f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.json') or f.endswith('.yaml') or f.endswith('.txt') or f.endswith('.toml') or f.endswith('.md')):
                continue
            if 'rebrand.py' in f:
                continue
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
            except:
                continue
            
            # Perform replacements
            new_content = content
            new_content = new_content.replace('MindMesh AI.', 'Maieo AI.')
            new_content = new_content.replace('MindMesh.', 'Maieo AI.')
            new_content = new_content.replace('MindMesh AI', 'Maieo AI')
            new_content = new_content.replace('MindMesh', 'Maieo AI')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f'Updated {path}')

if __name__ == '__main__':
    process()