// Default apps configuration
const defaultApps = [
    { name: 'YouTube', url: 'https://youtube.com', icon: '/Images/youtube1.png', default: true },
    { name: 'Spotify', url: 'https://open.spotify.com', icon: '/Images/spotify.png', default: true },
    { name: 'Chat GPT', url: 'http://chat.openai.com/', icon: '/Images/chatgpt.png', default: true },
    { name: 'whatsapp', url: 'https://web.whatsapp.com/', icon: '/Images/whatsapp.png', default: true },
    { name: 'Github', url: 'http://github.com/', icon: '/Images/github.png', default: true },
    { name: 'Figma', url: 'https://figma.com', icon: '/Images/figma.png', default: true },
    { name: 'Quicklabs', url: 'https://quicklabs.fun/', icon: '/Images/quicklabs.png', default: true },
];

// Initialize apps in localStorage if not present
function initializeApps() {
  const savedApps = localStorage.getItem('navApps');
  if (!savedApps) {
    localStorage.setItem('navApps', JSON.stringify(defaultApps));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize apps when the page loads
  initializeApps();
  const navList = document.querySelector('.nav-list');
  const searchInput = document.querySelector('input[type="text"]');
  const settingsIcon = document.getElementById('settings-icon');
  const sidePanel = document.getElementById('side-panel');
  const sidePanelBlur = document.getElementById('side-panel-blur')
  const closePanelBtn = document.getElementById('close-panel');
  const addShortcutBtn = document.getElementById('add-shortcut-btn');
  const shortcutList = document.getElementById('shortcut-list');
  const shortcutNameInput = document.getElementById('shortcut-name');
  const shortcutUrlInput = document.getElementById('shortcut-url');
  const clock = document.getElementById("clock"); 

  // Add this code right before your DOMContentLoaded event listener

// Favicon cache manager
const FaviconManager = {
  // Try different favicon paths
  async tryFaviconPaths(domain) {
    const paths = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://icon.horse/icon/${domain}`,
      `https://favicongrabber.com/api/grab/${domain}`,
      `https://${domain}/favicon.ico`,
      `https://${domain}/favicon.png`,
      `https://${domain}/apple-touch-icon.png`,
      `https://${domain}/apple-touch-icon-precomposed.png`
    ];

    for (const path of paths) {
      try {
        const response = await fetch(path, { mode: 'no-cors' });
        if (response.ok || response.type === 'opaque') {
          return path;
        }
      } catch (error) {
        console.warn(`Failed to fetch favicon from ${path}:`, error);
        continue;
      }
    }
    return null;
  },

  async cacheFavicons(url) {
    try {
      const domain = new URL(url).hostname;
      const iconUrl = await this.tryFaviconPaths(domain);
      
      if (!iconUrl) {
        const fallbackIcon = this.generateFallbackIcon(url);
        this.saveFaviconToCache(url, fallbackIcon);
        return fallbackIcon;
      }

      const response = await fetch(iconUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.saveFaviconToCache(url, reader.result);
          resolve(iconUrl);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error caching favicon:', error);
      const fallbackIcon = this.generateFallbackIcon(url);
      this.saveFaviconToCache(url, fallbackIcon);
      return fallbackIcon;
    }
  },

  saveFaviconToCache(url, iconData) {
    try {
      const iconCache = JSON.parse(localStorage.getItem('faviconCache')) || {};
      iconCache[url] = iconData;
      localStorage.setItem('faviconCache', JSON.stringify(iconCache));
    } catch (error) {
      console.error('Error saving favicon to cache:', error);
    }
  },

  getCachedFavicon(url) {
    try {
      const iconCache = JSON.parse(localStorage.getItem('faviconCache')) || {};
      return iconCache[url];
    } catch (error) {
      console.error('Error getting cached favicon:', error);
      return null;
    }
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
      
      // Draw circle with gradient
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, this.adjustColor(color, -30));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw letter with shadow
      const letter = new URL(url).hostname.replace('www.', '')[0].toUpperCase();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, 32, 32);
      
      return canvas.toDataURL();
    } catch (error) {
      console.error('Error generating fallback icon:', error);
      return '/Images/loom.png';
    }
  },

  // Helper function to adjust color brightness
  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(Math.min(parseInt(hex.substring(0, 2), 16) + amount, 255), 0);
    const g = Math.max(Math.min(parseInt(hex.substring(2, 4), 16) + amount, 255), 0);
    const b = Math.max(Math.min(parseInt(hex.substring(4, 6), 16) + amount, 255), 0);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
};
//this use for dock fevicon
// Modified getFavicon function - replace your existing one with this 
async function getFavicon(url) {
  try {
    const domain = new URL(url).hostname;
    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    
    // Check cache first
    const cachedFavicon = localStorage.getItem(`favicon_${domain}`);
    if (cachedFavicon) {
      return cachedFavicon;
    }

    // If online and not in cache, fetch from Google's service
    if (navigator.onLine) {
      const response = await fetch(googleFaviconUrl);
      if (response.ok) {
        const blob = await response.blob();
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        localStorage.setItem(`favicon_${domain}`, base64data);
        return base64data;
      }
      return googleFaviconUrl; // Fallback to direct Google URL if blob conversion fails
    }

    // If offline and not in cache, return default icon
    return './Images/loom.png';
    
    // If no favicon is found, return the default icon
    return './Images/loom.png'; // Update this path to the actual location of loom.png
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return './Images/loom.png'; // Update this path to the actual location of loom.png
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
    // Clear the navigation list
    navList.innerHTML = '';
    
    // Get apps from localStorage
    let allApps = [];
    try {
        allApps = JSON.parse(localStorage.getItem('navApps')) || [];
        if (allApps.length === 0) {
            // If no apps in localStorage, reinitialize with default apps
            allApps = [...defaultApps];
            localStorage.setItem('navApps', JSON.stringify(allApps));
        }
    } catch (error) {
        console.error('Error loading saved apps:', error);
        allApps = [...defaultApps];
        localStorage.setItem('navApps', JSON.stringify(allApps));
    }

    // Only fetch favicons for non-default apps
    const processedApps = await Promise.all(allApps.map(async (app) => {
      if (!app.default) {
        // For non-default apps, fetch favicon
        const favicon = await getFavicon(app.url);
        return { ...app, icon: favicon };
      }
      // For default apps, keep the stored image
      return app;
    }));

    // Save updated apps
    localStorage.setItem('navApps', JSON.stringify(processedApps));

    // Create nav items
    processedApps.forEach((app) => {
      const listItem = createNavItem(app);
      navList.appendChild(listItem);
    });

    // Populate side panel shortcut list
    populateShortcutList(processedApps);
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
        icon: favicon,
        default: false  // New shortcuts are not default
      });
      localStorage.setItem('navApps', JSON.stringify(savedApps));
      loadApps();
      shortcutNameInput.value = '';
      shortcutUrlInput.value = '';
    }
  }

  // Edit shortcut with favicon update
  async function editShortcut(e) {
    const displayIndex = parseInt(e.target.dataset.index);
    const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
    // Find the actual index in the full apps array
    const nonDefaultApps = savedApps.filter(app => app.default !== true);
    const app = nonDefaultApps[displayIndex];
    const actualIndex = savedApps.findIndex(a => a.name === app.name && a.url === app.url);

    shortcutNameInput.value = app.name;
    shortcutUrlInput.value = app.url;

    // Modify add button to update existing shortcut
    addShortcutBtn.textContent = 'Update Shortcut';
    addShortcutBtn.onclick = async () => {
      const favicon = await getFavicon(shortcutUrlInput.value);
      savedApps[actualIndex] = {
        name: shortcutNameInput.value,
        url: shortcutUrlInput.value,
        icon: favicon,
        default: false // Maintain non-default status
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
    const index = parseInt(e.target.dataset.index);
    const savedApps = JSON.parse(localStorage.getItem('navApps')) || defaultApps;
    
    // Remove the app at the specified index
    savedApps.splice(index, 1);
    
    // Save the updated apps list
    localStorage.setItem('navApps', JSON.stringify(savedApps));
    loadApps();
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
  // searchInput.addEventListener('keypress', (e) => {
  //   if (e.key === 'Enter') {
  //     const query = searchInput.value.trim();
  //     if (query.startsWith('http://') || query.startsWith('https://')) {
  //       window.location.href = query;
  //     } else {
  //       window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  //     }
  //   }
  // });

const searchOptions = document.querySelectorAll('.search-option');
let selectedEngine = localStorage.getItem('selectedEngine') || 'google'; // Default to 'google' if nothing is stored

// Function to set the active state of the button
function setActiveButton(engine) {
  searchOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.engine === engine) {
      option.classList.add('active');
    }
  });
}

// Set active button on page load
setActiveButton(selectedEngine);

// Event listener for search engine selection
searchOptions.forEach(option => {
  option.addEventListener('click', () => {
    selectedEngine = option.dataset.engine;
    localStorage.setItem('selectedEngine', selectedEngine); // Store the selected engine in localStorage
    setActiveButton(selectedEngine);
  });
});

// Event listener for pressing Enter in the search input
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    let searchUrl = '';

    // Construct the search URL based on the selected engine
    switch (selectedEngine) {
      case 'google':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'brave':
        searchUrl = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'youtube':
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }

    // Perform the search by navigating to the constructed URL
    window.location.href = searchUrl;
  }
});


  // Settings icon and side panel logic
  settingsIcon.addEventListener('click', () => {
    sidePanel.classList.toggle('open');
    sidePanelBlur.classList.toggle('open');
  });

  closePanelBtn.addEventListener('click', () => {
    sidePanel.classList.remove('open');
    sidePanelBlur.classList.remove('open');
  });

  // Optional: Close panel when clicking on blur
  sidePanelBlur.addEventListener('click', () => {
    sidePanel.classList.remove('open');
    sidePanelBlur.classList.remove('open');
  });

  // Add shortcut button
  addShortcutBtn.addEventListener('click', addShortcut);


  
  // Initial load
  loadApps();

  // Initialize the clock
  initializeClocks();

  // Initialize categories visibility
  const toggleButton = document.getElementById('toggle-categories-btn');
  const categoriesSection = document.querySelector('.categories-section');
  
  // Get saved preference or default to visible
  const categoriesVisible = localStorage.getItem('categoriesVisible') !== 'false';
  
  if (!categoriesVisible) {
    categoriesSection.style.display = 'none';
    toggleButton.textContent = 'Show Categories';
    toggleButton.setAttribute('data-state', 'hide');
  }

  // Add click event listener for toggle button
  toggleButton.addEventListener('click', toggleCategories);

  // Initialize clock 3
  initializeClock3();

  // Initialize clock 4
  const clock4Interval = initializeClock4();

  // Optional: Clean up interval on page unload
  window.addEventListener('unload', () => {
    clearInterval(clock4Interval);
  });

  // Initialize clock scaling
  initializeClockScaling();

  // Initialize default category
  initializeDefaultCategory();

  // Initialize clock 5
  const clock5Interval = initializeClock5();

  // Clean up interval when page unloads
  window.addEventListener('unload', () => {
    clearInterval(clock5Interval);
  });

  // Initialize tab count
  initializeTabCount();

  // Function to display the extension version
  function displayExtensionVersion() {
    const manifest = chrome.runtime.getManifest();
    const version = manifest.version; // Get the version from the manifest
    const versionSection = document.getElementById('extension-version'); // Get the span element
    if (versionSection) {
        versionSection.textContent = version; // Update the text content with the version
    }
  }

  // Call displayExtensionVersion on page load
  document.addEventListener("DOMContentLoaded", displayExtensionVersion);

  // Add an event listener to the image
  document.getElementById('instagram-icon').addEventListener('click', function() {
    window.location.href = 'https://instagram.com/yash_chauhan________'; // Navigate to the URL
  });
});





 // Default array of website objects
 const websites =[
    {
        "icon": "https://www.google.com/s2/favicons?domain=chat.openai.com&sz=64",
        "url": "https://chat.openai.com/",
        "description": "ChatGPT by OpenAI",
        "name": "ChatGPT",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=bard.google.com&sz=64",
        "url": "https://bard.google.com/",
        "description": "Bard by Google",
        "name": "Google Bard",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=www.perplexity.ai&sz=64",
        "url": "https://www.perplexity.ai/",
        "description": "Perplexity AI - Conversational Search",
        "name": "Perplexity AI",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=www.character.ai&sz=64",
        "url": "https://www.character.ai/",
        "description": "Create & Chat with AI Characters",
        "name": "Character AI",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=claude.ai&sz=64",
        "url": "https://claude.ai/",
        "description": "Claude by Anthropic",
        "name": "Claude",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=www.jasper.ai&sz=64",
        "url": "https://www.jasper.ai/",
        "description": "AI Writing Assistant",
        "name": "Jasper AI",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=chat.forefront.ai&sz=64",
        "url": "https://chat.forefront.ai/",
        "description": "Forefront AI Chat",
        "name": "Forefront AI",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=pi.ai&sz=64",
        "url": "https://pi.ai/",
        "description": "Pi - Your Personal AI",
        "name": "Pi AI",
        "category": "c"
    },
    {
        "icon": "https://www.google.com/s2/favicons?domain=beta.characterhub.io&sz=64",
        "url": "https://beta.characterhub.io/",
        "description": "Create & Explore AI Characters",
        "name": "CharacterHub",
        "category": "c"
    },

    { icon: "https://www.google.com/s2/favicons?domain=savee.it&sz=64", url: "https://savee.it/", description: "Stock Images", name: "savee", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=www.flaticon.com&sz=64", url: "https://www.flaticon.com/", description: "Icons", name: "flaticon", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=iconscout.com&sz=64", url: "https://iconscout.com/", description: "Icons", name: "iconscout", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=looka.com&sz=64", url: "https://looka.com/", description: "Logo Maker", name: "looka", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=leonardo.ai&sz=64", url: "https://leonardo.ai", description: "AI Image Generator", name: "leonardo", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=stablediffusionweb.com&sz=64", url: "https://stablediffusionweb.com", description: "AI Image Generator", name: "stablediffusionweb", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=www.emojis.com&sz=64", url: "https://www.emojis.com/", description: "Emojis", name: "emojis", category: "d" },
    { icon: "https://www.google.com/s2/favicons?domain=in.pinterest.com&sz=64", url: "https://in.pinterest.com/", description: "Inspiration & Images", name: "pinterest", category: "d" },
    // { icon: "https://firefly.adobe.com/favicon.ico", url: "https://firefly.adobe.com/inspire", description: "Adobe AI Image Generator", name: "firefly", category: "d" },
    // { icon: "https://boxicons.com/favicon.ico", url: "https://boxicons.com/", description: "Icons", name: "boxicons", category: "d" },
    // { icon: "https://ideogram.ai/favicon.ico", url: "https://ideogram.ai/", description: "AI Image Generator", name: "ideogram", category: "d" },
    // { icon: "https://www.pngwing.com/favicon.ico", url: "https://www.pngwing.com", description: "Transparent PNGs", name: "pngwing", category: "d" },
    // { icon: "https://shapefest.com/favicon.ico", url: "https://shapefest.com/", description: "3D Shapes", name: "shapefest", category: "d" },
    

    {
      "icon": "https://www.google.com/s2/favicons?domain=web.whatsapp.com&sz=64",
      "url": "https://web.whatsapp.com/",
      "description": "WhatsApp Web Messaging",
      "name": "WhatsApp",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=web.telegram.org&sz=64",
      "url": "https://web.telegram.org/",
      "description": "Telegram Web Messaging",
      "name": "Telegram",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.facebook.com&sz=64",
      "url": "https://www.facebook.com/",
      "description": "Social Network",
      "name": "Facebook",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=x.com&sz=64",
      "url": "https://x.com/",
      "description": "Microblogging Platform",
      "name": "Twitter",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.linkedin.com&sz=64",
      "url": "https://www.linkedin.com/",
      "description": "Professional Networking",
      "name": "LinkedIn",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=snapchat.com&sz=64",
      "url": "https://www.snapchat.com/",
      "description": "Snapchat - Share Moments",
      "name": "Snapchat",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.reddit.com&sz=64",
      "url": "https://www.reddit.com/",
      "description": "Community Discussions",
      "name": "Reddit",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.tiktok.com&sz=64",
      "url": "https://www.tiktok.com/",
      "description": "Short Video Platform",
      "name": "TikTok",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.pinterest.com&sz=64",
      "url": "https://www.pinterest.com/",
      "description": "Visual Discovery Platform",
      "name": "Pinterest",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.youtube.com&sz=64",
      "url": "https://www.youtube.com/",
      "description": "Video Sharing Platform",
      "name": "YouTube",
      "category": "b"
    },  
    {
      "icon": "https://www.google.com/s2/favicons?domain=discord.com&sz=64",
      "url": "https://discord.com/",
      "description": "Voice, Video & Text Chat",
      "name": "Discord",
      "category": "b"
    },
    {
      "icon": "https://www.google.com/s2/favicons?domain=www.instagram.com&sz=64",
      "url": "https://www.instagram.com/",
      "description": "Photo & Video Sharing",
      "name": "Instagram",
      "category": "b"
    },


    
    { icon: "https://www.google.com/s2/favicons?domain=freetts.com&sz=64", "url": "https://freetts.com/", "description": "Text to Speech", "name": "freetts", "category": "f" },
    { icon: "https://www.google.com/s2/favicons?domain=covers.ai&sz=64", "url": "https://covers.ai/", "description": "AI Audio Cover", "name": "covers", "category": "f" },
    { icon: "https://www.google.com/s2/favicons?domain=audiopen.ai&sz=64", "url": "https://audiopen.ai/", "description": "Audio Transcription", "name": "audiopen", "category": "f" },
    { icon: "https://www.google.com/s2/favicons?domain=elevenlabs.io&sz=64", "url": "https://elevenlabs.io/", "description": "AI Voice Synthesis", "name": "elevenlabs", "category": "f" },
    
      {
          icon: "https://www.google.com/s2/favicons?domain=invideo.io&sz=64",
          url: "https://invideo.io/",
          description: "Online Video Editor",
          name: "invideo",
          category: "e"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=motionarray.com&sz=64",
          url: "https://motionarray.com/",
          description: "Stock Media & Templates",
          name: "motionarray",
          category: "e"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=giphy.com&sz=64",
          url: "https://giphy.com/",
          description: "GIF Search Engine",
          name: "giphy",
          category: "e"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=jitter.video&sz=64",
          url: "https://jitter.video/",
          description: "Motion Design Tool",
          name: "jitter",
          category: "e"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=artgrid.io&sz=64",
          url: "https://artgrid.io/",
          description: "Royalty-Free Stock Footage",
          name: "artgrid",
          category: "e"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=app.runwayml.com&sz=64",
          url: "https://app.runwayml.com/login",
          description: "AI Video Editing Platform",
          name: "runwayml",
          category: "e"
      },

  
    
    { icon: "https://www.google.com/s2/favicons?domain=www.medium.com&sz=64", url: "https://medium.com", description: "Blogging Platform", category: "h" },
    { icon: "https://www.google.com/s2/favicons?domain=uiverse.io&sz=64", url: "https://uiverse.io", description: "UI Components", category: "h" },
    { icon: "https://www.google.com/s2/favicons?domain=replit.com&sz=64", url: "https://replit.com", description: "online code editer", category: "h" },
  

      {
          icon: "https://www.google.com/s2/favicons?domain=colorhunt.co&sz=64",
          url : "https://colorhunt.co/",
          description : "Free Color Palette Inspiration",
          name : "colorhunt",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=animista.net&sz=64",
          url : "https://animista.net/",
          description : "CSS Animation Tool",
          name : "animista",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=animate.style&sz=64",
          url : "https://animate.style/",
          description : "CSS Animation Library",
          name : "animate-style",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=app.haikei.app&sz=64",
          url : "https://app.haikei.app/",
          description : "SVG Shape Generator",
          name : "haikei",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=www.magicpattern.design&sz=64",
          url : "https://www.magicpattern.design/",
          description : "Pattern & Shape Generator",
          name : "magicpattern",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=animejs.com&sz=64",
          url : "https://animejs.com/",
          description : "JavaScript Animation Library",
          name : "animejs",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=www.blobmaker.app&sz=64",
          url : "https://www.blobmaker.app/",
          description : "Blob Shape Generator",
          name : "blobmaker",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=www.fffuel.co&sz=64",
          url : "https://www.fffuel.co/",
          description : "Creative Design Tools",
          name : "fffuel",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=stacksorted.com&sz=64",
          url : "https://stacksorted.com/scroll-effects",
          description : "Scroll Effect Inspirations",
          name : "stacksorted",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=typespiration.com&sz=64",
          url : "https://typespiration.com/",
          description : "Typography Inspiration",
          name : "typespiration",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=9elements.github.io&sz=64",
          url : "https://9elements.github.io/",
          description : "CSS Filter Generator",
          name : "9elements",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=color4bg.com&sz=64",
          url : "https://color4bg.com/",
          description : "Background Color Generator",
          name : "color4bg",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=patterns.helloyes.dev&sz=64",
          url : "https://patterns.helloyes.dev/",
          description : "Pattern Background Generator",
          name : "helloyes-patterns",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=cssgrid-generator.netlify.app&sz=64",
          url : "https://cssgrid-generator.netlify.app/",
          description : "CSS Grid Generator",
          name : "cssgrid-generator",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=www.eraser.io&sz=64",
          url : "https://www.eraser.io/",
          description : "Visual Collaboration Tool",
          name : "eraser",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=daisyui.com&sz=64",
          url : "https://daisyui.com/",
          description : "Tailwind Component Library",
          name : "daisyui",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=www.heroui.com&sz=64",
          url : "https://www.heroui.com/",
          description : "Hero Section Library",
          name : "heroui",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=ui.shadcn.com&sz=64",
          url : "https://ui.shadcn.com/",
          description : "shadcn/ui Component Library",
          name : "shadcn",
          category : "g"
      },
      {
          icon: "https://www.google.com/s2/favicons?domain=ui.mantine.dev&sz=64",
          url : "https://ui.mantine.dev/",
          description : "Mantine UI Components",
          name : "mantine",
          category : "g"
      },



        {
            "icon": "https://www.google.com/s2/favicons?domain=replicate.com&sz=64",
            "url": "https://replicate.com/",
            "description": "AI Models Hosting",
            "name": "replicate",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=huggingface.co&sz=64",
            "url": "https://huggingface.co/",
            "description": "AI Models & Datasets",
            "name": "huggingface",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=10015.io&sz=64",
            "url": "https://10015.io/",
            "description": "AI Tool Collection",
            "name": "10015",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=get.imagica.ai&sz=64",
            "url": "https://get.imagica.ai/",
            "description": "AI Creativity Tool",
            "name": "imagica",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.playbook.com&sz=64",
            "url": "https://www.playbook.com/",
            "description": "Creative Asset Management",
            "name": "playbook",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.dafont.com&sz=64",
            "url": "https://www.dafont.com/",
            "description": "Free Font Library",
            "name": "dafont",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.cofolios.com&sz=64",
            "url": "https://www.cofolios.com/",
            "description": "Product Designer Portfolios",
            "name": "cofolios",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=aframe.io&sz=64",
            "url": "https://aframe.io/",
            "description": "WebVR Framework",
            "name": "aframe",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.freefaces.gallery&sz=64",
            "url": "https://www.freefaces.gallery",
            "description": "Free Faces Font Collection",
            "name": "freefaces",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.fontspace.com&sz=64",
            "url": "https://www.fontspace.com/",
            "description": "Free Fonts",
            "name": "fontspace",
            "category": "h"
        },
        {
            "icon": "https://www.google.com/s2/favicons?domain=www.fontshare.com&sz=64",
            "url": "https://www.fontshare.com/",
            "description": "Modern Fonts",
            "name": "fontshare",
            "category": "h"
        }
  
];


// document.addEventListener("DOMContentLoaded", function () {
//   // Set default category (e.g., "a")
//   const defaultCategory = "a";
//   showCategory(defaultCategory);
//   document.getElementById("btn-a").addEventListener("click", () => showCategory("a"));
//   document.getElementById("btn-b").addEventListener("click", () => showCategory("b"));
//   document.getElementById("btn-c").addEventListener("click", () => showCategory("c"));
//   document.getElementById("btn-d").addEventListener("click", () => showCategory("d"));
//   document.getElementById("btn-e").addEventListener("click", () => showCategory("e"));
// });

// function showCategory(category) {
//   console.log("Category Selected: ", category);

//   // Remove active class from all buttons
//   document.querySelectorAll(".categories button").forEach(btn => btn.classList.remove("active"));

//   // Add active class to clicked button
//   document.getElementById("btn-" + category).classList.add("active");

//   // Get the container and clear previous content
//   const container = document.getElementById("websites-container");
//   container.innerHTML = "";

//   // Filter and render websites for the selected category
//   const filteredWebsites = websites.filter(website => website.category === category);

//   if (filteredWebsites.length > 0) {
//       filteredWebsites.forEach(site => {
//           const siteElement = document.createElement("div");
//           siteElement.classList.add("website-item");
//           siteElement.innerHTML = `
//               <img src="${site.icon}" alt="icon">
//               <a href="${site.url}" target="_blank">${site.name}</a>
//               <h4>${site.description}</h4>
//           `;
//           container.appendChild(siteElement);
//       });
//   } else {
//       container.innerHTML = "<p>No websites available for this category.</p>";
//   }
// }

document.addEventListener("DOMContentLoaded", function () {
  // Set default category (e.g., "a")
  const defaultCategory = "d";
  showCategory(defaultCategory);

  // Add event listeners for buttons
  document.getElementById("btn-a").addEventListener("click", () => showCategory("a"));
  document.getElementById("btn-b").addEventListener("click", () => showCategory("b"));
  document.getElementById("btn-c").addEventListener("click", () => showCategory("c"));
  document.getElementById("btn-d").addEventListener("click", () => showCategory("d"));
  document.getElementById("btn-e").addEventListener("click", () => showCategory("e"));
  document.getElementById("btn-f").addEventListener("click", () => showCategory("f"));
  document.getElementById("btn-g").addEventListener("click", () => showCategory("g"));
  document.getElementById("btn-h").addEventListener("click", () => showCategory("h"));
});

function showCategory(category) {
  console.log("Category Selected: ", category);

  // Update both the main category buttons and settings category buttons
  document.querySelectorAll(".categories button, #default-category-section .category-btn")
      .forEach(btn => {
          btn.classList.remove("active");
          if (btn.id === `btn-${category}` || btn.dataset.category === category) {
              btn.classList.add("active");
          }
      });

  // Get the container and clear previous content
  const container = document.getElementById("websites-container");
  container.innerHTML = "";

  // Filter and render websites for the selected category
  const filteredWebsites = websites.filter(website => website.category === category);

  if (filteredWebsites.length > 0) {
    // clock.style.display="none"
    filteredWebsites.forEach((site, index) => {
      const siteElement = document.createElement("div");
      siteElement.classList.add("website-item", "fade-in-up"); // Apply animation class
      
      // Delay animation per item
      siteElement.style.animationDelay = `${index * 0.1}s`;

      siteElement.innerHTML = `
        <img src="${site.icon}" alt="icon">
        <div class="website-info">
        <a href="${site.url}" target="_blank">${site.name}</a>
        <h4>${site.description}</h4>
        </div>
      `;

      container.appendChild(siteElement);
    });
  } else {
    container.innerHTML = "<p>No websites available for this category.</p>";
    // clock.style.display="block"
  }
}






document.addEventListener('DOMContentLoaded', () => {
  const categories = document.querySelector('.categories');
  const buttons = categories.querySelectorAll('button');
  const hoverIndicator = document.querySelector('.hover-indicator');

  // Function to set the hover indicator position and width
  function setHoverIndicator(button) {
    const buttonRect = button.getBoundingClientRect();
    const categoriesRect = categories.getBoundingClientRect();

    // Calculate the left position relative to the categories div
    const left = buttonRect.left - categoriesRect.left;

    hoverIndicator.style.width = `${buttonRect.width}px`;
    hoverIndicator.style.transform = `translateX(${left}px)`;
  }

  // Function to handle button click (set active state)
  function handleButtonClick(event) {
    buttons.forEach((btn) => btn.classList.remove('active'));
    event.target.classList.add('active');
    setHoverIndicator(event.target);
  }

  // Event listeners for button clicks
  buttons.forEach((button) => {
    button.addEventListener('click', handleButtonClick);
  });

  // Event listeners for button hover
  buttons.forEach((button) => {
    button.addEventListener('mouseover', () => {
      setHoverIndicator(button);
    });
  });

  // Reset indicator when mouse leaves the categories div
  categories.addEventListener('mouseleave', () => {
    const activeButton = categories.querySelector('.active');
    if (activeButton) {
      setHoverIndicator(activeButton);
    } else {
      hoverIndicator.style.width = '0';
    }
  });
});


setTime();

setInterval(function() {
  setTime();
}, 1000);

function setTime() {
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	
	var hour 	 = 360 * (h / 12);
	var minute = 360 * (m / 60);
	var second = 360 * (s / 60);
	
	document.getElementById("hour1").style.transform = 'rotate(' + hour + 'deg)';
	document.getElementById("minute1").style.transform = 'rotate(' + minute + 'deg)';
	document.getElementById("second1").style.transform = 'rotate(' + second + 'deg)';
}



// function updateTime() {
//   let cd = new Date();
//   let week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

//   let hours = cd.getHours();
//   let ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12; // Convert 0 to 12

//   let timeString = zeroPadding(hours, 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
//   let dateString = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
  
//   document.getElementById("time").textContent = timeString;
//   // document.getElementById("ampm").textContent = ampm;
//   document.getElementById("date").textContent = dateString;
// }

// function zeroPadding(num, digit) {
//   return num.toString().padStart(digit, '0');
// }

// // Update time every second
// setInterval(updateTime, 1000);
// updateTime(); // Initial call to display time immediately


// ---------------------super wathch analog----------------------

const seconds = document.querySelector('.seconds2');
const minutes = document.querySelector('.minutes2');
const minute = document.querySelector('.minute2');
const hour = document.querySelector('.hour2');

// Create spikes
for(let s = 0; s < 60 ; s++){
  let mSpikeEl = document.createElement('i');
  let sSpikeEl = document.createElement('i');
  mSpikeEl.className = 'spike2'
  sSpikeEl.className = 'spike2'
  mSpikeEl.style = `--rotate:${6 * s}deg`;
  sSpikeEl.style = `--rotate:${6 * s}deg`;
  mSpikeEl.setAttribute('data-i', s);
  sSpikeEl.setAttribute('data-i', s);

  seconds.append(sSpikeEl);
  minutes.append(mSpikeEl);
}

function getTime() {
		let date = new Date(),
    s  = date.getSeconds() ,
    m  = date.getMinutes();
  
  	hour.textContent = date.getHours();
  	minute.textContent = m;
  

  	minutes.style = `--dRotate:${6 * m}deg`;

    if(s == 0){
			seconds.classList.add('stop-anim2')
    } else{
      seconds.classList.remove('stop-anim2')
    }
    if(m == 0){
			minutes.classList.add('stop-anim2')
    } else{
      minutes.classList.remove('stop-anim2')
    }
  	
  		seconds.style = `--dRotate:${6 * s}deg`;
}

setInterval(getTime, 1000);
getTime();


// --------theme changer/------

function setTheme(themeName) {
    // Remove all existing theme classes
    document.documentElement.className = '';
    
    // Add the new theme class
    document.documentElement.classList.add(themeName);
    
    // Save theme preference to localStorage
    localStorage.setItem('currentTheme', themeName);
    
    // Update active state of theme buttons
    const themeButtons = document.querySelectorAll('#dark-mode-section .buttons button');
    themeButtons.forEach(button => {
        // Remove active class from all buttons
        button.classList.remove('active');
        
        // Add active class to selected theme button
        if (button.getAttribute('onclick').includes(themeName)) {
            button.classList.add('active');
        }
    });
}

// Function to load and apply saved theme
function loadSavedTheme() {
    // Get saved theme from localStorage, default to 'theme-1' if none found
    const savedTheme = localStorage.getItem('currentTheme') || 'theme-1';
    
    // Apply the saved theme
    setTheme(savedTheme);
}

// Add event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    loadSavedTheme();
    
    // Add click event listeners to theme buttons
    const themeButtons = document.querySelectorAll('#dark-mode-section .buttons button');
    themeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Extract theme name from onclick attribute
            const themeName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
            setTheme(themeName);
        });
    });
});

// Function to set the selected clock
function setClock(clockClass) {
  // Hide all clocks first
  const allClocks = document.querySelectorAll('.clocky');
  allClocks.forEach(clock => clock.style.display = 'none');

  // Show the selected clock
  const selectedClock = document.querySelector(`.${clockClass}`);
  if (selectedClock) {
    selectedClock.style.display = 'flex'; // or 'block' depending on your layout
    localStorage.setItem('selectedClock', clockClass);
  }

  // Update active state of clock buttons
  const clockButtons = document.querySelectorAll('#fav-clock-section button');
  clockButtons.forEach(button => {
    // Remove active class from all buttons
    button.classList.remove('active');
    
    // Add active class to the selected clock button
    if (button.getAttribute('data-clock') === clockClass) {
      button.classList.add('active');
    }
  });
}

// Function to initialize clock display
function initializeClocks() {
  // Get saved clock preference or default to clock-pos1
  const selectedClock = localStorage.getItem('selectedClock') || 'clock-pos1';
  setClock(selectedClock);

  // Add click event listeners to clock buttons
  const clockButtons = document.querySelectorAll('#fav-clock-section button');
  clockButtons.forEach(button => {
    button.addEventListener('click', () => {
      const clockClass = button.getAttribute('data-clock');
      setClock(clockClass);
    });
  });
}

// Initialize clock on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeClocks(); // This will handle setting the saved clock preference
});
// Function to toggle categories visibility
function toggleCategories() {
  const categoriesSection = document.querySelector('.categories-section');
  const toggleButton = document.getElementById('toggle-categories-btn');
  const currentState = toggleButton.getAttribute('data-state');
  
  if (currentState === 'show') {
    categoriesSection.style.display = 'none';
    toggleButton.textContent = 'Show Categories';
    toggleButton.setAttribute('data-state', 'hide');
    localStorage.setItem('categoriesVisible', 'false');
  } else {
    categoriesSection.style.display = 'flex';
    toggleButton.textContent = 'Hide Categories';
    toggleButton.setAttribute('data-state', 'show');
    localStorage.setItem('categoriesVisible', 'true');
  }
}


const r1 = 5;
const r2 = 10;
const r3 = 15;

const width = window.innerWidth;
const height = window.innerHeight;
const minWH = Math.min(width, height);
const maxSize = minWH < 430 ? minWH - 30 : 400;

const mid = maxSize / 2;
const paddedRadius = (maxSize - 30) / 2;

const rad = (a) => (Math.PI * (a - 90)) / 180;
const rx = (r, a, c) => c + r * Math.cos(rad(a));
const ry = (r, a, c) => c + r * Math.sin(rad(a));

const svg = document.getElementById('clockSvg3');
svg.setAttribute('width', maxSize);
svg.setAttribute('height', maxSize);
svg.setAttribute('viewBox', `0 0 ${maxSize} ${maxSize}`);

document.getElementById('outerRing3').setAttribute('cx', mid);
document.getElementById('outerRing3').setAttribute('cy', mid);
document.getElementById('outerRing3').setAttribute('r', mid - 5);

document.getElementById('primCircle3').setAttribute('cx', mid);
document.getElementById('primCircle3').setAttribute('cy', mid);
document.getElementById('primCircle3').setAttribute('r', mid - 15);

// Draw static spikes once
const spikesContainer = document.getElementById('spikes3');
for (let i = 1; i <= 12; i++) {
    const angle = i * 30;
    const spike = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spike.setAttribute('class', 'spike');
    spike.setAttribute('x1', rx(paddedRadius - 5, angle, mid));
    spike.setAttribute('y1', ry(paddedRadius - 5, angle, mid));
    spike.setAttribute('x2', rx(paddedRadius - 10, angle, mid));
    spike.setAttribute('y2', ry(paddedRadius - 10, angle, mid));
    spikesContainer.appendChild(spike);
}

function getTimeParts() {
    const t = new Date();
    return {
        h: t.getHours(),
        m: t.getMinutes(),
        s: t.getSeconds(),
        str: t.toTimeString().slice(0, 8).replace(/:/g, ' : ')
    };
}

function getHandPositions() {
    const { h, m, s } = getTimeParts();

    return {
        hx: rx(paddedRadius - 30, h * 30, mid),
        hy: ry(paddedRadius - 30, h * 30, mid),
        mx: rx(paddedRadius - 30, m * 6, mid),
        my: ry(paddedRadius - 30, m * 6, mid),
        sx: rx(paddedRadius - 30, s * 6, mid),
        sy: ry(paddedRadius - 30, s * 6, mid),
    };
}

function updateClock() {
    const time = getTimeParts();
    const { hx, hy, mx, my, sx, sy } = getHandPositions();

    document.getElementById('trianglePath3')
        .setAttribute('d', `M${hx},${hy} L${mx},${my} L${sx},${sy} Z`);

    document.getElementById('hourCircle3').setAttribute('cx', hx);
    document.getElementById('hourCircle3').setAttribute('cy', hy);
    document.getElementById('hourCircle3').setAttribute('r', r3);

    document.getElementById('minuteCircle3').setAttribute('cx', mx);
    document.getElementById('minuteCircle3').setAttribute('cy', my);
    document.getElementById('minuteCircle3').setAttribute('r', r2);

    document.getElementById('secondCircle3').setAttribute('cx', sx);
    document.getElementById('secondCircle3').setAttribute('cy', sy);
    document.getElementById('secondCircle3').setAttribute('r', r1);

    document.getElementById('timeText3').setAttribute('x', mid);
    document.getElementById('timeText3').setAttribute('y', mid);
    document.getElementById('timeText3').textContent = time.str;
}

setInterval(updateClock, 1000);
updateClock(); // initial render

// Clock 3 initialization function
function initializeClock3() {
    const r1 = 5;
    const r2 = 10;
    const r3 = 15;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const minWH = Math.min(width, height);
    const maxSize = minWH < 430 ? minWH - 30 : 400;

    const mid = maxSize / 2;
    const paddedRadius = (maxSize - 30) / 2;

    const rad = (a) => (Math.PI * (a - 90)) / 180;
    const rx = (r, a, c) => c + r * Math.cos(rad(a));
    const ry = (r, a, c) => c + r * Math.sin(rad(a));

    const svg = document.getElementById('clockSvg3');
    if (!svg) return; // Guard clause if element doesn't exist

    svg.setAttribute('width', maxSize);
    svg.setAttribute('height', maxSize);
    svg.setAttribute('viewBox', `0 0 ${maxSize} ${maxSize}`);

    const outerRing = document.getElementById('outerRing3');
    const primCircle = document.getElementById('primCircle3');
    
    if (outerRing && primCircle) {
        outerRing.setAttribute('cx', mid);
        outerRing.setAttribute('cy', mid);
        outerRing.setAttribute('r', mid - 5);

        primCircle.setAttribute('cx', mid);
        primCircle.setAttribute('cy', mid);
        primCircle.setAttribute('r', mid - 15);
    }

    // Draw static spikes once
    const spikesContainer = document.getElementById('spikes3');
    if (spikesContainer) {
        for (let i = 1; i <= 12; i++) {
            const angle = i * 30;
            const spike = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            spike.setAttribute('class', 'spike');
            spike.setAttribute('x1', rx(paddedRadius - 5, angle, mid));
            spike.setAttribute('y1', ry(paddedRadius - 5, angle, mid));
            spike.setAttribute('x2', rx(paddedRadius - 10, angle, mid));
            spike.setAttribute('y2', ry(paddedRadius - 10, angle, mid));
            spikesContainer.appendChild(spike);
        }
    }

    function getTimeParts() {
        const t = new Date();
        return {
            h: t.getHours(),
            m: t.getMinutes(),
            s: t.getSeconds(),
            str: t.toTimeString().slice(0, 8).replace(/:/g, ' : ')
        };
    }

    function getHandPositions() {
        const { h, m, s } = getTimeParts();
        return {
            hx: rx(paddedRadius - 30, h * 30, mid),
            hy: ry(paddedRadius - 30, h * 30, mid),
            mx: rx(paddedRadius - 30, m * 6, mid),
            my: ry(paddedRadius - 30, m * 6, mid),
            sx: rx(paddedRadius - 30, s * 6, mid),
            sy: ry(paddedRadius - 30, s * 6, mid),
        };
    }

    function updateClock() {
        const time = getTimeParts();
        const { hx, hy, mx, my, sx, sy } = getHandPositions();

        const elements = {
            trianglePath: document.getElementById('trianglePath3'),
            hourCircle: document.getElementById('hourCircle3'),
            minuteCircle: document.getElementById('minuteCircle3'),
            secondCircle: document.getElementById('secondCircle3'),
            timeText: document.getElementById('timeText3')
        };

        if (elements.trianglePath) {
            elements.trianglePath.setAttribute('d', `M${hx},${hy} L${mx},${my} L${sx},${sy} Z`);
        }

        if (elements.hourCircle) {
            elements.hourCircle.setAttribute('cx', hx);
            elements.hourCircle.setAttribute('cy', hy);
            elements.hourCircle.setAttribute('r', r3);
        }

        if (elements.minuteCircle) {
            elements.minuteCircle.setAttribute('cx', mx);
            elements.minuteCircle.setAttribute('cy', my);
            elements.minuteCircle.setAttribute('r', r2);
        }

        if (elements.secondCircle) {
            elements.secondCircle.setAttribute('cx', sx);
            elements.secondCircle.setAttribute('cy', sy);
            elements.secondCircle.setAttribute('r', r1);
        }

        if (elements.timeText) {
            elements.timeText.setAttribute('x', mid);
            elements.timeText.setAttribute('y', mid);
            elements.timeText.textContent = time.str;
        }
    }

    // Start the clock
    updateClock(); // Initial render
    setInterval(updateClock, 1000);
}





const size = 86;
const columns = Array.from(document.getElementsByClassName('column'));
let d, c;
const classList = ['visible', 'close', 'far', 'far', 'distant', 'distant'];
const use24HourClock = true;

function padClock(p, n) {
  return p + ('0' + n).slice(-2);
}

function getClock() {
  d = new Date();
  return [
    use24HourClock ? d.getHours() : (d.getHours() % 12 || 12),
    d.getMinutes(),
    d.getSeconds()
  ]
  .reduce(padClock, '');
}

function getClass(n, i2) {
  return classList.find((className, classIndex) => Math.abs(n - i2) === classIndex) || '';
}

let loop = setInterval(() => {
  c = getClock();
  columns.forEach((ele, i) => {
    let n = +c[i];
    let offset = -n * size;
    ele.style.transform = `translateY(calc(50vh + ${offset}px - ${size / 2}px))`;
    Array.from(ele.children).forEach((ele2, i2) => {
      ele2.className = 'num ' + getClass(n, i2);
    });
  });
}, 200 + Math.E * 10);

// Clock 4 initialization function
function initializeClock4() {
    const size = 86;
    const columns = Array.from(document.getElementsByClassName('column'));
    const classList = ['visible', 'close', 'far', 'far', 'distant', 'distant'];
    const use24HourClock = true;

    function padClock(p, n) {
        return p + ('0' + n).slice(-2);
    }

    function getClock() {
        const d = new Date();
        return [
            use24HourClock ? d.getHours() : (d.getHours() % 12 || 12),
            d.getMinutes(),
            d.getSeconds()
        ].reduce(padClock, '');
    }

    function getClass(n, i2) {
        return classList.find((className, classIndex) => Math.abs(n - i2) === classIndex) || '';
    }

    function updateClock() {
        if (!columns.length) return; // Guard clause if elements don't exist

        const c = getClock();
        columns.forEach((ele, i) => {
            let n = +c[i];
            let offset = -n * size;
            ele.style.transform = `translateY(calc(50vh + ${offset}px - ${size / 2}px))`;
            Array.from(ele.children).forEach((ele2, i2) => {
                ele2.className = 'num ' + getClass(n, i2);
            });
        });
    }

    // Initial update
    updateClock();

    // Set interval for updates
    return setInterval(updateClock, 200 + Math.E * 10);
}

// Clock scaling functionality
function initializeClockScaling() {
    const scaleRange = document.getElementById('clock-scale');
    const scaleValue = document.getElementById('scale-value');
    const allClocks = document.querySelectorAll('.clocky');
    
    // Load saved scale from localStorage or default to 100
    const savedScale = localStorage.getItem('clockScale') || 100;
    
    // Set initial scale
    scaleRange.value = savedScale;
    scaleValue.textContent = `${savedScale}%`;
    applyClockScale(savedScale);

    // Update scale when range input changes
    scaleRange.addEventListener('input', (e) => {
        const scale = e.target.value;
        scaleValue.textContent = `${scale}%`;
        applyClockScale(scale);
        localStorage.setItem('clockScale', scale);
    });

    function applyClockScale(scale) {
        allClocks.forEach(clock => {
            // Convert scale percentage to decimal
            const scaleDecimal = scale / 100;
            
            // Apply scale transform
            clock.style.transform = `scale(${scaleDecimal})`;
            
            // Adjust container to maintain layout
            clock.style.transformOrigin = 'center center';
            
            // Optional: Adjust margins to maintain spacing
            const marginAdjustment = (100 - scale) / 2;
            clock.style.margin = `${marginAdjustment}px 0`;
        });
    }
}

// Initialize default category functionality
function initializeDefaultCategory() {
    const categorySelect = document.getElementById('default-category-select');
    
    // Load saved default category from localStorage or use 'd' as fallback
    const savedCategory = localStorage.getItem('defaultCategory') || 'd';
    
    // Set initial selected option
    categorySelect.value = savedCategory;
    
    // Show the saved default category on page load
    showCategory(savedCategory);

    // Add change handler to select
    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        
        // Save to localStorage
        localStorage.setItem('defaultCategory', category);
        
        // Show the selected category
        showCategory(category);
    });
}



// No clock implementation for clock-pos5

// Clock 5 initialization function
function initializeClock5() {
    // Create hour spans
    const hourContainer = document.querySelector('.hour5');
    if (hourContainer) {
        hourContainer.innerHTML = ''; // Clear existing content
        for (let i = 0; i < 24; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            hourContainer.appendChild(span);
        }
    }

    // Create minute spans
    const minuteContainer = document.querySelector('.minute5');
    if (minuteContainer) {
        minuteContainer.innerHTML = ''; // Clear existing content
        for (let i = 0; i < 60; i++) {
            const span = document.createElement('span');
            span.textContent = i < 10 ? '0' + i : i;
            minuteContainer.appendChild(span);
        }
    }

    // Create second spans
    const secondsContainer = document.querySelector('.seconds5');
    if (secondsContainer) {
        secondsContainer.innerHTML = ''; // Clear existing content
        for (let i = 0; i < 60; i++) {
            const span = document.createElement('span');
            span.textContent = i < 10 ? '0' + i : i;
            secondsContainer.appendChild(span);
        }
    }

    function setTimeAnimations() {
        const now = new Date();
        const second = now.getSeconds();
        const minute = (now.getMinutes() * 60) + second;
        const hour = (now.getHours() * 3600) + minute;
        
        const secString = -second + 's';
        const minString = -minute + 's';
        const hourString = -hour + 's';
        
        if (secondsContainer) {
            secondsContainer.style.animationDelay = secString;
        }
        if (minuteContainer) {
            minuteContainer.style.animationDelay = minString;
        }
        if (hourContainer) {
            hourContainer.style.animationDelay = hourString;
        }
    }

    // Initialize animations
    setTimeAnimations();

    // Update animations every second to ensure smooth transitions
    const updateInterval = setInterval(setTimeAnimations, 1000);

    // Return the interval ID for cleanup
    return updateInterval;
}

// Initialize tab count
function initializeTabCount() {
    let tabCount = localStorage.getItem('tabCount');
    tabCount = tabCount ? parseInt(tabCount) : 0; // Parse count or set to 0
    tabCount += 1; // Increment the count
    localStorage.setItem('tabCount', tabCount); // Store updated count
    displayTabCount(tabCount); // Display the count
}

// Function to display the tab count
function displayTabCount(count) {
    const countSection = document.getElementById('tab-count'); // Get the span element
    if (countSection) {
        countSection.textContent = count; // Update the text content with the count
    }
}

// Call initializeTabCount on page load
document.addEventListener("DOMContentLoaded", initializeTabCount);