#!/bin/sh
echo "remove-cache-by-key.sh $@>> "

if [[ $@ == *"url="* ]]
then

    grep_result=`grep -lr $@ /opt/`

    if test -z "$grep_result" 
    then
        echo "NOT_CACHED:params:$@"
    else
        result=`rm -rfv $grep_result`
        echo "SUCCESS:$result"
    fi
else
    echo "INVALID_PARAMS:$@"
fi
