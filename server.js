const https = require('https');
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// === API Credentials ===
const APIKey = "6625a404-fcf7-aa22-595f-1ce908fc5ebb";
const APISalt = "$2a$04$nArWqsGVKLmYJ3ob48c2/.fL8hULjZTJLWdtTEstM4Ss8oqagInmu";
const RandType = 1; // Keeping RandType fixed

// === Function to create HMAC digest ===
function createDigest(apiKey, randType, randLength, apiSalt) {
    const data = `${apiKey}|${randType}|${randLength}|${apiSalt}`;
    return crypto.createHash('sha512').update(data).digest('hex');
}

// === Function to fetch random binary data from QRNG server ===
function fetchRandomBinary(randLength, hostname, port, callback) {
    const hmacDigest = createDigest(APIKey, RandType, randLength, APISalt);

    const postData = JSON.stringify({
        Api_key: APIKey,
        Rand_type: RandType,
        Length: randLength,
        Hash: hmacDigest,
    });

    const options = {
        hostname: hostname,
        port: port,
        path: '/api/v1/randbin',
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
            console.log(`Random Binary Response (len=${randLength}, host=${hostname}, port=${port}):`, data);
            if (callback) callback(null, data);
        });
    });

    req.on('error', (error) => {
        console.error('Error fetching binary data:', error);
        if (callback) callback(error, null);
    });

    req.write(postData);
    req.end();
}

// === Endpoint: user provides length, hostname, and port ===
// Example: POST http://localhost:3003/proxy 
// { "length": 20, "hostname": "202.83.17.121", "port": 443 }
app.post('/proxy', (req, res) => {
    const randLength = req.body.length;
    const hostname = req.body.hostname;
    const port = req.body.port;

    if (!randLength || isNaN(randLength)) {
        return res.status(400).send({ error: "Please provide a valid 'length' parameter" });
    }
    if (!hostname || typeof hostname !== 'string') {
        return res.status(400).send({ error: "Please provide a valid 'hostname' parameter" });
    }
    if (!port || isNaN(port)) {
        return res.status(400).send({ error: "Please provide a valid 'port' parameter" });
    }

    fetchRandomBinary(randLength, hostname, port, (err, data) => {
        if (err) return res.status(500).send("Error fetching data");
        res.send(data);
    });
});

const PORT = 3003;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});

// 202.83.17.121 : 443
