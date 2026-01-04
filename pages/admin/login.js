import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const router = useRouter();
  const [err,setErr]=useState(null);

  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/admin/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});
    const j = await res.json();
    if (res.ok){
      localStorage.setItem('ms_admin_token', j.token);
      router.push('/admin/dashboard');
    } else setErr(j.error||'Login failed');
  }

  return (
    <main className="screen">
      <div>
        <div className="title">Admin Login</div>
        <div className="subtitle">Protected dashboard</div>
      </div>
      <form className="card stack" onSubmit={submit}>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        </div>
        {err && <div className="error">{err}</div>}
        <div className="footer-actions">
          <button type="submit" className="btn btn-primary">Login</button>
        </div>
      </form>
    </main>
  );
}
