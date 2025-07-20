const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors'); // Importing the CORS middleware
const app = express();

app.use(cors()); // Enable CORS for all origins (you can restrict it to specific origins if needed)
app.use(express.json());

app.post('/proxy', (req, res) => {
    const options = {
        hostname: '106.51.67.193',
        port: 443,
        path: '/api/v1/randbin',
        method: 'POST',
        rejectUnauthorized: false, // Ignore SSL certificate
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const proxyRequest = https.request(options, (proxyResponse) => {
        let data = '';
        proxyResponse.on('data', (chunk) => {
            data += chunk;
        });
        proxyResponse.on('end', () => {
            res.status(proxyResponse.statusCode).send(data);
        });
    });

    proxyRequest.on('error', (error) => {
        console.error('Proxy request error:', error);
        res.status(500).send('Error fetching data');
    });

    proxyRequest.write(JSON.stringify(req.body));
    proxyRequest.end();
});

const PORT = 3003; // Example port
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
