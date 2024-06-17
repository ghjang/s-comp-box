#!/bin/bash

# NOTE: 'pdfjs-dist'라는 '배포용도'의 npm 패키지가 존재하는 것으로 보인다.
#       다만 'PDF.js' 웹페이지에서 배포하는 것과 내용물이 좀 다르다.
#       '폴더 구성'도 좀 다르고, 'viewer.html' 파일도 존재하지 않는다.
#       일단 'PDF.js' 웹페이지에서 배포하는 것을 빌드 결과물에 포함시킨다.

source_dir="vendor/pdfjs/pdfjs-4.3.136-dist"
destination_dir="build/dev/vendor/pdfjs"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/pdfjs"
fi

mkdir -p "$destination_dir"

cp -R "$source_dir"/* "$destination_dir"
