#!/bin/bash

# 전기안전교육 웹앱 백업 복원 스크립트
# 생성일: 2025-07-26T05:47:42.465Z
# 백업 경로: backup/netlify-functions-2025-07-26T05-47-42

echo "🔄 백업에서 복원을 시작합니다..."

# Netlify Functions 복원
if [ -d "netlify/functions" ]; then
    echo "📁 기존 netlify/functions 폴더를 임시 백업합니다..."
    mv netlify/functions netlify/functions.backup.$(date +%Y%m%d-%H%M%S)
fi

mkdir -p netlify/functions

echo "📂 Netlify Functions 복원 중..."
cp backup/netlify-functions-2025-07-26T05-47-42/*.js netlify/functions/ 2>/dev/null || echo "⚠️  .js 파일이 없습니다."

# 설정 파일 복원 (선택적)
echo "⚙️  설정 파일 복원 중..."
[ -f "backup/netlify-functions-2025-07-26T05-47-42/package.json" ] && cp backup/netlify-functions-2025-07-26T05-47-42/package.json . && echo "✅ package.json 복원"
[ -f "backup/netlify-functions-2025-07-26T05-47-42/netlify.toml" ] && cp backup/netlify-functions-2025-07-26T05-47-42/netlify.toml . && echo "✅ netlify.toml 복원"
[ -f "backup/netlify-functions-2025-07-26T05-47-42/.gitignore" ] && cp backup/netlify-functions-2025-07-26T05-47-42/.gitignore . && echo "✅ .gitignore 복원"

echo "✅ 복원 완료!"
echo "⚠️  환경 변수는 수동으로 Netlify 대시보드에서 설정해야 합니다."
echo "📋 환경 변수 목록은 backup/netlify-functions-2025-07-26T05-47-42/environment-variables.json 파일을 참조하세요."
