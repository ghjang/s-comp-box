#!/bin/bash

build_dir="build/dist"
src_json="src/SCompBox/s-custom-elements.dist.json"
dest_json_file_name="s-custom-elements.json"

if [ "$ROLLUP_WATCH" == "true" ]; then
    build_dir="build/dev"
    src_json="src/SCompBox/s-custom-elements.dev.json"
fi

mkdir -p $build_dir/default $build_dir/custom

cp $src_json $build_dir/default/$dest_json_file_name
cp $src_json $build_dir/custom/$dest_json_file_name

if [ "$ROLLUP_WATCH" != "true" ]; then
    cp $src_json pages/docroot/config/$dest_json_file_name
fi
