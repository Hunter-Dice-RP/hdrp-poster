-- English translations for qadr_bountposter_creator
qadr_settings.translations["en"] = {
    -- Menu translations
    menu = {
        title = "Poster Creator",          -- Main menu title
        footer = "Fill in the details to create your poster", -- Footer text
        submit = "Create Poster",          -- Submit button text
        labels = {                         -- Form field labels
            visible = "Visible",           -- Visibility toggle
            header = "Header",             -- Poster header text
            price = "Price",               -- Price input
            texture_dict = "Texture Dictionary", -- Texture dictionary input
            texture = "Texture",           -- Texture input
            name = "Name",                 -- Name input
            body = "Body",                 -- Body text input
            type = "Type",                 -- Type selector
            difficulty = "Difficulty"       -- Difficulty selector
        },
        types = {                          -- Poster type options
            type1 = "Type 1",
            type2 = "Type 2",
            type3 = "Type 3",
            type4 = "Type 4",
            type5 = "Type 5"
        },
        poster_type_select = "Select Poster Type",    -- Poster type selector label
        poster_type_default = "Default Poster",       -- Default poster option
        poster_type_legendary = "Legendary Poster",   -- Legendary poster option
        poster_created = "Poster Created"             -- Success message
    },
    errors = {
        max_posters = "You cannot create more posters in this area!" -- Error message
    },
    prompts = {                            -- Button prompts
        pin = "Pin",                       -- Pin action
        cancel = "Cancel"                  -- Cancel action
    }
}