const { getDb } = require('../../lib/firebaseAdmin');

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized' });
    }

    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Missing identifier' });

    const normalized = identifier.toString().trim().toUpperCase().replace(/\s+/g, '');
    const isRegNo = /^KSD(2[0-9])(IT|CS|CE|ME|EC|EE|CB|AI)\d{3}$/.test(normalized);
    const cleanPhone = identifier.replace(/\s+/g, '');
    const isPhone = /^[6-9]\d{9}$/.test(cleanPhone);

    if (!isRegNo && !isPhone) {
      return res.status(400).json({ error: 'Invalid registration number or phone number' });
    }

    const field = isRegNo ? 'reg_no' : 'phone';
    const value = isRegNo ? normalized : cleanPhone;

    const openQuery = await db.collection('sessions')
      .where(field, '==', value)
      .where('status', '==', 'open')
      .limit(1)
      .get();

    if (openQuery.empty) {
      return res.status(404).json({ error: 'No active check-in found' });
    }

    const doc = openQuery.docs[0];
    const session = doc.data();
    
    const checkInTime = session.check_in_time?.toMillis
      ? session.check_in_time.toMillis()
      : (session.check_in_time?.seconds || 0) * 1000;
    
    const elapsed = Math.max(0, Math.round((Date.now() - checkInTime) / 60000));

    return res.json({
      ok: true,
      session: {
        id: doc.id,
        user_type: session.user_type,
        name: session.name,
        reg_no: session.reg_no || null,
        phone: session.phone || null,
        department: session.department || null,
        year: session.year || null,
        purpose: session.purpose,
        check_in_photo_url: session.check_in_photo_url,
        check_in_time: checkInTime,
        elapsed_minutes: elapsed
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'server error' });
  }
}
