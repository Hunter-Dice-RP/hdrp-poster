-- Import RedEM framework
local RedEM = exports["redem_roleplay"]:RedEM()

-- Store all saved posters in memory
local savedPosters = {}

-- Load posters from JSON file into memory
local function loadPosters()
    local data = LoadResourceFile(GetCurrentResourceName(), "data/posters.json") or ""
    if data ~= "" then
        savedPosters = json.decode(data)
    end
end

-- Save posters from memory to JSON file
local function savePosters()
    SaveResourceFile(GetCurrentResourceName(), "data/posters.json", json.encode(savedPosters), -1)
end

-- Initialize posters when resource starts
Citizen.CreateThread(function()
    Wait(1000)
    loadPosters()
    TriggerClientEvent('qadr_poster_creator:loadAllPosters', -1, savedPosters)
end)

-- Handle saving new posters
RegisterServerEvent('qadr_poster_creator:savePoster')
AddEventHandler('qadr_poster_creator:savePoster',  function(posterData)
    local _source = source
    local Player = RedEM.GetPlayer(_source)
    if not Player then return end
    
    -- Get player info
    local playerName = Player.GetName()
    local playerIdentifier = Player.GetIdentifier()
    local posterId = #savedPosters + 1
    
    -- Create poster object
    local poster = {
        id = posterId,
        data = posterData,
        creator = {
            name = playerName,
            identifier = playerIdentifier
        },
        location = {
            coords = {
                x = posterData.coords.x,
                y = posterData.coords.y,
                z = posterData.coords.z
            },
            rot = {
                x = posterData.rot.x,
                y = posterData.rot.y,
                z = posterData.rot.z
            }
        },
        createdAt = os.time()
    }
    
    -- Save poster and notify clients
    table.insert(savedPosters, poster)
    savePosters()
    TriggerClientEvent('qadr_poster_creator:newPosterCreated', -1, poster)
    TriggerClientEvent('qadr_poster_creator:notification', _source, getlang("menu","poster_created"))    
end)

-- Send all posters to player when they join
AddEventHandler("redemrp:playerLoaded",function(source, user)
    local _source = source
    TriggerClientEvent('qadr_poster_creator:loadAllPosters', _source, savedPosters)
end)

-- Handle client requests for all posters
RegisterServerEvent('qadr_poster_creator:requestAllPosters')
AddEventHandler('qadr_poster_creator:requestAllPosters', function()
    local _source = source
    TriggerClientEvent('qadr_poster_creator:loadAllPosters', _source, savedPosters)
end)
