# QADR Poster Creator

A comprehensive poster creation system for RedM, allowing players to create and customize posters in-game.

## Important Notice

This resource requires the QADR UI framework to function. QADR UI is a paid resource that can be purchased separately:
- Forum Topic: [QADR UI on CFX Forum](https://forum.cfx.re/t/paid-qadr-ui-standalone/4872625)
- Purchase: [QADR UI on Tebex](https://west-world.tebex.io/package/5165474)

## Features

- Create both standard and legendary posters
- Customizable poster content including name, description, reward, and more
- User-friendly interface with RDR2-style menu system
- Support for multiple languages through localization system
- Seamless integration with RedM environment
- Configurable poster board locations throughout the map

## Dependencies
- [QADR UI Framework](https://west-world.tebex.io/package/5165474) (Required)

## Installation

1. Purchase and install QADR UI from the [Tebex store](https://west-world.tebex.io/package/5165474)
2. Download the latest release of QADR Poster Creator
3. Extract the `qadr_poster_creator` folder to your server's resources directory
4. Add the following to your server.cfg file:
```lua
ensure qadr_ui
ensure qadr_poster_creator
```
5. Restart your server

## Usage

1. In-game, use the command `/posterCreator` to open the poster creation menu
2. Select the type of poster you want to create (Default or Legendary)
3. Fill in the details for your poster including target name, description, and reward
4. Submit the form to create your poster

## Configuration

To add additional languages, create new language files in the `locales` folder following the format of `en.json`.

### Poster Board Locations

You can configure poster board locations in `conf.lua`. Each board location requires coordinates, rotation, name, and board model:

```lua
posterBoards = {
    -- Valentine
    {
        coords = vector3(-270.07, 807.2, 119.36),
        rot = vector3(0, 0, 100),
        name = "Valentine Sheriff Office",
        boardmodel = "mp005_p_mp_bountyboard01x"
    },
    -- Rhodes
    {
        coords = vector3(1353.77, -1303.95, 76.05),
        rot = vector3(0, 0, -20),
        name = "Rhodes Sheriff Office",
        boardmodel = "mp005_p_mp_bountyboard02x"
    },
    -- Add more locations as needed
}
```

Each poster board configuration includes:
- `coords`: The position where the board will spawn (vector3)
- `rot`: The rotation of the board (vector3)
- `name`: Location identifier
- `boardmodel`: The model to use for the board

## Available Poster Textures

### Default Posters
- bounty_target_02, bounty_target_02
- bounty_target_03, bounty_target_03
- bounty_target_04, bounty_target_04
- bounty_target_05, bounty_target_05
- bounty_target_06, bounty_target_06
- bounty_target_07, bounty_target_07
- bounty_target_08, bounty_target_08
- bounty_target_09, bounty_target_09
- bounty_target_10, bounty_target_10
- bounty_target_11, bounty_target_11
- bounty_target_12, bounty_target_12
- bounty_target_13, bounty_target_13
- bounty_target_14, bounty_target_14
- bounty_target_15, bounty_target_15
- bounty_target_16, bounty_target_16
- bounty_target_17, bounty_target_17
- bounty_target_18, bounty_target_18
- bounty_target_19, bounty_target_19
- bounty_target_20, bounty_target_20
- bounty_target_21, bounty_target_21
- bounty_target_22, bounty_target_22
- bounty_target_23, bounty_target_23
- bounty_target_24, bounty_target_24
- bounty_target_25, bounty_target_25
- bounty_target_26, bounty_target_26
- bounty_target_27, bounty_target_27
- bounty_target_28, bounty_target_28
- bounty_target_29, bounty_target_29
- bounty_target_30, bounty_target_30
- bounty_target_31, bounty_target_31
- bounty_target_32, bounty_target_32
- bounty_target_33, bounty_target_33
- bounty_target_34, bounty_target_34
- bounty_target_35, bounty_target_35
- bounty_target_36, bounty_target_36
- bounty_target_37, bounty_target_37
- bounty_target_38, bounty_target_38
- bounty_target_39, bounty_target_39
- bounty_target_40, bounty_target_40

### Location-Based Default Posters
- bounty_target_set_annesburg_[0-3]
- bounty_target_set_armadillo_[0-3]
- bounty_target_set_benedicts_point_[0-3]
- bounty_target_set_blackwater_[0-3]
- bounty_target_set_emerald_ranch_[0-3]
- bounty_target_set_rhodes_[0-3]
- bounty_target_set_riggs_station_[0-3]
- bounty_target_set_saint_dennis_[0-3]
- bounty_target_set_strawberry_[0-3]
- bounty_target_set_tumbleweed_[0-3]
- bounty_target_set_valentine_[0-3]
- bounty_target_set_van_horn_[0-3]
- bounty_target_set_wallace_station_[0-3]

### Legendary Posters
- bounty_l_target_001, bounty_l_target_001
- bounty_l_target_002, bounty_l_target_002
- bounty_l_target_003, bounty_l_target_003
- bounty_l_target_003_a, bounty_l_target_003_a
- bounty_l_target_004, bounty_l_target_004
- bounty_l_target_005, bounty_l_target_005
- bounty_l_target_005_a, bounty_l_target_005_a
- bounty_l_target_006, bounty_l_target_006
- bounty_l_target_007, bounty_l_target_007
- bounty_l_target_008, bounty_l_target_008
- bounty_l_target_009, bounty_l_target_009
- bounty_l_target_010, bounty_l_target_010
- document_poster_legend_bounty_801, document_poster_legend_bounty_801
- document_poster_legend_bounty_802, document_poster_legend_bounty_802
- document_poster_legend_bounty_803, document_poster_legend_bounty_803

## Technical Details

### File Structure

- `client/` - Client-side scripts and UI
  - `html/` - Web-based UI components
  - `locked_files/` - Protected script files
  - `unlocked_files/` - Editable script files
- `server/` - Server-side scripts
- `shared/` - Shared functions and utilities

## Support

For support, bug reports, or feature requests, please open an issue on the repository or contact the developer directly.

## Credits AO
Developed by QADR - A premium script for RedM roleplay servers.

## Version Sadicius