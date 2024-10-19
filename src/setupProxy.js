const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(
    '/api',
    createProxyMiddleware({
        target: 'https://api.thegraph.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api': '',
        },
    })
);

app.listen(PORT, () => {
    console.log('Proxy server is running on http://localhost:${PORT}');
});