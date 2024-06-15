#!/bin/bash

source_dir="vendor/monaco-editor/dist-bundle"
destination_dir="build/dev/vendor/monaco-editor"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/monaco-editor"
fi

mkdir -p "$destination_dir"

cp "$source_dir"/*.* "$destination_dir"
