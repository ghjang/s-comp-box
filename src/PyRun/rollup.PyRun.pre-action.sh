#!/bin/bash

# NOTE: '배포용도'의 'pyodide' npm 패키지가 존재하는 것으로 보인다.
#       이 스크립트는 'pyodide' 패키지의 '빌드 결과물'을 '빌드 결과물' 폴더 하위로 복사하는 작업을 수행한다.
#
#       참고로 해당 패키지에 'console.html'이라는 '파이썬 터미널 웹 에뮬레이터'가 포함되어 있다.
#       'PyRun' 컴포넌트를 개선하는데 참조할 수 있는 좋은 예시 코등일 것으로 보인다.
#       해당 터미널 코드 자체를 wrap해서 별도의 '컴포넌트'로 만들어 사용할 수도 있을 것 같다.

source_dir="node_modules/pyodide"
destination_dir="build/dev/vendor/pyodide"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/pyodide"
fi

mkdir -p "$destination_dir"

cp "$source_dir"/*.* "$destination_dir"
