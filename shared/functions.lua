lib.locale()
local allobject = {}

-- Handles item interaction animations with props
-- @param inventoryitemname - Name or hash of the inventory item
-- @param propname - Name of the prop model to use
-- @param itemInteractionState - State of the interaction (e.g. "PrimaryItem")
-- @param interaction - Animation to play
-- @param beforeinteraction - Optional callback before interaction starts
-- @param afterinteraction - Optional callback after interaction starts
function taskiteminteraction(inventoryitemname,propname,itemInteractionState,interaction, beforeinteraction, afterinteraction)
	--"document_collector_map",qadr.mapModel,"PrimaryItem", "MP_DOCUMENT_INSPECT@Paper_W48-2_H32-2_FoldVerticalHorizontal_OUTRO"
	SetCurrentPedWeapon(PlayerPedId(), GetHashKey("WEAPON_UNARMED"), true)
	if type(interaction) ~= "number" then
		interaction = GetHashKey(interaction)
	end
	if type(inventoryitemname) ~= "number" then
		inventoryitemname = GetHashKey(inventoryitemname)
	end
	if type(itemInteractionState) ~= "number" then
		itemInteractionState = GetHashKey(itemInteractionState)
	end
    local coords = GetEntityCoords(PlayerPedId())
	--local prop = GetClosestObjectOfType(coords.x, coords.y, coords.z, 0.50,propname)

    local prop = nil
    local propModels = {
        "mp005_p_mp_bountyposter01x",
        "mp005_p_mp_bountyposter02x",
        "mp005_p_mp_bountyposter03x",
    }
    for k,v in pairs(propModels)do
        prop = GetClosestObjectOfType(coords.x, coords.y, coords.z, 0.50,v)
        if prop ~= 0 then
            break
        end
    end

    if prop == 0 then
        prop = objectcreator(propname, coords, true, true, true, true, true)
    end

	Wait(100)
	if beforeinteraction then
		beforeinteraction(prop)
	end
	--TaskItemInteraction_2(PlayerPedId(), GetHashKey("CONSUMABLE_COFFEE"), object, GetHashKey("P_MUGCOFFEE01X_PH_R_HAND"), GetHashKey("DRINK_COFFEE_HOLD"), 1, 0, -1082130432)
    TaskItemInteraction_2(PlayerPedId(), inventoryitemname, prop, itemInteractionState or GetHashKey("PrimaryItem"),interaction ,1,1,-1082130432)
	if afterinteraction then
		afterinteraction(prop)
	end
end

-- Creates an object/prop in the game world
-- @param ... - Variable arguments: model, coords, network flags and other settings
-- @return - Created object handle
function objectcreator(...)
	local data = {...}
	local _model = data[1]
	local _coords = data[2]

	local _network = data[3] or false
	local _bScriptHostObj = data[4] or false
	local _dynamic = data[5] or false
	local _p7 = data[6] or false
	local _p8 = data[7] or true

	if type(_coords) ~= "vector3" then
		_coords = vector3(data[2],data[3],data[4])
		_network = data[5] or false
		_bScriptHostObj = data[6] or false
		_dynamic = data[7] or false
		_p7 = data[8] or false
		_p8 = data[9] or true
	end
	if type(_model) == "string" then
		_model = GetHashKey(_model)
	end
	RequestModel(_model)
    while not HasModelLoaded(_model) do
        Wait(10)
    end
	local obje = CreateObject(_model,_coords,_network,_bScriptHostObj,_dynamic,_p7,_p8)
	table.insert(tempprop,obje)
	SetModelAsNoLongerNeeded(_model)

    return obje
end

-- Deep copies a table including metatables
-- @param orijinal - Original table to copy
-- @return - Deep copy of the table
function tabloKopyala(orijinal)
    local orijinal_turu = type(orijinal)
    local kopya
    if orijinal_turu == 'table' then
        kopya = {}
        for anahtar, deger in next, orijinal, nil do
            kopya[tabloKopyala(anahtar)] = tabloKopyala(deger)
        end
        setmetatable(kopya, tabloKopyala(getmetatable(orijinal)))
    else -- sayı, string, boolean, vb.
        kopya = orijinal
    end
    return kopya
end

-- Deep copies a table but removes function references
-- @param orijinal - Original table to copy
-- @return - Deep copy of table without functions
function functionRemoveCopyTable(orijinal)
    local orijinal_turu = type(orijinal)
    local kopya
    if orijinal_turu == 'table' then
        kopya = {}
        for anahtar, deger in next, orijinal, nil do
            kopya[functionRemoveCopyTable(anahtar)] = functionRemoveCopyTable(deger)
        end
        setmetatable(kopya, functionRemoveCopyTable(getmetatable(orijinal)))
	elseif orijinal_turu == 'function' then

		kopya = nil
    else -- sayı, string, boolean, vb.
        kopya = orijinal
    end
    return kopya
end

-- Creates an interaction prompt in the game UI
-- @param _str - Prompt text to display
-- @param button - Button or table of buttons to trigger prompt
-- @param holdmode - Whether prompt requires holding button
-- @param group - Optional group for the prompt
-- @return - Created prompt handle
function promptCreator(_str,button,holdmode,group)
	local promptr = PromptRegisterBegin()
	if type(button) == "table" then
		for k,l in pairs(button)do
			PromptSetControlAction(promptr, l)
		end
	else
		PromptSetControlAction(promptr, button)
	end
	local str = CreateVarString(10, 'LITERAL_STRING', _str)
	PromptSetText(promptr, str)
	--PromptSetUrgentPulsingEnabled(promptr,true)
	PromptSetEnabled(promptr, true)
	PromptSetVisible(promptr, true)
	--PromptSetPriority(promptr, 3)
	--PromptSetPriority(promptr, 0)
    --PromptSetAttribute(promptr,13, true)
	PromptSetStandardMode(promptr, true)
	local mode = true
	if holdmode ~= nil then
		mode = holdmode
		if mode == false then
			PromptSetStandardMode(promptr, not mode)
			PromptSetEnabled(promptr, not mode)
		else
			PromptSetHoldMode(promptr, mode)
			PromptSetEnabled(promptr, mode)
		end
	else
		PromptSetHoldMode(promptr, mode)
		PromptSetEnabled(promptr, true)
	end

    if group then
        PromptSetGroup(promptr, group, 0)
    else
        PromptSetPosition(promptr,0,0,0)
    end
	PromptRegisterEnd(promptr)
	--table.insert(tempPrompt,promptr)
    tempPrompt[promptr] = promptr
	return promptr
end

-- Shorthand for Citizen.InvokeNative
-- @param ... - Arguments to pass to InvokeNative
-- @return - Result from native call
function cin(...)
    return Citizen.InvokeNative(...)
end

-- Displays a menu with the provided data
-- @param data - Table containing menu configuration and items
function showMenu(data)
    local menuData = functionRemoveCopyTable(data)
    menuData.menuData.name = "posterCreator_" .. menuData.menuData.title
    allMenuDatas[menuData.menuData.name] = data
    SendNUIMessage(menuData)
    SetNuiFocus(true, false)
end


------------------
-- add for delete qadr_ui
function createPosterInUI(posterData)
    -- Aquí puedes implementar cómo agregar el poster a la UI.
    -- Podría ser crear un elemento visual en la pantalla con los datos del poster.
    print("Creando poster con datos:", posterData)
    -- Tu lógica para agregar el poster
end

local function createPosterEntity(model, coords, rotation)
    local entity = objectcreator(model, coords, false, false, true, false, true)
    SetEntityRotation(entity, rotation.x, rotation.y, rotation.z, 2, true)
    return entity
end

function removePosterFromUI(posterid)
    -- Aquí puedes implementar cómo eliminar el poster de la UI.
    -- Podría ser algo como ocultar el poster o eliminarlo de una lista de UI.
    print("Eliminando poster con ID:", posterid)
    -- Tu lógica para eliminar el poster
end

local function removePosterEntity(entity)
    if DoesEntityExist(entity) then
        DeleteEntity(entity)
    end
end
------------------

-- Shows a submenu for poster configuration
-- @param data - Table containing menu configuration
-- @param posterId - String identifier for the poster
function showSubMenu(data, posterId)
    local menuData = {
        type = "show",
        position = "right",
        menuData = {
            title = locale("menu_title"),
            items = {
                {
                    type = "checkbox",
                    label = locale("menu_labels_visible"),
                    checked = false,
                    data = { action = "isVisible" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.checked
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_header"),
                    value = "",
                    data = { action = "header" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_price"),
                    value = "",
                    data = { action = "price" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_texture_dict"),
                    value = "bounty_target_01",
                    data = { action = "txd" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_texture"),
                    value = "bounty_target_01",
                    data = { action = "tex" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_name"),
                    value = "",
                    data = { action = "name" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "input",
                    label = locale("menu_labels_body"),
                    value = "",
                    data = { action = "body" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = data.value
                        }
                        updatePoster(updateData,posterId)
                    end
                },
                {
                    type = "select",
                    label = locale("menu_labels_type"),
                    value = 1,
                    options = {
                        { label = locale("menu_types_type1"), value = 1 },
                        { label = locale("menu_types_type2"), value = 2 },
                        { label = locale("menu_types_type3"), value = 3 },
                        { label = locale("menu_types_type4"), value = 4 },
                        { label = locale("menu_types_type5"), value = 5 },
                    },
                    data = { action = "type" },
                    callback = function(data)
                        local updateData = {
                            [data.data.action] = tonumber(data.value)
                        }
                        updatePoster(updateData,posterId)
                    end
                },
            },
            submitText = locale("menu_submit"),
            footer = {
                text = locale("menu_footer")
            },
            submitFunction = function(itemData,formData)
                local posterentity = itemData.menuData.posterentity
                local posterData = {
                    posterType = itemData.menuData.posterType or "Poster",
                    isVisible = formData.isVisible or false,
                    header = formData.header or nil,
                    body = formData.body or nil,
                    name = formData.name or nil,
                    txd = formData.txd or nil,
                    tex = formData.tex or nil,
                    price = formData.price or nil,
                    type = formData.type or nil,
                    setDifficulty = formData.setDifficulty or nil,
                    coords = GetEntityCoords(posterentity),
                    rot = GetEntityRotation(posterentity)
                }
                removePosterFromUI(itemData.menuData.availablemodel) -- exports["qadr_ui"]:removePoster(itemData.menuData.availablemodel)
                TriggerServerEvent('qadr_poster_creator:savePoster', posterData)
                ClearPedTasks(PlayerPedId())
                DeleteEntity(posterentity)
            end,
            cancelFunction = function(itemData)
                local posterentity = itemData.menuData.posterentity
                if clearTempCam then
                    clearTempCam()
                end
                if posterentity then
                    DeleteEntity(posterentity)
                    removePosterFromUI(itemData.menuData.availablemodel) -- exports["qadr_ui"]:removePoster(itemData.menuData.availablemodel)
                end
            end
        }
    }
    if string.find(posterId, "legendaryPoster") then
        menuData.menuData.items =  {
            {
                type = "checkbox",
                label = locale("menu_labels_visible"),
                checked = false,
                data = { action = "isVisible" },
                callback = function(data)
                    local updateData = {
                        [data.data.action] = data.checked
                    }
                    updatePoster(updateData,posterId)
                end
            },
            {
                type = "input",
                label = locale("menu_labels_texture_dict"),
                value = "bounty_target_01",
                data = { action = "txd" },
                callback = function(data)
                    local updateData = {
                        [data.data.action] = data.value
                    }
                    updatePoster(updateData,posterId)
                end
            },
            {
                type = "input",
                label = locale("menu_labels_texture"),
                value = "bounty_target_01",
                data = { action = "tex" },
                callback = function(data)
                    local updateData = {
                        [data.data.action] = data.value
                    }
                    updatePoster(updateData,posterId)
                end
            },
            {
                type = "select",
                label = locale("menu_labels_difficulty"),
                value = 1,
                options = {
                    { label = "1", value = 1 },
                    { label = "2", value = 2 },
                    { label = "3", value = 3 },
                    { label = "4", value = 4 },
                    { label = "5", value = 5 },
                },
                data = { action = "setDifficulty" },
                callback = function(data)
                    local updateData = {
                        [data.data.action] = tonumber(data.value)
                    }
                    updatePoster(updateData,posterId)
                end
            },
        }
    end
    if string.find(posterId, "advertPoster") then
        menuData.menuData.items = {
            {
                type = "checkbox",
                label = locale("menu_labels_visible"),
                checked = false,
                data = { action = "isVisible" },
                callback = function(data)
                    local updateData = {
                        [data.data.action] = data.checked
                    }
                    updatePoster(updateData,posterId)
                end
            },
        }        
    end
    local yerlestimi, posterentity,availablemodel, poster = posterCreator(data)
    if yerlestimi then
        -- posterId değerinin sonundaki sayıyı sil        
        menuData.menuData.posterType = string.gsub(posterId, "%d$", "")
        menuData.menuData.posterentity = posterentity
        menuData.menuData.availablemodel = availablemodel
        showMenu(menuData)
    else
        if clearTempCam then
            clearTempCam()
        end
    end
end

local activePosters = {}

function getAvailablePosterType(baseType)
    if baseType == "Poster" or baseType == "legendaryPoster" then
        for posterId, isUsed in pairs(activePosters[baseType]) do
            if not isUsed then
                return posterId
            end
        end
    end
    return nil -- todos en uso
end

function markPosterUsed(posterId)
    if string.find(posterId, "Poster") then
        for group, posters in pairs(activePosters) do
            if posters[posterId] ~= nil then
                activePosters[group][posterId] = true
            end
        end
    end
end

local posters = {}

function createPoster(posterData)
    local posterId = posterData.posterid
    if posters[posterId] then
        return posters[posterId], "alreadyActive"
    end

    posters[posterId] = {
        data = posterData,
        update = function(self, newData)
            for k, v in pairs(newData) do
                self.data[k] = v
            end
        end
    }

    markPosterUsed(posterId)

    return posters[posterId], "created"
end

-- Creates a poster entity in the game world
-- @param data - Table containing poster configuration
-- @param withAnim - Boolean to determine if animation should be played
-- @return boolean, entity, string, object - Success status, poster entity, model name, poster object
function posterCreator(data, withAnim)
    local anim = "DOCUMENT_INSPECT@Paper_W48-2_H32-2_FoldVerticalHorizontal_INTRO"
    local yerlestimi = false
    local posterObj = nil
    local usableModels = {
        advertPoster2   = { model = "mp005_p_mp_bountyposter01x" },
        legendaryPoster0 = { model = "mp005_p_mp_bountyposter01x" },
        legendaryPoster1 = { model = "mp005_p_mp_bountyposter02x" },
        legendaryPoster2 = { model = "mp005_p_mp_bountyposter03x" },
        Poster0         = { model = "mp005_p_mp_bountyposter01x" },
        Poster1         = { model = "mp005_p_mp_bountyposter02x" },
        Poster2         = { model = "mp005_p_mp_bountyposter03x" },
    }
    local availablemodel = getAvailablePosterType(string.gsub(data.value, "%d$", ""))-- exports["qadr_ui"]:getEmptyposterlike(string.gsub(data.value, "%d$", ""))
    if availablemodel == nil then
        TriggerEvent('redem_roleplay:Tip', locale("errors_max_posters"), 5000)
        return false
    end
    local model = usableModels[availablemodel].model or "mp005_p_mp_bountyposter01x"
    if withAnim then
        taskiteminteraction("document_collector_map",model,"PrimaryItem", anim,
        function(entity)
            modelnet = ObjToNet(entity)
            SetNetworkIdExistsOnAllMachines(qadr_map_map_net, true)
        end,
        function(entity)
            Wait(3000)
            --Pcall(clearMap)
        end)
    else
        -- objeyi kendimiz oluşturup kamerayı objeye attach edelim
        RequestModel(GetHashKey(model))
        while not HasModelLoaded(GetHashKey(model)) do
            Wait(10)
        end
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        local playerHeading = GetEntityHeading(ped)
        -- Poster'ı oyuncunun önünde oluştur
        local angle = math.rad(playerHeading)
        local posterPos = vector3(
            coords.x + math.cos(angle) * 1.0,
            coords.y + math.sin(angle) * 1.0,
            coords.z + 0.5
        )
        -- Create poster object
        posterObj = CreateObject(GetHashKey(model), posterPos.x, posterPos.y, posterPos.z, true, true, true) -- objectcreator(model, posterPos, true, true, true, true, true)
        
        yerlestimi = posterPlacer(posterObj)
        if yerlestimi then
            local cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
            table.insert(tempCam, cam)
            SetCamActive(cam, true)
            RenderScriptCams(true, true, 500, true, true)

            AttachCamToEntity(cam, posterObj, 0.0, 0.38, 0.30, true)
            local posterRotation = GetEntityRotation(posterObj)

            SetCamRot(cam, -5.6, 0.0, posterRotation.z + 180.0, 2)

            local posterData = {
                isVisible = false,
                isDiffVisible = false,
                header = "",
                price = "",
                tex = "",
                txd = "",
                type = 1,
                setDifficulty = 1,
                name = "",
                body = "",
                posterid = availablemodel or "Poster0"
            }
            local poster,status = createPoster(posterData) -- exports["qadr_ui"]:createPoster(posterData)
            if status =="alreadyActive" then
                poster:update(posterData)
            end
        else
            DeleteEntity(posterObj)
            posterObj = nil
            cam = nil
        end
        function clearTempCam()
            RenderScriptCams(false, true, 1000, true, true)
            for _, cam in ipairs(tempCam) do
                if DoesCamExist(cam) then
                    DestroyCam(cam, false)
                end
            end
            tempCam = {}
        end
    end
    return yerlestimi, posterObj, availablemodel, poster
end
-- Updates properties of an existing poster
-- @param data - Table containing the properties to update (e.g., {isVisible = true})
-- @param posterId - String identifier of the poster to update (e.g., "Poster0", "legendaryPoster1")
function updatePoster(data,posterId)
    local poster,status = createPoster({posterid = posterId}) -- exports["qadr_ui"]:createPoster({posterid = posterId})
    if poster and status =="alreadyActive" then
        poster:update(data)
    end
end

-- Processes callbacks for menu items based on user interaction
-- @param {table} itemData - Data object containing menu item information
--   @param {string} itemData.name - Menu name identifier
--   @param {number} itemData.index - Zero-based index of the selected menu item
--   @param {any} itemData.value - Selected/input value from the menu item
function allCallBackRunner(itemData)
    if not itemData then
        return
    end
    if not itemData.name then
        return
    end
    if not allMenuDatas[itemData.name] then
        return
    end
    if not allMenuDatas[itemData.name].menuData then
        return
    end
    if not allMenuDatas[itemData.name].menuData.items then
        return
    end
    local itemIndex = itemData.index
    if type(itemIndex) ~= "number" then
        return
    end
    local adjustedIndex = itemIndex + 1
    if not allMenuDatas[itemData.name].menuData.items[adjustedIndex] then
        return
    end
    local selectedItem = allMenuDatas[itemData.name].menuData.items[adjustedIndex]
    selectedItem.selectedItem = itemData.value
    if selectedItem and selectedItem.callback then
        selectedItem.callback(itemData)
    end
end

-- Calculates coordinates in 3D space based on camera rotation and distance
-- @param {number} distance - Distance from camera position
-- @param {table} coords - Camera position coordinates [x, y, z]
-- @return {vector3} - Calculated coordinates in 3D space
function GetCoordsFromCam(distance, coords)
    local rx, ry, rz = table.unpack(GetGameplayCamRot())
    local rad = math.pi / 180
    local radX, radZ = rx * rad, rz * rad
    local cosX = math.abs(math.cos(radX))
    local dirX = -math.sin(radZ) * cosX
    local dirY = math.cos(radZ) * cosX
    local dirZ = math.sin(radX)
    return vector3(
        coords[1] + dirX * distance,
        coords[2] + dirY * distance,
        coords[3] + dirZ * distance
    )
end

-- Gets coordinates and entity information from the player's camera view
-- @return tuple - Returns multiple values: success, hit status, coordinates, surface normal, and entity hit
function GetInView()
    local Cam = GetGameplayCamCoord()
    local handle = Citizen.InvokeNative(0x377906D8A31E5586, Cam, GetCoordsFromCam(10.0, Cam), -1, PlayerPedId(), 4)
    local _, Hit, Coords, _, Entity = GetShapeTestResult(handle)
    return _, Hit, Coords, _, Entity
end

-- Handles the placement of a poster in the game world
-- Allows player to position and rotate poster on valid surfaces
-- @param poster - The poster entity to be placed
-- @return boolean - Returns true if poster was successfully placed, false if cancelled
function posterPlacer(poster)
    -- Disable collision while placing
    SetEntityCollision(poster, false, false)
    -- Create interaction prompts
    local hangPoster = promptCreator(locale("prompts_pin"), 0xCEE12B50, false)
    local esc = promptCreator(locale("prompts_cancel"), 0x8E90C7BB, false)

    local rotdiff = 10.0
    local rtn = false

    while true do
        Wait(1)
        rtn = true

        -- Get raycast information from camera view
        local first, Hit, spawnPos, second, entity = GetInView()
        local boraddatas = Config.validBoards[GetEntityModel(entity)]

        -- Check if hit valid surface
        if Hit and (entity ~= poster or entity ~= PlayerPedId()) and boraddatas then
            -- Calculate poster position with offset from wall
            local offsetDistance = boraddatas.offset or 0.13
            local posterPos = vector3(
                spawnPos.x - (first.x * offsetDistance),
                spawnPos.y - (first.y * offsetDistance),
                spawnPos.z
            )

            -- Update poster position and rotation
            SetEntityCoordsNoOffset(poster, posterPos.x, posterPos.y, posterPos.z, true, true, true)
            local angle = math.atan2(first.y, first.x)
            local rotation = (math.deg(angle) - 90) % 360
            SetEntityHeading(poster, rotation)

            -- Check for confirmation or cancellation
            if PromptIsReleased(hangPoster) then
                break
            end
            if PromptIsReleased(esc) then
                rtn = false
                break
            end
        end
    end

    -- Clean up prompts and restore collision
    PromptDelete(hangPoster)
    PromptDelete(esc)
    SetEntityCollision(poster, true, true)

    return rtn
end

-- Closes the menu interface and cleans up camera
-- Disables NUI focus and sends close message to UI
function closeMenu()
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = "closeMenu"
    })
    if clearTempCam then
        clearTempCam()
    end
end
-- Takes the closest poster or a specific poster entity and plays pickup animation
-- @param {Entity} entity - Optional specific poster entity to take. If not provided, finds closest poster
function takeClosestPoster(entity)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local rot = GetEntityRotation(ped)
    local propModels = {
        "mp005_p_mp_bountyposter01x",
        "mp005_p_mp_bountyposter02x",
        "mp005_p_mp_bountyposter03x",
    }
    local animDict = "mech_inventory@document@world_player_inspect_poster_vertical@144cm@paper@w32-2_h45-2_foldverticalhorizontal"
    local playerAnim = "base"
    local propAnim = "base_prop"
    RequestAnimDict(animDict)
    while not HasAnimDictLoaded(animDict) do
        Wait(10)
    end
    local prop = nil
    for k,v in pairs(propModels)do
        prop = entity or GetClosestObjectOfType(coords.x, coords.y, coords.z, 1.20,v)
        if prop ~= 0 then
            AttachEntityToEntity(prop, ped, GetEntityBoneIndexByName(ped, "SKEL_R_Hand"), 
                -0.1, -0.13, -0.20,
                -45.0, 90.0, 0.0,    -- Rotasyon
                true, true, false, true, 1, true)
            TaskPlayAnim(ped, animDict, playerAnim, 1.0, 1.0, -1, 2, 0, true, 0, false, 0, false)
            PlayEntityAnim(prop, propAnim, animDict, 0.0, false, true, true, 0.0, 0)
            RemoveAnimDict(animDict)
            Wait(1000)
            ClearPedTasks(ped)
            Wait(100)
            cin(0x786591D986DE9159, prop, propAnim, animDict)

            local anim = "DOCUMENT_INSPECT@Paper_W32-2_H48-2_FoldVerticalHorizontal_BASE"
            local model = "mp005_p_mp_bountyposter01x"
            taskiteminteraction("document_collector_map",model,"PrimaryItem", anim,
            function(entity)
                modelnet = ObjToNet(entity)
                SetNetworkIdExistsOnAllMachines(qadr_map_map_net, true)
            end,
            function(entity)
                Wait(3000)
                --Pcall(clearMap)
            end)
            break
        end
    end
end

-- Creates and manages poster board entities in the game world
-- Finds the closest board to player and spawns/maintains its entity
function bountyBoardCreator()
    -- Find closest board by checking distance to all configured boards
    for k,l in pairs(Config.posterBoards)do
        local distance = #(playerCoords - l.coords)
        if distance < minDistance then
            closestBoard = l
            break
        else
            closestBoard = nil
        end
    end

    -- If a close board was found, ensure its entity exists
    if closestBoard then
        -- Try to find existing board entity at location
        closestBoard.entity = GetClosestObjectOfType(closestBoard.coords.x, closestBoard.coords.y, closestBoard.coords.z, 2.50,closestBoard.boardmodel)

        -- If no entity exists, create new board
        if closestBoard.entity == 0 then
            -- Create board object with specified model and position
            closestBoard.entity = objectcreator(closestBoard.boardmodel, closestBoard.coords, false, false, true, false, true)
            -- Set board rotation
            SetEntityRotation(closestBoard.entity, closestBoard.rot.x, closestBoard.rot.y, closestBoard.rot.z, 2, true)
        end
    end
end

-- Manages the creation, deletion and interaction of bounty posters in the game world
-- Handles poster entity lifecycle based on player proximity and interaction
function bountyPosterCreator()
    -- Remove posters that are far from player
    for k,l in pairs(activePosters) do
        if l.entity and DoesEntityExist(l.entity) then
            local distance = #(playerCoords - vector3(l.location.coords.x, l.location.coords.y, l.location.coords.z))
            if distance > minDistance then
                DeleteEntity(l.entity)
                l.entity = nil
                l.asildi = false
                removePosterFromUI(l.posterid)  --exports["qadr_ui"]:removePoster(l.posterid)
            end
        end
    end

    -- Create or update nearby posters
    for k,l in pairs(activePosters) do
        local distance = #(playerCoords - vector3(l.location.coords.x, l.location.coords.y, l.location.coords.z))

        if distance < minDistance and not l.asildi then
            closestPoster = l
            -- Define available poster models for different poster types
            local usableModels = {
                advertPoster2   = { model = "mp005_p_mp_bountyposter01x" },
                legendaryPoster0 = { model = "mp005_p_mp_bountyposter01x" },
                legendaryPoster1 = { model = "mp005_p_mp_bountyposter02x" },
                legendaryPoster2 = { model = "mp005_p_mp_bountyposter03x" },
                Poster0         = { model = "mp005_p_mp_bountyposter01x" },
                Poster1         = { model = "mp005_p_mp_bountyposter02x" },
                Poster2         = { model = "mp005_p_mp_bountyposter03x" },
            }
            -- Get available poster type from UI system
            local postertip = getAvailablePosterType(closestPoster.data.posterType) -- exports["qadr_ui"]:getEmptyposterlike(closestPoster.data.posterType)
            l.posterid = postertip
            if not postertip then return end

            local model = usableModels[postertip].model
            -- Initialize entity reference
            closestPoster.entity = 0

            -- Create new poster entity if none exists
            if closestPoster.entity == 0 then
                -- Create and position the poster object
                closestPoster.entity = objectcreator(model, vector3(l.location.coords.x, l.location.coords.y, l.location.coords.z), false, false, true, false, true)
                SetEntityRotation(closestPoster.entity, closestPoster.location.rot.x, closestPoster.location.rot.y, closestPoster.location.rot.z, 2, true)
                -- Configure poster data
                local posterData = {
                    isVisible = true,
                    header = closestPoster.data.header or nil,
                    price = closestPoster.data.price or nil,
                    tex = closestPoster.data.tex  or nil,
                    txd = closestPoster.data.txd  or nil,
                    type = tonumber(closestPoster.data.type) or nil,
                    setDifficulty = tonumber(closestPoster.data.setDifficulty) or 1,
                    name = closestPoster.data.name or nil,
                    body = closestPoster.data.body or nil,
                    posterid = postertip
                }
                -- Create poster in UI system
                local poster, status = createPoster(posterData) -- exports["qadr_ui"]:createPoster(posterData)
                l.asildi = true
                Wait(200)

                if Config.EnableTarget and not l.targetAdded then
                    exports.ox_target:addLocalEntity(l.entity, {
                        {
                            name = 'obj_poster_take',
                            icon = 'far fa-eye',
                            label = locale("prompts_take_poster"),
                            onSelect = function(entity)
                                takeClosestPoster(entity)
                            end,
                            distance = 3.0
                        }
                    })
                    l.targetAdded = true
                end

            end
        -- Handle interaction when player is within prompt distance
        elseif distance < promptDistance and DoesEntityExist(l.entity) then
            if not Config.EnableTarget then
                cin(0x7DFB49BCDB73089A,l.entity,1)

                local takePoster = promptCreator(locale("prompts_take_poster"),0xCEFD9220,false)
                while distance < promptDistance and DoesEntityExist(l.entity) do
                    Wait(0)
                    distance = #(playerCoords - vector3(l.location.coords.x, l.location.coords.y, playerCoords.z))
                    if distance > promptDistance then
                        break
                    end
                    if PromptIsReleased(takePoster) then
                        cin(0x7DFB49BCDB73089A,l.entity,0)
                        takeClosestPoster(l.entity)
                        break
                    end
                end
                cin(0x7DFB49BCDB73089A,l.entity,0)
                PromptDelete(takePoster)
            end
        -- Clean up poster if entity no longer exists
        elseif distance < minDistance and l.asildi and not DoesEntityExist(l.entity) then
            l.asildi = false
            removePosterFromUI(l.posterid)  --exports["qadr_ui"]:removePoster(l.posterid)
            l.entity = nil
            l.targetAdded = false
        end
    end
end