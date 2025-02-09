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
  const closePanelBtn = document.getElementById('close-panel');
  const addShortcutBtn = document.getElementById('add-shortcut-btn');
  const shortcutList = document.getElementById('shortcut-list');
  const shortcutNameInput = document.getElementById('shortcut-name');
  const shortcutUrlInput = document.getElementById('shortcut-url');
  const clock = document.getElementById("clock"); 

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
 const websites =[
    { icon: "https://iconbuddy.com/favicon.ico", url: "https://iconbuddy.com/", description: "Icons", name: "iconbuddy", category: "a" },
    { icon: "https://savee.it/favicon.ico", url: "https://savee.it/", description: "Stock Images", name: "savee", category: "a" },
    // { icon: "https://www.flaticon.com/favicon.ico", url: "https://www.flaticon.com/", description: "Icons", name: "flaticon", category: "a" },
    // { icon: "https://shapefest.com/favicon.ico", url: "https://shapefest.com/", description: "3D Shapes", name: "shapefest", category: "a" },
    // { icon: "https://futicons.com/favicon.ico", url: "https://futicons.com/", description: "Icons", name: "futicons", category: "a" },
    // { icon: "https://iconscout.com/favicon.ico", url: "https://iconscout.com/", description: "Icons", name: "iconscout", category: "a" },
    // { icon: "https://boxicons.com/favicon.ico", url: "https://boxicons.com/", description: "Icons", name: "boxicons", category: "a" },
    // { icon: "https://looka.com/favicon.ico", url: "https://looka.com/", description: "Logo Maker", name: "looka", category: "a" },
    // { icon: "https://leonardo.ai/favicon.ico", url: "https://leonardo.ai", description: "AI Image Generator", name: "leonardo", category: "a" },
    // { icon: "https://stablediffusionweb.com/favicon.ico", url: "https://stablediffusionweb.com", description: "AI Image Generator", name: "stablediffusionweb", category: "a" },
    // { icon: "https://firefly.adobe.com/favicon.ico", url: "https://firefly.adobe.com/inspire", description: "Adobe AI Image Generator", name: "firefly", category: "a" },
    { icon: "https://ideogram.ai/favicon.ico", url: "https://ideogram.ai/", description: "AI Image Generator", name: "ideogram", category: "a" },
    { icon: "https://getimg.ai/favicon.ico", url: "https://getimg.ai/", description: "AI Image Generator", name: "getimg", category: "a" },
    { icon: "https://unsplash.com/favicon.ico", url: "https://unsplash.com/", description: "Stock Images", name: "unsplash", category: "a" },
    { icon: "https://www.pngwing.com/favicon.ico", url: "https://www.pngwing.com", description: "Transparent PNGs", name: "pngwing", category: "a" },
    { icon: "https://www.emojis.com/favicon.ico", url: "https://www.emojis.com/", description: "Emojis", name: "emojis", category: "a" },
    { icon: "https://in.pinterest.com/favicon.ico", url: "https://in.pinterest.com/", description: "Inspiration & Images", name: "pinterest", category: "a" },
  


      { "icon": "https://freetts.com/favicon.ico", "url": "https://freetts.com/", "description": "Text to Speech", "name": "freetts", "category": "c" },
      { "icon": "https://covers.ai/favicon.ico", "url": "https://covers.ai/", "description": "AI Audio Cover", "name": "covers", "category": "c" },
      { "icon": "https://audiopen.ai/favicon.ico", "url": "https://audiopen.ai/", "description": "Audio Transcription", "name": "audiopen", "category": "c" },
      { "icon": "https://elevenlabs.io/favicon.ico", "url": "https://elevenlabs.io/", "description": "AI Voice Synthesis", "name": "elevenlabs", "category": "c" },
    

  { icon: "https://www.medium.com/favicon.ico", url: "https://medium.com", description: "Blogging Platform", category: "c" },


  { icon: "https://uiverse.io/favicon.ico", url: "https://uiverse.io", description: "UI Components", category: "d" },


  { icon: "https://replit.com/favicon.ico", url: "https://replit.com", description: "online code editer", category: "e" }
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
  const defaultCategory = "a";
  showCategory(defaultCategory);

  // Add event listeners for buttons
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
	
	document.getElementById("hour").style.transform = 'rotate(' + hour + 'deg)';
	document.getElementById("minute").style.transform = 'rotate(' + minute + 'deg)';
	document.getElementById("second").style.transform = 'rotate(' + second + 'deg)';
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


