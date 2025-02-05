document.addEventListener("DOMContentLoaded", () => {
  const navList = document.querySelector('.nav-list');
  const searchInput = document.querySelector('input[type="text"]');
  const settingsIcon = document.getElementById('settings-icon');
  const sidePanel = document.getElementById('side-panel');
  const closePanelBtn = document.getElementById('close-panel');
  const addShortcutBtn = document.getElementById('add-shortcut-btn');
  const shortcutList = document.getElementById('shortcut-list');
  const shortcutNameInput = document.getElementById('shortcut-name');
  const shortcutUrlInput = document.getElementById('shortcut-url');

  // Default apps if no saved apps
  const defaultApps = [
    { name: 'Notion', url: 'https://www.notion.so', icon: 'notion.png' },
    { name: 'VS Code', url: 'https://vscode.dev', icon: 'vs-code.png' },
    { name: 'Slack', url: 'https://slack.com', icon: 'slack.png' },
    { name: 'Spotify', url: 'https://open.spotify.com', icon: 'spotify.png' },
    { name: 'Figma', url: 'https://www.figma.com', icon: 'figma.png' }
  ];

 

  // Add this code right before your DOMContentLoaded event listener

// Favicon cache manager
const FaviconManager = {
  async cacheFavicons(url) {
    try {
      const domain = new URL(url).hostname;
      const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      // Try to fetch and cache the favicon
      const response = await fetch(iconUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Store in localStorage
          const iconCache = JSON.parse(localStorage.getItem('faviconCache')) || {};
          iconCache[url] = reader.result;
          localStorage.setItem('faviconCache', JSON.stringify(iconCache));
          resolve(iconUrl);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error caching favicon:', error);
      return null;
    }
  },

  getCachedFavicon(url) {
    const iconCache = JSON.parse(localStorage.getItem('faviconCache')) || {};
    return iconCache[url];
  },

  generateFallbackIcon(url) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      
      // Generate color based on URL
      let hash = 0;
      for (let i = 0; i < url.length; i++) {
        hash = url.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = '#' + ('000000' + (hash & 0xFFFFFF).toString(16)).slice(-6);
      
      // Draw circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw letter
      const letter = new URL(url).hostname.replace('www.', '')[0].toUpperCase();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 32, 32);
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating fallback icon:', error);
      return 'default-favicon.png';
    }
  }
};

// Modified getFavicon function - replace your existing one with this
async function getFavicon(url) {
  try {
    // If online, try to get and cache the favicon
    if (navigator.onLine) {
      const domain = new URL(url).hostname;
      const iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      await FaviconManager.cacheFavicons(url);
      return iconUrl;
    }
    
    // If offline, try to get cached version
    const cachedIcon = FaviconManager.getCachedFavicon(url);
    if (cachedIcon) {
      return cachedIcon;
    }
    
    // Fallback to generated icon
    return FaviconManager.generateFallbackIcon(url);
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return 'default-favicon.png';
  }
}

// Add these event listeners right before your DOMContentLoaded event
window.addEventListener('online', () => {
  // Refresh icons when coming back online
  if (document.readyState === 'complete') {
    loadApps();
  }
});

window.addEventListener('offline', () => {
  // Refresh icons when going offline
  if (document.readyState === 'complete') {
    loadApps();
  }
});


  // Fetch favicon for a given URL
  async function getFavicon(url) {
    try {
      // Extract domain from URL
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (error) {
      console.error('Error fetching favicon:', error);
      return 'default-favicon.png'; // Fallback icon
    }
  }

async function loadApps() {
    const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
    navList.innerHTML = ''; // Clear existing items

    // Fetch favicons for all apps
    const appsWithFavicons = await Promise.all(savedApps.map(async (app) => {
      // If no icon or using default icon, fetch new favicon
      if (!app.icon || app.icon.includes('png')) {
        const favicon = await getFavicon(app.url);
        return { ...app, icon: favicon };
      }
      return app;
    }));

    // Save updated apps with favicons
    localStorage.setItem('navApps', JSON.stringify(appsWithFavicons));
// Create nav items
appsWithFavicons.forEach((app) => {
  const listItem = createNavItem(app);
  navList.appendChild(listItem);
});

// Populate side panel shortcut list
populateShortcutList(appsWithFavicons);
attachNavItemListeners();
}

  // Create nav item dynamically
  function createNavItem(app) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `
      <a href="#" class="nav-item__link" data-url="${app.url}">
        <img src="${app.icon}" loading="eager" alt="${app.name} icon" class="image">
      </a>
      <div class="nav-item__tooltip">
        <div>${app.name}</div>
      </div>
    `;
    return li;
  }

  // Populate side panel shortcut list
  function populateShortcutList(apps) {
    shortcutList.innerHTML = '';
    apps.forEach((app, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${app.name}</span>
        <div class="actions">
          <button class="edit-shortcut" data-index="${index}">Edit</button>
          <button class="delete-shortcut" data-index="${index}">Delete</button>
        </div>
      `;
      shortcutList.appendChild(li);
    });

    // Add event listeners for edit and delete
    document.querySelectorAll('.edit-shortcut').forEach(btn => {
      btn.addEventListener('click', editShortcut);
    });

    document.querySelectorAll('.delete-shortcut').forEach(btn => {
      btn.addEventListener('click', deleteShortcut);
    });
  }

  async function addShortcut() {
    const name = shortcutNameInput.value;
    const url = shortcutUrlInput.value;
    
    if (name && url) {
      const favicon = await getFavicon(url);
      const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
      savedApps.push({
        name,
        url,
        icon: favicon
      });
      localStorage.setItem('navApps', JSON.stringify(savedApps));
      loadApps();
      shortcutNameInput.value = '';
      shortcutUrlInput.value = '';
    }
  }

  // Edit shortcut with favicon update
  async function editShortcut(e) {
    const index = e.target.dataset.index;
    const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
    const app = savedApps[index];

    shortcutNameInput.value = app.name;
    shortcutUrlInput.value = app.url;

    // Modify add button to update existing shortcut
    addShortcutBtn.textContent = 'Update Shortcut';
    addShortcutBtn.onclick = async () => {
      const favicon = await getFavicon(shortcutUrlInput.value);
      savedApps[index] = {
        name: shortcutNameInput.value,
        url: shortcutUrlInput.value,
        icon: favicon
      };
      localStorage.setItem('navApps', JSON.stringify(savedApps));
      loadApps();
      shortcutNameInput.value = '';
      shortcutUrlInput.value = '';
      addShortcutBtn.textContent = 'Add Shortcut';
      addShortcutBtn.onclick = addShortcut;
    };
  }
  // Delete shortcut
  function deleteShortcut(e) {
    const index = e.target.dataset.index;
    const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
    savedApps.splice(index, 1);
    localStorage.setItem('navApps', JSON.stringify(savedApps));
    loadApps();
  }

  // Add shortcut
  function addShortcut() {
    const name = shortcutNameInput.value;
    const url = shortcutUrlInput.value;
    
    if (name && url) {
      const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
      savedApps.push({
        name,
        url,
        icon: `favicon_${name.toLowerCase().replace(/\s+/g, '')}.png`
      });
      localStorage.setItem('navApps', JSON.stringify(savedApps));
      loadApps();
      shortcutNameInput.value = '';
      shortcutUrlInput.value = '';
    }
  }

  // Attach navigation and hover listeners
  function attachNavItemListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach((item, index) => {
      const link = item.querySelector('.nav-item__link');
      
      // Navigation listener
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('data-url');
        window.location.href = url;
      });

      // Hover effects
      item.addEventListener('mouseenter', () => {
        item.classList.add('hover');
        toggleSiblingClass(navItems, index, -1, 'sibling-close', true);
        toggleSiblingClass(navItems, index, 1, 'sibling-close', true);
        toggleSiblingClass(navItems, index, -2, 'sibling-far', true);
        toggleSiblingClass(navItems, index, 2, 'sibling-far', true);
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('hover');
        toggleSiblingClass(navItems, index, -1, 'sibling-close', false);
        toggleSiblingClass(navItems, index, 1, 'sibling-close', false);
        toggleSiblingClass(navItems, index, -2, 'sibling-far', false);
        toggleSiblingClass(navItems, index, 2, 'sibling-far', false);
      });
    });
  }

  // Helper function for hover effects
  function toggleSiblingClass(items, index, offset, className, add) {
    const sibling = items[index + offset];
    if (sibling) {
      sibling.classList.toggle(className, add);
    }
  }

  // Search functionality
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query.startsWith('http://') || query.startsWith('https://')) {
        window.location.href = query;
      } else {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      }
    }
  });

  // Settings icon and side panel logic
  settingsIcon.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
  });

  closePanelBtn.addEventListener('click', () => {
    sidePanel.classList.remove('open');
  });

  // Add shortcut button
  addShortcutBtn.addEventListener('click', addShortcut);


  
  // Initial load
  loadApps();
});





 // Default array of website objects
 const websites = [
  { icon: "https://www.google.com/favicon.ico", url: "https://google.com", description: "Search Engine", category: "a" },
  { icon: "https://www.facebook.com/favicon.ico", url: "https://facebook.com", description: "Social Media", category: "a" },
  { icon: "https://www.twitter.com/favicon.ico", url: "https://twitter.com", description: "Social Networking", category: "b" },
  { icon: "https://www.linkedin.com/favicon.ico", url: "https://linkedin.com", description: "Professional Network", category: "b" },
  { icon: "https://www.github.com/favicon.ico", url: "https://github.com", description: "Code Hosting", category: "c" },
  { icon: "https://www.medium.com/favicon.ico", url: "https://medium.com", description: "Blogging Platform", category: "c" },
  { icon: "https://www.reddit.com/favicon.ico", url: "https://reddit.com", description: "Forum & Community", category: "d" },
  { icon: "https://www.quora.com/favicon.ico", url: "https://quora.com", description: "Q&A Platform", category: "d" },
  { icon: "https://www.amazon.com/favicon.ico", url: "https://amazon.com", description: "Online Shopping", category: "e" },
  { icon: "https://www.ebay.com/favicon.ico", url: "https://ebay.com", description: "E-Commerce", category: "e" }
];


document.addEventListener("DOMContentLoaded", function () {
  // Set default category (e.g., "a")
  const defaultCategory = "a";
  showCategory(defaultCategory);
  document.getElementById("btn-a").addEventListener("click", () => showCategory("a"));
  document.getElementById("btn-b").addEventListener("click", () => showCategory("b"));
  document.getElementById("btn-c").addEventListener("click", () => showCategory("c"));
  document.getElementById("btn-d").addEventListener("click", () => showCategory("d"));
  document.getElementById("btn-e").addEventListener("click", () => showCategory("e"));
});

function showCategory(category) {
  console.log("Category Selected: ", category);

  // Remove active class from all buttons
  document.querySelectorAll(".categories button").forEach(btn => btn.classList.remove("active"));

  // Add active class to clicked button
  document.getElementById("btn-" + category).classList.add("active");

  // Get the container and clear previous content
  const container = document.getElementById("websites-container");
  container.innerHTML = "";

  // Filter and render websites for the selected category
  const filteredWebsites = websites.filter(website => website.category === category);

  if (filteredWebsites.length > 0) {
      filteredWebsites.forEach(site => {
          const siteElement = document.createElement("div");
          siteElement.classList.add("website-item");
          siteElement.innerHTML = `
              <img src="${site.icon}" alt="icon">
              <a href="${site.url}" target="_blank">${site.description}</a>
          `;
          container.appendChild(siteElement);
      });
  } else {
      container.innerHTML = "<p>No websites available for this category.</p>";
  }
}
