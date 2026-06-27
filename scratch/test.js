const http = require('http');

const PORT = 5000;
const HOST = 'localhost';

const makeRequest = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(postData);
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');
  const uniqueUser = 'dev_' + Math.random().toString(36).substring(7);
  
  try {
    // 1. Register Developer
    console.log(`\n[Test 1]: Registering developer "${uniqueUser}"...`);
    const regRes = await makeRequest('POST', '/api/auth/register', {
      username: uniqueUser,
      password: 'password123'
    });
    console.log('Result:', regRes);

    // 2. Login Developer
    console.log('\n[Test 2]: Logging in developer...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      username: uniqueUser,
      password: 'password123'
    });
    console.log('Result:', loginRes);
    
    if (!loginRes.data.token) {
      throw new Error('No token returned during login!');
    }
    const token = loginRes.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    // 3. Create a Project
    console.log('\n[Test 3]: Creating Roblox script project...');
    const projectRes = await makeRequest('POST', '/api/projects', {
      name: 'BloxFruits Autofarm',
      description: 'Automated farming helper script',
      raw_script: 'print("BloxFruits protected autofarm running!")'
    }, authHeaders);
    console.log('Result:', projectRes);
    
    const projectId = projectRes.data.project.id;

    // 4. Generate 2 License Keys
    console.log('\n[Test 4]: Generating license keys for project...');
    const keysRes = await makeRequest('POST', '/api/keys/generate', {
      project_id: projectId,
      count: 2,
      duration_days: 1 // 1 day expiry
    }, authHeaders);
    console.log('Result:', keysRes);
    
    const testKeyString = keysRes.data.keys[0].key_string;

    // 5. Simulate Roblox client verification (First time - should bind HWID)
    console.log(`\n[Test 5]: Mocking first-time Roblox execution with key: ${testKeyString}...`);
    const verifyRes1 = await makeRequest('POST', '/api/v1/verify', {
      key: testKeyString,
      hwid: 'ROBLOX-EXECUTOR-HWID-ABC-123'
    });
    console.log('Result:', verifyRes1);

    // 6. Simulate Roblox client verification (Second time - correct HWID, should succeed)
    console.log('\n[Test 6]: Mocking second verification from same executor...');
    const verifyRes2 = await makeRequest('POST', '/api/v1/verify', {
      key: testKeyString,
      hwid: 'ROBLOX-EXECUTOR-HWID-ABC-123'
    });
    console.log('Result:', verifyRes2);

    // 7. Simulate Roblox client verification (Mismatched HWID - should fail)
    console.log('\n[Test 7]: Mocking verification from another executor (HWID Mismatch)...');
    const verifyRes3 = await makeRequest('POST', '/api/v1/verify', {
      key: testKeyString,
      hwid: 'ROBLOX-EXECUTOR-HWID-DIFF-456'
    });
    console.log('Result:', verifyRes3);

    // 8. Fetch execution audit logs for project
    console.log('\n[Test 8]: Fetching developer portal verification logs...');
    const logsRes = await makeRequest('GET', `/api/logs?project_id=${projectId}`, null, authHeaders);
    console.log('Logs Count:', logsRes.data.logs.length);
    console.log('Sample Log Entry:', logsRes.data.logs[0]);

    console.log('\n--- ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ---');
  } catch (e) {
    console.error('Test run error:', e);
  }
}

runTests();
