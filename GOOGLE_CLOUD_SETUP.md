# ☁️ Google Cloud 서비스 계정 설정 가이드

## 1단계: Google Cloud Console 접속

1. **Google Cloud Console 접속**: https://console.cloud.google.com
2. **프로젝트 선택** 또는 **새 프로젝트 생성**
   - 프로젝트 이름: "safe-edu"

## 2단계: Google Sheets API 활성화

1. **API 및 서비스** → **라이브러리** 클릭
2. **"Google Sheets API"** 검색
3. **Google Sheets API** 클릭 → **사용** 버튼 클릭

## 3단계: 서비스 계정 생성

1. **API 및 서비스** → **사용자 인증 정보** 클릭
2. **사용자 인증 정보 만들기** → **서비스 계정** 클릭
3. **서비스 계정 세부정보** 입력:
   ```
   서비스 계정 이름: safe-edu-service
   서비스 계정 ID: safe-edu-service
   설명: Safe Edu 안전교육 시스템용 서비스 계정
   ```
4. **만들기** 클릭

## 4단계: 서비스 계정 키 생성

1. 생성된 서비스 계정 클릭
2. **키** 탭 클릭
3. **키 추가** → **새 키 만들기** 클릭
4. **키 유형**: JSON 선택
5. **만들기** 클릭 → JSON 파일 다운로드

## 5단계: 환경 변수 정보 추출

다운로드한 JSON 파일에서 다음 정보를 추출하세요:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "safe-edu-service@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  ...
}
```

## 6단계: Google Sheets 공유

1. **Google Sheets 문서**로 돌아가기
2. **공유** 버튼 클릭
3. **서비스 계정 이메일** 입력:
   ```
   safe-edu-service@your-project.iam.gserviceaccount.com
   ```
4. **권한**: "편집자" 선택
5. **공유** 클릭

## 7단계: 환경 변수 준비

다음 환경 변수들을 준비하세요:

```bash
GOOGLE_SHEETS_ID=your_spreadsheet_id_from_url
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
GOOGLE_SERVICE_ACCOUNT_EMAIL=safe-edu-service@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
```

## 8단계: Claude API 키 (선택사항)

AI 운세 생성을 위해 Claude API 키도 준비하세요:
- Anthropic 웹사이트에서 API 키 발급
- `CLAUDE_API_KEY=your_claude_api_key`

---

## ⚠️ 보안 주의사항

1. **JSON 키 파일 보안**:
   - 절대 GitHub에 업로드하지 마세요
   - `.gitignore`에 추가하세요
   - 로컬에서만 보관하세요

2. **환경 변수 관리**:
   - 실제 값은 Vercel 대시보드에서만 설정
   - 코드에 직접 입력하지 마세요

---

## ✅ 완료 체크리스트

- [ ] Google Cloud 프로젝트 생성 완료
- [ ] Google Sheets API 활성화 완료
- [ ] 서비스 계정 생성 완료
- [ ] JSON 키 파일 다운로드 완료
- [ ] Google Sheets 공유 설정 완료
- [ ] 환경 변수 정보 추출 완료
- [ ] Claude API 키 준비 완료 (선택사항)

완료되면 다음 단계인 "Vercel 환경 변수 설정"으로 진행합니다.