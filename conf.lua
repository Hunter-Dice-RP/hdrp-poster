qadr_settings = {
	defaultlang = "en", -- Sets the default language to English.
	translations = {}, -- Do not change check locales folder

	-- Valid board models and their offset configurations
	validBoards = {
		[GetHashKey("mp005_p_mp_bountyboard01x")] = {
			offset = 0.002 -- do not change
		},
		[GetHashKey("mp005_p_mp_bountyboard02x")] = {
			offset = 0.16 -- do not change
		}
	},

	-- Locations of poster boards in the game world
	posterBoards = {
		-- Valentine location
		{
			coords = vector3(-270.07, 807.2, 119.36), -- X, Y, Z coordinates
			rot = vector3(0, 0, 100),                 -- Rotation (pitch, roll, yaw)
			name = "Valentine Sheriff Office",        -- Location name
			boardmodel = "mp005_p_mp_bountyboard01x"  -- Model to use
		},
		-- Rhodes location
		{
			coords = vector3(1353.77, -1303.95, 76.05), -- X, Y, Z coordinates
			rot = vector3(0, 0, -20),                   -- Rotation (pitch, roll, yaw)
			name = "Rhodes Sheriff Office",             -- Location name
			boardmodel = "mp005_p_mp_bountyboard02x"    -- Model to use
		},
	}
}
