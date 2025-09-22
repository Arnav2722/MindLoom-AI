(function() {
  // Check if MindLoom AI bookmarklet is already loaded
  if (window.mindloomBookmarklet) {
    window.mindloomBookmarklet.show();
    return;
  }

  // Usage tracking (localStorage)
  const getUsageCount = () => {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('mindloom_usage') || '{}');
    return usage[today] || 0;
  };

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('mindloom_usage') || '{}');
    usage[today] = (usage[today] || 0) + 1;
    localStorage.setItem('mindloom_usage', JSON.stringify(usage));
  };

  const DAILY_LIMIT = 5;

  // Create the bookmarklet interface
  const createBookmarkletUI = () => {
    const overlay = document.createElement('div');
    overlay.id = 'mindloom-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(5px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border: 4px solid black;
      box-shadow: 12px 12px 0px black;
      padding: 0;
      max-width: 600px;
      width: 95%;
      max-height: 90vh;
      overflow: hidden;
      border-radius: 0;
    `;

    const usageCount = getUsageCount();
    const remainingUses = Math.max(0, DAILY_LIMIT - usageCount);

    const header = document.createElement('div');
    header.style.cssText = `
      background: #e91e63;
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid black;
    `;

    const title = document.createElement('div');
    title.innerHTML = `
      <h2 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase;">
        🧠 MindLoom AI <span style="font-size: 14px; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px;">PREVIEW</span>
      </h2>
      <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
        ${remainingUses} free uses remaining today
      </p>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: 2px solid white;
      color: white;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 0;
    `;
    closeBtn.onclick = () => overlay.remove();

    const content = document.createElement('div');
    content.style.cssText = `
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    `;
    
    // Get page content
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const pageText = document.body.innerText.substring(0, 3000);

    if (remainingUses <= 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">⏰</div>
          <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold;">Daily Limit Reached</h3>
          <p style="margin: 0 0 24px 0; color: #666; line-height: 1.5;">
            You've used all ${DAILY_LIMIT} free transformations today. 
            Visit MindLoom AI for unlimited access to all features!
          </p>
          <button id="visit-website-btn" style="
            background: #e91e63;
            color: white;
            border: 3px solid black;
            box-shadow: 4px 4px 0px black;
            padding: 16px 32px;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            margin-right: 12px;
          ">🚀 Visit Full Website</button>
          <button id="share-btn" style="
            background: #4caf50;
            color: white;
            border: 3px solid black;
            box-shadow: 4px 4px 0px black;
            padding: 16px 32px;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
          ">📤 Share with Friends</button>
        </div>
      `;
    } else {
      content.innerHTML = `
        <div style="margin-bottom: 20px; padding: 16px; background: #f5f5f5; border: 2px solid black;">
          <strong>📄 Page:</strong> ${pageTitle}<br>
          <strong>🔗 URL:</strong> <a href="${pageUrl}" target="_blank" style="color: #e91e63; text-decoration: none;">${pageUrl.length > 50 ? pageUrl.substring(0, 50) + '...' : pageUrl}</a>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: bold; margin-bottom: 8px; font-size: 14px;">
            📝 Content Source:
          </label>
          <div style="display: flex; gap: 8px; margin-bottom: 16px;">
            <button id="source-page" class="source-btn active" style="
              background: #e91e63;
              color: white;
              border: 2px solid black;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">📄 This Page</button>
            <button id="source-text" class="source-btn" style="
              background: white;
              color: black;
              border: 2px solid black;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">✏️ Custom Text</button>
            <button id="source-url" class="source-btn" style="
              background: white;
              color: black;
              border: 2px solid black;
              padding: 8px 16px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">🔗 URL</button>
          </div>
          
          <div id="input-area">
            <div id="page-input" style="padding: 12px; background: #f0f0f0; border: 2px solid black; font-size: 12px;">
              ✅ Using content from current page: <strong>${pageTitle}</strong>
            </div>
            <div id="text-input" style="display: none;">
              <textarea id="custom-text" placeholder="Paste your text, article, or document content here..." style="
                width: 100%;
                height: 120px;
                padding: 12px;
                border: 2px solid black;
                font-size: 12px;
                resize: vertical;
                font-family: inherit;
              "></textarea>
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                <span id="char-count">0</span> characters (min 50 for processing)
              </div>
            </div>
            <div id="url-input" style="display: none;">
              <input type="url" id="custom-url" placeholder="https://example.com/article" style="
                width: 100%;
                padding: 12px;
                border: 2px solid black;
                font-size: 12px;
                font-family: inherit;
              ">
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                Enter any webpage URL to analyze
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="display: block; font-weight: bold; margin-bottom: 12px; font-size: 16px;">
            🎯 Choose Transformation (FREE Preview):
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button class="transform-btn" data-type="summary" style="
              background: #2196f3;
              color: white;
              border: 3px solid black;
              box-shadow: 4px 4px 0px black;
              padding: 16px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              cursor: pointer;
              text-align: left;
            ">
              📄 Smart Summary<br>
              <small style="opacity: 0.8; font-weight: normal;">Key points & insights</small>
            </button>
            <button class="transform-btn" data-type="legal" style="
              background: #ff9800;
              color: white;
              border: 3px solid black;
              box-shadow: 4px 4px 0px black;
              padding: 16px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              cursor: pointer;
              text-align: left;
            ">
              ⚖️ Legal Demystify<br>
              <small style="opacity: 0.8; font-weight: normal;">Plain English legal</small>
            </button>
          </div>
        </div>

        <div style="margin-bottom: 20px; padding: 16px; background: #e3f2fd; border: 2px solid #2196f3; border-left: 6px solid #2196f3;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 20px; margin-right: 8px;">💎</span>
            <strong>Want More? Full Website Includes:</strong>
          </div>
          <div style="font-size: 14px; color: #1976d2;">
            🧠 Interactive Mind Maps • 📚 Study Notes Generator • 📊 Content Analytics • 🌍 Multi-Language Support • 📁 File Uploads • 🎵 Text-to-Speech • And Much More!
          </div>
        </div>

        <div id="result-area" style="display: none;">
          <div style="border: 3px solid black; padding: 20px; background: #f9f9f9; margin-top: 20px; box-shadow: 4px 4px 0px black;">
            <div id="result-content" style="line-height: 1.6;"></div>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #ddd; display: flex; gap: 12px; flex-wrap: wrap;">
              <button id="copy-btn" style="
                background: #4caf50;
                color: white;
                border: 2px solid black;
                box-shadow: 3px 3px 0px black;
                padding: 10px 16px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
              ">📋 Copy Result</button>
              <button id="share-btn" style="
                background: #9c27b0;
                color: white;
                border: 2px solid black;
                box-shadow: 3px 3px 0px black;
                padding: 10px 16px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
              ">📤 Share</button>
              <button id="upgrade-btn" style="
                background: #e91e63;
                color: white;
                border: 2px solid black;
                box-shadow: 3px 3px 0px black;
                padding: 10px 16px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
              ">🚀 Get Full Access</button>
            </div>
          </div>
        </div>
      `;
    }

    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);

    // Add event listeners
    if (remainingUses > 0) {
      const transformBtns = content.querySelectorAll('.transform-btn');
      const resultArea = content.querySelector('#result-area');
      const resultContent = content.querySelector('#result-content');
      
      // Source selection handlers
      const sourceBtns = content.querySelectorAll('.source-btn');
      const pageInput = content.querySelector('#page-input');
      const textInput = content.querySelector('#text-input');
      const urlInput = content.querySelector('#url-input');
      const customText = content.querySelector('#custom-text');
      const customUrl = content.querySelector('#custom-url');
      const charCount = content.querySelector('#char-count');
      
      let currentSource = 'page';
      
      sourceBtns.forEach(btn => {
        btn.onclick = () => {
          sourceBtns.forEach(b => {
            b.style.background = 'white';
            b.style.color = 'black';
            b.classList.remove('active');
          });
          btn.style.background = '#e91e63';
          btn.style.color = 'white';
          btn.classList.add('active');
          
          pageInput.style.display = 'none';
          textInput.style.display = 'none';
          urlInput.style.display = 'none';
          
          if (btn.id === 'source-page') {
            currentSource = 'page';
            pageInput.style.display = 'block';
          } else if (btn.id === 'source-text') {
            currentSource = 'text';
            textInput.style.display = 'block';
            customText.focus();
          } else if (btn.id === 'source-url') {
            currentSource = 'url';
            urlInput.style.display = 'block';
            customUrl.focus();
          }
        };
      });
      
      // Character counter for custom text
      if (customText) {
        customText.oninput = () => {
          const count = customText.value.length;
          charCount.textContent = count;
          charCount.style.color = count >= 50 ? '#4caf50' : '#666';
        };
      }

      transformBtns.forEach(btn => {
        btn.onclick = async () => {
          const transformationType = btn.dataset.type;
          
          // Disable all buttons
          transformBtns.forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.5';
            b.textContent = '⏳ Processing...';
          });

          try {
            incrementUsage();
            
            // Get content based on selected source
            let contentToProcess = '';
            let contentTitle = '';
            
            if (currentSource === 'page') {
              contentToProcess = pageText;
              contentTitle = pageTitle;
            } else if (currentSource === 'text') {
              contentToProcess = customText.value.trim();
              contentTitle = 'Custom Text Input';
              if (contentToProcess.length < 50) {
                throw new Error('Please enter at least 50 characters of text');
              }
            } else if (currentSource === 'url') {
              const url = customUrl.value.trim();
              if (!url || !url.startsWith('http')) {
                throw new Error('Please enter a valid URL starting with http:// or https://');
              }
              // For URL, we'll show a message about limitations
              contentToProcess = `URL Analysis: ${url}\n\nNote: This is a basic preview. The full MindLoom AI website can fetch and analyze content from any URL automatically.`;
              contentTitle = `URL: ${url}`;
            }
            
            // Simple client-side transformation for demo
            let result = '';
            
            if (transformationType === 'summary') {
              result = generateSummary(contentToProcess, contentTitle);
            } else if (transformationType === 'legal') {
              result = generateLegalAnalysis(contentToProcess, contentTitle);
            }

            resultContent.innerHTML = `<div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${result}</div>`;
            resultArea.style.display = 'block';

            // Add result action handlers
            const copyBtn = content.querySelector('#copy-btn');
            const shareBtn = content.querySelector('#share-btn');
            const upgradeBtn = content.querySelector('#upgrade-btn');

            copyBtn.onclick = () => {
              navigator.clipboard.writeText(result).then(() => {
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => copyBtn.textContent = '📋 Copy Result', 2000);
              });
            };

            shareBtn.onclick = () => {
              const shareText = `Check out this AI transformation from MindLoom AI:\\n\\n${result.substring(0, 200)}...\\n\\nGet your own at: https://mindloom-ai.netlify.app/`;
              if (navigator.share) {
                navigator.share({ text: shareText });
              } else {
                navigator.clipboard.writeText(shareText);
                shareBtn.textContent = '✅ Copied to Share!';
                setTimeout(() => shareBtn.textContent = '📤 Share', 2000);
              }
            };

            upgradeBtn.onclick = () => {
              window.open('https://mindloom-ai.netlify.app/', '_blank');
            };

          } catch (error) {
            resultContent.innerHTML = `<div style="color: red; padding: 16px; background: #ffebee; border: 2px solid #f44336;">
              <strong>⚠️ Error:</strong> ${error.message}<br><br>
              <a href="https://mindloom-ai.netlify.app/" target="_blank" style="color: #e91e63; font-weight: bold;">
                Try the full website for better processing →
              </a>
            </div>`;
            resultArea.style.display = 'block';
          } finally {
            // Re-enable buttons
            transformBtns.forEach((b, i) => {
              b.disabled = false;
              b.style.opacity = '1';
              if (i === 0) {
                b.innerHTML = '📄 Smart Summary<br><small style="opacity: 0.8; font-weight: normal;">Key points & insights</small>';
              } else {
                b.innerHTML = '⚖️ Legal Demystify<br><small style="opacity: 0.8; font-weight: normal;">Plain English legal</small>';
              }
            });
          }
        };
      });
    } else {
      // Handle limit reached buttons
      const visitBtn = content.querySelector('#visit-website-btn');
      const shareBtn = content.querySelector('#share-btn');

      if (visitBtn) {
        visitBtn.onclick = () => {
          window.open('https://mindloom-ai.netlify.app/', '_blank');
        };
      }

      if (shareBtn) {
        shareBtn.onclick = () => {
          const shareText = `I've been using MindLoom AI's bookmarklet to transform web content with AI! Get yours at: https://mindloom-ai.netlify.app/`;
          if (navigator.share) {
            navigator.share({ text: shareText });
          } else {
            navigator.clipboard.writeText(shareText);
            shareBtn.textContent = '✅ Copied to Share!';
            setTimeout(() => shareBtn.textContent = '📤 Share with Friends', 2000);
          }
        };
      }
    }

    return overlay;
  };

  // Simple transformation functions (client-side for speed)
  const generateSummary = (text, title) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const keyPoints = sentences.slice(0, 6).map((s, i) => `${i + 1}. ${s.trim()}`);
    
    return `📄 SMART SUMMARY: ${title}

🔑 KEY POINTS:
${keyPoints.join('\\n')}

📊 CONTENT STATS:
• Word Count: ~${text.split(' ').length} words
• Reading Time: ~${Math.ceil(text.split(' ').length / 200)} minutes
• Complexity: ${text.split(' ').length > 1000 ? 'High' : text.split(' ').length > 500 ? 'Medium' : 'Low'}

💡 This is a basic preview. The full MindLoom AI website offers:
• Advanced AI analysis with GPT/Gemini
• Interactive mind maps
• Study notes generation
• Multi-language support
• File upload processing
• And much more!

🚀 Get full access: https://mindloom-ai.netlify.app/`;
  };

  const generateLegalAnalysis = (text, title) => {
    const legalTerms = ['shall', 'must', 'may', 'liable', 'breach', 'contract', 'agreement', 'terms', 'conditions', 'warranty', 'indemnify', 'jurisdiction'];
    const foundTerms = legalTerms.filter(term => text.toLowerCase().includes(term));
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const legalSentences = sentences.filter(s => 
      legalTerms.some(term => s.toLowerCase().includes(term))
    ).slice(0, 4);

    return `⚖️ LEGAL DEMYSTIFICATION: ${title}

🔍 LEGAL TERMS DETECTED:
${foundTerms.length > 0 ? foundTerms.map(term => `• ${term.toUpperCase()}`).join('\\n') : '• No common legal terms detected'}

📋 KEY LEGAL CLAUSES:
${legalSentences.length > 0 ? legalSentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\\n') : 'No specific legal clauses identified in this content.'}

⚠️ COMPLEXITY ASSESSMENT:
• Legal Language Density: ${foundTerms.length > 5 ? 'High' : foundTerms.length > 2 ? 'Medium' : 'Low'}
• Readability: ${text.split(' ').length > 1000 ? 'Complex' : 'Moderate'}
• Recommendation: ${foundTerms.length > 3 ? 'Consider professional legal review' : 'Generally accessible'}

💡 This is a basic preview. The full MindLoom AI offers:
• Professional legal document analysis
• Risk assessment and recommendations
• Plain English translations
• Clause-by-clause breakdowns
• Legal term definitions
• And comprehensive legal insights!

🚀 Get professional legal analysis: https://mindloom-ai.netlify.app/`;
  };

  // Initialize bookmarklet
  window.mindloomBookmarklet = {
    show: () => {
      const existing = document.getElementById('mindloom-overlay');
      if (existing) existing.remove();
      document.body.appendChild(createBookmarkletUI());
    }
  };

  // Show the bookmarklet
  window.mindloomBookmarklet.show();
})();