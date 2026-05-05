// Use global fetch when available (Node 18+). Otherwise fall back to a tiny http/https requester.
const fetch = (typeof globalThis.fetch === 'function') ? globalThis.fetch : (url => {
  const lib = url.startsWith('https') ? require('https') : require('http');
  return new Promise((resolve, reject) => {
    const req = lib.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, json: async () => parsed });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('Request timeout')));
  });
});

async function check(url, name) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log(`${name}: ${res.status}`, json);
  } catch (err) {
    console.error(`${name} failed:`, err.message || err);
  }
}

async function main() {
  const apiBase = process.env.API_BASE_URL || 'http://localhost:5000/api';
  await check(`${apiBase}/health`, 'API Health');
  await check(`${apiBase}/config`, 'API Config');
}

main();
