# 🔌 Safe Edu - 전기설비 온라인 안전교육 시스템

제철소 전기설비 정비 작업자를 위한 인터랙티브 안전교육 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🎯 **개인화된 교육 경험**: 사용자 정보 기반 맞춤형 운세 및 콘텐츠
- 🎬 **YouTube Privacy-Enhanced 영상**: 개인정보 보호 강화된 영상 플레이어
- 📝 **실시간 퀴즈 평가**: Google Sheets 기반 동적 퀴즈 시스템
- 🍀 **행운 이벤트**: 교육 완료 후 당첨 이벤트 (100명 한정)
- 📊 **자동 데이터 관리**: Google Sheets 자동 저장 및 관리
- 🤖 **AI 운세 생성**: Claude API 기반 맞춤형 운세 제공
- 🔄 **자동 백업 시스템**: 인프라 변경 시 기존 설정 보존

## 🛠️ 기술 스택

### Frontend
- **HTML5, CSS3, JavaScript (Vanilla)**
- **반응형 디자인** (모바일/데스크톱 지원)
- **SPA (Single Page Application)** 구조

### Backend
- **Netlify Functions** (서버리스)
- **Google Sheets API** (데이터베이스)
- **Claude API** (AI 운세 생성)

### 배포 및 호스팅
- **Netlify** (정적 사이트 + 서버리스 함수)
- **GitHub** (소스 코드 관리)

## 📁 프로젝트 구조

```
safe-edu/
├── netlify/
│   └── functions/          # 서버리스 함수들
│       ├── start-education.js
│       ├── get-quiz.js
│       ├── check-winners.js
│       ├── complete-education.js
│       └── generate-fortune.js
├── backup/                 # 자동 백업 디렉토리
│   └── netlify-functions-TIMESTAMP/
├── backup-system.js        # 백업 시스템 스크립트
├── index.html              # 메인 HTML
├── script.js              # 프론트엔드 로직
├── styles.css             # 스타일시트
├── netlify.toml           # Netlify 설정
├── package.json           # 의존성 관리
└── .env.example           # 환경 변수 예시
```

## 🚀 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/safe-edu.git
cd safe-edu
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env.local
# .env.local 파일에 실제 API 키들 입력
```

### 4. 로컬 서버 실행
```bash
npm run dev
# 또는
netlify dev
```

## 🔄 백업 및 복원

### 백업 생성
```bash
npm run backup
# 또는
node backup-system.js
```

### 백업에서 복원
```bash
# 특정 백업 디렉토리로 이동
cd backup/netlify-functions-TIMESTAMP/
# 복원 스크립트 실행
./restore.sh
```

### 백업 내용
- Netlify Functions (모든 .js 파일)
- 환경 변수 설정 (암호화된 형태)
- 설정 파일 (package.json, netlify.toml, .gitignore)
- 복원 스크립트 및 검증 리포트

## 📊 Google Sheets 구조

### 1번째 탭: "교육참가자"
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| SubmissionTime | EducationMonth | Name | Zodiac | EmployeeID | QuizScore | IsWinner | CompletionTime |

### 2번째 탭: "퀴즈"
| A | B | C | D |
|---|---|---|---|
| 문제번호 | 문제내용 | 선택지(쉼표구분) | 정답 |

## 🔐 환경 변수

```bash
# Google Sheets 연동
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your_client_id

# AI 운세 생성 (선택사항)
CLAUDE_API_KEY=your_claude_api_key
```

## 🎯 사용자 플로우

1. **개인정보 입력** → 이름, 띠 선택
2. **맞춤형 운세** → AI 기반 개인화 운세 + 로또번호
3. **안전교육 영상** → YouTube Privacy-Enhanced 모드로 영상 시청 (빨리감기 제한)
4. **교육 평가** → 동적 퀴즈 문제 풀이
5. **행운 이벤트** → 당첨 확률 10%, 최대 100명

## 🔒 개인정보 보호 기능

### YouTube Privacy-Enhanced 모드
- `youtube-nocookie.com` 도메인 사용
- 영상 재생 전까지 쿠키 설정 안함
- 추적 및 데이터 수집 최소화
- 영상 로드 실패 시 수동 완료 옵션 제공

## 📱 반응형 지원

- **데스크톱**: 1200px 이상
- **태블릿**: 768px - 1199px
- **모바일**: 767px 이하

## 🔒 보안 고려사항

- 환경 변수를 통한 API 키 관리
- Google Cloud 서비스 계정 인증
- CORS 설정으로 도메인 제한
- 입력 데이터 검증 및 정제

## 📈 성능 최적화

- 바닐라 JavaScript (프레임워크 없음)
- 서버리스 함수로 확장성 확보
- Google Sheets 캐싱으로 응답 속도 개선
- 이미지 최적화 및 압축

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

⚡ **안전한 전기 작업을 위한 교육, 재미있게 배우세요!** ⚡