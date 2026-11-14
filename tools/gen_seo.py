#!/usr/bin/env python3
"""Generates the long-tail SEO pages in /prompts and sitemap.xml + robots.txt. Run: python3 tools/gen_seo.py"""
import html, json, os, datetime
SITE = "https://promptkit-tan.vercel.app"
TODAY = datetime.date.today().isoformat()
PAGES = [
 dict(slug="chatgpt-prompts-for-product-descriptions", bundle="E-Commerce", anchor="ecommerce",
  title="ChatGPT Prompts for Product Descriptions That Sell (Copy and Paste)",
  desc="Three free, copy-and-paste AI prompts for product descriptions: benefit-first, objection-handling and SEO-ready. Fill the brackets and paste into ChatGPT or Claude.",
  h1="ChatGPT prompts for product descriptions that sell",
  intro="Most AI product descriptions sound the same because the prompt is the same: \"write a description for my product\". The model has nothing to work with, so it fills the page with adjectives. A good prompt gives the AI a buyer, a problem and a rule about what to leave out. Here are three prompts you can copy today.",
  prompts=[("Benefit-first description","Write a product description for [PRODUCT]. The buyer is [BUYER] and their main problem is [PROBLEM]. Open with the benefit in one sentence, then give 3 short bullets that each pair a feature with what it does for the buyer. Plain words, no hype, no words like \"premium\" or \"high-quality\". Under 120 words."),
           ("Objection handler","List the 5 reasons a shopper might hesitate to buy [PRODUCT] (price, fit, trust, shipping, returns). Then write a 90-word product description that answers the top 3 objections without sounding defensive. Tone: [TONE]."),
           ("Search-friendly version","Rewrite this description for search: [PASTE DESCRIPTION]. Work the phrase [KEYWORD] into the first sentence and one subheading, keep it natural, and add a 155-character meta description.")],
  tips=["Name one buyer. \"Frequent travelers\" beats \"everyone\".","Ask for benefits, not adjectives, and ban the words you are tired of seeing.","Give the model your real specs and policies so it does not invent them.","Always read the result and check every claim before you publish."],
  faq=[("Can AI write product descriptions that rank?","It can draft them. Rankings depend on the keyword in your title and headings, real details about the product, and a page that loads fast. Use AI for the first draft and edit it."),("Which AI works best?","ChatGPT and Claude both follow structured prompts well. The prompt matters more than the model.")]),
 dict(slug="ai-prompts-for-facebook-ads-ecommerce", bundle="E-Commerce", anchor="ecommerce",
  title="AI Prompts for Facebook and Instagram Ads for Online Stores",
  desc="Free AI prompts to write Facebook and Instagram ad copy for e-commerce: hooks, primary text and headline variations. Copy, fill the brackets, paste into any AI.",
  h1="AI prompts for Facebook and Instagram ads for your online store",
  intro="Ad copy fails when it talks about you instead of the person scrolling. These prompts force the AI to start from the viewer's problem, then give you several angles to test instead of one \"best\" ad.",
  prompts=[("Five hooks to test","Write 5 different opening lines for a Facebook ad for [PRODUCT]. The audience is [AUDIENCE]. Use these angles, one each: a pain point, a surprising fact I can verify, a before-and-after, a question, a short story. Max 12 words per line."),
           ("Primary text, three lengths","Write the primary text for a Facebook ad for [PRODUCT] aimed at [AUDIENCE]. Give me a 1-line version, a 3-line version and a 6-line version. Lead with the problem, state one clear benefit, end with a single call to action: [CTA]. No exaggerated claims and no promises of results."),
           ("Headline variations","Give me 10 headline options under 40 characters for [PRODUCT]. Mix benefit headlines, curiosity headlines and offer headlines. Offer: [OFFER].")],
  tips=["Test one thing at a time: hook first, then the offer, then the image.","Keep claims you can prove. Ad platforms reject exaggerated promises.","Use the customer's own words from reviews and support emails.","Write the call to action last, and make it a single action."],
  faq=[("How many ad variations should I test?","Start with 3 to 5 hooks on the same offer and image. Keep the winners and write new variations from them."),("Does this work for TikTok too?","Yes. Use the hook prompt and read the line out loud as the first sentence of a video.")]),
 dict(slug="abandoned-cart-email-prompts", bundle="E-Commerce", anchor="ecommerce",
  title="Abandoned Cart Email Prompts: A 3-Email Sequence You Can Generate",
  desc="Copy-and-paste AI prompts for a 3-email abandoned cart sequence: reminder, objection handler and last-chance email. Works with ChatGPT and Claude.",
  h1="Abandoned cart email prompts: a 3-email sequence",
  intro="Many shoppers leave without buying and never come back. A short, helpful sequence brings some of them back. These prompts write the three emails, each with a different job.",
  prompts=[("Email 1: the reminder (1 hour later)","Write a short abandoned cart email for [STORE] selling [PRODUCT]. Job: remind the shopper what they left, make checkout one click away, and offer help. Warm, plain tone, under 80 words, subject line under 40 characters. No fake urgency."),
           ("Email 2: answer the doubt (next day)","Write an abandoned cart email that answers the most common doubts about [PRODUCT]: [DOUBTS, e.g. sizing, shipping time, returns]. Use a short FAQ format with 3 questions. Include our return policy: [POLICY]. Subject line under 40 characters."),
           ("Email 3: last call (day 3)","Write a final abandoned cart email for [PRODUCT]. If an incentive is allowed, mention only this real offer: [OFFER OR \"none\"]. Be honest about any deadline. Under 70 words, one button text.")],
  tips=["Only mention discounts and deadlines that are real.","Show the product image and the exact item left in the cart.","Send the first email within a few hours, the rest over 2 to 3 days.","Add an unsubscribe link and follow your local email rules."],
  faq=[("Do I need a discount in the sequence?","No. A reminder and an honest answer to doubts often works. Use an offer only if it fits your margin."),("What tool sends the emails?","Any email platform that supports cart-abandonment flows. The prompts write the copy, your platform sends it.")]),
 dict(slug="chatgpt-prompts-for-real-estate-listings", bundle="Real Estate", anchor="realestate",
  title="ChatGPT Prompts for Real Estate Listings, Posts and Follow-Ups",
  desc="Copy-and-paste AI prompts for real estate agents: listing descriptions, open house posts and lead follow-up emails. Fair-housing-aware prompts you can edit.",
  h1="ChatGPT prompts for real estate listings and follow-ups",
  intro="\"Spacious home in a great location\" tells buyers nothing. These prompts make the AI describe how the home is lived in, stay clear of language that breaks fair housing rules, and write the follow-up that keeps a lead warm.",
  prompts=[("Listing description","Write a listing description for [PROPERTY: beds, baths, size, key features]. Describe how a buyer would use the spaces day to day. Mention [NEARBY: park, school, transit] only as distances or facts. Do not describe the ideal buyer or the neighborhood's people, and avoid any wording that could breach fair housing rules. 150 words."),
           ("Open house post","Write an Instagram caption and a Facebook post for an open house at [PROPERTY] on [DATE AND TIME]. Lead with one concrete detail that makes the home different. End with the address and time. Add 5 relevant hashtags."),
           ("Lead follow-up email","Write a warm follow-up email to a buyer who toured [PROPERTY] two days ago. Mention one thing they said they liked: [DETAIL]. Offer two next steps: [OPTIONS]. Under 100 words, no pressure.")],
  tips=["Describe features and distances, not who should live there.","Lead with the one detail photos cannot show.","Check every fact against the MLS entry before posting.","Follow up inside 48 hours while the tour is fresh."],
  faq=[("Is AI-written listing copy allowed?","Check your brokerage and MLS rules. You stay responsible for accuracy and for fair housing compliance, so read and edit every listing."),("Can AI replace my follow-up?","It drafts the message. Personal details from the tour are what make it work.")]),
 dict(slug="ugc-brand-pitch-email-template", bundle="UGC", anchor="ugc",
  title="UGC Brand Pitch Email Template and AI Prompt (That Gets Replies)",
  desc="A UGC creator pitch email structure plus an AI prompt to write it fast. Get more replies from brands with a short, specific pitch.",
  h1="UGC brand pitch email: template and AI prompt",
  intro="Brands get dozens of \"I love your brand, let's work together\" emails a week. The ones that get replies are short, specific and show proof. Use this structure and let the AI do the first draft.",
  prompts=[("Pitch email draft","Write a cold email from a UGC creator to [BRAND]. Structure: one specific line about their product or recent campaign, one line of proof from my work [PROOF: views, niche, sample], a clear offer [OFFER: 3 videos in 7 days], and a single question to end. Under 100 words, plain tone, subject line under 45 characters."),
           ("Three subject lines","Give me 10 subject lines under 45 characters for a UGC pitch to [BRAND]. Mix curiosity, a named result I can prove, and a direct offer. No clickbait and no all-caps."),
           ("Follow-up after 5 days","Write a 40-word follow-up to my pitch to [BRAND]. Add one new useful idea: [IDEA, e.g. a hook for their new product]. Do not say \"just checking in\".")],
  tips=["Find the right contact: the brand's social or partnerships manager.","Attach one sample, not a whole portfolio.","Send 5 tailored pitches rather than 50 identical ones.","Quote real numbers only. Never claim results you cannot show."],
  faq=[("How long should a pitch be?","Under 100 words. The goal of the first email is a reply, not a contract."),("When should I follow up?","After about five days, with something new in the message.")]),
 dict(slug="ugc-video-script-prompts", bundle="UGC", anchor="ugc",
  title="UGC Video Script Prompts: Hooks and 20-Second Scripts with AI",
  desc="Free AI prompts for UGC video scripts: hooks, 20-second scripts and shot lists for TikTok and Reels. Copy, fill the brackets and paste.",
  h1="UGC video script prompts: hooks and 20-second scripts",
  intro="The first three seconds decide if anyone watches. These prompts start from the hook, then build a short script and shot list you can film with a phone.",
  prompts=[("Ten hooks","Write 10 hooks for a 20-second UGC video about [PRODUCT] for [AUDIENCE]. The problem is [PAIN]. Use five styles: question, bold statement, \"stop doing X\", mini story, curiosity gap. Max 10 words each."),
           ("20-second script","Write a 20-second UGC script for [PRODUCT]. Structure: hook (3 s), problem (4 s), product in use (8 s), result I can honestly show (3 s), call to action (2 s). Conversational, as if talking to a friend. Include on-screen text for each beat."),
           ("Shot list","Turn this script into a shot list for a phone: [PASTE SCRIPT]. For each shot give the framing, what is in the frame, and the line spoken. Keep it to 6 shots.")],
  tips=["Film the hook last, once you know what the video shows.","Show the product in use inside the first 8 seconds.","Say only what you can show on camera.","Disclose partnerships as required by the platform."],
  faq=[("How long should a UGC video be?","15 to 30 seconds works well for product demos on TikTok and Reels."),("Can the AI film the video?","No. It writes the script and shot list. You film, or hire a creator.")]),
]
def esc(s): return html.escape(s, quote=True)
def page(p):
    url = f"{SITE}/prompts/{p['slug']}/"
    ld = {"@context":"https://schema.org","@graph":[
        {"@type":"Article","headline":p["title"],"description":p["desc"],"mainEntityOfPage":url,"dateModified":TODAY,"author":{"@type":"Organization","name":"PromptKit"},"publisher":{"@type":"Organization","name":"PromptKit","url":SITE+"/"}},
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"PromptKit","item":SITE+"/"},{"@type":"ListItem","position":2,"name":p["h1"],"item":url}]}]}
    pr = "".join(f'<section class="card"><h3>{i+1}. {esc(n)}</h3><pre id="p{i}">{esc(t)}</pre><button onclick="cp({i},this)">Copy prompt</button></section>' for i,(n,t) in enumerate(p["prompts"]))
    tips = "".join(f"<li>{esc(t)}</li>" for t in p["tips"])
    faq = "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q,a in p["faq"])
    others = "".join(f'<li><a href="/prompts/{o["slug"]}/">{esc(o["h1"])}</a></li>' for o in PAGES if o["slug"]!=p["slug"])
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(p['title'])}</title><meta name="description" content="{esc(p['desc'])}"><link rel="canonical" href="{url}">
<meta property="og:title" content="{esc(p['title'])}"><meta property="og:description" content="{esc(p['desc'])}"><meta property="og:type" content="article"><meta property="og:url" content="{url}">
<script type="application/ld+json">{json.dumps(ld)}</script>
<style>:root{{color-scheme:dark}}body{{margin:0;background:#050816;color:#d7dbea;font:17px/1.65 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}}main{{max-width:760px;margin:0 auto;padding:32px 20px 80px}}a{{color:#a99bff}}h1{{font-size:2rem;line-height:1.2;color:#fff}}h2{{color:#fff;margin-top:2.2em}}h3{{color:#fff}}.card{{background:#0e1330;border:1px solid #232a55;border-radius:14px;padding:16px 18px;margin:16px 0}}pre{{white-space:pre-wrap;font:15px/1.55 ui-monospace,Menlo,monospace;color:#e8eaff;margin:8px 0 12px}}button{{background:#7c5cff;color:#fff;border:0;border-radius:10px;padding:9px 16px;font-weight:600;cursor:pointer}}.cta{{background:linear-gradient(135deg,#2a1f6b,#0e1330);border:1px solid #4b3fbf;border-radius:16px;padding:22px;margin:34px 0}}.cta a.b{{display:inline-block;background:#22c39a;color:#04251c;font-weight:700;text-decoration:none;padding:11px 20px;border-radius:10px;margin-top:6px}}nav a{{text-decoration:none;font-weight:700;color:#fff}}</style></head>
<body><main><nav><a href="/">PromptKit</a></nav>
<h1>{esc(p['h1'])}</h1><p>{esc(p['intro'])}</p>
<h2>Copy-and-paste prompts</h2><p>Replace every [BRACKET] with your own details, then paste into ChatGPT, Claude or any AI assistant.</p>{pr}
<h2>How to get better results</h2><ul>{tips}</ul>
<div class="cta"><strong>Want the full {esc(p['bundle'])} prompt bundle?</strong><br>PromptKit {esc(p['bundle'])} has ready-made prompts like these for every step, with fill-in brackets and examples. $7, one-time.<br><a class="b" href="/#{p['anchor']}">See the {esc(p['bundle'])} bundle</a></div>
<h2>FAQ</h2>{faq}
<h2>More free prompts</h2><ul>{others}</ul>
<p style="font-size:14px;color:#8a90b8;margin-top:40px">AI output can contain mistakes. Review and fact-check everything before you publish or send it. Results vary.</p></main>
<script>function cp(i,b){{navigator.clipboard.writeText(document.getElementById('p'+i).innerText).then(function(){{b.textContent='Copied';setTimeout(function(){{b.textContent='Copy prompt'}},1500)}})}}</script></body></html>"""
for p in PAGES:
    d = os.path.join("prompts", p["slug"]); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(page(p))
urls = [SITE + "/"] + [f"{SITE}/prompts/{p['slug']}/" for p in PAGES]
open("sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"<url><loc>{u}</loc><lastmod>{TODAY}</lastmod></url>\n" for u in urls) + "</urlset>\n")
open("robots.txt","w").write(f"User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n")
print(len(PAGES), "pages")
