const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
var ssllabs = require("node-ssllabs");
const cors = require('cors');
const whois = require('whois');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());
const sample = 'https://appstorrent.ru/programs/'

// Helper function to fetch and parse a website
async function analyzeWebsite(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Referer': 'https://google.com/',
        'Origin': 'https://google.com',
      },
      timeout: 10000, // 10-second timeout
      maxRedirects: 5, // Prevent automatic redirects
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const baseDomain = new URL(url).hostname;
    const parsedUrl = new URL(url).protocol;

    // Check for outgoing links
    const links = $('a[href]')
      .map((_, element) => $(element).attr('href'))
      .get()
      .filter((href) => href.startsWith('http'));

    const unsafeLinks = links.filter((link) => !link.startsWith('https://'));
// const unsafeLinks = []
    // Check for popups or automatic downloads
    // Detect popup behavior
    // const popupDetected = html.includes('window.open') || html.includes('new Function("open")');

    // Detect automatic downloads
    // const autoDownloadDetected = html.includes('Content-Disposition: attachment') ||
    //                              html.includes('download') ||
    //                              $('meta[http-equiv="refresh"]').length > 0;
    const autoDownloadDetected = []
    $('a[href]').each((index, element) => {
      const href = $(element).attr('href');
      if (href.match(/\.(exe|bat|zip|msi|js)$/i)) {
          autoDownloadDetected.push(href);
      }
    });
    // Return analysis result
    // const externalRedirects = [];
    // $('a[href]').each((index, element) => {
    //     const href = $(element).attr('href');
    //     const parsedHref = new URL(href, url).hostname;
    //     if (parsedHref !== baseDomain) {
    //         externalRedirects.push(href);
    //     }
    // });

    return {
      malicious: (parsedUrl === 'http:' || unsafeLinks.length > 0 || autoDownloadDetected.length>0) ? 'possible' : 'certified safe',
      details: {
        parsedUrl,
        httpLinks: unsafeLinks.length,
        // popupDetected,
        autoDownloadDetected,
        // externalRedirects
      },
    };
  } catch (error) {
    // if (error.response && error.response.status >= 300 && error.response.status < 400) {
    //   return { malicious: true, reason: 'Automatic redirect detected' };
    // }
    return { malicious: false, reason: 'error', error: error.message };
  }
}

// async function sampleUrl(){
//   const result = await analyzeWebsite(sample)
//   console.log(sample,result)
// }

// sampleUrl()

// API Endpoint
app.get('/verify', async (req, res) => {
  const { url } = req.query;

  if (!url || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL parameter' });
  }

  try {
    const result = await analyzeWebsite(url);
    console.log(url,result) 
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/verify', async (req, res) => {
  const {url}  = req.body;
  console.log(url);
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL parameter' });
  }

  try {
    const result = await analyzeWebsite(url);
    console.log(url,result) 
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/whois', async (req, res) => {
  const { url } = req.body;
  
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL parameter' });
  }

  const domain = new URL(url).hostname;

  whois.lookup(domain, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'WHOIS lookup failed', details: err.message });
    }
    res.status(200).json({ whoisData: data });
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
