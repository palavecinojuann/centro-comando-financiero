import os
import glob

out_file = r"apps\finance_copilot\notebooklm_export.txt"
brain_dir = r"C:\Users\bimontcad\.gemini\antigravity\brain\b2681372-6605-4d8b-ae5a-e4b50b2d3a89"

with open(out_file, "w", encoding="utf-8") as out:
    out.write("---\ntitle: Finance Copilot - Código Fuente y Arquitectura\n---\n\n")
    out.write("# Documentación de Arquitectura (AI Memory)\n\n")
    
    for md_file in glob.glob(os.path.join(brain_dir, "*.md")):
        with open(md_file, "r", encoding="utf-8") as f:
            out.write(f.read() + "\n\n")
            
    out.write("# Código Fuente del Proyecto\n\n")
    
    for root, dirs, files in os.walk(r"apps\finance_copilot\lib"):
        for file in files:
            if file.endswith(".dart") and not file.endswith(".g.dart") and not file.endswith(".freezed.dart"):
                file_path = os.path.join(root, file)
                out.write(f"## Archivo: {file_path}\n\n```dart\n")
                with open(file_path, "r", encoding="utf-8") as f:
                    out.write(f.read())
                out.write("\n```\n\n")
                
os.system("git add " + out_file)
os.system('git commit -m "Add NotebookLM export bundle"')
os.system("git push")
