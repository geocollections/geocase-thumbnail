#!/bin/bash
# echo "yo" >&2
# ls /opt/nginx-fcgi-cache/ >&2
# echo $("rm -rf /opt/nginx-fcgi-cache/$1") >&2


echo ">>>>>>>>>>>>>>>>>> Purge request: path:$1 args:$2" >&2

# rm -rf $(grep -lr "$1" /opt/nginx-fcgi-cache/) >&2