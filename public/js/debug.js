/**
 * Debug utilities for SimpleWebDBApp
 * This script helps debug issues with edit and delete operations
 * 
 * IMPORTANT: This module is disabled by default to avoid performance issues.
 * To enable debugging, set window.PictureDBDebug.enabled = true; in the browser console.
 */
// Create a global debug object
window.PictureDBDebug = {
  // Settings - disabled by default to avoid performance issues
  enabled: false,
  logToConsole: true,
  logToUI: false,
  
  // Log levels
  levels: {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug'
  },
  
  // Internal log store (limited size to prevent memory issues)
  _logs: [],
  _maxLogs: 100,
  
  // Initialize debug panel
  init: function() {
    if (!this.enabled) return;
    console.log('[PictureDBDebug] Initializing debug utilities');
    
    // Create debug panel if logging to UI is enabled
    if (this.logToUI) {
      this._createDebugPanel();
    }
    
    // Capture unhandled errors
    this._setupErrorHandling();
    
    console.log('[PictureDBDebug] Debug utilities initialized');
  },
  
  // Log a message
  log: function(message, level = 'info', data = null) {
    if (!this.enabled) return;
    
    const time = new Date().toISOString();
    const logEntry = { time, level, message, data };
    
    // Store log (with size limitation to prevent memory issues)
    this._logs.unshift(logEntry);
    if (this._logs.length > this._maxLogs) {
      this._logs.pop();
    }
    
    // Log to console if enabled
    if (this.logToConsole) {
      const consoleMsg = `[PictureDBDebug][${level.toUpperCase()}] ${message}`;
      switch (level) {
        case this.levels.ERROR:
          console.error(consoleMsg, data || '');
          break;
        case this.levels.WARN:
          console.warn(consoleMsg, data || '');
          break;
        case this.levels.DEBUG:
          console.debug(consoleMsg, data || '');
          break;
        default:
          console.log(consoleMsg, data || '');
      }
    }
    
    // Update UI panel if enabled
    if (this.logToUI) {
      this._updateDebugPanel(logEntry);
    }
  },
  
  // Log info message
  info: function(message, data = null) {
    this.log(message, this.levels.INFO, data);
  },
  
  // Log warning message
  warn: function(message, data = null) {
    this.log(message, this.levels.WARN, data);
  },
  
  // Log error message
  error: function(message, data = null) {
    this.log(message, this.levels.ERROR, data);
  },
  
  // Log debug message
  debug: function(message, data = null) {
    this.log(message, this.levels.DEBUG, data);
  },
  
  // Helper function to create the debug panel
  _createDebugPanel: function() {
    if (document.getElementById('debugPanel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.className = 'debug-panel';
    
    // Minimal inline styles to avoid CSS conflicts
    panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 400px;
      height: 300px;
      background: rgba(0,0,0,0.8);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      overflow: auto;
      z-index: 9999;
      padding: 10px;
      border-top-left-radius: 5px;
      display: none;
    `;
    
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <strong>Picture DB Debug</strong>
        <button id="debugPanelToggle" style="background:none;border:none;color:white;cursor:pointer;">Hide</button>
      </div>
      <hr style="border:0;border-top:1px solid #444;margin:5px 0;">
    `;
    
    const logContainer = document.createElement('div');
    logContainer.id = 'debugPanelLogs';
    logContainer.style.cssText = 'font-size:11px;';
    
    panel.appendChild(header);
    panel.appendChild(logContainer);
    document.body.appendChild(panel);
    
    // Handle toggle button
    const toggleBtn = document.getElementById('debugPanelToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        toggleBtn.textContent = panel.style.display === 'none' ? 'Show' : 'Hide';
      });
    }
    
    // Add keyboard shortcut (Ctrl+D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (toggleBtn) {
          toggleBtn.textContent = panel.style.display === 'none' ? 'Show' : 'Hide';
        }
      }
    });
  },
  
  // Helper function to update the debug panel with a new log entry
  _updateDebugPanel: function(logEntry) {
    const logContainer = document.getElementById('debugPanelLogs');
    if (!logContainer) return;
    
    const logEl = document.createElement('div');
    logEl.className = `log-entry log-${logEntry.level}`;
    logEl.style.cssText = 'padding:2px 0;border-bottom:1px solid #333;';
    
    let logColor = '#fff';
    switch (logEntry.level) {
      case this.levels.ERROR:
        logColor = '#ff6b6b';
        break;
      case this.levels.WARN:
        logColor = '#ffd93d';
        break;
      case this.levels.DEBUG:
        logColor = '#6bffce';
        break;
      default:
        logColor = '#fff';
    }
    
    logEl.innerHTML = `
      <span style="color:${logColor};">[${logEntry.level.toUpperCase()}]</span>
      <span style="color:#999;">${new Date(logEntry.time).toLocaleTimeString()}</span>
      <span>${logEntry.message}</span>
    `;
    
    if (logEntry.data) {
      const dataEl = document.createElement('pre');
      dataEl.style.cssText = 'margin:2px 0 2px 10px;font-size:10px;color:#999;white-space:pre-wrap;';
      try {
        dataEl.textContent = JSON.stringify(logEntry.data, null, 2);
      } catch (e) {
        dataEl.textContent = '[Cannot stringify data]';
      }
      logEl.appendChild(dataEl);
    }
    
    logContainer.insertBefore(logEl, logContainer.firstChild);
  },
  
  // Setup global error handling
  _setupErrorHandling: function() {
    if (!this.enabled) return;
    
    window.addEventListener('error', (event) => {
      this.error(`Unhandled error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.error(`Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }
};

// Initialize debug utilities when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize only if explicitly enabled
  // Users need to manually enable in console with: window.PictureDBDebug.enabled = true;
  if (window.PictureDBDebug.enabled) {
    window.PictureDBDebug.init();
  }
});
