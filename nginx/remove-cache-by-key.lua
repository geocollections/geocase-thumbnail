access_by_lua_block {

    cachekey = ""
    if ngx.var.uri then cachekey = cachekey .. ngx.var.uri:gsub("/purge/",""):gsub("/purge","") end
    if ngx.var.is_args then cachekey = cachekey .. ngx.var.is_args end
    if ngx.var.args then cachekey = cachekey .. ngx.var.args end


    if (cachekey == "all")
    then
        f = assert( io.popen('rm -rfv /opt/nginx-proxy-cache/ | strings &', 'r'))
        result = assert(f:read('*a'))
        f:close()
        f = assert( io.popen('rm -rfv /opt/nginx-fcgi-cache/ | strings &', 'r'))
        result = result .. assert(f:read('*a'))
        f:close()
    else
        f = assert(io.popen('/bin/remove-cache-by-key.sh "' .. cachekey .. '" | strings &' , 'r'))
        result = assert(f:read('*a'))
        f:close()
    end
    
    --ngx.redirect(  ngx.var.request_uri:gsub("/purge", "") )
    ngx.say('{"message":"' .. result:gsub("\n","") .. '", "link":"' .. ngx.var.scheme .. '://' .. ngx.var.http_host .. "/" .. cachekey .. '", "cachekey":"' .. cachekey .. '" }')

}