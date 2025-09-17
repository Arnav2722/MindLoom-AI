// MindLoom Bookmarklet - Transform any webpage content
(function() {
  'use strict';
  
  // Check if MindLoom overlay already exists
  if (document.getElementById('mindloom-overlay')) {
    document.getElementById('mindloom-overlay').style.display = 'block';
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'mindloom-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        padding: 30px;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">🧠 MindLoom AI</h2>
          <button id="mindloom-close" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          ">×</button>
        </div>
        
        <p style="color: #666; margin-bottom: 20px; line-height: 1.5;">
          Transform this page content with AI
        </p>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #333;">
            Choose transformation:
          </label>
          <select id="mindloom-transform-type" style="
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            background: white;
          ">
            <option value="summary">📝 Summary</option>
            <option value="mindmap">🗺️ Mind Map</option>
            <option value="podcast">🎙️ Podcast Script</option>
            <option value="legal">⚖️ Legal Analysis</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 15px;">
          <button id="mindloom-transform" style="
            flex: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            TRANSFORM
          </button>
          <button id="mindloom-cancel" style="
            flex: 1;
            background: #f8f9fa;
            color: #495057;
            border: 2px solid #dee2e6;
            padding: 15px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            Cancel
          </button>
        </div>
        
        <div id="mindloom-status" style="
          margin-top: 20px;
          padding: 15px;
          border-radius: 8px;
          display: none;
          text-align: center;
        "></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Event listeners
  document.getElementById('mindloom-close').onclick = function() {
    overlay.style.display = 'none';
  };

  document.getElementById('mindloom-cancel').onclick = function() {
    overlay.style.display = 'none';
  };

  document.getElementById('mindloom-transform').onclick = async function() {
    const transformType = document.getElementById('mindloom-transform-type').value;
    const statusDiv = document.getElementById('mindloom-status');
    const transformBtn = document.getElementById('mindloom-transform');
    
    // Show loading state
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#e3f2fd';
    statusDiv.style.color = '#1976d2';
    statusDiv.innerHTML = '🔄 Extracting content...';
    transformBtn.disabled = true;
    transformBtn.style.opacity = '0.6';

    try {
      // Extract page content
      const pageContent = document.body.innerText || document.body.textContent || '';
      const pageTitle = document.title || 'Untitled Page';
      const pageUrl = window.location.href;

      if (!pageContent.trim()) {
        throw new Error('No content found on this page');
      }

      statusDiv.innerHTML = '🧠 Transforming with AI...';

      // Send to MindLoom API
      const response = await fetch('https://aynhvozryqdfoibmhygq.supabase.co/functions/v1/content-transformer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: pageContent.substring(0, 10000), // Limit content size
          transformationType: transformType,
          title: pageTitle
        })
      });

      const result = await response.json();

      if (result.success) {
        // Open MindLoom with results
        const mindloomUrl = `https://mindloom-ai.lovableproject.com/?result=${encodeURIComponent(JSON.stringify({
          content: result.transformedContent,
          type: transformType,
          title: pageTitle,
          url: pageUrl
        }))}`;
        
        window.open(mindloomUrl, '_blank');
        overlay.style.display = 'none';
      } else {
        throw new Error(result.error || 'Transformation failed');
      }

    } catch (error) {
      statusDiv.style.background = '#ffebee';
      statusDiv.style.color = '#c62828';
      statusDiv.innerHTML = `❌ Error: ${error.message}`;
    } finally {
      transformBtn.disabled = false;
      transformBtn.style.opacity = '1';
    }
  };

  // Close on overlay click
  overlay.onclick = function(e) {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  };
})();