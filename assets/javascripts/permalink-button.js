/**
 * Copy the URL to the clipboard
 * @param {string} url - The URL to copy
 * @param {HTMLElement} button - The button element that was clicked
 */
function copyPermalink(url, button) {
  const fullUrl = window.location.origin + url;
  const tooltip = button.parentNode.querySelector('[data-tooltip]');
  
  // Try to use the Clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        tooltip.textContent = 'Copied!';
        setTimeout(() => tooltip.textContent = 'Click to copy link', 2000);
      })
      .catch(() => {
        // Fallback if Clipboard API fails
        fallbackCopyToClipboard(fullUrl, tooltip);
      });
  } else {
    // Fallback for browsers that don't support Clipboard API
    fallbackCopyToClipboard(fullUrl, tooltip);
  }
}

/**
 * Fallback method to copy text to clipboard
 * @param {string} text - The text to copy
 * @param {HTMLElement} tooltip - The tooltip element to update
 */
function fallbackCopyToClipboard(text, tooltip) {
  // Create a temporary textarea element
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  
  // Select and copy the text
  textArea.focus();
  textArea.select();
  
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
  
  // Remove the textarea
  document.body.removeChild(textArea);
  
  // Update the tooltip
  if (success) {
    tooltip.textContent = 'Copied!';
    setTimeout(() => tooltip.textContent = 'Click to copy link', 2000);
  } else {
    tooltip.textContent = 'Copy failed. Try again.';
    setTimeout(() => tooltip.textContent = 'Click to copy link', 2000);
  }
}