#!/bin/bash

source_dir="vendor/pdfjs/pdfjs-4.3.136-dist"
destination_dir="build/dev/vendor/pdfjs"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/pdfjs"
fi

mkdir -p "$destination_dir"

cp -R "$source_dir"/* "$destination_dir"
