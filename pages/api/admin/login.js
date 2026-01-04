const jwt = require('jsonwebtoken');

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email }, process.env.ADMIN_JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });
    return res.json({ ok: true, token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
}
