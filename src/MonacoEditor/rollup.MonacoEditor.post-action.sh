#!/bin/bash

if [ "$ROLLUP_WATCH" == "true" ]; then
    cp -r src/MonacoEditor/monaco-editor-bundle/* build/dev
else
    cp -r src/MonacoEditor/monaco-editor-bundle/* build/dist
fi
