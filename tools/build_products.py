#!/usr/bin/env python3
"""Builds the deliverable PDFs and a Markdown copy for each PromptKit bundle.
Output: products/<id>/<Name>.pdf and .md   (run from repo root: python3 tools/build_products.py)"""
import html, os, subprocess, sys, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
CHROME = "/usr/bin/google-chrome"
CSS = """
@page{size:Letter;margin:18mm 16mm}
*{box-sizing:border-box}body{font:11pt/1.5 Georgia,'Times New Roman',serif;color:#1a1a1a;margin:0}
h1{font:700 26pt/1.15 Helvetica,Arial,sans-serif;margin:0 0 6pt}h2{font:700 17pt Helvetica,Arial,sans-serif;margin:0 0 4pt;padding-top:4pt;border-top:3pt solid #7C5CFF}
h3{font:700 11.5pt Helvetica,Arial,sans-serif;margin:0 0 3pt;color:#4a2fd0}
.cover{height:240mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}
.brand{font:700 11pt Helvetica,Arial,sans-serif;color:#7C5CFF;letter-spacing:.5pt;margin-bottom:14pt}
.sub{font-size:13pt;color:#444;max-width:150mm}.meta{margin-top:30pt;font:10pt Helvetica,Arial,sans-serif;color:#666}
.sec{page-break-before:always}.vars{background:#f4f1ff;border-left:3pt solid #7C5CFF;padding:7pt 10pt;margin:8pt 0 12pt;font:9.5pt/1.45 Helvetica,Arial,sans-serif}
.p{page-break-inside:avoid;margin:0 0 10pt;padding:8pt 10pt;border:.75pt solid #d9d4f2;border-radius:4pt}
.p pre{white-space:pre-wrap;font:10pt/1.45 'Courier New',monospace;background:#fafafa;margin:3pt 0 0;padding:6pt 8pt;border-radius:3pt}
ul{margin:4pt 0 0 14pt;padding:0}li{margin-bottom:3pt}.note{font:9.5pt Helvetica,Arial,sans-serif;color:#555}
.toc li{list-style:none;margin:2pt 0;font:11pt Helvetica,Arial,sans-serif}.fair{background:#eefaf3;border-left:3pt solid #1a9d5a;padding:8pt 10pt;font:10pt/1.5 Helvetica,Arial,sans-serif;margin-top:10pt}
.foot{margin-top:16pt;font:9pt Helvetica,Arial,sans-serif;color:#777}
"""
DISCLAIMER = ("Results vary. These prompts are writing aids, not guarantees of sales, leads or income. "
              "You are responsible for checking facts, following platform ad policies and applicable laws, "
              "and disclosing sponsored content. AI output can contain mistakes: review before you publish.")

def build(mod):
    B = importlib.import_module(mod).BUNDLE
    total = sum(len(s["prompts"]) for s in B["sections"])
    e = html.escape
    out = [f"<style>{CSS}</style>"]
    out.append(f'<div class="cover"><div class="brand">PROMPTKIT</div><h1>{e(B["name"])}</h1>'
               f'<p class="sub">{total} copy-and-paste prompts for ChatGPT, Claude and Gemini.</p>'
               f'<p class="meta">Version 1.0 &nbsp;·&nbsp; promptkit-tan.vercel.app &nbsp;·&nbsp; Support: vitalika.limited@gmail.com</p></div>')
    out.append(f'<h2>How to use this bundle</h2><p>{e(B["intro"])}</p><ul>' + "".join(f"<li>{e(x)}</li>" for x in B["how"]) + "</ul>")
    out.append("<h3 style='margin-top:14pt'>What is inside</h3><ul class='toc'>" +
               "".join(f"<li>{e(s['title'])}</li>" for s in B["sections"]) + "</ul>")
    if B.get("fair"):
        out.append(f'<div class="fair"><b>Fair Housing note.</b> {e(B["fair"])}</div>')
    out.append(f'<p class="foot">{e(DISCLAIMER)}</p>')
    n = 0
    for s in B["sections"]:
        out.append(f'<div class="sec"><h2>{e(s["title"])}</h2><div class="vars"><b>Fill these in first:</b> {e(s["vars"])}</div>')
        for title, body in s["prompts"]:
            n += 1
            out.append(f'<div class="p"><h3>{n}. {e(title)}</h3><pre>{e(body)}</pre></div>')
        out.append("</div>")
    out.append(f'<div class="sec"><h2>Before you publish</h2><ul><li>Check every fact, price and claim.</li>'
               f'<li>Follow the rules of the platform where you post.</li><li>Disclose partnerships and gifted products where the law requires it.</li></ul>'
               f'<p class="foot">{e(DISCLAIMER)}<br>Questions or a problem with your download? Email vitalika.limited@gmail.com.</p></div>')
    doc = "<!doctype html><meta charset=utf-8><title>%s</title><body>%s</body>" % (e(B["name"]), "".join(out))
    d = os.path.join(ROOT, "products", B["id"]); os.makedirs(d, exist_ok=True)
    base = B["name"].replace(" ", "-")
    hp = os.path.join(d, base + ".html"); open(hp, "w", encoding="utf-8").write(doc)
    pdf = os.path.join(d, base + ".pdf")
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", "file://" + hp], check=True, capture_output=True, timeout=120)
    # markdown copy
    md = [f"# {B['name']}\n", B["intro"] + "\n", "## How to use\n"] + [f"- {x}" for x in B["how"]]
    n = 0
    for s in B["sections"]:
        md += [f"\n## {s['title']}\n", f"**Fill in first:** {s['vars']}\n"]
        for title, body in s["prompts"]:
            n += 1; md += [f"### {n}. {title}\n", "```", body, "```\n"]
    md += ["\n---\n", DISCLAIMER]
    open(os.path.join(d, base + ".md"), "w", encoding="utf-8").write("\n".join(md))
    os.remove(hp)
    return B["id"], total, pdf

if __name__ == "__main__":
    for m in ("lib_ecommerce", "lib_realestate", "lib_ugc"):
        print(build(m))
