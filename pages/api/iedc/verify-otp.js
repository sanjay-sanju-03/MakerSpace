import { proxyJson, badMethod } from './_utils';

const PATH = process.env.IEDC_VERIFY_OTP_PATH || '/public/verify-otp';

export default async function handler(req, res) {
  if (req.method !== 'POST') return badMethod(res);
  const { email, membershipId, otp } = req.body || {};
  if ((!email && !membershipId) || !otp) {
    return res.status(400).json({ success: false, error: 'Email or membershipId and OTP are required' });
  }
  try {
    const body = email ? { email, otp } : { membershipId, otp };
    const { upstream, data } = await proxyJson(req, PATH, { method: 'POST', body });
    return res.status(upstream.ok ? 200 : upstream.status).json(data || { success: false });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'OTP verify failed' });
  }
}
