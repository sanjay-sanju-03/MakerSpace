const { getDb } = require('../../../lib/firebaseAdmin');
const jwt = require('jsonwebtoken');

function auth(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  const token = h.split(' ')[1];
  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized. Check .env.local and Firestore API.' });
    }

    // Get open sessions without orderBy to avoid index requirement
    const snap = await db.collection('sessions')
      .where('status', '==', 'open')
      .get();

    const sessions = snap.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          check_in_time: data.check_in_time?.toDate?.() || null,
          check_out_time: data.check_out_time?.toDate?.() || null,
        };
      })
      .sort((a, b) => {
        const at = a.check_in_time ? a.check_in_time.getTime() : 0;
        const bt = b.check_in_time ? b.check_in_time.getTime() : 0;
        return bt - at; // descending
      });

    return res.json({ ok: true, sessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
