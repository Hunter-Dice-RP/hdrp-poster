
fx_version 'adamant'
game 'rdr3'
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'

ui_page 'client/html/index.html'

files {
    'client/html/index.html',
    'client/html/js/*.js',
    'client/html/css/*.css',
    'client/html/images/*.png',
    'client/html/fonts/*.ttf',
}

shared_script {
    "conf.lua",
    "locales/*.lua",
    "shared/functions.lua",
    "shared/localization.lua",
}

client_script {
    "client/client.lua",
}

server_script {
    "server/verification.lua",
    "server/server.lua",
}

lua54 'yes'
    