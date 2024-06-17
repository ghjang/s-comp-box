#!/bin/bash

# NOTE: 'mathjax'라는 이름의 '배포용도'의 npm 패키지가 존재한다.
#       이 스크립트는 'mathjax' 배포물을 '빌드 결과물'에 포함시킨다.
#
#       참고로 'mathjax-full' 패키지는 '개발용도'의 '소스코드'를 제공하는 것으로 보인다.
#       'mathjax-full' 패키지를 참조하는 '번들링 설정'을 구성해서 '커스텀 빌드'가 가능하지만,
#       일단 표준 배포물을 이용하도록 한다.

source_dir="node_modules/mathjax"
destination_dir="build/dev/vendor/mathjax"

if [ "$ROLLUP_WATCH" != "true" ]; then
    destination_dir="build/dist/vendor/mathjax"
fi

mkdir -p "$destination_dir"

cp -R "$source_dir"/* "$destination_dir"
