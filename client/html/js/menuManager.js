
/**
 * Menu Manager - Handles dynamic menu creation and interaction
 *
 * This module manages menus that can be positioned at top, bottom, left, or right of the screen.
 * It supports button and input type menu items, keyboard navigation, and footer content.
 */

/**
 * Preload common menu images for better performance
 */
const commonMenuImages = [
    'images/inkroller_1a.png',
    'images/menu_header_1a.png',
    'images/scroller_arrow_bottom.png',
    'images/selection_box_bg_1d.png',
    'images/selsected.png',
    'images/divider_line.png'
];

// Cache for preloaded images
const imageCache = {};

/**
 * Flag to enable/disable sound effects
 */
let soundEnabled = true;

/**
 * Preload images to improve menu rendering performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @returns {Promise} Promise that resolves when all images are loaded
 */
function preloadImages(imageUrls) {
    const promises = imageUrls.map(url => {
        // Skip if already cached
        if (imageCache[url]) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                imageCache[url] = img;
                resolve();
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                resolve(); // Resolve anyway to not block other images
            };
            img.src = url;
        });
    });

    return Promise.all(promises);
}


/**
 * Initialize message event listener when window loads
 */
window.onload = function () {
    // Preload common menu images
    preloadImages(commonMenuImages);

    // Set up message event listener
    window.addEventListener('message', (event) => {
        onData(event.data);
    });
};

// Track currently active menu and selected item
let currentActiveMenu = null;
let currentActiveIndex = -1;

// Flag to track whether mouse support is enabled (default: disabled)
let isMouseSupportEnabled = false;

// Add a global mouse event tracker
window.mouseEventOccurred = false;
document.addEventListener('mousedown', () => {
    window.mouseEventOccurred = true;
});
document.addEventListener('mousemove', () => {
    window.mouseEventOccurred = true;
});

// Cache for active menu data
const menuDataCache = {
    top: null,
    bottom: null,
    left: null,
    right: null
};

/**
 * Convert Lua-style menu data to JavaScript format
 * @param {Object} data - Lua-style menu data
 * @returns {Object} JavaScript-style menu data
 */
function convertLuaToJsFormat(data) {
    // Check if this is Lua-style data (using = instead of :)
    if (typeof data === 'object' && data !== null) {
        // If data has properties with = instead of :, convert it
        if (data.type && data.position && data.menuData) {
            return {
                type: data.type,
                position: data.position,
                menuData: data.menuData,
                useMouse: data.useMouse
            };
        }
    }
    return data;
}

/**
 * Handle incoming menu data messages
 * @param {Object} data - Menu configuration data
 * @param {string} data.type - Action type ('show', 'hide', 'hideMenu')
 * @param {string} [data.position] - Menu position ('top', 'bottom', 'left', 'right')
 * @param {Object} [data.menuData] - Menu content configuration
 * @param {boolean} [data.useMouse=false] - Whether to enable mouse support (default: false)
 */
function onData(data) {
    // Convert Lua-style data if needed
    data = convertLuaToJsFormat(data);

    // Check if mouse support setting has changed
    const previousMouseSupportSetting = isMouseSupportEnabled;

    //closeMenu()
    if (data.type === 'closeMenu') {
        hideAllMenus();
        currentActiveMenu = null;
        currentActiveIndex = -1;
        return;
    }

    // Update mouse support setting
    if (data.useMouse === true) {
        isMouseSupportEnabled = true;
        document.body.classList.add('mouse-enabled');
    } else {
        isMouseSupportEnabled = false;
        document.body.classList.remove('mouse-enabled');
    }

    // If mouse support setting has changed and we have an active menu, re-setup event listeners
    if (previousMouseSupportSetting !== isMouseSupportEnabled && currentActiveMenu) {
        setupMenuEventListeners(currentActiveMenu);
    }
    if (data.type === 'show') {
        document.body.style.display = 'block';
        const position = data.position || 'top';

        // Debug the checkbox states before reopening
        if (currentActiveMenu === position) {
            debugCheckboxStates(position, 'Before reopening');
        }

        // If we're already showing a menu in this position, preserve checkbox states
        if (currentActiveMenu === position) {
            // Get the current menu data
            const currentMenuData = menuDataCache[position];

            // If we have current menu data, update the new menu data with checkbox states
            if (currentMenuData && currentMenuData.items && data.menuData && data.menuData.items) {
                // Loop through the items and preserve checkbox states
                for (let i = 0; i < data.menuData.items.length; i++) {
                    const newItem = data.menuData.items[i];

                    // Skip if the new item doesn't exist
                    if (!newItem) continue;

                    // Find the corresponding item in the current menu
                    const currentItem = i < currentMenuData.items.length ? currentMenuData.items[i] : null;

                    // If both items are checkboxes, preserve the checked state
                    if (currentItem &&
                        newItem.type === 'checkbox' && currentItem.type === 'checkbox') {
                        // Update the checked state from the current menu
                        newItem.checked = !!currentItem.checked;
                    }
                }
            }

            // Close the current menu without animation
            const menu = document.getElementById(position + 'Menu');
            menu.style.display = 'none';
            menu.classList.remove('visible');
        }

        createMenu(data.menuData, position);

        // Debug the checkbox states after reopening
        debugCheckboxStates(position, 'After reopening');

        // Play menu open sound


        // Set this as the active menu
        currentActiveMenu = position;
        currentActiveIndex = 0;

        // Focus on the first item
        setTimeout(focusMenuItemByIndex, 100, 0);
    } else if (data.type === 'hide') {
        // Play menu close sound


        document.body.style.display = 'none';
        hideAllMenus();
        currentActiveMenu = null;
        currentActiveIndex = -1;
    } else if (data.type === 'hideMenu') {
        // Play menu close sound


        const position = data.position || 'top';
        hideMenu(position);
        if (currentActiveMenu === position) {
            currentActiveMenu = null;
            currentActiveIndex = -1;
        }
    }
}

/**
 * Hide all menu containers with animation
 */
function hideAllMenus() {
    hideAllMenusExcept(null);
}

/**
 * Hide all menu containers except the specified one
 * @param {string|null} exceptPosition - Position to exclude from hiding
 */
function hideAllMenusExcept(exceptPosition) {
    const menus = ['top', 'bottom', 'left', 'right'];
    menus.forEach(position => {
        if (position === exceptPosition) {
            // Skip the menu we want to keep
            return;
        }

        const menu = document.getElementById(position + 'Menu');
        // Only animate if menu is visible
        if (menu.style.display === 'block') {
            // Remove visible class to trigger fade out
            menu.classList.remove('visible');
            // Wait for animation to complete before hiding
            setTimeout(() => {
                menu.style.display = 'none';
            }, 300); // Match this with CSS transition duration
        } else {
            menu.style.display = 'none';
        }
    });
}

/**
 * Hide specific menu by position with animation
 * @param {string} position - Menu position to hide
 */
function hideMenu(position) {
    const menu = document.getElementById(position + 'Menu');
    // Only animate if menu is visible
    if (menu.style.display === 'block') {
        // Remove visible class to trigger fade out
        menu.classList.remove('visible');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            menu.style.display = 'none';
        }, 300); // Match this with CSS transition duration
    } else {
        menu.style.display = 'none';
    }
}

// Store event listeners for each menu position so we can remove them later
const menuEventListeners = {
    top: { mouseenter: null, click: null, keydown: null },
    bottom: { mouseenter: null, click: null, keydown: null },
    left: { mouseenter: null, click: null, keydown: null },
    right: { mouseenter: null, click: null, keydown: null }
};

/**
 * Set up event listeners for a menu container using event delegation
 * @param {string} position - Menu position
 */
function setupMenuEventListeners(position) {
    const menuItemsContainer = document.getElementById(position + 'MenuItems');

    // Remove existing event listeners if they exist
    if (menuEventListeners[position].mouseenter) {
        menuItemsContainer.removeEventListener('mouseenter', menuEventListeners[position].mouseenter, true);
    }
    if (menuEventListeners[position].click) {
        menuItemsContainer.removeEventListener('click', menuEventListeners[position].click);
    }
    if (menuEventListeners[position].keydown) {
        menuItemsContainer.removeEventListener('keydown', menuEventListeners[position].keydown);
    }

    // Create and store new event listeners

    // Mouse enter event for all menu items
    menuEventListeners[position].mouseenter = (e) => {
        // Skip if mouse support is disabled
        if (!isMouseSupportEnabled) return;

        // Find the closest menu item, input container, or select container
        const menuItem = e.target.closest('.menu-item, .menu-input-container, .menu-select-container');
        if (!menuItem) return;

        // Only process if this is the active menu
        if (currentActiveMenu !== position) return;

        const index = parseInt(menuItem.getAttribute('data-index'));
        if (isNaN(index)) return;

        focusMenuItemByIndex(index);
        updateFooterContent(position, index);
    };

    // Click event for all menu items
    menuEventListeners[position].click = (e) => {
        // Skip if mouse support is disabled
        if (!isMouseSupportEnabled) return;

        // Find the closest menu item, input container, or select container
        const menuItem = e.target.closest('.menu-item, .menu-input-container, .menu-select-container');
        if (!menuItem) return;

        const index = parseInt(menuItem.getAttribute('data-index'));
        if (isNaN(index)) return;

        const type = menuItem.getAttribute('data-type');

        if (type === 'checkbox') {
            toggleCheckbox(menuItem, position, index);
        } else if (type === 'button') {
            activateMenuItem(menuItem, position, index);
        }
        // Input and select containers are handled separately with their own event listeners
    };

    // Keydown event for all menu items
    menuEventListeners[position].keydown = (e) => {
        // Only handle Enter and Space
        if (e.key !== 'Enter' && e.key !== ' ') return;

        // Find the closest menu item, input container, or select container
        const menuItem = e.target.closest('.menu-item, .menu-input-container, .menu-select-container');
        if (!menuItem) return;

        const index = parseInt(menuItem.getAttribute('data-index'));
        if (isNaN(index)) return;

        const type = menuItem.getAttribute('data-type');

        e.preventDefault(); // Prevent default for both Enter and Space

        if (type === 'checkbox') {
            toggleCheckbox(menuItem, position, index);
        } else if (type === 'button') {
            activateMenuItem(menuItem, position, index);
        } else if (type === 'input') {
            // Focus the input field
            const input = menuItem.querySelector('input');
            if (input) input.focus();
        } else if (type === 'select') {
            // Toggle the dropdown
            toggleDropdown(menuItem);
        }
    };

    // Add the event listeners
    menuItemsContainer.addEventListener('mouseenter', menuEventListeners[position].mouseenter, true);
    menuItemsContainer.addEventListener('click', menuEventListeners[position].click);
    menuItemsContainer.addEventListener('keydown', menuEventListeners[position].keydown);
}

/**
 * Extract all image URLs from menu data for preloading
 * @param {Object} menuData - Menu configuration
 * @returns {Array} Array of image URLs
 */
function extractMenuImages(menuData) {
    const images = [];

    // Check for footer images
    if (menuData.footer) {
        if (menuData.footer.image) {
            images.push(menuData.footer.image);
        }
        if (menuData.footer.images && Array.isArray(menuData.footer.images)) {
            images.push(...menuData.footer.images);
        }
    }

    // Check for submit button image
    if (menuData.submitImage) {
        images.push(menuData.submitImage);
    }

    // Check for item images
    if (menuData.items && Array.isArray(menuData.items)) {
        menuData.items.forEach(item => {
            if (item.image) {
                images.push(item.image);
            }
            if (item.footerImages && Array.isArray(item.footerImages)) {
                images.push(...item.footerImages);
            }
        });
    }

    return images;
}

/**
 * @typedef {Object} SubMenuData
 * @property {string} label - Submenu label
 * @property {MenuItemData[]} items - Submenu items
 * @property {string} [icon] - Optional submenu icon
 * @property {MenuFooter} [footer] - Submenu footer
 */

/**
 * @typedef {Object} MenuItemData
 * @property {string} type - Item type ('button', 'input', 'checkbox', 'submenu')
 * @property {string} label - Display label for the item
 * @property {string} [icon] - Optional icon path
 * @property {string} [iconPosition] - Icon position ('left' or 'right')
 * @property {Object} data - Custom data for the item
 * @property {string} [footerText] - Optional footer text for this item
 * @property {string[]} [footerImages] - Optional footer images for this item
 * @property {SubMenuData} [submenu] - Submenu configuration (only for type: 'submenu')
 * @property {string} [animation] - Custom animation name
 */

/**
 * @typedef {Object} MenuFooter
 * @property {string} [text] - Footer text content
 * @property {string} [image] - Single footer image path
 * @property {string[]} [images] - Array of footer image paths
 * @property {string} [pagination] - Pagination text (e.g., "1/5")
 */

/**
 * @typedef {Object} MenuData
 * @property {string} title - Menu title
 * @property {string} [name] - Menu name identifier (used in POST requests)
 * @property {MenuItemData[]} items - Array of menu items
 * @property {string} [submitText] - Text for submit button
 * @property {string} [submitImage] - Image for submit button
 * @property {MenuFooter} [footer] - Footer configuration
 */

// Menü geçmişini takip etmek için
const menuHistory = [];

/**
 * Creates and displays a menu with the specified configuration
 * @param {MenuData} menuData - Menu configuration object
 * @param {string} position - Menu position ('top', 'bottom', 'left', 'right')
 * @throws {Error} Throws if required menu elements are not found
 */
function createMenu(menuData, position) {
    // Cache the menu data for later use
    menuDataCache[position] = menuData;

    // Preload all images used in this menu
    const menuImages = extractMenuImages(menuData);
    preloadImages(menuImages);

    // Hide all menus except the one we're about to show
    hideAllMenusExcept(position);

    // Get the correct menu elements based on position
    const menuContainer = document.getElementById(position + 'Menu');
    const menuTitle = document.getElementById(position + 'MenuTitle');
    const menuItemsContainer = document.getElementById(position + 'MenuItems');
    const menuSubmitContainer = document.getElementById(position + 'MenuSubmit');
    const menuFooter = document.getElementById(position + 'MenuFooter');

    // Reset the menu container state
    menuContainer.style.display = 'none';
    menuContainer.classList.remove('visible');

    // Force a reflow to ensure the browser recognizes the state change
    void menuContainer.offsetWidth;

    // Show this menu with animation
    menuContainer.style.display = 'block';

    // Trigger another reflow to ensure animation works
    void menuContainer.offsetWidth;

    // Add visible class to start animation
    menuContainer.classList.add('visible');

    // Set the title
    menuTitle.textContent = menuData.title || '';

    // Remove event listeners from input elements before clearing the container
    const inputContainers = menuItemsContainer.querySelectorAll('.menu-input-container');
    inputContainers.forEach(container => {
        if (container.focusHandler) {
            container.removeEventListener('focus', container.focusHandler);
        }

        const input = container.querySelector('input');
        if (input) {
            if (input.changeHandler) {
                input.removeEventListener('change', input.changeHandler);
            }
            if (input.mousedownHandler) {
                input.removeEventListener('mousedown', input.mousedownHandler);
            }
        }
    });

    // Remove event listeners from select containers and dropdowns
    const selectContainers = menuItemsContainer.querySelectorAll('.menu-select-container');
    selectContainers.forEach(container => {
        // Remove click and keydown event listeners from select container
        if (container.clickHandler) {
            container.removeEventListener('click', container.clickHandler);
        }
        if (container.keydownHandler) {
            container.removeEventListener('keydown', container.keydownHandler);
        }

        // Remove click event listener from dropdown container
        const dropdown = container.querySelector('.menu-select-dropdown');
        if (dropdown && dropdown.clickHandler) {
            dropdown.removeEventListener('click', dropdown.clickHandler);
        }
    });

    // Clear previous items
    menuItemsContainer.innerHTML = '';

    // Remove event listeners from submit button before clearing
    const submitButton = menuSubmitContainer.querySelector('.menu-submit-button');
    if (submitButton) {
        if (submitButton.clickHandler) {
            submitButton.removeEventListener('click', submitButton.clickHandler);
        }
        if (submitButton.keydownHandler) {
            submitButton.removeEventListener('keydown', submitButton.keydownHandler);
        }
    }
    menuSubmitContainer.innerHTML = '';

    // Set up event listeners for this menu
    setupMenuEventListeners(position);

    // Create menu items using DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    menuData.items.forEach((item, index) => {
        switch (item.type) {
            case 'input':
                createInputItem(item, index, fragment, position);
                break;
            case 'checkbox':
                createCheckboxItem(item, index, fragment, position);
                break;
            case 'select':
                createSelectItem(item, index, fragment, position);
                break;
            default:
                createButtonItem(item, index, fragment, position);
        }
    });

    // Append all items at once for better performance
    menuItemsContainer.appendChild(fragment);

    // Check if menu is scrollable and add class if needed
    setTimeout(() => {
        if (menuItemsContainer.scrollHeight > menuItemsContainer.clientHeight) {
            menuContainer.classList.add('scrollable');
        } else {
            menuContainer.classList.remove('scrollable');
        }
    }, 100);

    // Create submit button
    if (menuData.submitText || menuData.submitImage) {
        createSubmitButton(menuData, position, menuSubmitContainer);
    } else {
    }

    // Set the footer
    if (menuData.footer) {
        if (typeof menuData.footer === 'string') {
            menuFooter.textContent = menuData.footer;
        } else if (typeof menuData.footer === 'object') {
            // Clear previous content
            menuFooter.innerHTML = '';

            // Create footer content container
            const footerContent = document.createElement('div');
            footerContent.className = 'menu-footer-content';

            // Add images container if there are images
            if (menuData.footer.images && Array.isArray(menuData.footer.images)) {
                const imagesContainer = document.createElement('div');
                imagesContainer.className = 'menu-footer-images';

                // En fazla 3 görsel ekle
                menuData.footer.images.slice(0, 3).forEach(imageUrl => {
                    const footerImage = document.createElement('img');
                    footerImage.className = 'menu-footer-image';
                    footerImage.src = imageUrl;
                    footerImage.alt = '';
                    imagesContainer.appendChild(footerImage);
                });

                footerContent.appendChild(imagesContainer);
            }
            // Geriye dönük uyumluluk için tek image desteği
            else if (menuData.footer.image) {
                const imagesContainer = document.createElement('div');
                imagesContainer.className = 'menu-footer-images';

                const footerImage = document.createElement('img');
                footerImage.className = 'menu-footer-image';
                footerImage.src = menuData.footer.image;
                footerImage.alt = '';
                imagesContainer.appendChild(footerImage);

                footerContent.appendChild(imagesContainer);
            }

            // Add text content
            const footerText = document.createElement('div');
            footerText.className = 'menu-footer-text';
            footerText.innerHTML = menuData.footer.text || '';
            footerContent.appendChild(footerText);

            // Pagination ekleme
            const totalItems = menuData.items.length;
            const currentIndex = currentActiveIndex + 1;
            const pagination = document.createElement('div');
            pagination.className = 'menu-pagination';
            pagination.textContent = `${currentIndex}/${totalItems}`;
            menuFooter.appendChild(pagination);

            menuFooter.appendChild(footerContent);
        }
    } else {
        menuFooter.textContent = '';
    }
}

/**
 * Create a button-type menu item
 * @param {Object} item - Button item configuration
 * @param {number} index - Item index
 * @param {HTMLElement} container - Parent container
 * @param {string} _ - Menu position (unused with event delegation)
 */
function createButtonItem(item, index, container, _) {
    const menuItem = document.createElement('div');
    menuItem.className = `menu-item ${item.animation || ''}`;
    menuItem.setAttribute('data-index', index);
    menuItem.setAttribute('data-type', 'button');
    menuItem.setAttribute('tabindex', '0');
    // Set animation delay based on index for staggered appearance
    menuItem.style.setProperty('--item-index', index);

    if (item.type === 'submenu') {
        menuItem.classList.add('submenu-item');

        // Submenu ok işareti
        const arrow = document.createElement('div');
        arrow.className = 'submenu-arrow';
        menuItem.appendChild(arrow);

        menuItem.addEventListener('click', () => openSubmenu(item.submenu));
    }

    // Create text element
    const textElement = document.createElement('div');
    textElement.className = 'menu-item-text';
    textElement.textContent = item.label;

    menuItem.appendChild(textElement);

    // Icon handling...
    if (item.icon) {
        const iconElement = document.createElement('img');
        iconElement.className = 'menu-item-icon';
        iconElement.src = item.icon;
        iconElement.alt = '';

        if (item.iconPosition === 'right') {
            iconElement.style.marginLeft = '10px';
            menuItem.appendChild(iconElement);
        } else {
            iconElement.style.marginRight = '10px';
            menuItem.insertBefore(iconElement, textElement);
        }
    }

    // Artık olay dinleyicileri event delegation ile yönetiliyor

    container.appendChild(menuItem);
}

/**
 * Handles menu item activation and sends data to backend
 * @param {HTMLElement} menuItem - The activated menu item element
 * @param {string} position - Menu position
 * @param {number} index - Item index in menu
 * @fires fetch - Sends POST request to backend
 */
function activateMenuItem(_, position, index) {
    // Play select sound


    // Send data to backend
    const itemData = getMenuItemData(position, index);
    const menuData = getMenuData(position);
    if (itemData) {
        fetch(`https://qadr_poster_creator/menuItemClicked`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index: index,
                position: position,
                name: menuData.name || '',
                data: itemData.data
            })
        });
    }
}

/**
 * Get menu item data from active menu
 * @param {string} position - Menu position
 * @param {number} index - Item index
 * @returns {Object|null} Menu item data
 */
function getMenuItemData(position, index) {
    // Get menu data from the active menu
    const menuData = getMenuData(position);

    // Return the item data if it exists
    if (menuData && menuData.items && menuData.items[index]) {
        return menuData.items[index];
    }
    return null;
}

/**
 * Create a checkbox-type menu item
 * @param {Object} item - Checkbox item configuration
 * @param {number} index - Item index
 * @param {HTMLElement} container - Parent container
 * @param {string} _ - Menu position (unused with event delegation)
 */
function createCheckboxItem(item, index, container, _) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.setAttribute('data-index', index);
    menuItem.setAttribute('data-type', 'checkbox');
    menuItem.setAttribute('tabindex', '0');
    // Set animation delay based on index for staggered appearance
    menuItem.style.setProperty('--item-index', index);

    // Create text element
    const textElement = document.createElement('div');
    textElement.className = 'menu-item-text';
    textElement.textContent = item.label;

    menuItem.appendChild(textElement);

    // Add image if specified
    if (item.image) {
        const imageElement = document.createElement('img');
        imageElement.className = 'menu-item-image';
        imageElement.src = item.image;
        imageElement.alt = '';

        if (item.imagePosition === 'right') {
            imageElement.classList.add('right');
            menuItem.appendChild(imageElement);
        } else {
            menuItem.insertBefore(imageElement, textElement);
        }
    }

    // Create checkbox container and element
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'menu-checkbox-container';

    const checkbox = document.createElement('div');
    checkbox.className = 'menu-checkbox';

    // Ensure the item has a checked property (default to false if not set)
    if (typeof item.checked !== 'boolean') {
        item.checked = false;
    }

    // Set the checkbox state based on the item data
    if (item.checked) {
        checkbox.classList.add('checked');
        menuItem.setAttribute('data-checked', 'true');
    } else {
        checkbox.classList.remove('checked');
        menuItem.setAttribute('data-checked', 'false');
    }

    checkboxContainer.appendChild(checkbox);
    menuItem.appendChild(checkboxContainer);

    // Artık olay dinleyicileri event delegation ile yönetiliyor

    container.appendChild(menuItem);
}

/**
 * Toggle checkbox state
 * @param {HTMLElement} menuItem - Checkbox menu item
 * @param {string} position - Menu position
 * @param {number} index - Item index
 */
function toggleCheckbox(menuItem, position, index) {
    debugCheckboxStates(position, `Before toggle of checkbox ${index}`);

    const checkbox = menuItem.querySelector('.menu-checkbox');
    const isChecked = checkbox.classList.contains('checked');

    // Play toggle sound


    // Toggle checked state
    const newCheckedState = !isChecked;

    // Update the DOM
    if (newCheckedState) {
        checkbox.classList.add('checked');
        menuItem.setAttribute('data-checked', 'true');
    } else {
        checkbox.classList.remove('checked');
        menuItem.setAttribute('data-checked', 'false');
    }

    // Update the cached menu data
    const cachedMenuData = getMenuData(position);
    if (cachedMenuData && cachedMenuData.items && cachedMenuData.items[index]) {
        // Update the checked state in the cached menu data
        cachedMenuData.items[index].checked = newCheckedState;
    }

    // Debug the checkbox states after toggling
    debugCheckboxStates(position, `After toggle of checkbox ${index}`);

    // Send data to backend
    const itemData = getMenuItemData(position, index);
    const menuData = getMenuData(position);
    if (itemData) {
        fetch(`https://qadr_poster_creator/checkboxToggled`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index: index,
                position: position,
                name: menuData.name || '',
                checked: newCheckedState,
                data: itemData.data
            })
        });
    }
}

/**
 * Create an input-type menu item
 * @param {Object} item - Input item configuration
 * @param {number} index - Item index
 * @param {HTMLElement} container - Parent container
 * @param {string} position - Menu position
 */
function createInputItem(item, index, container, position) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'menu-input-container';
    inputContainer.setAttribute('data-index', index);
    inputContainer.setAttribute('data-type', 'input');
    inputContainer.setAttribute('tabindex', '0');
    // Set animation delay based on index for staggered appearance
    inputContainer.style.setProperty('--item-index', index); // Make focusable

    // Artık mouse hover event delegation ile yönetiliyor

    // If there's a specific icon to show (not as background)
    if (item.icon) {
        const iconElement = document.createElement('img');
        iconElement.className = 'menu-input-icon';
        iconElement.src = item.icon;
        iconElement.alt = '';
        iconElement.style.marginRight = '10px';
        inputContainer.appendChild(iconElement);
    }

    const label = document.createElement('div');
    label.className = 'menu-input-label';
    label.textContent = item.label;

    const input = document.createElement('input');
    input.className = 'menu-input';
    input.type = item.inputType || 'text';
    input.placeholder = item.placeholder || '';
    input.value = item.value || '';

    // When the container is focused, focus the input
    // Store a flag to track if we should auto-focus
    inputContainer.autoFocus = true;

    // Create a unique focus handler for this input
    const focusHandler = () => {
        // Skip auto-focus if mouse support is disabled and the focus was triggered by a mouse event
        if (!isMouseSupportEnabled && window.mouseEventOccurred) {
            window.mouseEventOccurred = false;
            return;
        }

        if (inputContainer.autoFocus) {
            setTimeout(() => input.focus(), 50);
        }
        // Reset the flag for next time
        inputContainer.autoFocus = true;
    };

    // Store the handler on the element so we can remove it if needed
    inputContainer.focusHandler = focusHandler;
    inputContainer.addEventListener('focus', focusHandler);

    // Prevent direct clicking on input when mouse support is disabled
    const inputMousedownHandler = (e) => {
        if (!isMouseSupportEnabled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    // Store the handler on the element so we can remove it if needed
    input.mousedownHandler = inputMousedownHandler;
    input.addEventListener('mousedown', inputMousedownHandler);

    // Input değişikliklerini dinle - bu olayı koruyoruz çünkü input değeri değiştiğinde sunucuya bildirilmeli
    const changeHandler = () => {
        const menuData = getMenuData(position);
        fetch(`https://qadr_poster_creator/menuInputChanged`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index: index,
                position: position,
                name: menuData.name || '',
                value: input.value,
                data: item.data
            })
        });
    };

    // Store the handler on the element so we can remove it if needed
    input.changeHandler = changeHandler;
    input.addEventListener('change', changeHandler);

    // Flag to track if we're handling arrow key navigation
    let isNavigating = false;

    // Handle keyboard events in input fields - bu olayı koruyoruz çünkü input alanından çıkış ve navigasyon için özel işlem gerekiyor
    input.addEventListener('keydown', (e) => {
        // Exit input with Escape key
        if (e.key === 'Escape') {
            e.preventDefault();
            input.blur();
            // Don't auto-focus when returning to container
            inputContainer.autoFocus = false;
            inputContainer.focus();
        }

        // Exit input with arrow keys
        if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isNavigating) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling

            // Set flag to prevent double navigation
            isNavigating = true;

            // Store the direction before we lose focus
            const direction = e.key === 'ArrowUp' ? -1 : 1;

            // Completely remove focus from the input
            input.blur();

            // Don't auto-focus when returning to container
            inputContainer.autoFocus = false;

            // Delay navigation slightly to ensure focus events complete
            setTimeout(() => {
                // Check if we should navigate to the submit button
                const menuItems = document.getElementById(currentActiveMenu + 'MenuItems')
                    .querySelectorAll('.menu-item, .menu-input-container, .menu-select-container');
                const submitButton = document.getElementById(currentActiveMenu + 'MenuSubmit')
                    .querySelector('.menu-submit-button');

                // If moving down from the last item, go to submit button
                if (direction > 0 && currentActiveIndex === menuItems.length - 1 && submitButton) {
                    // Remove active class from all menu items
                    menuItems.forEach(item => item.classList.remove('active'));
                    submitButton.focus();
                    submitButton.classList.add('active');
                } else {
                    // Standard navigation between menu items
                    let newIndex = currentActiveIndex + direction;
                    if (newIndex < 0) newIndex = menuItems.length - 1;
                    if (newIndex >= menuItems.length) newIndex = 0;

                    // Focus directly on the new item
                    focusMenuItemByIndex(newIndex);
                }

                // Reset the navigation flag after a short delay
                setTimeout(() => {
                    isNavigating = false;
                }, 100);
            }, 10);
        }
    });

    // Add the label to the container
    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    container.appendChild(inputContainer);
}

function closeMenu() {
    document.body.style.display = 'none';
    currentActiveMenu = null;
    currentActiveIndex = -1;
}

document.onkeydown = function (e) {
    // Only process if a menu is active
    if (!currentActiveMenu) return;

    // Handle Escape key
    if (e.key === 'Escape') {
        // If we're in an input, let the input handle it
        if (document.activeElement.tagName === 'INPUT') return;

        // Check if any dropdown is open
        const openDropdowns = document.querySelectorAll('.menu-select-dropdown[style*="display: block"]');
        if (openDropdowns.length > 0) {
            // Close dropdowns instead of closing the menu
            closeAllDropdowns();
            return;
        }

        const menuData = getMenuData(currentActiveMenu);
        fetch(`https://qadr_poster_creator/closeMenu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                position: currentActiveMenu,
                name: menuData.name,
                menuData: menuData
            })
        });
        document.body.style.display = 'none';
        currentActiveMenu = null;
        currentActiveIndex = -1;
        return;
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent page scrolling

        // If we're in an input field, the input's keydown handler will handle it
        if (document.activeElement.tagName === 'INPUT') return;

        // Check if any dropdown is open - if so, let the dropdown handle navigation
        const openDropdowns = document.querySelectorAll('.menu-select-dropdown[style*="display: block"]');
        if (openDropdowns.length > 0) {
            // If dropdown is open, don't navigate the main menu
            return;
        }

        // Check if we're on the submit button
        const submitButton = document.getElementById(currentActiveMenu + 'MenuSubmit').querySelector('.menu-submit-button');
        const isOnSubmitButton = document.activeElement === submitButton;

        // If we're on the submit button, handle navigation specially
        if (isOnSubmitButton) {
            // Make sure the footer is reset to default when on submit button
            resetFooterToDefault(currentActiveMenu);
            if (e.key === 'ArrowUp') {
                // Navigate to the last menu item
                const menuItems = document.getElementById(currentActiveMenu + 'MenuItems')
                    .querySelectorAll('.menu-item, .menu-input-container, .menu-select-container');
                if (menuItems.length > 0) {
                    submitButton.classList.remove('active');
                    focusMenuItemByIndex(menuItems.length - 1);
                    // Footer will be updated by focusMenuItemByIndex
                }
                return;
            } else if (e.key === 'ArrowDown') {
                // Navigate to the first menu item
                submitButton.classList.remove('active');
                focusMenuItemByIndex(0);
                // Footer will be updated by focusMenuItemByIndex
                return;
            }
        }

        const direction = e.key === 'ArrowUp' ? -1 : 1;
        navigateMenu(direction);
    }
};

/**
 * Handle keyboard navigation between menu items
 * @param {number} direction - Navigation direction (-1 for up, 1 for down)
 */
function navigateMenu(direction) {
    if (!currentActiveMenu) return;

    // Close any open dropdowns when navigating
    closeAllDropdowns();

    const menuItemsContainer = document.getElementById(currentActiveMenu + 'MenuItems');
    const menuItems = menuItemsContainer.querySelectorAll('.menu-item, .menu-input-container, .menu-select-container');
    const submitButton = document.getElementById(currentActiveMenu + 'MenuSubmit').querySelector('.menu-submit-button');

    if (menuItems.length === 0 && !submitButton) return;

    // Play navigation sound


    // Check if we're on the submit button
    const isOnSubmitButton = document.activeElement === submitButton;

    // Calculate new index
    let newIndex = currentActiveIndex + direction;

    // Special handling for navigation to/from submit button
    if (direction > 0 && newIndex >= menuItems.length && !isOnSubmitButton) {
        // Moving down from last menu item to submit button
        if (submitButton) {
            // Remove active class from all menu items
            menuItems.forEach(item => item.classList.remove('active'));
            submitButton.focus();
            submitButton.classList.add('active');

            // Reset footer to default when focusing on submit button
            resetFooterToDefault(currentActiveMenu);
            return;
        }
    } else if (direction > 0 && document.activeElement.tagName === 'INPUT' &&
        currentActiveIndex === menuItems.length - 1) {
        // Moving down from the last input field to submit button
        if (submitButton) {
            // First blur the input and focus its container
            document.activeElement.blur();
            // Then focus the submit button
            menuItems.forEach(item => item.classList.remove('active'));
            submitButton.focus();
            submitButton.classList.add('active');

            // Reset footer to default when focusing on submit button
            resetFooterToDefault(currentActiveMenu);
            return;
        }
    } else if (direction < 0 && isOnSubmitButton) {
        // Moving up from submit button to last menu item
        if (menuItems.length > 0) {
            submitButton.classList.remove('active');
            focusMenuItemByIndex(menuItems.length - 1);
            // Footer will be updated by focusMenuItemByIndex
            return;
        }
    } else if (isOnSubmitButton) {
        // If on submit button and moving down, loop to first menu item
        if (direction > 0 && menuItems.length > 0) {
            submitButton.classList.remove('active');
            focusMenuItemByIndex(0);
            // Footer will be updated by focusMenuItemByIndex
            return;
        }
    }

    // Standard menu item navigation
    if (!isOnSubmitButton) {
        // Loop around if we go past the ends
        if (newIndex < 0) newIndex = menuItems.length - 1;
        if (newIndex >= menuItems.length) newIndex = 0;

        // Focus the new item
        focusMenuItemByIndex(newIndex);
    }
}

/**
 * Focus menu item by index
 * @param {number} index - Item index to focus
 */
function focusMenuItemByIndex(index) {
    if (!currentActiveMenu) return;

    const menuItemsContainer = document.getElementById(currentActiveMenu + 'MenuItems');
    const menuItems = menuItemsContainer.querySelectorAll('.menu-item, .menu-input-container, .menu-select-container');

    if (menuItems.length === 0 || index < 0 || index >= menuItems.length) return;

    // Close any open dropdowns when changing focus
    closeAllDropdowns();

    // Remove active class from all items
    menuItems.forEach(item => item.classList.remove('active'));

    // Add active class to the current item
    menuItems[index].classList.add('active');
    menuItems[index].focus();

    // Check if this is an input container and focus the input directly
    if (menuItems[index].classList.contains('menu-input-container')) {
        const input = menuItems[index].querySelector('input');
        if (input) {
            // Focus the input directly
            setTimeout(() => input.focus(), 10);
        }
    }

    // If this is a select container, make sure it's properly focused
    if (menuItems[index].classList.contains('menu-select-container')) {
        // Just ensure it has focus, no need to open dropdown automatically
        setTimeout(() => menuItems[index].focus(), 10);
    }

    // Update current index
    currentActiveIndex = index;

    // Update footer content for the current item
    updateFooterContent(currentActiveMenu, index);

    // Pagination is already updated in updateFooterContent
}

/**
 * Reset footer content to default (used when focusing on submit button)
 * @param {string} position - Menu position
 */
function resetFooterToDefault(position) {
    const menuData = getMenuData(position);
    if (!menuData || !menuData.footer) return;

    const menuFooter = document.getElementById(position + 'MenuFooter');
    const footerContent = menuFooter.querySelector('.menu-footer-content');

    if (!footerContent) return;

    // Clear current content
    footerContent.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // Add default footer images if any
    if (menuData.footer.images && Array.isArray(menuData.footer.images)) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'menu-footer-images';

        // Create a fragment for images
        const imagesFragment = document.createDocumentFragment();
        menuData.footer.images.slice(0, 3).forEach(imageUrl => {
            const footerImage = document.createElement('img');
            footerImage.className = 'menu-footer-image';
            footerImage.src = imageUrl;
            footerImage.alt = '';
            imagesFragment.appendChild(footerImage);
        });

        // Append all images at once
        imagesContainer.appendChild(imagesFragment);
        fragment.appendChild(imagesContainer);
    } else if (menuData.footer.image) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'menu-footer-images';

        const footerImage = document.createElement('img');
        footerImage.className = 'menu-footer-image';
        footerImage.src = menuData.footer.image;
        footerImage.alt = '';
        imagesContainer.appendChild(footerImage);

        fragment.appendChild(imagesContainer);
    }

    // Add default footer text
    const footerText = document.createElement('div');
    footerText.className = 'menu-footer-text';
    footerText.innerHTML = menuData.footer.text || '';
    fragment.appendChild(footerText);

    // Append all footer content at once
    footerContent.appendChild(fragment);

    // Update pagination if needed
    const paginationElement = menuFooter.querySelector('.menu-pagination');
    if (paginationElement) {
        const menuItems = document.getElementById(position + 'MenuItems')
            .querySelectorAll('.menu-item, .menu-input-container, .menu-select-container');
        paginationElement.textContent = `${currentActiveIndex + 1}/${menuItems.length}`;
    }
}

/**
 * Update footer content for current menu item
 * @param {string} position - Menu position
 * @param {number} index - Current item index
 */
function updateFooterContent(position, index) {
    const menuData = getMenuData(position);
    if (!menuData) return;

    const item = menuData.items[index];
    if (!item) return;

    const menuFooter = document.getElementById(position + 'MenuFooter');
    const footerContent = menuFooter.querySelector('.menu-footer-content');

    // Footer içeriğini temizle
    footerContent.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();

    // İtem'a özel görseller varsa ekle
    if (item.footerImages && Array.isArray(item.footerImages)) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'menu-footer-images';

        // Create a fragment for images
        const imagesFragment = document.createDocumentFragment();
        item.footerImages.slice(0, 3).forEach(imageUrl => {
            const footerImage = document.createElement('img');
            footerImage.className = 'menu-footer-image';
            footerImage.src = imageUrl;
            footerImage.alt = '';
            imagesFragment.appendChild(footerImage);
        });

        // Append all images at once
        imagesContainer.appendChild(imagesFragment);
        fragment.appendChild(imagesContainer);
    }

    // İtem'a özel metin varsa ekle
    const footerText = document.createElement('div');
    footerText.className = 'menu-footer-text';
    footerText.innerHTML = item.footerText || menuData.footer.text || '';
    fragment.appendChild(footerText);

    // Append all footer content at once
    footerContent.appendChild(fragment);

    // Pagination'ı güncelle
    const paginationElement = menuFooter.querySelector('.menu-pagination');
    if (paginationElement) {
        const totalItems = menuData.items.length;
        paginationElement.textContent = `${index + 1}/${totalItems}`;
    }
}

/**
 * Create a submit button for the menu
 * @param {Object} menuData - Menu configuration
 * @param {string} position - Menu position
 * @param {HTMLElement} container - Container element for the submit button
 */
function createSubmitButton(menuData, position, container) {
    const submitButton = document.createElement('button');
    submitButton.className = 'menu-submit-button';
    submitButton.setAttribute('data-position', position);
    submitButton.setAttribute('tabindex', '0');
    submitButton.textContent = menuData.submitText || 'Gönder';

    // Add image if specified
    if (menuData.submitImage) {
        const imageElement = document.createElement('img');
        imageElement.className = 'menu-submit-button-image';
        imageElement.src = menuData.submitImage;
        imageElement.alt = '';

        // Check image position
        if (menuData.submitImagePosition === 'right') {
            imageElement.classList.add('right');
            submitButton.appendChild(imageElement);
        } else {
            submitButton.prepend(imageElement);
        }
    }

    // Create click handler
    const clickHandler = () => {
        // Skip if mouse support is disabled
        if (!isMouseSupportEnabled) return;

        submitFormData(position);
    };

    // Create keydown handler
    const keydownHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            submitFormData(position);
        }
    };

    // Store handlers on the button so we can remove them if needed
    submitButton.clickHandler = clickHandler;
    submitButton.keydownHandler = keydownHandler;

    // Add event listeners
    submitButton.addEventListener('click', clickHandler);
    submitButton.addEventListener('keydown', keydownHandler);

    container.appendChild(submitButton);
}

/**
 * Collect and submit all form data from the menu
 * @param {string} position - Menu position
 */
function submitFormData(position) {
    const menuData = getMenuData(position);
    if (!menuData) return;

    // Collect all input values
    const formData = {};
    const menuItemsContainer = document.getElementById(position + 'MenuItems');
    const inputElements = menuItemsContainer.querySelectorAll('input');

    // Add each input to the form data
    inputElements.forEach((input) => {
        const menuItem = input.closest('.menu-input-container');
        const itemIndex = parseInt(menuItem.getAttribute('data-index'));
        const itemData = menuData.items[itemIndex];

        if (itemData && itemData.data) {
            // Use the action as the key if available
            const key = itemData.data.action || `input_${itemIndex}`;
            formData[key] = input.value;
        }
    });

    // Add button data for context
    menuData.items.forEach((item, index) => {
        if (item.type === 'button' && item.data && item.data.action) {
            // Only include selected buttons (those with a state)
            const menuItem = menuItemsContainer.querySelector(`.menu-item[data-index="${index}"]`);
            if (menuItem && menuItem.classList.contains('selected')) {
                formData[item.data.action] = true;
            }
        }
        // Add checkbox data
        else if (item.type === 'checkbox' && item.data && item.data.action) {
            // Use the cached checkbox state from the menu data
            formData[item.data.action] = !!item.checked;
        }
        // Add select data
        else if (item.type === 'select' && item.data && item.data.action) {
            const selectContainer = menuItemsContainer.querySelector(`.menu-select-container[data-index="${index}"]`);
            if (selectContainer) {
                const valueDisplay = selectContainer.querySelector('.menu-select-value');
                const value = valueDisplay.getAttribute('data-value');
                formData[item.data.action] = value;
            }
        }
    });
    fetch(`https://qadr_poster_creator/submitFormData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            position: position,
            name: menuData.name || '',
            menuData: menuData,
            formData: formData
        })
    });
}

/**
 * Get menu data from cache
 * @param {string} position - Menu position
 * @returns {Object|null} Menu data
 */
function getMenuData(position) {
    // Return the cached menu data for the specified position
    return menuDataCache[position];
}

/**
 * Debug function to log the state of all checkboxes in a menu
 * @param {string} position - Menu position
 * @param {string} label - Label for the log message
 */
function debugCheckboxStates(position, label) {
    const menuData = getMenuData(position);
    if (!menuData || !menuData.items) return;

    menuData.items.forEach((item, index) => {

    });
}

function openSubmenu(submenuData) {
    // Mevcut menüyü geçmişe ekle
    if (currentActiveMenu) {
        const currentMenuData = menuDataCache[currentActiveMenu];
        if (currentMenuData) {
            menuHistory.push({
                title: currentMenuData.title,
                items: currentMenuData.items,
                footer: currentMenuData.footer
            });
        }
    }

    // Get the current menu data to preserve the name
    const currentMenuData = menuDataCache[currentActiveMenu];

    // Yeni alt menüyü göster
    createMenu({
        title: submenuData.label,
        name: currentMenuData ? currentMenuData.name : '',
        items: submenuData.items,
        footer: submenuData.footer
    }, currentActiveMenu);

    // Play submenu open sound
    playSound('submenuOpen', 0.3);
}

/**
 * Create a select-type menu item with dropdown options
 * @param {Object} item - Select item configuration
 * @param {number} index - Item index
 * @param {HTMLElement} container - Parent container
 * @param {string} position - Menu position
 */
function createSelectItem(item, index, container, position) {
    const selectContainer = document.createElement('div');
    selectContainer.className = 'menu-select-container';
    selectContainer.setAttribute('data-index', index);
    selectContainer.setAttribute('data-type', 'select');
    selectContainer.setAttribute('tabindex', '0');
    selectContainer.style.setProperty('--item-index', index);

    // Create label element
    const labelElement = document.createElement('div');
    labelElement.className = 'menu-select-label';
    labelElement.textContent = item.label;
    selectContainer.appendChild(labelElement);

    // Create selected value display
    const selectedDisplay = document.createElement('div');
    selectedDisplay.className = 'menu-select-value';

    // Find the currently selected option
    const selectedOption = item.options.find(option => option.value === item.value) || item.options[0];
    selectedDisplay.textContent = selectedOption ? selectedOption.label : '';
    selectedDisplay.setAttribute('data-value', selectedOption ? selectedOption.value : '');
    selectContainer.appendChild(selectedDisplay);

    // Create dropdown container (hidden by default)
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'menu-select-dropdown';
    dropdownContainer.style.display = 'none';

    // Create options
    if (item.options && Array.isArray(item.options)) {
        item.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'menu-select-option';
            optionElement.textContent = option.label;
            optionElement.setAttribute('data-value', option.value);
            optionElement.setAttribute('data-option-index', optionIndex);

            // Store the option data for easy access
            optionElement.setAttribute('data-label', option.label);

            // Mark the selected option
            if (option.value === item.value) {
                optionElement.classList.add('selected');
            }

            // We'll use event delegation for click handling instead of individual listeners
            dropdownContainer.appendChild(optionElement);
        });
    }

    // Use event delegation for dropdown options
    const dropdownClickHandler = (e) => {
        // Skip if mouse support is disabled
        if (!isMouseSupportEnabled) return;

        // Find the clicked option element
        const optionElement = e.target.closest('.menu-select-option');
        if (!optionElement) return;

        e.stopPropagation(); // Prevent event bubbling

        // Get the option data
        const value = optionElement.getAttribute('data-value');
        const label = optionElement.getAttribute('data-label');

        // Select the option
        selectOption(selectContainer, value, label, position, index);
        closeAllDropdowns();
    };

    // Store the handler for later removal
    dropdownContainer.clickHandler = dropdownClickHandler;
    dropdownContainer.addEventListener('click', dropdownClickHandler);

    selectContainer.appendChild(dropdownContainer);

    // Toggle dropdown on click
    const selectClickHandler = () => {
        // Skip if mouse support is disabled
        if (!isMouseSupportEnabled) return;

        toggleDropdown(selectContainer);
    };

    // Store the handler for later removal
    selectContainer.clickHandler = selectClickHandler;
    selectContainer.addEventListener('click', selectClickHandler);

    // Handle keyboard events
    const selectKeydownHandler = (e) => {
        const isDropdownOpen = dropdownContainer.style.display === 'block';

        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();

            // If dropdown is open, select the currently highlighted option
            if (isDropdownOpen) {
                const selectedOption = dropdownContainer.querySelector('.menu-select-option.selected');
                if (selectedOption) {
                    const value = selectedOption.getAttribute('data-value');
                    const label = selectedOption.getAttribute('data-label') || selectedOption.textContent;
                    selectOption(selectContainer, value, label, position, index);
                }
                closeAllDropdowns();
            } else {
                // Toggle dropdown on Enter when closed (force open with keyboard)
                toggleDropdown(selectContainer, true);
            }
        } else if (e.key === 'Escape') {
            if (isDropdownOpen) {
                e.preventDefault();
                e.stopPropagation();
                closeAllDropdowns();
            }
        } else if (e.key === 'ArrowRight') {
            // Open dropdown with right arrow
            if (!isDropdownOpen) {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown(selectContainer, true);
            }
        } else if (e.key === 'ArrowLeft') {
            // Close dropdown with left arrow
            if (isDropdownOpen) {
                e.preventDefault();
                e.stopPropagation();
                closeAllDropdowns();
            }
        } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && isDropdownOpen) {
            // Only handle up/down arrows when dropdown is open
            e.preventDefault();
            e.stopPropagation();
            navigateDropdown(dropdownContainer, e.key === 'ArrowDown' ? 1 : -1);
        }
        // When dropdown is closed, let the default menu navigation handle up/down arrows
    };

    // Store the handler for later removal
    selectContainer.keydownHandler = selectKeydownHandler;
    selectContainer.addEventListener('keydown', selectKeydownHandler);

    container.appendChild(selectContainer);
}

/**
 * Toggle dropdown visibility
 * @param {HTMLElement} selectContainer - The select container element
 * @param {boolean} [forceOpen=false] - Force the dropdown to open regardless of mouse support
 */
function toggleDropdown(selectContainer, forceOpen = false) {
    // If this is a mouse event and mouse support is disabled, do nothing
    if (!forceOpen && window.mouseEventOccurred && !isMouseSupportEnabled) {
        window.mouseEventOccurred = false;
        return;
    }

    // Close all other dropdowns first
    closeAllDropdowns();

    const dropdown = selectContainer.querySelector('.menu-select-dropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        // Open the dropdown
        dropdown.style.display = 'block';

        // Add dropdown-open class to the container for proper z-index handling
        selectContainer.classList.add('dropdown-open');

        // Highlight the currently selected option
        const value = selectContainer.querySelector('.menu-select-value').getAttribute('data-value');
        const selectedOption = dropdown.querySelector(`.menu-select-option[data-value="${value}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            // Scroll to make the selected option visible - with a slight delay to ensure dropdown is rendered
            setTimeout(() => {
                selectedOption.scrollIntoView({ block: 'nearest' });
            }, 50);
        }

        // Ensure the dropdown is fully visible within the viewport
        setTimeout(() => {
            const dropdownRect = dropdown.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // If dropdown extends beyond viewport bottom, adjust its position
            if (dropdownRect.bottom > viewportHeight) {
                // Position dropdown above the select container instead
                dropdown.style.top = 'auto';
                dropdown.style.bottom = '100%';
                dropdown.style.marginTop = '0';
                dropdown.style.marginBottom = '5px';
            }
        }, 0);
    } else {
        // Close the dropdown
        dropdown.style.display = 'none';

        // Remove dropdown-open class
        selectContainer.classList.remove('dropdown-open');

        // Reset dropdown position
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.marginTop = '';
        dropdown.style.marginBottom = '';
    }
}

/**
 * Close all open dropdowns
 */
function closeAllDropdowns() {
    // Hide all dropdowns
    const dropdowns = document.querySelectorAll('.menu-select-dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';

        // Reset dropdown position
        dropdown.style.top = '';
        dropdown.style.bottom = '';
        dropdown.style.marginTop = '';
        dropdown.style.marginBottom = '';
    });

    // Remove dropdown-open class from all select containers
    const selectContainers = document.querySelectorAll('.menu-select-container');
    selectContainers.forEach(container => {
        container.classList.remove('dropdown-open');
    });
}

/**
 * Navigate through dropdown options with keyboard
 * @param {HTMLElement} dropdown - The dropdown container
 * @param {number} direction - Navigation direction (1 for down, -1 for up)
 */
function navigateDropdown(dropdown, direction) {
    const options = dropdown.querySelectorAll('.menu-select-option');
    if (options.length === 0) return;

    // Find the currently selected option
    const selectedOption = dropdown.querySelector('.menu-select-option.selected');
    let selectedIndex = -1;

    if (selectedOption) {
        selectedIndex = parseInt(selectedOption.getAttribute('data-option-index'));
        selectedOption.classList.remove('selected');
    }

    // Calculate new index
    let newIndex = selectedIndex + direction;
    if (newIndex < 0) newIndex = options.length - 1;
    if (newIndex >= options.length) newIndex = 0;

    // Select new option
    options[newIndex].classList.add('selected');
    options[newIndex].scrollIntoView({ block: 'nearest' });

    // Make sure the option has a data-label attribute
    if (!options[newIndex].hasAttribute('data-label')) {
        options[newIndex].setAttribute('data-label', options[newIndex].textContent);
    }

    // Artık Enter tuşu işleme kodunu kaldırıyoruz çünkü bu işlemi selectContainer'ın keydown event listener'ında yapıyoruz
    // Bu sayede çift işleme ve olası çakışmaları önlemiş oluyoruz
}

/**
 * Select an option from the dropdown
 * @param {HTMLElement} selectContainer - The select container element
 * @param {any} value - The selected value
 * @param {string} label - The selected label
 * @param {string} position - Menu position
 * @param {number} index - Item index
 */
function selectOption(selectContainer, value, label, position, index) {
    const valueDisplay = selectContainer.querySelector('.menu-select-value');
    valueDisplay.textContent = label;
    valueDisplay.setAttribute('data-value', value);

    // Update all options to reflect the selection
    const options = selectContainer.querySelectorAll('.menu-select-option');
    options.forEach(option => {
        if (option.getAttribute('data-value') == value) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    // Send data to backend
    const itemData = getMenuItemData(position, index);
    const menuData = getMenuData(position);
    if (itemData) {
        fetch(`https://qadr_poster_creator/selectOptionChanged`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                index: index,
                position: position,
                name: menuData.name || '',
                value: value,
                data: itemData.data
            })
        });
    }
}

function goBack() {
    if (menuHistory.length > 0) {
        const previousMenu = menuHistory.pop();
        // Get the current menu data to preserve the name
        const currentMenuData = menuDataCache[currentActiveMenu];

        createMenu({
            title: previousMenu.title,
            name: currentMenuData ? currentMenuData.name : '',
            items: previousMenu.items,
            footer: previousMenu.footer
        }, currentActiveMenu);

        playSound('submenuClose', 0.3);
    }
}

// Geri tuşu için olay dinleyici
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuHistory.length > 0) {
        goBack();
    }
});