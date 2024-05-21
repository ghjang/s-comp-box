#!/bin/bash

if [ "$ROLLUP_WATCH" == "true" ]; then
    mkdir -p build/dev/default build/dev/custom
    cp src/SCompBox/s-custom-elements.dev.json build/dev/default/s-custom-elements.json
    cp src/SCompBox/s-custom-elements.dev.json build/dev/custom/s-custom-elements.json
else
    mkdir -p build/dist/default build/dist/custom
    cp src/SCompBox/s-custom-elements.production.json build/dist/default/s-custom-elements.json
    cp src/SCompBox/s-custom-elements.production.json build/dist/custom/s-custom-elements.json
    cp src/SCompBox/s-custom-elements.production.json pages/docroot/config/s-custom-elements.json
fi
