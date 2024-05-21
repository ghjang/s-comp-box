#!/bin/bash

source_dir="vendor/pyodide/pyodide-core-0.25.1"
destination_dir="build/dev/vendor/pyodide"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/pyodide"
fi

mkdir -p "$destination_dir"

cp "$source_dir"/*.* "$destination_dir"
