#==============================================================================
# 1단계: 'Monaco 에디터' 번들링
#==============================================================================
FROM node:20-alpine AS root-builder

WORKDIR /app
COPY ./vendor/monaco-editor/browser-rollup-custom \
    ./vendor/monaco-editor/browser-rollup-custom

WORKDIR /app/vendor/monaco-editor/browser-rollup-custom
RUN npm ci

RUN chmod +x ./bundle.sh
RUN ./bundle.sh dist

#==============================================================================
# 2단계: 'ts-js-compare' 빌드
#==============================================================================
FROM node:20-alpine AS ts-js-compare-builder

WORKDIR /app
COPY ./src ./src
COPY --from=root-builder /app/vendor/monaco-editor/browser-rollup-custom/dist \
    ./vendor/monaco-editor/browser-rollup-custom/dist

WORKDIR /app/webapp/ts-js-compare
COPY ./webapp/ts-js-compare/package*.json .
RUN npm ci

COPY ./webapp/ts-js-compare .
RUN npm run build

RUN npm ci --only=production

#==============================================================================
# 3단계: 'ts-js-compare' 실행
#==============================================================================
FROM node:20-alpine AS ts-js-compare-runner

WORKDIR /app
COPY --from=ts-js-compare-builder /app/webapp/ts-js-compare/package*.json .
COPY --from=ts-js-compare-builder /app/webapp/ts-js-compare/build ./build
COPY --from=ts-js-compare-builder /app/webapp/ts-js-compare/node_modules ./node_modules

CMD ["node", "build"]
