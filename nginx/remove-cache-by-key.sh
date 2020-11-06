#!/bin/bash
# echo "remove-cache-by-key.sh $1 >> "

TEST='url='
if [[ "$1" == *"$TEST"* ]]
then

    grep_result=`grep -lr $1 /opt/`

    if test -z "$grep_result" 
    then
        echo "NOT_CACHED:params:$1"W
    else
        result=`rm -rfv $grep_result`
        echo "SUCCESS:$result"
    fi
else
    echo "INVALID_PARAMS:$1"
fi
