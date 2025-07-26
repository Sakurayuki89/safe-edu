// ========================================
// 🔧 설정값 (나중에 변경 가능한 값들)
// ========================================
const CONFIG = {
    // API 관련 설정
    API_BASE_URL: '/api',
    VIDEO_URL: 'HggDt3GUGYo', // YouTube 영상 ID (실제 영상으로 교체 필요)

    // 개발 모드 설정
    DEVELOPMENT_MODE: window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // 행운 이벤트 설정
    WIN_PROBABILITY: 0.1, // 10% 당첨 확률 (0.0 ~ 1.0)
    MAX_WINNERS: 100, // 최대 당첨자 수

    // UI 관련 설정
    LOADING_DELAY: 1000, // 로딩 화면 표시 시간 (밀리초)
    SCREEN_TRANSITION_DELAY: 300, // 화면 전환 지연 시간 (밀리초)
    API_SIMULATION_DELAY: 1500, // API 호출 시뮬레이션 지연 시간 (밀리초)

    // 영상 관련 설정
    VIDEO_SIMULATION_DURATION: 10, // 영상 시뮬레이션 시간 (초)

    // 유효성 검사 설정
    EMPLOYEE_ID_LENGTH: 7, // 사번 자릿수
    LOTTERY_NUMBER_COUNT: 6, // 로또 번호 개수
    LOTTERY_NUMBER_MAX: 45 // 로또 번호 최대값
};

// ========================================
// 💾 사용자 세션 데이터 관리
// ========================================
const userSession = {
    name: '',
    zodiac: '',
    rowNumber: null, // Google Sheets 행 번호 (백엔드 연동용)
    quizAnswers: [], // 배열로 변경 (백엔드 형식에 맞춤)
    isWinner: false,
    employeeId: '',
    startTime: null,
    completionTime: null,
    quizData: [] // 동적으로 로드된 퀴즈 데이터 저장
};

// ========================================
// 📊 데이터 (콘텐츠 관련 정보)
// ========================================

// 12지신별 운세 데이터 (나중에 변경 가능)
const FORTUNE_DATA = {
    '쥐': '이번 주는 새로운 기회가 찾아올 것입니다. 전기 안전에 특히 주의하시고, 작업 전 점검을 철저히 하세요.',
    '소': '꾸준함이 빛을 발하는 한 주입니다. 안전 수칙을 차근차근 지키며 작업하시면 좋은 결과가 있을 것입니다.',
    '호랑이': '활동적인 에너지가 넘치는 시기입니다. 하지만 성급함은 금물! 전기 작업 시 안전을 최우선으로 하세요.',
    '토끼': '평화롭고 안정적인 한 주가 될 것입니다. 동료들과의 협력을 통해 안전한 작업 환경을 만들어보세요.',
    '용': '큰 성취를 이룰 수 있는 기회의 주입니다. 전기 안전 교육을 통해 더욱 전문성을 키워보세요.',
    '뱀': '신중하고 지혜로운 판단이 필요한 시기입니다. 안전 점검을 꼼꼼히 하여 사고를 예방하세요.',
    '말': '빠른 진전과 발전이 기대되는 주입니다. 안전 장비 착용을 잊지 마시고 건강한 한 주 보내세요.',
    '양': '온화하고 조화로운 분위기 속에서 좋은 성과를 거둘 것입니다. 팀워크를 발휘해 안전한 작업을 하세요.',
    '원숭이': '창의적인 아이디어가 샘솟는 시기입니다. 새로운 안전 기술에 관심을 가져보시는 것도 좋겠습니다.',
    '닭': '계획적이고 체계적인 접근이 성공의 열쇠입니다. 안전 매뉴얼을 숙지하고 규칙을 준수하세요.',
    '개': '충실하고 성실한 자세로 임하면 좋은 결과가 있을 것입니다. 동료의 안전도 함께 챙겨주세요.',
    '돼지': '풍요롭고 만족스러운 한 주가 될 것입니다. 여유로운 마음으로 안전 교육에 임해보세요.'
};

// 퀴즈 문제 및 정답 데이터 (나중에 변경 가능)
const QUIZ_DATA = {
    questions: [
        {
            id: 1,
            question: '전기 작업 시 가장 중요한 안전 수칙은 무엇입니까?',
            options: [
                '작업 전 전원 차단 확인',
                '작업복 착용',
                '도구 점검',
                '작업 시간 단축'
            ],
            correctAnswer: 1 // 정답: 작업 전 전원 차단 확인
        },
        {
            id: 2,
            question: '전기 화재 발생 시 올바른 대처 방법은?',
            options: [
                '물로 진화',
                '전원 차단 후 소화기 사용',
                '모래로 덮기',
                '바람으로 끄기'
            ],
            correctAnswer: 2 // 정답: 전원 차단 후 소화기 사용
        }
    ]
};



// 행운 해시태그 데이터 (띠별 3개씩)
const FORTUNE_HASHTAGS = {
    '쥐': ['#새로운기회', '#전기안전점검', '#철저한준비'],
    '소': ['#꾸준한노력', '#안전수칙준수', '#차근차근'],
    '호랑이': ['#활동적에너지', '#안전최우선', '#신중한작업'],
    '토끼': ['#평화로운작업', '#동료협력', '#안전환경'],
    '용': ['#큰성취', '#전문성향상', '#안전교육'],
    '뱀': ['#신중한판단', '#꼼꼼한점검', '#사고예방'],
    '말': ['#빠른발전', '#안전장비착용', '#건강한작업'],
    '양': ['#조화로운분위기', '#팀워크', '#안전작업'],
    '원숭이': ['#창의적아이디어', '#새로운안전기술', '#혁신적사고'],
    '닭': ['#계획적접근', '#안전매뉴얼숙지', '#규칙준수'],
    '개': ['#성실한자세', '#동료안전챙기기', '#충실한작업'],
    '돼지': ['#풍요로운결과', '#여유로운마음', '#안전교육완주']
};

// 제철소 전기설비 정비 안전 해시태그 (4개씩 무작위 선택)
const SAFETY_HASHTAGS = [
    '#전원차단확인', '#절연장갑착용', '#접지확인', '#전압측정',
    '#안전거리유지', '#작업허가서확인', '#보호구착용', '#화재예방',
    '#감전방지', '#정전작업', '#안전표지판설치', '#작업구역격리',
    '#비상연락망확인', '#응급처치준비', '#안전교육이수', '#장비점검완료',
    '#케이블상태확인', '#누전차단기점검', '#접촉불량방지', '#과부하방지',
    '#정기점검실시', '#예방정비', '#안전수칙준수', '#위험요소제거',
    '#안전의식강화', '#팀워크안전', '#상호안전점검', '#안전소통',
    '#위험상황공유', '#안전문화정착', '#개인보호구점검', '#안전모착용'
];

// 오류 메시지 (나중에 변경 가능)
const ERROR_MESSAGES = {
    nameRequired: '이름을 입력해주세요.',
    zodiacRequired: '띠를 선택해주세요.',
    videoNotComplete: '영상을 끝까지 시청해주세요.',
    quizIncomplete: '모든 문제에 답해주세요.',
    employeeIdInvalid: `${CONFIG.EMPLOYEE_ID_LENGTH}자리 숫자를 입력해주세요.`,
    networkError: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
    serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    submitError: '제출 중 오류가 발생했습니다. 다시 시도해주세요.'
};

// ========================================
// 🛠️ 유틸리티 함수들 (재사용 가능한 기능들)
// ========================================

// 로딩 상태 관리 유틸리티
const LoadingUtils = {
    // 버튼 로딩 상태 표시
    showButtonLoading(buttonElement) {
        buttonElement.classList.add('loading');
        buttonElement.disabled = true;
    },

    // 버튼 로딩 상태 해제
    hideButtonLoading(buttonElement) {
        buttonElement.classList.remove('loading');
        buttonElement.disabled = false;
    }
};

// 유효성 검사 유틸리티
const ValidationUtils = {
    // 이름 유효성 검사
    validateName(name) {
        return name && name.trim().length > 0;
    },

    // 띠 선택 유효성 검사
    validateZodiac(zodiac) {
        return zodiac && zodiac.trim().length > 0;
    },

    // 사번 유효성 검사 (7자리 숫자)
    validateEmployeeId(employeeId) {
        const pattern = new RegExp(`^\\d{${CONFIG.EMPLOYEE_ID_LENGTH}}$`);
        return pattern.test(employeeId);
    }
};



// 해시태그 생성 유틸리티
const HashtagUtils = {
    // 행운 해시태그 3개 생성 (띠 기반)
    generateFortuneHashtags(zodiac) {
        return FORTUNE_HASHTAGS[zodiac] || ['#행운', '#안전', '#성공'];
    },

    // 안전 해시태그 4개 무작위 생성
    generateSafetyHashtags() {
        const shuffled = [...SAFETY_HASHTAGS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    },

    // 해시태그 배열을 문자열로 변환
    hashtagsToString(hashtags) {
        return hashtags.join(' ');
    }
};

// 세션 관리 유틸리티
const SessionUtils = {
    // 세션 데이터 저장
    saveSession() {
        try {
            localStorage.setItem('userSession', JSON.stringify(userSession));
        } catch (error) {
            console.error('세션 저장 실패:', error);
        }
    },

    // 세션 데이터 복원
    restoreSession() {
        try {
            const savedSession = localStorage.getItem('userSession');
            if (savedSession) {
                Object.assign(userSession, JSON.parse(savedSession));
                return true;
            }
        } catch (error) {
            console.error('세션 복원 실패:', error);
            localStorage.removeItem('userSession');
        }
        return false;
    },

    // 세션 데이터 정리
    clearSession() {
        try {
            localStorage.removeItem('userSession');
        } catch (error) {
            console.error('세션 정리 실패:', error);
        }
    }
};

// API 유틸리티 (실제 API 호출 포함)
const ApiUtils = {
    // 사용자 정보 제출
    async submitUserInfo(name, zodiac) {
        // 개발 모드에서는 시뮬레이션
        if (CONFIG.DEVELOPMENT_MODE) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            return {
                success: true,
                data: {
                    name,
                    zodiac,
                    startTime: new Date().toISOString(),
                    rowNumber: Math.floor(Math.random() * 100) + 1
                }
            };
        }

        try {
            const response = await fetch('/.netlify/functions/start-education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, zodiac })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('사용자 정보 제출 API 호출 실패:', error);
            throw error;
        }
    },

    // AI 기반 맞춤형 운세 생성
    async generateCustomFortune(name, zodiac) {
        // 개발 모드에서는 기본 운세 사용
        if (CONFIG.DEVELOPMENT_MODE) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return FORTUNE_DATA[zodiac] || '이번 주는 안전을 최우선으로 하며 좋은 성과를 거둘 것입니다.';
        }

        try {
            console.log('🔮 Claude API 호출 시작:', { name, zodiac });

            const response = await fetch('/.netlify/functions/generate-fortune', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    zodiac: zodiac,
                    context: '제철소 전기설비 정비 작업자'
                })
            });

            console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API 오류 응답:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Claude API 응답 성공:', data);

            if (data.success && data.fortune) {
                return data.fortune;
            } else if (data.fallback) {
                console.log('⚠️ Claude API 실패, 기본 운세 사용:', data.message);
                return data.fortune;
            } else {
                throw new Error('Invalid API response format');
            }

        } catch (error) {
            console.error('❌ AI 운세 생성 API 호출 실패:', error);
            // 실패 시 기본 운세 반환
            const fallbackFortune = FORTUNE_DATA[zodiac] || '이번 주는 안전을 최우선으로 하며 좋은 성과를 거둘 것입니다.';
            console.log('🔄 기본 운세로 폴백:', fallbackFortune);
            return fallbackFortune;
        }
    },

    // 퀴즈 데이터 가져오기
    async getQuizData() {
        // 개발 모드에서는 기본 퀴즈 데이터 사용
        if (CONFIG.DEVELOPMENT_MODE) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return QUIZ_DATA.questions;
        }

        try {
            const response = await fetch('/.netlify/functions/get-quiz', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data; // 퀴즈 문제 배열 반환
        } catch (error) {
            console.error('퀴즈 데이터 조회 API 호출 실패:', error);
            // 실패 시 기본 퀴즈 데이터 반환
            return QUIZ_DATA.questions;
        }
    },

    // 당첨자 수 확인
    async checkWinners() {
        // 개발 모드에서는 시뮬레이션 데이터 반환
        if (CONFIG.DEVELOPMENT_MODE) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { canWin: true, currentWinners: 0, maxWinners: 100 };
        }

        try {
            const response = await fetch('/.netlify/functions/check-winners', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('당첨자 수 확인 API 호출 실패:', error);
            return { canWin: true, currentWinners: 0, maxWinners: 100 };
        }
    },

    // 최종 데이터 제출
    async submitFinalData(sessionData) {
        // 개발 모드에서는 시뮬레이션
        if (CONFIG.DEVELOPMENT_MODE) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            console.log('개발 모드: 제출된 데이터', sessionData);
            return {
                success: true,
                message: '교육이 성공적으로 완료되었습니다.',
                data: sessionData
            };
        }

        try {
            const response = await fetch('/.netlify/functions/complete-education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('최종 데이터 제출 API 호출 실패:', error);
            throw error;
        }
    }
};

// ========================================
// 🖥️ 화면 관리 객체 (SPA 네비게이션)
// ========================================
const screenManager = {
    currentScreen: 'user-info',
    screens: ['user-info', 'fortune', 'video', 'assessment', 'completion'],
    screenSteps: {
        'user-info': 1,
        'fortune': 2,
        'video': 3,
        'assessment': 4,
        'completion': 5
    },

    // 화면 전환 함수
    showScreen(screenId) {
        const currentScreenElement = document.querySelector('.screen.active');
        const targetScreen = document.getElementById(screenId);

        if (!targetScreen) return;

        // 현재 화면에 전환 효과 적용
        if (currentScreenElement) {
            currentScreenElement.classList.add('screen-transition');

            setTimeout(() => {
                // 모든 화면 숨기기
                document.querySelectorAll('.screen').forEach(screen => {
                    screen.classList.remove('active', 'screen-transition');
                });

                // 대상 화면 보이기
                targetScreen.classList.add('active');
                this.currentScreen = screenId;

                // 진행 상황 업데이트
                this.updateProgress(screenId);

                // 화면별 초기화 함수 호출
                this.initializeScreen(screenId);

                // 스크롤을 맨 위로
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        } else {
            // 첫 화면인 경우 바로 표시
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            this.updateProgress(screenId);
            this.initializeScreen(screenId);
        }
    },

    // 진행 상황 업데이트
    updateProgress(screenId) {
        const currentStep = this.screenSteps[screenId];
        const progressSteps = document.querySelectorAll('.progress-step');

        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    },

    // 화면별 초기화
    initializeScreen(screenId) {
        switch (screenId) {
            case 'user-info':
                this.initUserInfoScreen();
                break;
            case 'fortune':
                this.initFortuneScreen();
                break;
            case 'video':
                this.initVideoScreen();
                break;
            case 'assessment':
                this.initAssessmentScreen();
                break;
            case 'completion':
                this.initCompletionScreen();
                break;
        }
    },

    // 사용자 정보 화면 초기화
    initUserInfoScreen() {
        const form = document.getElementById('user-info-form');
        const nameInput = document.getElementById('user-name');
        const zodiacSelect = document.getElementById('user-zodiac');

        // 폼 제출 이벤트
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = nameInput.value.trim();
            const zodiac = zodiacSelect.value;

            // 유효성 검사
            if (!this.validateUserInfo(name, zodiac)) {
                return;
            }

            // 세션 데이터 저장
            userSession.name = name;
            userSession.zodiac = zodiac;
            userSession.startTime = new Date().toISOString();

            // 세션 데이터 저장
            SessionUtils.saveSession();

            try {
                // 버튼 로딩 상태 표시
                const submitBtn = form.querySelector('button[type="submit"]');
                LoadingUtils.showButtonLoading(submitBtn);

                // API 호출 (유틸리티 함수 사용)
                const result = await ApiUtils.submitUserInfo(name, zodiac);

                if (result.success) {
                    // 백엔드에서 받은 행 번호 저장
                    userSession.rowNumber = result.data.rowNumber;

                    // 로딩 상태 해제
                    LoadingUtils.hideButtonLoading(submitBtn);

                    // 다음 화면으로 전환
                    this.showScreen('fortune');
                } else {
                    throw new Error(result.message || '사용자 정보 저장 실패');
                }
            } catch (error) {
                // 로딩 상태 해제
                const submitBtn = form.querySelector('button[type="submit"]');
                LoadingUtils.hideButtonLoading(submitBtn);

                this.showError(error.message || ERROR_MESSAGES.networkError);
            }
        });
    },

    // 사용자 정보 유효성 검사 (유틸리티 함수 사용)
    validateUserInfo(name, zodiac) {
        let isValid = true;

        // 이름 검사
        if (!ValidationUtils.validateName(name)) {
            this.showFieldError('name-error', ERROR_MESSAGES.nameRequired);
            isValid = false;
        } else {
            this.clearFieldError('name-error');
        }

        // 띠 선택 검사
        if (!ValidationUtils.validateZodiac(zodiac)) {
            this.showFieldError('zodiac-error', ERROR_MESSAGES.zodiacRequired);
            isValid = false;
        } else {
            this.clearFieldError('zodiac-error');
        }

        return isValid;
    },

    // 운세 화면 초기화 (AI API 기반)
    initFortuneScreen() {
        const zodiacDisplay = document.getElementById('user-zodiac-display');
        const fortuneText = document.getElementById('fortune-text');
        const lotteryNumbers = document.getElementById('lottery-numbers');
        const startBtn = document.getElementById('start-education-btn');

        // 사용자 띠 표시
        zodiacDisplay.textContent = userSession.zodiac;

        // AI 기반 맞춤형 운세 생성 및 표시
        this.generateAIFortune(fortuneText);

        // 로또 번호 생성 및 표시
        const lotteryNums = this.generateLotteryNumbers();
        lotteryNumbers.innerHTML = lotteryNums.map((num, index) =>
            `<div class="lottery-number" style="--i: ${index}">${num}</div>`
        ).join('');

        // 다음 버튼 이벤트
        startBtn.addEventListener('click', () => {
            this.showScreen('video');
        });
    },

    // AI 기반 맞춤형 운세 생성
    async generateAIFortune(fortuneTextElement) {
        // 로딩 상태 표시
        fortuneTextElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #667eea; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>🔮 ${userSession.name}님의 맞춤 운세를 생성하고 있습니다...</span>
            </div>
        `;

        try {
            // AI API 호출하여 맞춤형 운세 생성
            const customFortune = await ApiUtils.generateCustomFortune(userSession.name, userSession.zodiac);

            // 타이핑 효과로 운세 표시
            this.typeFortuneText(fortuneTextElement, customFortune);

        } catch (error) {
            console.error('AI 운세 생성 실패:', error);
            // 실패 시 기본 운세 표시
            const fallbackFortune = FORTUNE_DATA[userSession.zodiac] || '좋은 일이 생길 것입니다.';
            this.typeFortuneText(fortuneTextElement, fallbackFortune);
        }
    },

    // 운세 텍스트 타이핑 효과
    typeFortuneText(element, text) {
        element.textContent = '';
        let index = 0;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
            } else {
                clearInterval(typeInterval);
                // 타이핑 완료 후 반짝임 효과
                element.style.background = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    element.style.background = 'white';
                }, 500);
            }
        }, 30);
    },

    // 로또 번호 생성 함수 (설정값 사용)
    generateLotteryNumbers() {
        const numbers = [];
        while (numbers.length < CONFIG.LOTTERY_NUMBER_COUNT) {
            const randomNumber = Math.floor(Math.random() * CONFIG.LOTTERY_NUMBER_MAX) + 1;
            if (!numbers.includes(randomNumber)) {
                numbers.push(randomNumber);
            }
        }
        return numbers.sort((a, b) => a - b);
    },

    // 영상 화면 초기화 (제어 기능 추가)
    initVideoScreen() {
        const videoPlayer = document.getElementById('video-player');
        const completeBtn = document.getElementById('video-complete-btn');
        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');

        // 영상 제어 버튼들
        const restartBtn = document.getElementById('video-restart-btn');
        const pauseBtn = document.getElementById('video-pause-btn');
        const resumeBtn = document.getElementById('video-resume-btn');

        // 영상 상태 관리 객체 초기화
        this.videoState = {
            isPlaying: false,
            isPaused: false,
            currentProgress: 0,
            totalDuration: CONFIG.VIDEO_SIMULATION_DURATION,
            progressInterval: null
        };

        // 임시 영상 플레이어 (실제 구현 시 Google Drive 영상으로 교체)
        this.setupVideoPlayer(videoPlayer);

        // 이벤트 리스너 설정
        this.setupVideoEventListeners(progressFill, timeDisplay, completeBtn, restartBtn, pauseBtn, resumeBtn);
    },

    // 영상 플레이어 설정 (YouTube 영상 임베드)
    setupVideoPlayer(videoPlayer) {
        // YouTube 영상 ID (환경에 따라 다른 영상 사용)
        const videoId = CONFIG.DEVELOPMENT_MODE ?
            'dQw4w9WgXcQ' : // 개발용 샘플 ID
            CONFIG.VIDEO_URL || 'dQw4w9WgXcQ'; // 실제 영상 ID

        if (CONFIG.DEVELOPMENT_MODE) {
            // 개발 모드: 시뮬레이션 버튼
            videoPlayer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                    <p style="font-size: 18px; margin-bottom: 10px;">🎬 전기설비 안전교육 영상</p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                        개발 모드: 10초 시뮬레이션으로 진행됩니다
                    </p>
                    <button id="simulate-video" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        📺 영상 시청 시작
                    </button>
                </div>
            `;
        } else {
            // 프로덕션 모드: 실제 YouTube 영상
            videoPlayer.innerHTML = `
                <div style="position: relative; width: 100%; height: 400px;">
                    <iframe 
                        id="safety-video"
                        src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1" 
                        width="100%" 
                        height="100%" 
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        style="border-radius: 10px;">
                    </iframe>
                </div>
            `;

            // YouTube API를 통한 영상 추적 시작
            this.initYouTubePlayer(videoId);
        }
    },

    // 영상 이벤트 리스너 설정 (별도 함수로 분리)
    setupVideoEventListeners(progressFill, timeDisplay, completeBtn, restartBtn, pauseBtn, resumeBtn) {
        // 영상 시작 버튼 이벤트
        const simulateBtn = document.getElementById('simulate-video');
        simulateBtn.addEventListener('click', () => {
            this.startVideoPlayback(progressFill, timeDisplay, completeBtn);
        });

        // 처음부터 다시보기 버튼 이벤트
        restartBtn.addEventListener('click', () => {
            this.restartVideo(progressFill, timeDisplay, completeBtn);
        });

        // 일시정지 버튼 이벤트
        pauseBtn.addEventListener('click', () => {
            this.pauseVideo(pauseBtn, resumeBtn);
        });

        // 재생 버튼 이벤트
        resumeBtn.addEventListener('click', () => {
            this.resumeVideo(pauseBtn, resumeBtn, progressFill, timeDisplay, completeBtn);
        });

        // 시청 완료 버튼 이벤트
        completeBtn.addEventListener('click', () => {
            this.showScreen('assessment');
        });
    },

    // 영상 재생 시작 (기존 함수명 변경)
    startVideoPlayback(progressFill, timeDisplay, completeBtn) {
        if (this.videoState.isPlaying) return; // 이미 재생 중이면 무시

        this.videoState.isPlaying = true;
        this.videoState.isPaused = false;
        this.simulateVideoProgress(progressFill, timeDisplay, completeBtn);
    },

    // 영상 처음부터 다시보기
    restartVideo(progressFill, timeDisplay, completeBtn) {
        if (CONFIG.DEVELOPMENT_MODE) {
            // 개발 모드: 시뮬레이션 재시작
            if (this.videoState.progressInterval) {
                clearInterval(this.videoState.progressInterval);
            }

            this.videoState.currentProgress = 0;
            this.videoState.isPlaying = false;
            this.videoState.isPaused = false;

            progressFill.style.width = '0%';
            timeDisplay.textContent = '00:00 / 10:00';
            completeBtn.style.display = 'none';

            this.startVideoPlayback(progressFill, timeDisplay, completeBtn);
        } else {
            // 프로덕션 모드: YouTube 영상 재시작
            if (this.youtubePlayer && this.youtubePlayer.seekTo) {
                this.youtubePlayer.seekTo(0);
                this.youtubePlayer.playVideo();

                progressFill.style.width = '0%';
                completeBtn.style.display = 'none';
            }
        }
    },

    // 영상 일시정지
    pauseVideo(pauseBtn, resumeBtn) {
        if (CONFIG.DEVELOPMENT_MODE) {
            // 개발 모드: 시뮬레이션 일시정지
            if (!this.videoState.isPlaying || this.videoState.isPaused) return;

            this.videoState.isPaused = true;
            if (this.videoState.progressInterval) {
                clearInterval(this.videoState.progressInterval);
            }
        } else {
            // 프로덕션 모드: YouTube 영상 일시정지
            if (this.youtubePlayer && this.youtubePlayer.pauseVideo) {
                this.youtubePlayer.pauseVideo();
            }
        }

        // 버튼 상태 변경
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
    },

    // 영상 재생 재개
    resumeVideo(pauseBtn, resumeBtn, progressFill, timeDisplay, completeBtn) {
        if (CONFIG.DEVELOPMENT_MODE) {
            // 개발 모드: 시뮬레이션 재개
            if (!this.videoState.isPaused) return;

            this.videoState.isPaused = false;
            this.simulateVideoProgress(progressFill, timeDisplay, completeBtn);
        } else {
            // 프로덕션 모드: YouTube 영상 재개
            if (this.youtubePlayer && this.youtubePlayer.playVideo) {
                this.youtubePlayer.playVideo();
            }
        }

        // 버튼 상태 변경
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
    },

    // 영상 진행 시뮬레이션 (상태 관리 포함)
    simulateVideoProgress(progressFill, timeDisplay, completeBtn) {
        // 1초마다 진행률 업데이트
        this.videoState.progressInterval = setInterval(() => {
            if (this.videoState.isPaused) return; // 일시정지 상태면 진행하지 않음

            this.videoState.currentProgress += 1;
            const progressPercentage = (this.videoState.currentProgress / this.videoState.totalDuration) * 100;

            // 진행 바 업데이트
            progressFill.style.width = `${progressPercentage}%`;
            timeDisplay.textContent = `${this.videoState.currentProgress}:00 / ${this.videoState.totalDuration}:00`;

            // 영상 완료 시 처리
            if (this.videoState.currentProgress >= this.videoState.totalDuration) {
                clearInterval(this.videoState.progressInterval);
                this.videoState.isPlaying = false;
                this.showVideoCompleteButton(completeBtn);
            }
        }, 1000);
    },

    // YouTube 플레이어 초기화 및 추적
    initYouTubePlayer(videoId) {
        // YouTube API 스크립트 로드
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // API 로드 완료 후 플레이어 초기화
            window.onYouTubeIframeAPIReady = () => {
                this.createYouTubePlayer(videoId);
            };
        } else {
            this.createYouTubePlayer(videoId);
        }
    },

    // YouTube 플레이어 생성
    createYouTubePlayer(videoId) {
        this.youtubePlayer = new YT.Player('safety-video', {
            videoId: videoId,
            events: {
                'onReady': (event) => this.onYouTubePlayerReady(event),
                'onStateChange': (event) => this.onYouTubePlayerStateChange(event)
            }
        });
    },

    // YouTube 플레이어 준비 완료
    onYouTubePlayerReady(event) {
        console.log('YouTube 플레이어 준비 완료');
        this.startYouTubeTracking();
    },

    // YouTube 플레이어 상태 변경
    onYouTubePlayerStateChange(event) {
        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');
        const completeBtn = document.getElementById('video-complete-btn');

        if (event.data === YT.PlayerState.ENDED) {
            // 영상 완료 시
            this.videoState.isPlaying = false;
            progressFill.style.width = '100%';
            this.showVideoCompleteButton(completeBtn);

            if (this.videoState.progressInterval) {
                clearInterval(this.videoState.progressInterval);
            }
        } else if (event.data === YT.PlayerState.PLAYING) {
            // 재생 시작/재개 시
            this.videoState.isPlaying = true;
            this.videoState.isPaused = false;
        } else if (event.data === YT.PlayerState.PAUSED) {
            // 일시정지 시
            this.videoState.isPaused = true;
        }
    },

    // YouTube 영상 진행률 추적 시작
    startYouTubeTracking() {
        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');
        const completeBtn = document.getElementById('video-complete-btn');

        // 1초마다 진행률 업데이트
        this.videoState.progressInterval = setInterval(() => {
            if (this.youtubePlayer && this.youtubePlayer.getCurrentTime) {
                const currentTime = this.youtubePlayer.getCurrentTime();
                const duration = this.youtubePlayer.getDuration();

                if (duration > 0) {
                    const progressPercentage = (currentTime / duration) * 100;

                    // 진행 바 업데이트
                    progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;

                    // 시간 표시 업데이트
                    const currentMinutes = Math.floor(currentTime / 60);
                    const currentSeconds = Math.floor(currentTime % 60);
                    const totalMinutes = Math.floor(duration / 60);
                    const totalSecondsDisplay = Math.floor(duration % 60);

                    timeDisplay.textContent =
                        `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSecondsDisplay.toString().padStart(2, '0')}`;

                    // 영상 완료 시 처리 (90% 시청 시 완료로 간주)
                    if (progressPercentage >= 90) {
                        clearInterval(this.videoState.progressInterval);
                        this.showVideoCompleteButton(completeBtn);
                    }
                }
            }
        }, 1000);
    },% `;
            
            // 시간 표시 업데이트
            const currentMinutes = Math.floor(currentTime / 60);
            const currentSeconds = currentTime % 60;
            const totalMinutes = Math.floor(videoDurationSeconds / 60);
            const totalSeconds = videoDurationSeconds % 60;
            
            timeDisplay.textContent = 
                `${ currentMinutes }: ${ currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;

// 영상 완료 시 처리 (90% 시청 시 완료로 간주)
if (currentTime >= videoDurationSeconds * 0.9) {
    clearInterval(this.videoState.progressInterval);
    this.showVideoCompleteButton(completeBtn);
}
        }, 1000);
    },

// 영상 완료 버튼 표시 (별도 함수로 분리)
showVideoCompleteButton(completeBtn) {
    completeBtn.style.display = 'block';
    completeBtn.scrollIntoView({ behavior: 'smooth' });
},

    // 평가 화면 초기화 (동적 퀴즈 생성)
    async initAssessmentScreen() {
    try {
        // 백엔드에서 퀴즈 데이터 로드
        const quizData = await ApiUtils.getQuizData();
        userSession.quizData = quizData;

        // 퀴즈 문제 동적 생성
        this.generateQuizQuestions(quizData);

        const assessmentForm = document.getElementById('assessment-form');
        const submitButton = assessmentForm.querySelector('button[type="submit"]');

        // 기존 답변이 있다면 복원
        this.restoreQuizAnswers();

        // 이벤트 리스너 설정
        this.setupQuizEventListeners(assessmentForm, submitButton);

        // 초기 상태 업데이트
        this.updateAssessmentButton(assessmentForm, submitButton);
        this.updateAllOptionStyles();
    } catch (error) {
        console.error('퀴즈 데이터 로드 실패:', error);
        // 기본 퀴즈 데이터로 폴백
        userSession.quizData = QUIZ_DATA.questions;
        this.generateQuizQuestions(QUIZ_DATA.questions);
    }
},

// 퀴즈 문제 동적 생성 (데이터 구조 사용)
generateQuizQuestions(quizData = QUIZ_DATA.questions) {
    const questionsContainer = document.getElementById('quiz-questions-container');
    questionsContainer.innerHTML = ''; // 기존 내용 초기화

    quizData.forEach((questionData, index) => {
        const questionNumber = index + 1;
        const questionElement = this.createQuestionElement(questionData, questionNumber);
        questionsContainer.appendChild(questionElement);
    });
},

// 개별 문제 요소 생성 (별도 함수로 분리)
createQuestionElement(questionData, questionNumber) {
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question-container';

    // 문제 제목
    const questionTitle = document.createElement('h3');
    questionTitle.textContent = `문제 ${questionNumber}. ${questionData.question}`;
    questionContainer.appendChild(questionTitle);

    // 선택지 컨테이너
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options';

    // 각 선택지 생성
    questionData.options.forEach((optionText, optionIndex) => {
        const optionValue = optionIndex + 1;
        const optionElement = this.createOptionElement(questionNumber, optionValue, optionText);
        optionsContainer.appendChild(optionElement);
    });

    questionContainer.appendChild(optionsContainer);
    return questionContainer;
},

// 개별 선택지 요소 생성 (별도 함수로 분리)
createOptionElement(questionNumber, optionValue, optionText) {
    const optionLabel = document.createElement('label');
    optionLabel.className = 'option';

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = `question${questionNumber}`;
    radioInput.value = optionValue;

    const optionSpan = document.createElement('span');
    optionSpan.textContent = optionText;

    optionLabel.appendChild(radioInput);
    optionLabel.appendChild(optionSpan);

    return optionLabel;
},

// 퀴즈 이벤트 리스너 설정 (별도 함수로 분리)
setupQuizEventListeners(formElement, submitButton) {
    const radioButtons = formElement.querySelectorAll('input[type="radio"]');

    // 라디오 버튼 변경 이벤트
    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', () => {
            this.updateAssessmentButton(formElement, submitButton);
            this.updateOptionStyles(radioButton);
        });
    });

    // 폼 제출 이벤트
    formElement.addEventListener('submit', (event) => {
        event.preventDefault();
        this.handleQuizSubmission(formElement);
    });
},

// 퀴즈 제출 처리 (별도 함수로 분리)
handleQuizSubmission(formElement) {
    const formData = new FormData(formElement);

    // 답변을 배열 형태로 저장 (백엔드 형식에 맞춤)
    userSession.quizAnswers = [];
    userSession.quizData.forEach((_, index) => {
        const questionNumber = index + 1;
        const answerValue = parseInt(formData.get(`question${questionNumber}`)) - 1; // 0-based index로 변환
        userSession.quizAnswers.push(answerValue);
    });

    // 세션 저장
    SessionUtils.saveSession();

    // 완료 화면으로 이동
    this.showScreen('completion');
},

// 퀴즈 답변 복원
restoreQuizAnswers() {
    userSession.quizAnswers.forEach((answerIndex, questionIndex) => {
        if (answerIndex !== undefined && answerIndex !== null) {
            const questionNumber = questionIndex + 1;
            const answerValue = answerIndex + 1; // 1-based index로 변환
            const radio = document.querySelector(`input[name="question${questionNumber}"][value="${answerValue}"]`);
            if (radio) radio.checked = true;
        }
    });
},

// 모든 옵션 스타일 업데이트
updateAllOptionStyles() {
    const checkedRadios = document.querySelectorAll('input[type="radio"]:checked');
    checkedRadios.forEach(radio => {
        this.updateOptionStyles(radio);
    });
},

// 평가 버튼 상태 업데이트
updateAssessmentButton(form, submitBtn) {
    const totalQuestions = userSession.quizData.length || 2;
    let answeredCount = 0;

    for (let i = 1; i <= totalQuestions; i++) {
        const checkedAnswer = form.querySelector(`input[name="question${i}"]:checked`);
        if (checkedAnswer) {
            answeredCount++;
        }
    }

    if (answeredCount === totalQuestions) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
},

// 선택된 옵션 스타일 업데이트
updateOptionStyles(selectedRadio) {
    const questionContainer = selectedRadio.closest('.question-container');
    const options = questionContainer.querySelectorAll('.option');

    options.forEach(option => {
        option.classList.remove('selected');
    });

    selectedRadio.closest('.option').classList.add('selected');
},

// 완료 화면 초기화
initCompletionScreen() {
    const modifyBtn = document.getElementById('modify-answers-btn');
    const proceedBtn = document.getElementById('proceed-to-final-btn');
    const employeeSection = document.getElementById('employee-id-section');
    const employeeInput = document.getElementById('employee-id');
    const finalSubmitBtn = document.getElementById('final-submit-btn');

    // 답변 정보 표시
    this.displayAnswerSummary();

    // 답변 수정 버튼 이벤트
    modifyBtn.addEventListener('click', () => {
        this.showScreen('assessment');
    });

    // 최종 제출하기 버튼 이벤트
    proceedBtn.addEventListener('click', () => {
        document.querySelector('.answer-review-section').style.display = 'none';
        employeeSection.style.display = 'block';
        employeeSection.scrollIntoView({ behavior: 'smooth' });
    });

    // 사번 입력 유효성 검사
    employeeInput.addEventListener('input', () => {
        this.validateEmployeeId(employeeInput, finalSubmitBtn);
    });

    // 최종 제출 버튼 이벤트
    finalSubmitBtn.addEventListener('click', async () => {
        await this.handleFinalSubmit();
    });
},

// 답변 요약 정보 표시 (해시태그 중심)
displayAnswerSummary() {
    // 해시태그 생성 및 표시
    this.generateAndDisplayHashtags();

    // 퀴즈 답변 표시
    this.displayQuizAnswers();
},

// 해시태그 생성 및 표시
generateAndDisplayHashtags() {
    const fortuneHashtagsElement = document.getElementById('review-fortune-hashtags');
    const safetyHashtagsElement = document.getElementById('review-safety-hashtags');

    if (fortuneHashtagsElement && safetyHashtagsElement) {
        // 행운 해시태그 생성 (띠 기반)
        const fortuneHashtags = HashtagUtils.generateFortuneHashtags(userSession.zodiac);
        const fortuneHashtagString = HashtagUtils.hashtagsToString(fortuneHashtags);

        // 안전 해시태그 생성 (무작위 4개)
        const safetyHashtags = HashtagUtils.generateSafetyHashtags();
        const safetyHashtagString = HashtagUtils.hashtagsToString(safetyHashtags);

        // 타이핑 효과로 해시태그 표시
        this.typeHashtagsWithEffect(fortuneHashtagsElement, fortuneHashtagString, 'fortune');

        // 행운 해시태그 완료 후 안전 해시태그 표시
        setTimeout(() => {
            this.typeHashtagsWithEffect(safetyHashtagsElement, safetyHashtagString, 'safety');
        }, fortuneHashtagString.length * 30 + 500);
    }
},

// 해시태그 타이핑 효과 (스타일 포함)
typeHashtagsWithEffect(element, text, type) {
    element.textContent = '';
    element.classList.add(type); // fortune 또는 safety 클래스 추가

    let index = 0;
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(typeInterval);
            // 타이핑 완료 후 반짝임 효과
            element.style.transform = 'scale(1.02)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }, 30);
},

// 퀴즈 답변 표시 (별도 함수로 분리, 데이터 구조 사용)
displayQuizAnswers() {
    QUIZ_DATA.questions.forEach((questionData, index) => {
        const questionNumber = index + 1;
        const userAnswer = userSession.quizAnswers[`question${questionNumber}`];

        if (userAnswer) {
            const answerNumberElement = document.getElementById(`answer${questionNumber}-number`);
            const answerTextElement = document.getElementById(`answer${questionNumber}-text`);

            if (answerNumberElement && answerTextElement) {
                answerNumberElement.textContent = userAnswer;
                answerTextElement.textContent = questionData.options[parseInt(userAnswer) - 1];
            }
        }
    });
},



// 사번 유효성 검사 (유틸리티 함수 사용)
validateEmployeeId(inputElement, submitButton) {
    const employeeIdValue = inputElement.value;
    const isValidEmployeeId = ValidationUtils.validateEmployeeId(employeeIdValue);

    if (employeeIdValue && !isValidEmployeeId) {
        this.showFieldError('employee-id-error', ERROR_MESSAGES.employeeIdInvalid);
        submitButton.disabled = true;
    } else if (isValidEmployeeId) {
        this.clearFieldError('employee-id-error');
        submitButton.disabled = false;
    } else {
        this.clearFieldError('employee-id-error');
        submitButton.disabled = true;
    }
},

    // 행운 버튼 클릭 처리 (최종 제출 + 행운 이벤트)
    async handleFinalSubmit() {
    const luckyButton = document.getElementById('final-submit-btn');

    try {
        // 제출 데이터 준비
        this.prepareFinalSubmissionData();

        // 당첨자 수 확인
        const winnerStatus = await ApiUtils.checkWinners();

        // 행운 이벤트 처리 (당첨자 수 제한 고려)
        this.processLuckyEvent(winnerStatus.canWin);

        // 행운 버튼 로딩 상태 표시 (특별한 메시지)
        this.showLuckyButtonLoading(luckyButton);

        // 최종 데이터 제출 (백엔드 형식에 맞춤)
        const submitData = {
            name: userSession.name,
            zodiac: userSession.zodiac,
            employeeId: userSession.employeeId,
            quizAnswers: userSession.quizAnswers,
            rowNumber: userSession.rowNumber,
            isWinner: userSession.isWinner
        };

        const result = await ApiUtils.submitFinalData(submitData);

        // 로딩 상태 해제
        LoadingUtils.hideButtonLoading(luckyButton);

        if (result.success) {
            // 행운 결과 팝업 표시
            this.showLuckyResultPopup();

            // 세션 정리
            SessionUtils.clearSession();
        } else {
            throw new Error(result.message || '제출 실패');
        }

    } catch (error) {
        // 오류 처리
        LoadingUtils.hideButtonLoading(luckyButton);
        this.showError(error.message || ERROR_MESSAGES.submitError);
    }
},

// 행운 버튼 로딩 상태 표시 (특별한 메시지)
showLuckyButtonLoading(buttonElement) {
    buttonElement.classList.add('loading');
    buttonElement.disabled = true;
    buttonElement.innerHTML = '🍀 행운을 확인하는 중...';
},

// 최종 제출 데이터 준비 (별도 함수로 분리)
prepareFinalSubmissionData() {
    const employeeIdInput = document.getElementById('employee-id');
    userSession.employeeId = employeeIdInput.value;
    userSession.completionTime = new Date().toISOString();
},

// 행운 이벤트 처리 (별도 함수로 분리)
processLuckyEvent(canWin = true) {
    if (!canWin) {
        userSession.isWinner = false;
        return;
    }

    const randomValue = Math.random();
    userSession.isWinner = randomValue < CONFIG.WIN_PROBABILITY;
},

// 행운 결과 팝업 표시 (프로그램 종료 기능 포함)
showLuckyResultPopup() {
    if (userSession.isWinner) {
        this.showFinalModal(
            '🎉 대박! 당첨되셨습니다!',
            `축하합니다! ${userSession.name}님께서 행운의 당첨자로 선정되셨습니다!\n\n전기설비 안전교육도 성공적으로 완료하셨습니다.\n정말 수고 많으셨습니다! 🎊`
        );
    } else {
        this.showFinalModal(
            '😊 교육 완료!',
            `${userSession.name}님, 전기설비 안전교육을 성공적으로 완료하셨습니다!\n\n아쉽게도 이번엔 당첨되지 않으셨지만,\n안전한 작업을 위한 소중한 지식을 얻으셨습니다.\n\n정말 수고 많으셨습니다! 👏`
        );
    }
},

// 최종 완료 모달 (창 닫기 기능 포함)
showFinalModal(title, message) {
    const overlay = document.getElementById('modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');
    const closeBtn = document.getElementById('modal-close-btn');

    titleElement.textContent = title;
    messageElement.textContent = message;

    // 버튼 텍스트를 "창 닫기"로 변경
    closeBtn.textContent = '창 닫기';
    closeBtn.className = 'btn btn-close'; // 특별한 스타일 적용

    overlay.classList.add('active');

    // 최종 완료 모달 닫기 이벤트 (프로그램 종료)
    const closeFinalModal = () => {
        this.closeApplication();
    };

    const outsideClick = (event) => {
        if (event.target === overlay) {
            this.closeApplication();
        }
    };

    // 이벤트 리스너 등록
    closeBtn.addEventListener('click', closeFinalModal);
    overlay.addEventListener('click', outsideClick);

    // ESC 키로도 종료 가능
    const handleEscKey = (event) => {
        if (event.key === 'Escape') {
            this.closeApplication();
        }
    };

    document.addEventListener('keydown', handleEscKey);

    // 정리 함수 저장 (나중에 사용)
    this.finalModalCleanup = () => {
        closeBtn.removeEventListener('click', closeFinalModal);
        overlay.removeEventListener('click', outsideClick);
        document.removeEventListener('keydown', handleEscKey);
    };
},

// 애플리케이션 종료 처리
closeApplication() {
    // 모달 정리
    if (this.finalModalCleanup) {
        this.finalModalCleanup();
    }

    // 모달 숨기기
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');

    // 감사 메시지와 함께 페이지 숨기기
    this.showClosingMessage();

    // 3초 후 창 닫기 시도 (브라우저 보안 정책에 따라 동작할 수 있음)
    setTimeout(() => {
        this.attemptWindowClose();
    }, 3000);
},

// 종료 메시지 표시
showClosingMessage() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);">
                <h1 style="color: #667eea; margin-bottom: 20px;">🎓 교육 완료</h1>
                <p style="font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 30px;">
                    전기설비 온라인 안전교육이 성공적으로 완료되었습니다.<br>
                    안전한 작업을 위해 배운 내용을 잘 기억해 주세요.
                </p>
                <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
                    잠시 후 창이 자동으로 닫힙니다.
                </p>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <div style="width: 10px; height: 10px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div>
                    <div style="width: 10px; height: 10px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
                    <div style="width: 10px; height: 10px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
                </div>
            </div>
        `;

    // 바운스 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
            @keyframes bounce {
                0%, 80%, 100% {
                    transform: scale(0);
                }
                40% {
                    transform: scale(1.0);
                }
            }
        `;
    document.head.appendChild(style);
},

// 창 닫기 시도
attemptWindowClose() {
    try {
        // 브라우저에서 창 닫기 시도
        window.close();

        // 창이 닫히지 않는 경우를 대비한 메시지
        setTimeout(() => {
            if (!window.closed) {
                document.body.innerHTML = `
                        <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <div style="text-align: center; padding: 40px; background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); max-width: 500px;">
                                <h2 style="color: #667eea; margin-bottom: 20px;">✅ 교육 완료</h2>
                                <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
                                    전기설비 온라인 안전교육이 완료되었습니다.<br>
                                    이 창을 직접 닫아주세요.
                                </p>
                                <p style="font-size: 14px; color: #666;">
                                    브라우저 탭을 닫거나 Alt+F4 (Windows) / Cmd+W (Mac)를 눌러주세요.
                                </p>
                            </div>
                        </div>
                    `;
            }
        }, 1000);
    } catch (error) {
        console.log('창 닫기 실패:', error);
    }
},

// 필드 오류 표시
showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
    }
},

// 필드 오류 제거
clearFieldError(errorId) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = '';
    }
},

// 일반 오류 표시
showError(message) {
    this.showModal('오류', message);
},

// 일반 모달 표시 (기본 확인 버튼)
showModal(title, message) {
    const overlay = document.getElementById('modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');
    const closeBtn = document.getElementById('modal-close-btn');

    titleElement.textContent = title;
    messageElement.textContent = message;

    // 기본 버튼 스타일로 복원
    closeBtn.textContent = '확인';
    closeBtn.className = 'btn btn-primary';

    overlay.classList.add('active');

    // 모달 닫기 이벤트
    const closeModal = () => {
        overlay.classList.remove('active');
        closeBtn.removeEventListener('click', closeModal);
        overlay.removeEventListener('click', outsideClick);
    };

    const outsideClick = (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', outsideClick);
}
};

// ========================================
// 🚀 애플리케이션 초기화
// ========================================

// 애플리케이션 초기화 관리자
const AppInitializer = {
    // 전체 초기화 프로세스
    initialize() {
        this.showDevelopmentMode();
        this.hideLoadingScreen();
        this.restoreUserSession();
        this.initializeScreenManager();
        this.setupErrorHandling();
    },

    // 개발 모드 표시
    showDevelopmentMode() {
        if (CONFIG.DEVELOPMENT_MODE) {
            console.log('🔧 Safe Edu - 개발 모드로 실행 중');
            console.log('📡 API 호출이 시뮬레이션으로 동작합니다');

            // 개발 모드 표시 추가
            const devIndicator = document.createElement('div');
            devIndicator.innerHTML = '🔧 개발 모드';
            devIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #ff6b6b;
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 10000;
                font-family: monospace;
            `;
            document.body.appendChild(devIndicator);
        }
    },

    // 로딩 화면 숨기기 (설정값 사용)
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingElement = document.getElementById('loading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }, CONFIG.LOADING_DELAY);
    },

    // 사용자 세션 복구 (유틸리티 함수 사용)
    restoreUserSession() {
        SessionUtils.restoreSession();
    },

    // 화면 관리자 초기화
    initializeScreenManager() {
        screenManager.initializeScreen('user-info');
    },

    // 전역 오류 처리 설정
    setupErrorHandling() {
        // 페이지 새로고침 방지 (교육 진행 중일 때)
        window.addEventListener('beforeunload', (event) => {
            if (userSession.name && !userSession.completionTime) {
                event.preventDefault();
                event.returnValue = '교육이 완료되지 않았습니다. 정말 나가시겠습니까?';
            }
        });
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    AppInitializer.initialize();
});