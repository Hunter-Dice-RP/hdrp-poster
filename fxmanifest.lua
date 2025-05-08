
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
    'locales/*.json'
}

shared_script {
    '@ox_lib/init.lua',
    "shared/functions.lua",
    "conf.lua",
}

client_script {
    "client/*.lua",
}

server_script {
    "server/*.lua",
}

lua54 'yes'