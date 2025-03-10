// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check localStorage for a saved theme preference
  const storedTheme = localStorage.getItem('theme');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const prefersDark = mediaQuery.matches;

  if (storedTheme) {
    // Apply stored theme preference
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
  } else {
    // No stored preference, use system preference
    document.documentElement.classList.toggle('dark', prefersDark);
    // Store current theme
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  }

  // Update the toggle button state
  updateToggleIcon();

  // Listen for system theme changes
  mediaQuery.addEventListener('change', (e) => {
    // Always apply system preference changes as a trigger
    const prefersDark = e.matches;
    document.documentElement.classList.toggle('dark', prefersDark);
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    updateToggleIcon();
  });
});

function toggleTheme() {
  // Toggle dark class on html element
  document.documentElement.classList.toggle('dark');

  // Store new preference
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Update the icon
  updateToggleIcon();
}

function updateToggleIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const lightIcon = document.getElementById('light-icon');
  const darkIcon = document.getElementById('dark-icon');

  // Update sun/moon icons
  if (isDark) {
    lightIcon.classList.remove('hidden');
    lightIcon.classList.add('rotate-0');
    darkIcon.classList.add('hidden');
    darkIcon.classList.remove('rotate-0');
  } else {
    lightIcon.classList.add('hidden');
    lightIcon.classList.remove('rotate-0');
    darkIcon.classList.remove('hidden');
    darkIcon.classList.add('rotate-0');
  }
}