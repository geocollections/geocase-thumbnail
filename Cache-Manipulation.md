### Cache Manipulation

Remove from Fast-CGI cache:

```
rm -rf $(grep -lr 'url=https%3A%2F%2Ffiles.geocollections.info%2Fmedium%2F4a%2F09%2F4a095dbc-c99c-49cc-9f01-6e1c15fc76c9.jpg' /opt/nginx-fcgi-cache/)
```

request with cache:

```
curl  "http://localhost:2020/?url=https%3A%2F%2Ffiles.geocollections.info%2Fmedium%2F4a%2F09%2F4a095dbc-c99c-49cc-9f01-6e1c15fc76c9.jpg" -I
curl  "http://localhost:2020/resize?url=https%3A%2F%2Ffiles.geocollections.info%2Fmedium%2F4a%2F09%2F4a095dbc-c99c-49cc-9f01-6e1c15fc76c9.jpg&width=100" -I
```

ignore cache:

```
curl  "http://localhost:2020/?url=https%3A%2F%2Ffiles.geocollections.info%2Fmedium%2F4a%2F09%2F4a095dbc-c99c-49cc-9f01-6e1c15fc76c9.jpg" -I -H "cachepurge: true"
curl  "http://localhost:2020/resize?url=https%3A%2F%2Ffiles.geocollections.info%2Fmedium%2F4a%2F09%2F4a095dbc-c99c-49cc-9f01-6e1c15fc76c9.jpg&width=100" -I -H "cachepurge: true"
```

purging is possible:
https://www.claudiokuenzler.com/blog/584/nginx-configure-bypassing-purging-proxy-cache-ngx_cache_purge
http://labs.frickle.com/nginx_ngx_cache_purge/
https://github.com/FRiCKLE/ngx_cache_purge/
