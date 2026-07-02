export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ 
      error: "Upstash Redis database belum terhubung! Pastikan integrasi Upstash sudah selesai di Vercel." 
    });
  }

  const key = `celengan_${code}`;

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${url}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!result.result) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }
      
      const data = JSON.parse(result.result);
      return res.json(data);
    } 
    
    if (req.method === 'POST' || req.method === 'PUT') {
      const stateData = req.body;
      
      const response = await fetch(`${url}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(JSON.stringify(stateData))
      });
      
      const result = await response.json();
      
      if (result.result === 'OK') {
        return res.json({ success: true, data: stateData });
      } else {
        throw new Error("Gagal menyimpan ke Redis");
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Redis KV error:", error);
    return res.status(500).json({ error: error.message });
  }
}
