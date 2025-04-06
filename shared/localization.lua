-- Initialize language system
local function initializeLanguage()
    -- Check if the specified language exists, otherwise fall back to English
    if not qadr_settings.translations[qadr_settings.defaultlang] then
        print("^1Warning: Language '" .. qadr_settings.defaultlang .. "' not found. Falling back to English.^7")
        qadr_settings.defaultlang = "en"
    end

    -- If English doesn't exist either, create an empty table to prevent errors
    if not qadr_settings.translations["en"] then
        qadr_settings.translations["en"] = {}
        print("^1Warning: English language file not found. Using empty translations.^7")
    end

    return qadr_settings.translations[qadr_settings.defaultlang]
end

-- Set the current language
qadr_lang = initializeLanguage()

-- Function to get a translation string
function getlang(...)
    local args = {...}
    local current = qadr_settings.translations[qadr_settings.defaultlang]
    
    -- Navigate through nested tables
    for _, key in ipairs(args) do
        if type(current) == "table" then
            current = current[key]
            if current == nil then
                return string.format("Missing translation for %s", table.concat(args, "."))
            end
        else
            return string.format("Invalid translation path for %s", table.concat(args, "."))
        end
    end
    
    return current
end

-- Function to change language at runtime
function setLanguage(lang)
    if qadr_settings.translations[lang] then
        qadr_settings.defaultlang = lang
        qadr_lang = qadr_settings.translations[lang]
        return true
    else
        print("^1Error: Language '" .. lang .. "' not found.^7")
        return false
    end
end
