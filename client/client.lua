lib.locale()
-- Global state variables
tempPrompt = {}       -- Stores temporary prompts
tempprop = {}         -- Stores temporary props
allMenuDatas = {}     -- Stores all menu data
tempCam = {}          -- Stores temporary cameras
activePosters = {}    -- Stores active posters
posterProps = {}      -- Stores poster props
posterBoardBlips = {} -- Stores poster board blips
playerCoords = GetEntityCoords(PlayerPedId()) or vector3(0.0,0.0,0.0) -- Current player coordinates
minDistance = 10.0    -- Minimum interaction distance
promptDistance = 0.5  -- Distance for prompt activation
closestBoard = nil    -- Reference to nearest board
closestPoster = nil   -- Reference to nearest poster

function allPosterClear()
    -- Elimina los poster props
    if posterProps then
        for _, prop in pairs(posterProps) do
            if DoesEntityExist(prop) then
                DeleteEntity(prop)
            end
        end
    end
    posterProps = {}

    -- Elimina los blips de los tableros
    if posterBoardBlips then
        for _, blip in pairs(posterBoardBlips) do
            RemoveBlip(blip)
        end
    end
    posterBoardBlips = {}

    -- Limpia la lista de posters activos
    activePosters = {}

    -- También podrías resetear estos si están en uso visual:
    closestBoard = nil
    closestPoster = nil
end


-- Cleanup handler when resource stops
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if not Config.EnableTarget then
        -- Clean up prompts
        if tempPrompt then
            for k,l in pairs(tempPrompt)do
                PromptDelete(l)
            end
        end
    end
    -- Clean up props
    if tempprop then
        for k,l in pairs(tempprop)do
            DeleteEntity(l)
        end
    end
    -- Clean up blips
    if posterBoardBlips then
        for _, blip in pairs(posterBoardBlips) do
            RemoveBlip(blip)
        end
    end

    allPosterClear() -- exports["qadr_ui"]:allPosterClear()
end)

-- NUI Callback handlers
RegisterNUICallback("menuItemClicked", function(itemData,cb)
    cb('ok')
end)

RegisterNUICallback("checkboxToggled", function(itemData,cb)
    allCallBackRunner(itemData)
    cb('ok')
end)

RegisterNUICallback("menuInputChanged", function(itemData,cb)
    allCallBackRunner(itemData)
    cb('ok')
end)

RegisterNUICallback('closeMenu', function(data, cb)
    if allMenuDatas[data.name] and allMenuDatas[data.name].menuData and allMenuDatas[data.name].menuData.cancelFunction then
        allMenuDatas[data.name].menuData.cancelFunction(allMenuDatas[data.name])
    end
    closeMenu()
    cb('ok')
end)

RegisterNUICallback("submitFormData", function(data,cb)
    if allMenuDatas[data.name] and allMenuDatas[data.name].menuData and allMenuDatas[data.name].menuData.submitFunction then
        allMenuDatas[data.name].menuData.submitFunction(allMenuDatas[data.name],data.formData)
    end
    closeMenu()
    cb('ok')
end)

RegisterNUICallback("selectOptionChanged", function(itemData,cb)
    allCallBackRunner(itemData)
    cb('ok')
end)

-- Event handlers
RegisterNetEvent('qadr_poster_creator:notification')
AddEventHandler('qadr_poster_creator:notification', function(message)
    TriggerEvent('redem_roleplay:Tip', message, 5000)
end) 

RegisterNetEvent('qadr_poster_creator:loadAllPosters')
AddEventHandler('qadr_poster_creator:loadAllPosters', function(posters)
    activePosters = posters
end)

RegisterNetEvent('qadr_poster_creator:newPosterCreated')
AddEventHandler('qadr_poster_creator:newPosterCreated', function(posterData)
    table.insert(activePosters, posterData)
end)

-- Initial poster data request
TriggerServerEvent('qadr_poster_creator:requestAllPosters')

-- Main game loops
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)
        bountyBoardCreator()
        bountyPosterCreator()
    end
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)
        playerCoords = GetEntityCoords(PlayerPedId())
    end
end)

------------------------
-- add values change qadr_ui
function getAvailablePosterType(type)
    local posterTypes = {
        Poster = { "Poster0", "Poster1", "Poster2", "advertPoster2" },
        legendaryPoster = { "legendaryPoster0", "legendaryPoster1", "legendaryPoster2" },
    }

    for _, poster in ipairs(posterTypes[type] or {}) do
        local isUsed = false
        for _, active in ipairs(activePosters) do
            if active.posterid == poster then
                isUsed = true
                break
            end
        end
        if not isUsed then
            return poster
        end
    end
    return nil
end


-----------------------

-- Commands
RegisterCommand("posterCreator",function()
    local menuData = {
        type = "show",
        position = "right",
        menuData = {
            title = locale("menu_title"),
            items = {
                {
                    type = "select",
                    label = locale("menu_poster_type_select"),
                    value = "select",
                    options = {
                        { label = "Select", value = "select" },
                        { label = locale("menu_poster_type_default"), value = getAvailablePosterType("Poster") or "Poster0" }, -- exports["qadr_ui"]:getEmptyposterlike("Poster") or "Poster0" },
                        { label = locale("menu_poster_type_legendary"), value = getAvailablePosterType("legendaryPoster") or "legendaryPoster1" }, -- exports["qadr_ui"]:getEmptyposterlike("legendaryPoster") or "legendaryPoster1" },
                    },
                    data = { action = "setPosterId" },
                    callback = function(data)
                        local posterID = nil
                        if allMenuDatas[data.name] and allMenuDatas[data.name].menuData and allMenuDatas[data.name].menuData.items and allMenuDatas[data.name].menuData.items[1] then
                            posterID = allMenuDatas[data.name].menuData.items[1].selectedItem
                        end
                        if not posterID or posterID == "select" then
                            return
                        end
                        closeMenu()
                        showSubMenu(data,posterID)
                    end
                }
            },
            footer = {
                text = locale("menu_footer")
            }
        }
    }
    showMenu(menuData)
end, false)
