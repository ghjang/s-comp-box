#!/bin/bash

# NOTE: '모나코 에디터'는 꽤 크기가 큰 구성의 라이브러리이다.
#       때문에 'monaco-editor' 노드 패키지 설치후에 필요한 기능을 기술하는
#       '번들링 설정'을 작성해 가능한 작은 크기의 '.js' 파일을 먼저 '번들링'할 필요가 있다.
#       이 스크립트는 먼저 별도로 '번들링'한 결과물을 '빌드 결과물' 폴더 하위로 복사하는 작업을 수행한다.

source_dir="vendor/monaco-editor/dist-bundle"
destination_dir="build/dev/vendor/monaco-editor"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/monaco-editor"
fi

mkdir -p "$destination_dir"

cp "$source_dir"/*.* "$destination_dir"
