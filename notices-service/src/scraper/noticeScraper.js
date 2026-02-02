// notices-service/src/scraper/noticeScraper.js
// Scrapes notices from https://www.uiu.ac.bd/notice/

const axios = require('axios');
const cheerio = require('cheerio');
const he = require('he');

// In-memory cache for notices
let noticesCache = {
    notices: [],
    lastScraped: null
};

const BASE_URL = 'https://www.uiu.ac.bd/notice/';
const MAX_PAGES = 10; // Limit pagination to prevent infinite loops
const CONCURRENT_DETAIL_FETCHES = 5; // Limit concurrent requests for detail pages

/**
 * Parse date string from UIU format to Date object
 * Example formats: "January 15, 2026", "Dec 10, 2025"
 */
function parseNoticeDate(dateStr) {
    if (!dateStr) return null;
    try {
        // Clean up the date string
        const cleaned = dateStr.trim().replace(/\s+/g, ' ');
        const date = new Date(cleaned);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        return null;
    }
}

/**
 * Check if a date is within the last 3 months
 */
function isWithinThreeMonths(date) {
    if (!date) return false;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date >= threeMonthsAgo;
}

/**
 * Generate a unique ID from URL slug
 */
function generateIdFromUrl(url) {
    if (!url) return `notice-${Date.now()}`;
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        return pathParts[pathParts.length - 1] || `notice-${Date.now()}`;
    } catch {
        // If URL parsing fails, create a hash from the URL
        return url.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
    }
}

/**
 * Fetch notice detail page and extract full content and attachments
 * @param {string} noticeUrl - URL of the notice detail page
 * @returns {Promise<Object>} Object with content and attachments
 */
async function fetchNoticeDetails(noticeUrl) {
    try {
        const response = await axios.get(noticeUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        const $ = cheerio.load(response.data);
        
        // UIU notice details are in .notice-details inside .main-comp
        let content = '';
        const $noticeDetails = $('.notice-details');
        
        if ($noticeDetails.length > 0) {
            // Get the full HTML content
            content = $noticeDetails.html();
        } else {
            // Fallback to other selectors
            const fallbackSelectors = ['.main-comp', '.entry-content', '.post-content', 'article'];
            for (const selector of fallbackSelectors) {
                const $content = $(selector);
                if ($content.length > 0) {
                    content = $content.html();
                    break;
                }
            }
        }

        // Clean up the content HTML
        if (content) {
            // Remove script and style tags
            content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
            // Decode HTML entities
            content = he.decode(content);
        }

        // Extract attachments/files from the notice-details section specifically
        const attachments = [];
        const fileExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.jpg', '.jpeg', '.png', '.gif'];
        
        // Look for links that could be file downloads within notice-details
        const $searchArea = $noticeDetails.length > 0 ? $noticeDetails : $('body');
        $searchArea.find('a[href]').each((i, el) => {
            const href = $(el).attr('href');
            const linkText = $(el).text().trim();
            
            if (href) {
                const hrefLower = href.toLowerCase();
                const isFile = fileExtensions.some(ext => hrefLower.includes(ext));
                const isDownload = hrefLower.includes('download') || hrefLower.includes('attachment') || hrefLower.includes('wp-content/uploads');
                
                if (isFile || isDownload) {
                    // Determine file type
                    let fileType = 'file';
                    if (hrefLower.includes('.pdf')) fileType = 'pdf';
                    else if (hrefLower.includes('.doc')) fileType = 'doc';
                    else if (hrefLower.includes('.xls')) fileType = 'excel';
                    else if (hrefLower.includes('.ppt')) fileType = 'powerpoint';
                    else if (hrefLower.includes('.zip') || hrefLower.includes('.rar')) fileType = 'archive';
                    else if (hrefLower.match(/\.(jpg|jpeg|png|gif)/)) fileType = 'image';

                    // Get filename from URL or link text
                    let fileName = linkText || href.split('/').pop() || 'Download';
                    fileName = he.decode(fileName);
                    
                    // Make sure URL is absolute
                    let fileUrl = href;
                    if (href.startsWith('/')) {
                        fileUrl = 'https://www.uiu.ac.bd' + href;
                    } else if (!href.startsWith('http')) {
                        fileUrl = 'https://www.uiu.ac.bd/' + href;
                    }

                    // Avoid duplicates
                    if (!attachments.find(a => a.url === fileUrl)) {
                        attachments.push({
                            name: fileName,
                            url: fileUrl,
                            type: fileType
                        });
                    }
                }
            }
        });

        // Also look for images in the content that might be important
        const contentImages = [];
        $('article img, .entry-content img, .post-content img').each((i, el) => {
            const src = $(el).attr('src');
            const alt = $(el).attr('alt') || '';
            if (src && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar')) {
                let imgUrl = src;
                if (src.startsWith('/')) {
                    imgUrl = 'https://www.uiu.ac.bd' + src;
                } else if (!src.startsWith('http')) {
                    imgUrl = 'https://www.uiu.ac.bd/' + src;
                }
                if (!contentImages.find(img => img.url === imgUrl)) {
                    contentImages.push({
                        url: imgUrl,
                        alt: he.decode(alt)
                    });
                }
            }
        });

        return {
            content: content || '',
            attachments: attachments,
            contentImages: contentImages
        };
    } catch (error) {
        console.error(`  Error fetching notice details from ${noticeUrl}:`, error.message);
        return {
            content: '',
            attachments: [],
            contentImages: []
        };
    }
}

/**
 * Scrape notices from a single page
 * @param {number} pageNum - Page number (1 for first page)
 * @returns {Promise<Array>} Array of notice objects
 */
async function scrapeNoticePage(pageNum = 1) {
    const url = pageNum === 1 ? BASE_URL : `${BASE_URL}page/${pageNum}/`;
    
    console.log(`  Fetching page ${pageNum}: ${url}`);
    
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        const $ = cheerio.load(response.data);
        const notices = [];

        // Find all notice elements
        $('.notice').each((index, element) => {
            const $notice = $(element);
            
            // Extract date from .details .date-container .date
            const dateText = $notice.find('.details .date-container .date').text().trim();
            
            // Extract title and URL from .details .title a
            const $titleLink = $notice.find('.details .title a');
            const title = he.decode($titleLink.text().trim());
            const noticeUrl = $titleLink.attr('href');
            
            // Extract image from .image img (optional)
            const $image = $notice.find('.image img');
            const imageUrl = $image.attr('src') || null;
            
            // Only add if we have at least title and URL
            if (title && noticeUrl) {
                const parsedDate = parseNoticeDate(dateText);
                
                notices.push({
                    id: generateIdFromUrl(noticeUrl),
                    title: title,
                    url: noticeUrl,
                    date: dateText,
                    parsedDate: parsedDate,
                    image: imageUrl,
                    scrapedAt: new Date().toISOString()
                });
            }
        });

        return notices;
    } catch (error) {
        console.error(`  Error fetching page ${pageNum}:`, error.message);
        return [];
    }
}

/**
 * Process notices in batches to fetch their details
 * @param {Array} notices - Array of basic notice objects
 * @param {number} batchSize - How many to process concurrently
 */
async function fetchDetailsForNotices(notices, batchSize = CONCURRENT_DETAIL_FETCHES) {
    console.log(`  Fetching details for ${notices.length} notices...`);
    
    const results = [];
    
    for (let i = 0; i < notices.length; i += batchSize) {
        const batch = notices.slice(i, i + batchSize);
        console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(notices.length / batchSize)}`);
        
        const batchResults = await Promise.all(
            batch.map(async (notice) => {
                const details = await fetchNoticeDetails(notice.url);
                return {
                    ...notice,
                    content: details.content,
                    attachments: details.attachments,
                    contentImages: details.contentImages
                };
            })
        );
        
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < notices.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    return results;
}

/**
 * Scrape all notices from the last 3 months
 * Handles pagination automatically
 */
async function scrapeAllNotices() {
    console.log('\n--- Starting Notice Scraping ---');
    console.log(`Source: ${BASE_URL}`);
    console.log(`Filter: Last 3 months\n`);
    
    const allNotices = [];
    const seenUrls = new Set();
    let pageNum = 1;
    let hasMorePages = true;
    let foundOldNotice = false;

    // Phase 1: Collect basic notice info from listing pages
    console.log('Phase 1: Collecting notice listings...');
    while (hasMorePages && pageNum <= MAX_PAGES && !foundOldNotice) {
        const pageNotices = await scrapeNoticePage(pageNum);
        
        if (pageNotices.length === 0) {
            hasMorePages = false;
            break;
        }

        for (const notice of pageNotices) {
            // Skip duplicates
            if (seenUrls.has(notice.url)) continue;
            
            // Check if notice is within last 3 months
            if (notice.parsedDate && !isWithinThreeMonths(notice.parsedDate)) {
                console.log(`  Found notice older than 3 months, stopping pagination`);
                foundOldNotice = true;
                break;
            }
            
            seenUrls.add(notice.url);
            allNotices.push(notice);
        }

        pageNum++;
        
        // Small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\nPhase 2: Fetching full details for each notice...`);
    
    // Phase 2: Fetch full details for each notice
    const noticesWithDetails = await fetchDetailsForNotices(allNotices);

    // Sort by date (newest first)
    noticesWithDetails.sort((a, b) => {
        if (!a.parsedDate && !b.parsedDate) return 0;
        if (!a.parsedDate) return 1;
        if (!b.parsedDate) return -1;
        return b.parsedDate - a.parsedDate;
    });

    // Update cache
    noticesCache = {
        notices: noticesWithDetails,
        lastScraped: new Date().toISOString()
    };

    console.log(`\n--- Scraping Complete ---`);
    console.log(`Total notices: ${noticesWithDetails.length}`);
    console.log(`Pages scraped: ${pageNum - 1}\n`);

    return noticesWithDetails;
}

/**
 * Get cached notices
 */
function getNoticesCache() {
    return noticesCache;
}

/**
 * Get latest N notices
 */
function getLatestNotices(count = 5) {
    return noticesCache.notices.slice(0, count);
}

/**
 * Force refresh notices cache
 */
async function refreshNotices() {
    return await scrapeAllNotices();
}

module.exports = {
    scrapeAllNotices,
    scrapeNoticePage,
    getNoticesCache,
    getLatestNotices,
    refreshNotices
};
