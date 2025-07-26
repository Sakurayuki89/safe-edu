# 🎬 Google Drive 영상 설정 가이드

## 1단계: Google Drive 영상 업로드

1. **Google Drive 접속**
   - https://drive.google.com 접속
   - 로그인

2. **영상 파일 업로드**
   - "새로 만들기" → "파일 업로드" 클릭
   - 전기설비 안전교육 영상 파일 선택
   - 업로드 완료까지 대기

## 2단계: 영상 공유 설정

1. **업로드된 영상 파일 우클릭**
   - "공유" 선택

2. **공유 권한 설정**
   - "링크가 있는 모든 사용자" 선택
   - "뷰어" 권한 설정
   - "링크 복사" 클릭

3. **영상 ID 추출**
   - 복사된 링크 예시: `https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view`
   - `/d/` 다음부터 `/view` 전까지가 영상 ID
   - 예: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## 3단계: 코드에 영상 ID 적용

`script.js` 파일의 CONFIG 섹션에서 VIDEO_URL을 실제 영상 ID로 변경:

```javascript
const CONFIG = {
    // API 관련 설정
    API_BASE_URL: '/api',
    VIDEO_URL: '여기에_실제_영상_ID_입력', // ← 이 부분 수정
    
    // 개발 모드 설정
    DEVELOPMENT_MODE: window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
```

## 4단계: 영상 재생 테스트

1. **로컬 테스트**
   - `python3 serve.py`로 로컬 서버 실행
   - 개발 모드에서는 시뮬레이션으로 동작

2. **프로덕션 테스트**
   - GitHub에 변경사항 푸시
   - Netlify 자동 재배포 대기
   - 배포된 사이트에서 영상 재생 확인

## 🔧 영상 재생 기능

### 개발 모드 (로컬)
- 10초 시뮬레이션으로 동작
- "영상 시청 시작" 버튼 클릭
- 진행 바와 시간 표시 업데이트
- 완료 후 "시청 완료" 버튼 표시

### 프로덕션 모드 (배포된 사이트)
- 실제 Google Drive 영상 임베드
- 클릭하여 영상 시작
- 5분 영상 기준으로 진행률 추적
- 90% 시청 시 완료로 간주

## ⚠️ 주의사항

1. **영상 파일 크기**
   - 너무 큰 파일은 로딩이 느릴 수 있음
   - 권장: 100MB 이하, 5-10분 길이

2. **영상 형식**
   - MP4 형식 권장
   - 웹 브라우저에서 재생 가능한 형식 사용

3. **공유 권한**
   - 반드시 "링크가 있는 모든 사용자" 권한 설정
   - 비공개 설정 시 영상이 재생되지 않음

4. **영상 시간 설정**
   - `script.js`의 `startRealVideoTracking()` 함수에서 `videoDurationMinutes` 값을 실제 영상 길이에 맞게 조정

## 🎯 영상 길이 변경 방법

실제 영상 길이에 맞게 코드 수정:

```javascript
// script.js의 startRealVideoTracking() 함수에서
const videoDurationMinutes = 8; // 8분 영상인 경우
```

---

💡 **팁**: 영상 ID만 변경하면 즉시 새로운 영상으로 교체됩니다!