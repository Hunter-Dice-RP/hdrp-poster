-- Import RSGCore framework
local RSGCore = exports['rsg-core']:GetCoreObject()
lib.locale()

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
    local src = source
    local Player = RSGCore.Functions.GetPlayer(src)
    if not Player then return end

    -- Get player info
    local name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname
    local citizenid = Player.PlayerData.citizenid -- Player.GetIdentifier()
    local posterId = #savedPosters + 1

    -- Create poster object
    local poster = {
        id = posterId,
        data = posterData,
        creator = {
            name = name,
            identifier = citizenid
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

    local discordMessage = string.format(
        locale('sv_log_c')..":** %s \n**"
        ..locale('sv_log_d')..":** %d \n**"
        ..locale('sv_log_e')..":** %s %s \n**"
        ..locale('sv_log_f')..":** %s \n**"
        ..locale('sv_log_g')..":** %s **",
        Player.PlayerData.citizenid,
        Player.PlayerData.cid,
        Player.PlayerData.charinfo.firstname,
        Player.PlayerData.charinfo.lastname,
        posterId,
        json.encode(posterData)
    )

    TriggerEvent('rsg-log:server:CreateLog', Config.WebhookName, Config.WebhookTitle, Config.WebhookColour, discordMessage, false)

    TriggerClientEvent('ox_lib:notify', src, {title = locale('menu_poster_created'), type = 'info', duration = 5000 })
    -- TriggerClientEvent('qadr_poster_creator:notification', src, getlang("menu","poster_created"))
end)

-- Send all posters to player when they join
AddEventHandler("RSGCore:Server:PlayerLoaded",function(source, user)
    local src = source
    TriggerClientEvent('qadr_poster_creator:loadAllPosters', src, savedPosters)
end)

-- Handle client requests for all posters
RegisterServerEvent('qadr_poster_creator:requestAllPosters')
AddEventHandler('qadr_poster_creator:requestAllPosters', function()
    local src = source
    TriggerClientEvent('qadr_poster_creator:loadAllPosters', src, savedPosters)
end)
