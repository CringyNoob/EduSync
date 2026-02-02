const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.uiu.ac.bd/notice/notice-regarding-withdrawal-and-conditional-drop-for-spring-2025-trimester/';
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        console.log('=== Testing different selectors ===\n');

        // Test various selectors
        const selectors = [
            '.entry-content',
            '.post-content',
            'article .content',
            '.notice-content',
            '.single-content',
            'article',
            '.the-content',
            '.page-content',
            '.notice-body',
            '.notice-details',
            '.single-notice',
            'main article',
            '.wpb_wrapper',
            '.vc_row',
            '#content',
            '.content-area'
        ];

        for (const sel of selectors) {
            const el = $(sel);
            if (el.length > 0) {
                const html = el.html();
                console.log(`\n=== ${sel} (${el.length} elements, ${html?.length || 0} chars) ===`);
                if (html && html.length > 0) {
                    console.log(html.substring(0, 500));
                    console.log('...\n');
                }
            }
        }

        // Check for PDF links
        console.log('\n=== PDF/Download Links ===');
        $('a[href*=".pdf"], a[href*="download"], a[href*="wp-content/uploads"]').each((i, el) => {
            console.log(`Link: ${$(el).attr('href')}`);
            console.log(`Text: ${$(el).text().trim()}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testScrape();
