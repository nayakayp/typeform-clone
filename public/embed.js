/**
 * Typeform Clone Embed Script
 *
 * This script provides embedding functionality for forms on external websites.
 * Include this script on your page and use the TypeformEmbed API to embed forms.
 *
 * Usage:
 * 1. Standard iframe - Just include the iframe tag
 * 2. Popup - window.TypeformEmbed.openPopup(url, options)
 * 3. Slider - window.TypeformEmbed.openSlider(url, options)
 * 4. Widget - window.TypeformEmbed.initWidget()
 */

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.TypeformEmbed) {
    return;
  }

  // CSS styles for embeds
  const styles = `
    .tf-embed-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .tf-embed-overlay.tf-active {
      opacity: 1;
      visibility: visible;
    }

    .tf-embed-popup {
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      transform: scale(0.95);
      transition: transform 0.3s ease;
      max-width: 90vw;
      max-height: 90vh;
    }

    .tf-embed-overlay.tf-active .tf-embed-popup {
      transform: scale(1);
    }

    .tf-embed-close {
      position: absolute;
      top: -12px;
      right: -12px;
      width: 32px;
      height: 32px;
      background: #1f2937;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      z-index: 1;
      transition: background 0.2s ease;
    }

    .tf-embed-close:hover {
      background: #374151;
    }

    .tf-embed-popup-container {
      position: relative;
    }

    .tf-embed-iframe {
      border: none;
      display: block;
    }

    /* Slider styles */
    .tf-embed-slider {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 400px;
      max-width: 100vw;
      background: white;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      z-index: 999999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .tf-embed-slider.tf-slider-left {
      left: 0;
      right: auto;
      transform: translateX(-100%);
    }

    .tf-embed-slider.tf-slider-right {
      right: 0;
      left: auto;
      transform: translateX(100%);
    }

    .tf-embed-slider.tf-active {
      transform: translateX(0);
    }

    .tf-embed-slider .tf-embed-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #f3f4f6;
      color: #1f2937;
    }

    .tf-embed-slider .tf-embed-close:hover {
      background: #e5e7eb;
    }

    .tf-embed-slider-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.3);
      z-index: 999998;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .tf-embed-slider-backdrop.tf-active {
      opacity: 1;
      visibility: visible;
    }

    /* Widget styles */
    .tf-widget-button {
      position: fixed;
      bottom: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 999998;
    }

    .tf-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .tf-widget-button.tf-widget-left {
      left: 24px;
    }

    .tf-widget-button.tf-widget-right {
      right: 24px;
    }

    .tf-widget-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .tf-widget-popup {
      position: fixed;
      bottom: 100px;
      width: 380px;
      max-width: calc(100vw - 48px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      z-index: 999999;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
    }

    .tf-widget-popup.tf-active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .tf-widget-popup.tf-widget-left {
      left: 24px;
    }

    .tf-widget-popup.tf-widget-right {
      right: 24px;
    }

    .tf-widget-header {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .tf-widget-greeting {
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      margin: 0;
    }

    .tf-widget-content {
      height: 400px;
      max-height: calc(100vh - 200px);
    }
  `;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('tf-embed-styles')) {
      return;
    }
    const styleElement = document.createElement('style');
    styleElement.id = 'tf-embed-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Create close button SVG
  function createCloseIcon() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }

  // Create widget icons
  function createWidgetIcon(type) {
    switch (type) {
      case 'chat':
        return `<svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
      case 'form':
        return `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
      case 'help':
        return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      default:
        return createWidgetIcon('chat');
    }
  }

  // Open popup
  function openPopup(url, options = {}) {
    injectStyles();

    const width = options.width || '600px';
    const height = options.height || '80vh';

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tf-embed-overlay';
    overlay.innerHTML = `
      <div class="tf-embed-popup-container">
        <button class="tf-embed-close" aria-label="Close">${createCloseIcon()}</button>
        <div class="tf-embed-popup" style="width: ${width}; height: ${height};">
          <iframe src="${url}" class="tf-embed-iframe" style="width: 100%; height: 100%;" allow="clipboard-write"></iframe>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('tf-active');
    });

    // Close handler
    const close = () => {
      overlay.classList.remove('tf-active');
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    overlay.querySelector('.tf-embed-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close();
      }
    });

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return { close };
  }

  // Open slider
  function openSlider(url, options = {}) {
    injectStyles();

    const position = options.position || 'right';
    const width = options.width || '400px';

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'tf-embed-slider-backdrop';
    document.body.appendChild(backdrop);

    // Create slider
    const slider = document.createElement('div');
    slider.className = `tf-embed-slider tf-slider-${position}`;
    slider.style.width = width;
    slider.innerHTML = `
      <button class="tf-embed-close" aria-label="Close">${createCloseIcon()}</button>
      <iframe src="${url}" class="tf-embed-iframe" style="width: 100%; height: 100%;" allow="clipboard-write"></iframe>
    `;

    document.body.appendChild(slider);

    // Trigger animation
    requestAnimationFrame(() => {
      backdrop.classList.add('tf-active');
      slider.classList.add('tf-active');
    });

    // Close handler
    const close = () => {
      backdrop.classList.remove('tf-active');
      slider.classList.remove('tf-active');
      setTimeout(() => {
        backdrop.remove();
        slider.remove();
      }, 300);
    };

    slider.querySelector('.tf-embed-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    return { close };
  }

  // Initialize widget
  function initWidget() {
    injectStyles();

    const widgetElement = document.getElementById('typeform-widget');
    if (!widgetElement) {
      console.warn('TypeformEmbed: No element with id "typeform-widget" found');
      return;
    }

    const url = widgetElement.dataset.url;
    const position = widgetElement.dataset.position || 'bottom-right';
    const greeting = widgetElement.dataset.greeting || 'Hi! How can we help?';
    const buttonColor = widgetElement.dataset.buttonColor || '#3B82F6';
    const buttonIcon = widgetElement.dataset.buttonIcon || 'chat';

    const positionClass = position === 'bottom-left' ? 'tf-widget-left' : 'tf-widget-right';

    // Create widget button
    const button = document.createElement('button');
    button.className = `tf-widget-button ${positionClass}`;
    button.style.backgroundColor = buttonColor;
    button.innerHTML = createWidgetIcon(buttonIcon);
    button.setAttribute('aria-label', 'Open form');

    // Create widget popup
    const popup = document.createElement('div');
    popup.className = `tf-widget-popup ${positionClass}`;
    popup.innerHTML = `
      <div class="tf-widget-header">
        <p class="tf-widget-greeting">${greeting}</p>
      </div>
      <div class="tf-widget-content">
        <iframe src="${url}" class="tf-embed-iframe" style="width: 100%; height: 100%; border-radius: 0 0 16px 16px;" allow="clipboard-write"></iframe>
      </div>
    `;

    document.body.appendChild(button);
    document.body.appendChild(popup);

    let isOpen = false;

    button.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        popup.classList.add('tf-active');
        button.innerHTML = createCloseIcon();
      } else {
        popup.classList.remove('tf-active');
        button.innerHTML = createWidgetIcon(buttonIcon);
      }
    });

    return {
      open: () => {
        isOpen = true;
        popup.classList.add('tf-active');
        button.innerHTML = createCloseIcon();
      },
      close: () => {
        isOpen = false;
        popup.classList.remove('tf-active');
        button.innerHTML = createWidgetIcon(buttonIcon);
      },
      toggle: () => {
        button.click();
      }
    };
  }

  // Export API
  window.TypeformEmbed = {
    openPopup,
    openSlider,
    initWidget,
    version: '1.0.0'
  };

  // Auto-initialize widgets on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('typeform-widget')) {
        initWidget();
      }
    });
  } else {
    if (document.getElementById('typeform-widget')) {
      initWidget();
    }
  }
})();
