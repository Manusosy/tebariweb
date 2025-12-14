
import http from 'http';

const data = JSON.stringify({
    username: "verify_user_" + Date.now(),
    password: "password123",
    name: "Verification User",
    email: "verify@example.com",
    role: "field_officer"
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Sending request to port 5001...");
const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
