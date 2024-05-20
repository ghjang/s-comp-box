#!/bin/bash

if [ "$ROLLUP_WATCH" == "true" ]; then
    mkdir -p build/dev/vendor/monaco-editor
    cp -r src/MonacoEditor/monaco-editor-bundle/* build/dev/vendor/monaco-editor
    echo "Copied Monaco Editor to build/dev/vendor/monaco-editor"
else
    mkdir -p build/dist/vendor/monaco-editor
    cp -r src/MonacoEditor/monaco-editor-bundle/* build/dist/vendor/monaco-editor
    echo "Copied Monaco Editor to build/dist/vendor/monaco-editor"
fi
