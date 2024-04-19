NODE_ENV=$1

if [ -z "${NODE_ENV}" ]; then
  echo "Error: No environment specified. Please specify 'dev' or 'production'."
  exit 1
fi

BUILD_DIR="../../build/${NODE_ENV}/monaco-editor"
DEST_DIR="../../src/MonacoEditor/monaco-editor-bundle"

printf "Running rollup..."
npx rollup --config rollup.monaco-editor.config.js
echo "done."

if [ -d "${BUILD_DIR}" ]; then
  printf "Removing existing destination directory..."
  rm -rf ${DEST_DIR}
  echo "done."

  printf "Copying build directory to destination..."
  cp -r ${BUILD_DIR} ${DEST_DIR}
  echo "done."
else
  echo "Error: Build directory ${BUILD_DIR} does not exist."
  exit 1
fi
