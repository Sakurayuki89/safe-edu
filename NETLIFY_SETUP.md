# 🚀 Netlify 배포 가이드

## 1단계: GitHub에 코드 업로드

```bash
# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Netlify 배포를 위한 코드 수정 - 서버리스 함수 변환"

# GitHub에 푸시
git push origin main
```

## 2단계: Netlify 계정 생성 및 사이트 연결

1. **Netlify 웹사이트 접속**
   - https://netlify.com 접속
   - "Sign up" 클릭
   - **GitHub 계정으로 로그인** (권장)

2. **새 사이트 생성**
   - 대시보드에서 "New site from Git" 클릭
   - "GitHub" 선택
   - 저장소 목록에서 "safe-edu" 선택

3. **배포 설정**
   - **Branch to deploy**: `main`
   - **Build command**: (비워두기)
   - **Publish directory**: `.` (점 하나)
   - **Functions directory**: `netlify/functions` (자동 감지됨)

4. **"Deploy site" 클릭**

## 3단계: 환경 변수 설정

1. **사이트 설정 페이지 이동**
   - 배포 완료 후 "Site settings" 클릭
   - 좌측 메뉴에서 "Environment variables" 클릭

2. **환경 변수 추가**
   - "Add a variable" 버튼 클릭
   - 다음 변수들을 하나씩 추가:

```bash
GOOGLE_SHEETS_ID=[스프레드시트 ID]
GOOGLE_PROJECT_ID=[프로젝트 ID]
GOOGLE_PRIVATE_KEY_ID=[프라이빗 키 ID]
GOOGLE_PRIVATE_KEY=[프라이빗 키 전체 - 줄바꿈 포함]
GOOGLE_SERVICE_ACCOUNT_EMAIL=[서비스 계정 이메일]
GOOGLE_CLIENT_ID=[클라이언트 ID]
CLAUDE_API_KEY=[Claude API 키] (선택사항)
```

3. **환경 변수 저장**
   - 각 변수 입력 후 "Create variable" 클릭

## 4단계: 재배포 및 테스트

1. **재배포 트리거**
   - "Deploys" 탭으로 이동
   - "Trigger deploy" → "Deploy site" 클릭

2. **배포 로그 확인**
   - 배포 진행 상황 모니터링
   - 오류 발생 시 로그에서 원인 파악

3. **사이트 접속 테스트**
   - 배포 완료 후 사이트 URL 클릭
   - 기본 화면 정상 표시 확인

## 5단계: API 엔드포인트 테스트

배포된 사이트에서 다음 URL들이 작동하는지 확인:

```bash
# 퀴즈 데이터 조회
https://your-site-name.netlify.app/.netlify/functions/get-quiz

# 당첨자 수 확인
https://your-site-name.netlify.app/.netlify/functions/check-winners

# 운세 생성 (POST 요청 필요)
https://your-site-name.netlify.app/.netlify/functions/generate-fortune
```

## 문제 해결

### 자주 발생하는 오류

1. **"Function not found"**
   - `netlify/functions/` 폴더 구조 확인
   - `netlify.toml` 파일 설정 확인

2. **"Module not found: googleapis"**
   - `package.json`에 의존성 확인
   - 재배포 시도

3. **"Environment variable not found"**
   - Netlify 대시보드에서 환경 변수 재확인
   - 변수명 오타 확인

4. **CORS 오류**
   - 함수에서 CORS 헤더 설정 확인
   - 브라우저 개발자 도구에서 네트워크 탭 확인

## 성공 확인

✅ 모든 단계가 완료되면:
- 사이트가 정상적으로 로드됨
- 모든 API 엔드포인트가 응답함
- Google Sheets 연동이 작동함
- 전체 사용자 플로우가 완주 가능함

## 다음 단계

배포가 성공하면 4단계 "전체 시스템 테스트"로 진행하세요!