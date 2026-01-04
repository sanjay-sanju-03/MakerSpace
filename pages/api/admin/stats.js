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
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const snap = await db.collection('sessions')
      .where('check_in_time', '>=', startOfDay)
      .get();

    const sessions = snap.docs.map(doc => doc.data());

    const stats = {
      total_checkins: sessions.length,
      active_users: sessions.filter(s => s.status === 'open').length,
      students: sessions.filter(s => s.user_type === 'student').length,
      staff: sessions.filter(s => s.user_type === 'staff').length,
      by_purpose: {}
    };

    // Purpose-wise breakdown
    sessions.forEach(s => {
      const purpose = s.purpose || 'Unknown';
      stats.by_purpose[purpose] = (stats.by_purpose[purpose] || 0) + 1;
    });

    return res.json({ ok: true, stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
}
