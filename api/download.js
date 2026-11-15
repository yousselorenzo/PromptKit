// Delivers a paid PDF. Stripe redirects here after payment:
//   https://promptkit-tan.vercel.app/api/download?b=ecommerce&session_id={CHECKOUT_SESSION_ID}
// Env (Vercel): STRIPE_SECRET_KEY (restricted key, read-only Checkout Sessions), GH_TOKEN (fine-grained, read-only Contents on PromptKit-products)
const FILES = {
  ecommerce: "The-E-Commerce-Scale-Bundle.pdf",
  realestate: "The-Real-Estate-Lead-Gen-Bundle.pdf",
  ugc: "The-UGC-Creator-and-Brand-Pitch-Bundle.pdf",
};
const REPO = "yousselorenzo/PromptKit-products";

module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, "http://x");
    const b = u.searchParams.get("b");
    const sid = u.searchParams.get("session_id");
    if (!FILES[b] || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(sid || "")) {
      res.statusCode = 400; return res.end("Invalid link. Contact vitalika.limited@gmail.com");
    }
    const sr = await fetch("https://api.stripe.com/v1/checkout/sessions/" + sid, {
      headers: { Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY },
    });
    const s = await sr.json();
    if (!sr.ok || s.payment_status !== "paid") {
      res.statusCode = 402; return res.end("Payment not confirmed. If you paid, email vitalika.limited@gmail.com");
    }
    const gr = await fetch(`https://api.github.com/repos/${REPO}/contents/pdf/${FILES[b]}`, {
      headers: { Authorization: "Bearer " + process.env.GH_TOKEN, Accept: "application/vnd.github.raw", "User-Agent": "promptkit" },
    });
    if (!gr.ok) { res.statusCode = 502; return res.end("File unavailable. Email vitalika.limited@gmail.com"); }
    const buf = Buffer.from(await gr.arrayBuffer());
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${FILES[b]}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.end(buf);
  } catch (e) {
    res.statusCode = 500; res.end("Error. Email vitalika.limited@gmail.com");
  }
};
