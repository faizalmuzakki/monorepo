/**
 * Instagram Video Downloader - Cloudflare Worker
 *
 * Embeds Instagram videos with captions in Discord and other platforms
 * Usage: Replace instagram.com with your-worker-domain.workers.dev
 */

interface InstagramData {
  videoUrl: string;
  caption: string;
  thumbnailUrl: string;
  author: string;
  timestamp?: number;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    // Handle root path
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(getHomePage(), {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
      });
    }

    try {
      // Extract Instagram post ID from various URL formats
      const instagramData = await getInstagramData(url.pathname);

      if (!instagramData) {
        return new Response('Could not fetch Instagram data', { status: 404 });
      }

      // Check if request is from a bot (Discord, Telegram, etc.) or a browser
      const isBot = /bot|discord|telegram|whatsapp|slack/i.test(userAgent);

      if (isBot) {
        // Return HTML with Open Graph tags for embedding
        return new Response(generateEmbedHTML(instagramData, url.href), {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
            'cache-control': 'public, max-age=3600',
          },
        });
      } else {
        // Redirect browsers directly to the video
        return Response.redirect(instagramData.videoUrl, 302);
      }
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        status: 500
      });
    }
  },
};

/**
 * Fetches Instagram post data
 */
async function getInstagramData(pathname: string): Promise<InstagramData | null> {
  // Extract post shortcode from various URL formats
  // /reels/ABC123/ or /p/ABC123/ or /tv/ABC123/
  const match = pathname.match(/\/(reels|p|tv)\/([A-Za-z0-9_-]+)/);

  if (!match) {
    throw new Error('Invalid Instagram URL format');
  }

  const shortcode = match[2];
  const instagramUrl = `https://www.instagram.com/p/${shortcode}/`;

  // Try method 1: Instagram's oEmbed API (public, but limited data)
  try {
    const oembed = await fetchOEmbed(instagramUrl);
    if (oembed) {
      return oembed;
    }
  } catch (e) {
    console.log('oEmbed failed, trying scraping method');
  }

  // Try method 2: Scrape Instagram page
  try {
    const scraped = await scrapeInstagram(instagramUrl, shortcode);
    if (scraped) {
      return scraped;
    }
  } catch (e) {
    console.error('Scraping failed:', e);
  }

  return null;
}

/**
 * Method 1: Use Instagram's oEmbed API
 */
async function fetchOEmbed(instagramUrl: string): Promise<InstagramData | null> {
  const oembedUrl = `https://graph.facebook.com/v12.0/instagram_oembed?url=${encodeURIComponent(instagramUrl)}&access_token=`;

  // Note: oEmbed doesn't provide video URLs directly, so this is limited
  // Keeping it as a fallback for caption extraction
  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;

    const data = await response.json();

    // oEmbed doesn't give us direct video URL, so we'll need scraping
    return null;
  } catch {
    return null;
  }
}

/**
 * Method 2: Scrape Instagram page for video data
 */
async function scrapeInstagram(instagramUrl: string, shortcode: string): Promise<InstagramData | null> {
  const response = await fetch(instagramUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`Instagram returned ${response.status}`);
  }

  const html = await response.text();

  // Instagram embeds data in <script type="application/ld+json">
  const ldJsonMatch = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/s);

  if (ldJsonMatch) {
    try {
      const jsonData = JSON.parse(ldJsonMatch[1]);

      // Extract video URL from LD+JSON
      let videoUrl = '';
      if (jsonData.video && Array.isArray(jsonData.video)) {
        videoUrl = jsonData.video[0]?.contentUrl || '';
      } else if (jsonData.video?.contentUrl) {
        videoUrl = jsonData.video.contentUrl;
      }

      const caption = jsonData.caption || jsonData.description || '';
      const thumbnailUrl = jsonData.thumbnailUrl || jsonData.image || '';
      const author = jsonData.author?.identifier?.value || jsonData.author?.name || 'Instagram User';

      if (videoUrl) {
        return {
          videoUrl,
          caption: cleanCaption(caption),
          thumbnailUrl,
          author,
        };
      }
    } catch (e) {
      console.error('Failed to parse LD+JSON:', e);
    }
  }

  // Fallback: Try to extract from window._sharedData
  const sharedDataMatch = html.match(/window\._sharedData = ({.+?});<\/script>/);

  if (sharedDataMatch) {
    try {
      const sharedData = JSON.parse(sharedDataMatch[1]);
      const media = sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

      if (media?.video_url) {
        return {
          videoUrl: media.video_url,
          caption: cleanCaption(media.edge_media_to_caption?.edges?.[0]?.node?.text || ''),
          thumbnailUrl: media.display_url || '',
          author: media.owner?.username || 'Instagram User',
        };
      }
    } catch (e) {
      console.error('Failed to parse shared data:', e);
    }
  }

  return null;
}

/**
 * Clean and truncate caption
 */
function cleanCaption(caption: string): string {
  if (!caption) return 'Instagram video';

  // Remove excessive newlines and trim
  let cleaned = caption.replace(/\n{3,}/g, '\n\n').trim();

  // Truncate if too long (Discord has limits)
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 197) + '...';
  }

  return cleaned;
}

/**
 * Generate HTML with Open Graph tags for embedding
 */
function generateEmbedHTML(data: InstagramData, originalUrl: string): string {
  const title = `${data.author} on Instagram`;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta property="og:type" content="video.other">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(data.caption)}">
    <meta property="og:url" content="${escapeHtml(originalUrl)}">
    <meta property="og:video" content="${escapeHtml(data.videoUrl)}">
    <meta property="og:video:secure_url" content="${escapeHtml(data.videoUrl)}">
    <meta property="og:video:type" content="video/mp4">
    <meta property="og:video:width" content="720">
    <meta property="og:video:height" content="1280">
    <meta property="og:image" content="${escapeHtml(data.thumbnailUrl)}">

    <meta name="twitter:card" content="player">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(data.caption)}">
    <meta name="twitter:image" content="${escapeHtml(data.thumbnailUrl)}">
    <meta name="twitter:player" content="${escapeHtml(data.videoUrl)}">
    <meta name="twitter:player:width" content="720">
    <meta name="twitter:player:height" content="1280">

    <meta http-equiv="refresh" content="0;url=${escapeHtml(data.videoUrl)}">
    <title>${escapeHtml(title)}</title>

    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #000;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            text-align: center;
        }
        video {
            max-width: 100%;
            border-radius: 8px;
            margin: 20px 0;
        }
        .caption {
            margin: 20px 0;
            line-height: 1.5;
            text-align: left;
        }
        .author {
            font-weight: bold;
            margin-bottom: 10px;
        }
        a {
            color: #0095f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <video controls autoplay loop muted playsinline>
            <source src="${escapeHtml(data.videoUrl)}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="caption">
            <div class="author">@${escapeHtml(data.author)}</div>
            <div>${escapeHtml(data.caption)}</div>
        </div>
        <p>
            <a href="${escapeHtml(data.videoUrl)}" download>Download Video</a>
        </p>
    </div>
</body>
</html>`;
}

/**
 * Home page
 */
function getHomePage(): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Video Downloader</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        h1 {
            margin-top: 0;
        }
        .instructions {
            background: rgba(0, 0, 0, 0.2);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
        .example {
            margin: 10px 0;
        }
        .feature {
            margin: 10px 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📹 Instagram Video Downloader</h1>
        <p>Embed Instagram videos with captions in Discord, Telegram, and other platforms!</p>

        <div class="instructions">
            <h2>How to use:</h2>
            <div class="example">
                <strong>Original URL:</strong><br>
                <code>https://www.instagram.com/reels/ABC123/</code>
            </div>
            <div class="example">
                <strong>Replace with:</strong><br>
                <code>https://your-worker.workers.dev/reels/ABC123/</code>
            </div>
        </div>

        <h2>✨ Features:</h2>
        <div class="feature">✅ Direct video embedding</div>
        <div class="feature">✅ Caption included</div>
        <div class="feature">✅ Works with Reels, Posts, and IGTV</div>
        <div class="feature">✅ No ads, no tracking</div>
        <div class="feature">✅ Fast (powered by Cloudflare)</div>

        <p style="margin-top: 30px; font-size: 14px; opacity: 0.8;">
            Made with ❤️ | Powered by Cloudflare Workers
        </p>
    </div>
</body>
</html>`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
