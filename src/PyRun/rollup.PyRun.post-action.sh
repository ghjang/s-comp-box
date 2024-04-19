#!/bin/bash

destination_dir="build/dev"
if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist"
fi

cp src/PyRun/pyodide/pyodide-core-0.25.1/package.json "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/pyodide-lock.json "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/pyodide.asm.js "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/pyodide.asm.wasm "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/pyodide.js "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/pyodide.mjs "$destination_dir"
cp src/PyRun/pyodide/pyodide-core-0.25.1/python_stdlib.zip "$destination_dir"
