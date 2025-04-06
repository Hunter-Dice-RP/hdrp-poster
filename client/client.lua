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

-- Cleanup handler when resource stops
AddEventHandler('onResourceStop', function(resourceName) 
    if resourceName == GetCurrentResourceName() then
        -- Clean up prompts
        if tempPrompt then
            for k,l in pairs(tempPrompt)do
                PromptDelete(l)
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
    end
    exports["qadr_ui"]:allPosterClear()
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

-- Commands
RegisterCommand("posterCreator",function()
    local menuData = {
        type = "show",
        position = "right",
        menuData = {
            title = getlang("menu","title"),
            items = {
                {
                    type = "select",
                    label = getlang("menu","poster_type_select"),
                    value = "select",
                    options = {
                        { label = "Select", value = "select" },
                        { label = getlang("menu","poster_type_default"), value = exports["qadr_ui"]:getEmptyposterlike("Poster") or "Poster0" },
                        { label = getlang("menu","poster_type_legendary"), value = exports["qadr_ui"]:getEmptyposterlike("legendaryPoster") or "legendaryPoster1" },
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
                text = getlang("menu","footer")
            }
        }
    }
    showMenu(menuData)
end)

RegisterCommand("setlang", function(source, args)
    if args[1] then
        local success = setLanguage(args[1])
        if success then
            TriggerEvent("chat:addMessage", {
                color = {0, 255, 0},
                multiline = true,
                args = {"System", "Language changed to " .. args[1]}
            })
        else
            TriggerEvent("chat:addMessage", {
                color = {255, 0, 0},
                multiline = true,
                args = {"System", "Language " .. args[1] .. " not found."}
            })
        end
    else
        TriggerEvent("chat:addMessage", {
            color = {255, 255, 0},
            multiline = true,
            args = {"System", "Current language: " .. qadr_settings.defaultlang}
        })
    end
end)
