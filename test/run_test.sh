#!/bin/bash

cd `dirname $0`

function exec_tests {
    expresso *.js

    for f in "$@"
    do
        echo $f
        if [[ -d $f && "$f" != ".." && "$f" != "." ]]
        then
            cd $f
            exec_tests `ls -1 "."`
            cd ..
        fi
    done
}

exec_tests `ls -a "."`
