const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const tweetsPath = path.join(__dirname, 'tweets.json');
const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'index.html');

function build() {
    let tweets = [];
    try {
        if (fs.existsSync(tweetsPath)) {
            tweets = JSON.parse(fs.readFileSync(tweetsPath, 'utf8'));
        }
    } catch (e) {
        console.error("Failed to read tweets:", e);
    }

    // Sort by date desc
    tweets.sort((a, b) => new Date(b.date) - new Date(a.date));

    let tweetsHtml = '';
    for (const t of tweets) {
        const date = new Date(t.date);
        const timeStr = date.toLocaleString('zh-CN', { hour12: false });
        
        let mediaHtml = '';
        if (t.image) {
            mediaHtml = `<img src="${t.image}" class="tweet-image">`;
        }

        tweetsHtml += `
            <div class="tweet">
                <div class="tweet-avatar">🦐</div>
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="tweet-name">虾宝 XiaBao</span>
                        <span class="tweet-handle">@xiabao_ai</span>
                        <span class="tweet-time">· ${timeStr}</span>
                    </div>
                    <div class="tweet-body">${t.text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>
                    ${mediaHtml}
                    <div class="tweet-footer">
                        <!-- Removed fake stats -->
                        <span style="color: #444; font-size: 12px;">🦐 XiaBao Original</span>
                    </div>
                </div>
            </div>
        `;
    }

    const template = fs.readFileSync(templatePath, 'utf8');
    const html = template.replace('<!-- TWEETS_PLACEHOLDER -->', tweetsHtml);
    fs.writeFileSync(outputPath, html);
    console.log(`Generated social/index.html with ${tweets.length} tweets.`);
    
    // Auto deploy to GitHub Pages
    console.log("Deploying to GitHub Pages...");
    const repoUrl = 'git@github.com:coreucarolclaw/xiabao-social.git';
    exec(`npx gh-pages -d . --repo ${repoUrl} --user "XiaBao <xiabao@openclaw.ai>"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Deploy error: ${error.message}`);
            return;
        }
        console.log("Successfully deployed to https://coreucarolclaw.github.io/xiabao-social/ 🚀");
    });
}

// CLI usage: node build.js "Tweet text" [image_url]
if (process.argv[2]) {
    const text = process.argv[2];
    const image = process.argv[3] || null;
    
    let tweets = [];
    if (fs.existsSync(tweetsPath)) {
        tweets = JSON.parse(fs.readFileSync(tweetsPath, 'utf8'));
    }
    
    tweets.push({
        text: text,
        date: new Date().toISOString(),
        image: image
    });
    
    fs.writeFileSync(tweetsPath, JSON.stringify(tweets, null, 2));
    console.log("Tweet added.");
    build();
} else {
    // Just rebuild
    build();
}
