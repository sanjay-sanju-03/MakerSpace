export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Only GET allowed' });
  }

  const id = (req.query.id || '').toString().trim();
  if (!id) {
    return res.status(400).json({ success: false, message: 'Missing id' });
  }

  try {
    const upstream = await fetch(
      `https://iedclbscekapi.vercel.app/api/users/member?id=${encodeURIComponent(id)}`,
      { cache: 'no-store' }
    );

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Leave data undefined if parsing fails
    }

    if (!upstream.ok || !data || data.success !== true || !data.data) {
      return res.status(upstream.status || 502).json({ success: false, message: 'Not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('IEDC member lookup failed:', err);
    return res.status(500).json({ success: false, message: 'Upstream error' });
  }
}
