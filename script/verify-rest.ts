
import https from 'https';

const url = "https://qhtebudzqjkysizleony.supabase.co/rest/v1/";
const key = process.argv[2];

const options = {
    hostname: 'qhtebudzqjkysizleony.supabase.co',
    path: '/rest/v1/',
    method: 'GET',
    headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key
    }
};

const req = https.request(options, (res) => {
    console.log('StatusCode:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});
req.end();
