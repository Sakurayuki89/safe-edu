# 🔗 GitHub 연동 설정 가이드

## 1단계: GitHub에서 새 저장소 생성

1. **GitHub 웹사이트 접속**
   - https://github.com 접속
   - 로그인

2. **새 저장소 생성**
   - 우상단 "+" 버튼 → "New repository" 클릭
   - **Repository name**: `safe-edu`
   - **Description**: `Safe Edu - 전기설비 온라인 안전교육 시스템 (Netlify + Google Sheets)`
   - **Public** 선택 (또는 Private)
   - **Initialize this repository with**: 모두 체크 해제 (빈 저장소로 생성)
   - "Create repository" 클릭

3. **저장소 URL 복사**
   - 생성된 저장소 페이지에서 HTTPS URL 복사
   - 예: `https://github.com/your-username/safe-edu.git`

## 2단계: 로컬 Git 설정

```bash
# 현재 폴더에서 실행 (프로젝트 루트)

# Git 사용자 정보 설정 (처음 사용하는 경우)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 원격 저장소 연결
git remote add origin https://github.com/your-username/safe-edu.git

# 기본 브랜치를 main으로 설정
git branch -M main

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "🚀 Safe Edu - 전기설비 안전교육 시스템 초기 버전

✨ 주요 기능:
- Netlify Functions 기반 서버리스 아키텍처
- Google Sheets API 연동 데이터 관리
- Claude AI 기반 맞춤형 운세 생성
- 반응형 SPA 구조
- 실시간 퀴즈 평가 시스템
- 행운 이벤트 (당첨자 100명 한정)

🛠️ 기술 스택:
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Netlify Functions, Google Sheets API
- AI: Claude API
- 배포: Netlify

📁 프로젝트 구조:
- netlify/functions/: 서버리스 함수 5개
- index.html, script.js, styles.css: 프론트엔드
- netlify.toml: 배포 설정
- 완전한 Google Sheets 연동 준비 완료"

# GitHub에 푸시
git push -u origin main
```

## 3단계: 업로드 확인

GitHub 저장소에서 다음 파일들이 올바르게 업로드되었는지 확인:

### ✅ 필수 파일들
- [ ] `index.html` - 메인 HTML 파일
- [ ] `script.js` - 프론트엔드 로직
- [ ] `styles.css` - 스타일시트
- [ ] `package.json` - 의존성 관리
- [ ] `netlify.toml` - Netlify 설정
- [ ] `README.md` - 프로젝트 문서
- [ ] `.gitignore` - Git 제외 파일 목록

### ✅ Netlify Functions
- [ ] `netlify/functions/start-education.js`
- [ ] `netlify/functions/get-quiz.js`
- [ ] `netlify/functions/check-winners.js`
- [ ] `netlify/functions/complete-education.js`
- [ ] `netlify/functions/generate-fortune.js`

### ✅ 가이드 문서들
- [ ] `GOOGLE_CLOUD_SETUP.md`
- [ ] `GOOGLE_SHEETS_SETUP.md`
- [ ] `NETLIFY_SETUP.md`
- [ ] `.env.example`

## 4단계: 브랜치 보호 설정 (선택사항)

1. **Settings** → **Branches** 이동
2. **Add rule** 클릭
3. **Branch name pattern**: `main`
4. 다음 옵션들 체크:
   - [ ] Require pull request reviews before merging
   - [ ] Require status checks to pass before merging
5. **Create** 클릭

## 🎉 완료!

GitHub 연동이 완료되었습니다. 이제 다음 단계로 진행할 수 있습니다:

1. **Netlify 배포 설정**
2. **환경 변수 설정**
3. **전체 시스템 테스트**