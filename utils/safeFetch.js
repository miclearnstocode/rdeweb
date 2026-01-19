// client/utils/safeFetch.js
/**
 * Safe fetch that handles HTML responses gracefully
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object|string>} - Parsed JSON or structured HTML response
 */
export const safeFetch = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get response as text first
        const responseText = await response.text();
        
        // Check if it's HTML
        const isHtml = responseText.trim().startsWith('<!DOCTYPE') || 
                      responseText.trim().startsWith('<html') ||
                      responseText.includes('<title>RDE</title>');
        
        if (isHtml) {
            console.warn(`⚠️ ${url} returned HTML instead of JSON`);
            
            // Parse HTML to extract useful information
            return parseHtmlResponse(responseText, url);
        }
        
        // Try to parse as JSON
        try {
            return JSON.parse(responseText);
        } catch (jsonError) {
            // If not JSON, return as text with metadata
            console.warn(`⚠️ ${url} returned non-JSON text`);
            return {
                success: false,
                message: 'Server returned non-JSON response',
                rawData: responseText,
                isHtml: false,
                isText: true
            };
        }
        
    } catch (error) {
        console.error(`❌ Fetch error for ${url}:`, error);
        return {
            success: false,
            message: 'Network error',
            error: error.message,
            isError: true
        };
    }
};

/**
 * Parse HTML response to extract useful information
 */
const parseHtmlResponse = (html, url) => {
    // Create temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract title
    const title = tempDiv.querySelector('title')?.textContent || 'No title';
    
    // Check for common pages
    const isLoginPage = title.includes('RDE') || 
                       html.toLowerCase().includes('login') ||
                       html.includes('type="password"');
    
    const isErrorPage = html.includes('404') || 
                       html.includes('Error') || 
                       html.toLowerCase().includes('error');
    
    // Extract any JSON that might be in script tags
    const scriptTags = tempDiv.querySelectorAll('script');
    let embeddedJson = null;
    
    for (const script of scriptTags) {
        const content = script.textContent || script.innerHTML;
        // Look for JSON patterns
        if (content.includes('{') && content.includes('}')) {
            try {
                // Find JSON object in script
                const jsonStart = content.indexOf('{');
                const jsonEnd = content.lastIndexOf('}') + 1;
                if (jsonStart !== -1 && jsonEnd !== -1) {
                    const jsonStr = content.substring(jsonStart, jsonEnd);
                    embeddedJson = JSON.parse(jsonStr);
                    break;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }
    
    // Check for redirect in meta tags
    const metaTags = tempDiv.querySelectorAll('meta');
    let redirectUrl = null;
    
    for (const meta of metaTags) {
        if (meta.getAttribute('http-equiv') === 'refresh') {
            const content = meta.getAttribute('content');
            const match = content.match(/url=(.+)/i);
            if (match) {
                redirectUrl = match[1];
            }
        }
    }
    
    // Return structured response
    return {
        success: false,
        message: 'Server returned HTML page',
        isHtml: true,
        htmlInfo: {
            title: title,
            isLoginPage: isLoginPage,
            isErrorPage: isErrorPage,
            url: url,
            redirectUrl: redirectUrl
        },
        embeddedData: embeddedJson,
        // For backward compatibility with existing code
        status: isLoginPage ? true : false, // true means "needs login"
        redirect: redirectUrl
    };
};

/**
 * Specialized fetch for login endpoints with better error handling
 */
export const authFetch = async (url, formData) => {
    const result = await safeFetch(url, {
        method: 'POST',
        body: formData
    });
    
    // Handle HTML responses for auth endpoints
    if (result.isHtml) {
        if (result.htmlInfo?.isLoginPage) {
            return {
                status: true,
                message: '/account', // Redirect to login
                isHtml: true
            };
        }
        // For other HTML pages, treat as failed login
        return {
            status: false,
            message: 'Invalid credentials or server error',
            isHtml: true
        };
    }
    
    return result;
};

/**
 * Check if user is logged in (handles HTML responses)
 */
export const checkSession = async () => {
    const formData = new FormData();
    formData.append('sessionChecker', 'true');
    
    const result = await safeFetch('/sessionCheck', {
        method: 'POST',
        body: formData
    });
    
    // Handle HTML response
    if (result.isHtml) {
        return {
            status: true,
            message: 'LOGIN_REQUIRED',
            isHtml: true
        };
    }
    
    return result;
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
    window.safeFetch = safeFetch;
    window.authFetch = authFetch;
    window.checkSession = checkSession;
}