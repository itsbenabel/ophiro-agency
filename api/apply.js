// Vercel serverless function: emails each /apply submission to Ben via Resend.
// Env vars (set in the Vercel project): RESEND_API_KEY, NOTIFY_EMAIL, FROM_EMAIL
// FROM_EMAIL must use a domain verified in Resend, e.g. "Ophiro <ben@benabel.co.uk>".

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clip = (v, n = 4000) => String(v ?? '').slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { RESEND_API_KEY, NOTIFY_EMAIL, FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL || !FROM_EMAIL) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (body.company_website) return res.status(200).json({ ok: true }); // honeypot

  const d = {
    name: clip(body.name, 200),
    email: clip(body.email, 200),
    website: clip(body.website, 300),
    sell: clip(body.sell),
    budget: clip(body.budget, 100),
    today: clip(body.today),
    done: clip(body.done),
  };
  if (!d.name || !/^\S+@\S+\.\S+$/.test(d.email) || !d.website || !d.sell || !d.budget || !d.today || !d.done) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const rows = [
    ['Name', d.name], ['Email', d.email], ['Website', d.website],
    ['What they sell / customer value', d.sell], ['Monthly Google Ads budget', d.budget],
    ['Where enquiries come from / what is not working', d.today], ['What done looks like in 12 weeks', d.done],
  ];
  const html = rows.map(([k, v]) => `<p><strong>${esc(k)}</strong><br>${esc(v).replace(/\n/g, '<br>')}</p>`).join('');
  const text = rows.map(([k, v]) => `${k}\n${v}`).join('\n\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [NOTIFY_EMAIL],
      reply_to: d.email,
      subject: `New 12-week build application: ${d.name}`,
      html,
      text,
    }),
  });

  if (!r.ok) return res.status(502).json({ error: 'Email failed' });
  return res.status(200).json({ ok: true });
};
