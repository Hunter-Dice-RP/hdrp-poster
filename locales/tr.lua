-- Turkish translations for qadr_bountposter_creator
qadr_settings.translations["tr"] = {
    menu = {
        title = "Poster Oluşturucu",      -- Main menu title
        footer = "Posterinizi oluşturmak için detayları doldurun", -- Menu footer text
        submit = "Poster Oluştur",        -- Submit button text
        labels = {                        -- Form field labels
            visible = "Görünür",          -- Visibility toggle
            header = "Başlık",            -- Poster header field
            price = "Fiyat",              -- Price field
            texture_dict = "Texture Dictionary", -- Texture dictionary field
            texture = "Texture",          -- Texture field
            name = "İsim",                -- Name field
            body = "İçerik",              -- Body content field
            type = "Tip",                 -- Type selector
            difficulty = "Zorluk"         -- Difficulty selector
        },
        types = {                         -- Poster type options
            type1 = "Tip 1",              -- Type 1
            type2 = "Tip 2",              -- Type 2
            type3 = "Tip 3",              -- Type 3
            type4 = "Tip 4",              -- Type 4
            type5 = "Tip 5"               -- Type 5
        },
        poster_type_select = "Poster Tipi Seçin",    -- Poster type selection prompt
        poster_type_default = "Normal Poster",        -- Default poster type
        poster_type_legendary = "Efsanevi Poster",    -- Legendary poster type
        poster_created = "Poster oluşturuldu"         -- Success message
    },
    errors = {
        max_posters = "Bu alana daha fazla poster oluşturamazsın!" -- Error for max posters reached
    },
    prompts = {                           -- Action prompts
        pin = "Sabitle",                  -- Pin action
        cancel = "İptal",                 -- Cancel action
        take_poster = "Posteri Incele"    -- Take poster action
    }
}