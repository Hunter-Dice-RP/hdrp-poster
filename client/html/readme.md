# Dynamic Menu System
A flexible and responsive menu system inspired by RDR2's menu style, supporting multiple positions and types of menu items.

## Features
- Multiple menu positions (top, bottom, left, right)
- Various item types (button, input, checkbox, submenu, select/dropdown)
- Customizable footer with text and images
- Keyboard navigation support with arrow keys
- Automatic text input in text fields
- Dedicated submit button with multi-line text and image support
- Checkbox elements with keyboard navigation
- Select/dropdown elements with option navigation
- Optional mouse support (disabled by default)
- Animations and sound effects
- Image preloading for better performance
- Labels displayed above input fields

## Usage Examples

### Basic Menu Creation (Lua)
```lua
local menuData = {
    type = "show",
    position = "right",
    menuData = {
        name = "mainMenu", -- Unique menu identifier
        title = "Main Menu",
        items = {
            {
                type = "button",
                label = "Start Game",
                data = { action = "startGame" }
            },
            {
                type = "checkbox",
                label = "Enable Sound",
                checked = true,
                data = { action = "toggleSound" }
            },
            {
                type = "select",
                label = "Difficulty",
                value = "normal",
                options = {
                    { label = "Easy", value = "easy" },
                    { label = "Normal", value = "normal" },
                    { label = "Hard", value = "hard" }
                },
                data = { action = "setDifficulty" }
            }
        },
        submitText = "Confirm",
        footer = {
            text = "Select an option"
        }
    }
}

-- Show menu
ShowMenu(menuData)
```

### Menu with Images (Lua)
```lua
local menuData = {
    type = "show",
    position = "left",
    menuData = {
        name = "inventoryMenu", -- Unique menu identifier
        title = "Inventory",
        items = {
            {
                type = "button",
                label = "Weapon",
                image = "images/weapon.png",
                imagePosition = "left",
                data = { action = "selectWeapon" }
            }
        },
        footer = {
            images = {"images/footer_bg.png"},
            text = "Select your equipment"
        }
    }
}
```

## Menu Elements

### Menu Positions
- `top`: Appears at the top of the screen
- `bottom`: Appears at the bottom of the screen
- `left`: Appears on the left side
- `right`: Appears on the right side

### Item Types

#### Button
```lua
{
    type = "button",
    label = "Click Me",
    image = "path/to/image.png", -- Optional
    imagePosition = "left", -- or "right"
    data = { action = "buttonAction" },
    footerText = "Button description"
}
```

#### Input
```lua
{
    type = "input",
    label = "Enter Name",
    placeholder = "Your name...",
    inputType = "text", -- or "number", "password"
    data = { action = "inputAction" }
}
```

#### Checkbox
```lua
{
    type = "checkbox",
    label = "Toggle Option",
    checked = false,
    data = { action = "checkboxAction" },
    footerText = "Check to enable feature"
}
```

#### Submenu
```lua
{
    type = "submenu",
    label = "More Options",
    submenu = {
        items = {
            -- Submenu items here
        },
        footer = {
            text = "Submenu description"
        }
    }
}
```

#### Select
```lua
{
    type = "select",
    label = "Choose Type",
    value = 1, -- Default selected value
    options = {
        { label = "Type 1", value = 1 },
        { label = "Type 2", value = 2 },
        { label = "Type 3", value = 3 }
    },
    data = { action = "setType" },
    footerText = "Select a type from the dropdown"
}
```

Select elements provide dropdown functionality in the menu system:

- **Navigation**:
  - Right arrow or Enter: Opens the dropdown options
  - Left arrow or Escape: Closes the dropdown options
  - Up/Down arrows: Navigate between options when dropdown is open
  - Enter: Select the highlighted option

- **Behavior**:
  - Options are only shown when right arrow or Enter is pressed
  - Options are hidden when left arrow or Escape is pressed
  - When dropdown is closed, up/down arrows navigate between menu elements
  - Labels are displayed above select fields

- **Mouse Support**:
  - Mouse interactions are disabled by default
  - Enable mouse support by setting `useMouse: true` in the menu data
  - Hover effects are disabled when mouse support is disabled

### Submit Button
```lua
submitText = "Confirm Selection", -- Text for the submit button
submitImage = "path/to/image.png", -- Optional image for the submit button
```

The submit button is positioned at the bottom of the menu and posts all form data when clicked. It can include:
- Multi-line text
- Optional image support
- Keyboard navigation with arrow keys
- Disabled hover effects when mouse support is disabled

### Footer Configuration
```lua
footer = {
    text = "Footer description",
    image = "single/image.png",
    -- OR
    images = {"image1.png", "image2.png", "image3.png"}, -- Max 3 images
    pagination = "1/5" -- Optional page indicator
}
```

## Animations
The menu system includes several built-in animations:
- `fadeIn`: Fade in effect
- `fadeOut`: Fade out effect
- `slideInTop`: Slide from top
- `slideInBottom`: Slide from bottom
- `slideInLeft`: Slide from left
- `slideInRight`: Slide from right
- `pulse`: Pulsing effect
- `checkmarkAppear`: Checkbox selection animation

## Event Handling
```lua
-- Menu item selection
RegisterMenuCallback("onItemSelected", function(itemData)
    if itemData.action == "startGame" then
        -- Handle start game action
    end
end)

-- Menu submission
RegisterMenuCallback("onSubmit", function(formData)
    -- Handle form submission
end)
```

## Customization
The menu appearance can be customized through CSS:
- Font families (default: 'crock')
- Colors
- Animations
- Spacing and layout
- Images and icons

### Default Images
The menu system uses specific images from the @images folder:
- `inkroller_1a`: Menu background
- `menu_header_1a`: Menu title background
- `scroller_arrow_bottom`: Scrollable content indicator
- `selection_box_bg_1d`: Button backgrounds
- `selsected`: Selected buttons/areas

## Dependencies
- Font: 'crock' (included)

## Notes
- Maximum 3 footer images allowed
- Supports keyboard navigation (arrow keys, Enter, Escape)
- Select dropdown navigation:
  - Right arrow or Enter: Open dropdown
  - Left arrow or Escape: Close dropdown
  - Up/Down arrows: Navigate between options when dropdown is open
  - Enter: Select the highlighted option
  - Options at the end of the menu are fully selectable
  - Labels are displayed above select fields
- Images are preloaded for better performance
- Responsive design adapts to screen size
- Each menu requires a unique `name` property that is included in all POST request bodies
- Submit buttons can be positioned above the footer with multi-line text and image support
- Mouse support can be enabled by setting `useMouse: true` in the menu data