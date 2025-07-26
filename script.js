// ========================================
// 🔧 빠른 로딩을 위한 간소화된 설정
// ========================================
console.log('Script 로드 시작:', new Date().toLocaleTimeString());

const CONFIG = {
    API_BASE_URL: '/.netlify/functions',
    // YouTube 영상 설정 (Privacy-Enhanced 모드 전용)
    YOUTUBE_VIDEO_ID: 'HggDt3GUGYo', // YouTube 영상 ID
    DEVELOPMENT_MODE: window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    LOADING_DELAY: 0, // 즉시 로딩
    VIDEO_SIMULATION_DURATION: 10,
    WIN_PROBABILITY: 0.1,
    MAX_WINNERS: 100
};

const userSession = {
    name: '',
    zodiac: '',
    quizAnswers: [],
    isWinner: false,
    employeeId: '',
    quizData: [],
    videoCompleted: false,
    quizScore: 0,  // 시청 완료 버튼 클릭 횟수
    rowNumber: null  // Google Sheets 행 번호
};

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

// 해시태그 데이터
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

const SAFETY_HASHTAGS = [
    '#전원차단확인', '#절연장갑착용', '#접지확인', '#전압측정',
    '#안전거리유지', '#작업허가서확인', '#보호구착용', '#화재예방'
];

console.log('데이터 로드 완료:', new Date().toLocaleTimeString());

// ========================================
// 🛠️ 유틸리티 함수들
// ========================================
const Utils = {
    generateLotteryNumbers() {
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    },

    validateName(name) {
        return name && name.trim().length > 0;
    },

    validateZodiac(zodiac) {
        return zodiac && zodiac.trim().length > 0;
    },

    validateEmployeeId(employeeId) {
        return /^\d{7}$/.test(employeeId);
    },

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    },

    // 네트워크 요청 유틸리티 (timeout과 retry 포함)
    async fetchWithTimeout(url, options = {}, timeout = 10000, retries = 2) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const fetchOptions = {
            ...options,
            signal: controller.signal
        };

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, fetchOptions);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                console.warn(`API 호출 시도 ${attempt + 1}/${retries + 1} 실패:`, error.message);

                if (attempt === retries) {
                    clearTimeout(timeoutId);
                    throw error;
                }

                // 재시도 전 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
};

console.log('유틸리티 함수 로드 완료:', new Date().toLocaleTimeString());

// ========================================
// 📱 화면 관리자
// ========================================
const ScreenManager = {
    currentScreen: 'user-info',

    showScreen(screenId) {
        console.log('화면 전환:', screenId);

        // 모든 화면 숨기기
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // 대상 화면 보이기
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
            this.updateProgress(screenId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    updateProgress(screenId) {
        const steps = {
            'user-info': 1,
            'fortune': 2,
            'video': 3,
            'assessment': 4,
            'completion': 5
        };

        const currentStep = steps[screenId];
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === currentStep) {
                step.classList.add('active');
            }
        });
    }
};

console.log('화면 관리자 로드 완료:', new Date().toLocaleTimeString());

// ========================================
// 🎬 영상 관리자
// ========================================
const VideoManager = {
    videoState: {
        isPlaying: false,
        isPaused: false,
        currentProgress: 0,
        totalDuration: CONFIG.VIDEO_SIMULATION_DURATION,
        progressInterval: null,
        pausedAt: 0
    },
    youtubePlayer: null,

    setupVideoPlayer() {
        console.log('영상 플레이어 설정 시작');
        const videoPlayer = document.getElementById('video-player');

        // 영상 ID 검증
        if (!this.validateVideoId()) {
            this.showVideoIdError(videoPlayer);
            return;
        }

        if (CONFIG.DEVELOPMENT_MODE) {
            // 개발 모드: 시뮬레이션
            this.renderDevelopmentVideo(videoPlayer);
        } else {
            // 프로덕션 모드: 실제 영상
            this.loadProductionVideo(videoPlayer);
        }

        this.setupVideoControls();
    },

    validateVideoId() {
        const videoId = CONFIG.YOUTUBE_VIDEO_ID;

        if (!videoId || videoId.trim() === '') {
            console.error('YouTube 영상 ID가 설정되지 않았습니다.');
            return false;
        }

        // YouTube ID 검증 (11자리 영숫자)
        const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;
        if (!youtubeIdPattern.test(videoId)) {
            console.error('유효하지 않은 YouTube 영상 ID:', videoId);
            return false;
        }

        return true;
    },

    showVideoIdError(container) {
        container.innerHTML = `
            <div class="video-fallback">
                <h3>⚠️ YouTube 영상 설정 오류</h3>
                <p>YouTube 영상 ID가 올바르게 설정되지 않았습니다.</p>
                <p><strong>현재 설정:</strong> ${CONFIG.YOUTUBE_VIDEO_ID}</p>
                <p>script.js 파일의 CONFIG.YOUTUBE_VIDEO_ID에서 올바른 11자리 YouTube 영상 ID를 설정해주세요.</p>
                <p><small>예시: 'dQw4w9WgXcQ' (11자리 영숫자)</small></p>
            </div>
        `;
    },

    renderDevelopmentVideo(container) {
        container.innerHTML = `
            <div class="dev-video-container">
                <p class="dev-video-title">🎬 전기설비 안전교육 영상</p>
                <p class="dev-video-desc">
                    개발 모드: ${CONFIG.VIDEO_SIMULATION_DURATION}초 시뮬레이션으로 진행됩니다
                </p>
                <button id="simulate-video" class="dev-video-btn">
                    📺 영상 시청 시작
                </button>
            </div>
        `;

        // 시뮬레이션 버튼 이벤트
        setTimeout(() => {
            const simulateBtn = document.getElementById('simulate-video');
            if (simulateBtn) {
                simulateBtn.addEventListener('click', () => {
                    this.startVideoSimulation();
                });
            }
        }, 100);
    },

    loadProductionVideo(container) {
        // 로딩 상태 표시
        container.innerHTML = `
            <div class="video-loading">
                <div class="loading-spinner"></div>
                <p>영상을 불러오는 중입니다...</p>
                <small>Privacy-Enhanced 모드로 로딩 중</small>
            </div>
        `;

        const videoConfig = this.getVideoConfig();

        // 잠시 후 실제 영상 로드
        setTimeout(() => {
            container.innerHTML = `
                <div class="video-wrapper">
                    ${videoConfig.iframe}
                </div>
            `;

            // YouTube Player API 초기화
            this.initializeYouTubePlayer();

            // 영상 로드 실패 감지 및 fallback 처리
            this.setupVideoFallback(container, videoConfig);

            // 실제 영상 추적 시작
            this.startRealVideoTracking(videoConfig.duration);
        }, 500);
    },

    setupVideoFallback(container, videoConfig) {
        // iframe 로드 실패 감지
        const iframe = container.querySelector('iframe');
        if (iframe) {
            // iframe 로드 오류 감지
            iframe.addEventListener('error', () => {
                console.warn('영상 로드 실패, fallback 모드로 전환');
                this.showVideoFallback(container, videoConfig);
            });

            // iframe 로드 완료 후에도 오류가 있는지 확인
            iframe.addEventListener('load', () => {
                setTimeout(() => {
                    try {
                        // iframe 내부에서 오류가 발생했는지 확인
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.includes('오류')) {
                            console.warn('YouTube 영상 오류 감지, fallback 모드로 전환');
                            this.showVideoFallback(container, videoConfig);
                        }
                    } catch (e) {
                        // Cross-origin 제한으로 인한 오류는 무시 (정상적인 경우)
                        console.log('Cross-origin 제한으로 iframe 내용 확인 불가 (정상)');
                    }
                }, 2000);
            });

            // 영상 로드 모니터링 (수동 완료 버튼 제거됨)
        }
    },

    showVideoFallback(container, videoConfig) {
        container.innerHTML = videoConfig.fallbackMessage;

        // Google Drive 백업 시도 버튼 이벤트 설정
        const tryGoogleDriveBtn = container.querySelector('#try-google-drive-btn');
        if (tryGoogleDriveBtn && CONFIG.VIDEO_PROVIDER === 'youtube') {
            tryGoogleDriveBtn.addEventListener('click', () => {
                console.log('Google Drive 영상으로 전환 시도');
                CONFIG.VIDEO_PROVIDER = 'google-drive';
                this.loadProductionVideo(container);
            });
        } else if (tryGoogleDriveBtn) {
            // 이미 Google Drive 모드인 경우 버튼 숨기기
            tryGoogleDriveBtn.style.display = 'none';
        }

        // 수동 완료 버튼 이벤트 설정
        const manualCompleteBtn = container.querySelector('#manual-complete-btn');
        if (manualCompleteBtn) {
            manualCompleteBtn.addEventListener('click', () => {
                userSession.videoCompleted = true;
                const completeBtn = document.getElementById('video-complete-btn');
                if (completeBtn) {
                    completeBtn.style.display = 'block';
                    completeBtn.scrollIntoView({ behavior: 'smooth' });
                }
                console.log('수동으로 영상 교육 완료 처리됨');
            });
        }
    },

    getVideoConfig() {
        return {
            iframe: `
                <iframe 
                    id="youtube-player"
                    width="100%" 
                    height="400" 
                    src="https://www.youtube-nocookie.com/embed/${CONFIG.YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1&controls=1&fs=1&iv_load_policy=3&enablejsapi=1"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    style="border-radius: 10px;"
                    title="전기설비 안전교육 영상 (Privacy-Enhanced Mode)">
                </iframe>
                <div class="privacy-notice">
                    <small>🔒 개인정보 보호 강화 모드로 재생됩니다. 영상 재생 전까지 쿠키가 설정되지 않습니다.</small>
                </div>
            `,
            duration: 300, // 5분 (초 단위)
            fallbackMessage: `
                <div class="video-fallback">
                    <h3>⚠️ YouTube 영상 로드 실패</h3>
                    <p>YouTube Privacy-Enhanced 모드로 영상을 불러올 수 없습니다.</p>
                    <p><strong>가능한 원인:</strong></p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>영상 ID가 잘못되었거나 영상이 삭제됨</li>
                        <li>영상이 비공개 또는 제한됨</li>
                        <li>네트워크 연결 문제</li>
                    </ul>
                    <p>페이지를 새로고침하거나 관리자에게 문의해주세요.</p>
                </div>
            `
        };
    },

    startRealVideoTracking() {
        // 실제 영상용 5분 추적
        const videoDurationSeconds = 300; // 5분
        let currentTime = 0;

        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');
        const completeBtn = document.getElementById('video-complete-btn');

        this.videoState.progressInterval = setInterval(() => {
            currentTime += 1;
            const progressPercentage = (currentTime / videoDurationSeconds) * 100;

            if (progressFill) progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;

            const currentMinutes = Math.floor(currentTime / 60);
            const currentSeconds = currentTime % 60;
            const totalMinutes = Math.floor(videoDurationSeconds / 60);

            if (timeDisplay) {
                timeDisplay.textContent =
                    `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${totalMinutes}:00`;
            }

            if (currentTime >= videoDurationSeconds * 0.9) { // 90% 시청 시 완료
                clearInterval(this.videoState.progressInterval);
                userSession.videoCompleted = true;
                if (completeBtn) {
                    completeBtn.style.display = 'block';
                    completeBtn.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 1000);
    },

    initializeYouTubePlayer() {
        // YouTube Player API가 로드되지 않은 경우 로드
        if (typeof YT === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(script);

            window.onYouTubeIframeAPIReady = () => {
                this.createYouTubePlayer();
            };
        } else {
            this.createYouTubePlayer();
        }
    },

    createYouTubePlayer() {
        // iframe이 로드된 후 Player API 연결 시도
        setTimeout(() => {
            try {
                const iframe = document.getElementById('youtube-player');
                if (iframe) {
                    this.youtubePlayer = new YT.Player('youtube-player', {
                        events: {
                            'onReady': (event) => {
                                console.log('YouTube Player 준비 완료');
                                this.setupVideoControls();
                            },
                            'onStateChange': (event) => {
                                this.handleYouTubeStateChange(event);
                            }
                        }
                    });
                }
            } catch (error) {
                console.warn('YouTube Player API 초기화 실패, 기본 컨트롤 사용:', error);
                this.setupVideoControls();
            }
        }, 1000);
    },

    handleYouTubeStateChange(event) {
        // YouTube 플레이어 상태 변경 감지
        if (event.data === YT.PlayerState.PLAYING) {
            this.videoState.isPlaying = true;
            this.videoState.isPaused = false;
            this.updateControlButtons();
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.videoState.isPaused = true;
            this.updateControlButtons();
        } else if (event.data === YT.PlayerState.ENDED) {
            userSession.videoCompleted = true;
            const completeBtn = document.getElementById('video-complete-btn');
            if (completeBtn) {
                completeBtn.style.display = 'block';
                completeBtn.scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    updateControlButtons() {
        const pauseBtn = document.getElementById('video-pause-btn');
        const resumeBtn = document.getElementById('video-resume-btn');

        if (this.videoState.isPaused) {
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (resumeBtn) resumeBtn.style.display = 'inline-block';
        } else {
            if (pauseBtn) pauseBtn.style.display = 'inline-block';
            if (resumeBtn) resumeBtn.style.display = 'none';
        }
    },

    setupVideoControls() {
        setTimeout(() => {
            const restartBtn = document.getElementById('video-restart-btn');
            const pauseBtn = document.getElementById('video-pause-btn');
            const resumeBtn = document.getElementById('video-resume-btn');

            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartVideo());
            }
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => this.pauseVideo());
            }
            if (resumeBtn) {
                resumeBtn.addEventListener('click', () => this.resumeVideo());
            }
        }, 100);
    },

    startVideoSimulation() {
        console.log('영상 시뮬레이션 시작');
        if (this.videoState.isPlaying) return;

        this.videoState.isPlaying = true;
        this.videoState.isPaused = false;
        this.videoState.currentProgress = this.videoState.pausedAt || 0;

        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');
        const completeBtn = document.getElementById('video-complete-btn');

        this.videoState.progressInterval = setInterval(() => {
            if (this.videoState.isPaused) return;

            this.videoState.currentProgress += 1;
            const progressPercentage = (this.videoState.currentProgress / this.videoState.totalDuration) * 100;

            if (progressFill) progressFill.style.width = `${progressPercentage}%`;
            if (timeDisplay) timeDisplay.textContent = `${this.videoState.currentProgress}:00 / ${this.videoState.totalDuration}:00`;

            if (this.videoState.currentProgress >= this.videoState.totalDuration) {
                clearInterval(this.videoState.progressInterval);
                this.videoState.isPlaying = false;
                userSession.videoCompleted = true;
                if (completeBtn) {
                    completeBtn.style.display = 'block';
                    completeBtn.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 1000);
    },

    restartVideo() {
        console.log('영상 재시작');

        // YouTube Player API 사용 가능한 경우
        if (this.youtubePlayer && typeof this.youtubePlayer.seekTo === 'function') {
            try {
                this.youtubePlayer.seekTo(0);
                this.youtubePlayer.playVideo();
                console.log('YouTube Player API로 재시작');
                userSession.videoCompleted = false;
                const completeBtn = document.getElementById('video-complete-btn');
                if (completeBtn) completeBtn.style.display = 'none';
                return;
            } catch (error) {
                console.warn('YouTube Player API 재시작 실패:', error);
            }
        }

        // 시뮬레이션 모드 또는 API 실패 시 기본 처리
        if (this.videoState.progressInterval) {
            clearInterval(this.videoState.progressInterval);
        }

        this.videoState.currentProgress = 0;
        this.videoState.pausedAt = 0;
        this.videoState.isPlaying = false;
        this.videoState.isPaused = false;
        userSession.videoCompleted = false;

        const progressFill = document.getElementById('video-progress-fill');
        const timeDisplay = document.getElementById('video-time-display');
        const completeBtn = document.getElementById('video-complete-btn');

        if (progressFill) progressFill.style.width = '0%';
        if (timeDisplay) timeDisplay.textContent = '00:00 / 10:00';
        if (completeBtn) completeBtn.style.display = 'none';

        this.updateControlButtons();
        this.setupVideoPlayer();
    },

    pauseVideo() {
        console.log('영상 일시정지');

        // YouTube Player API 사용 가능한 경우
        if (this.youtubePlayer && typeof this.youtubePlayer.pauseVideo === 'function') {
            try {
                this.youtubePlayer.pauseVideo();
                console.log('YouTube Player API로 일시정지');
                return;
            } catch (error) {
                console.warn('YouTube Player API 일시정지 실패:', error);
            }
        }

        // 시뮬레이션 모드 또는 API 실패 시 기본 처리
        if (!this.videoState.isPlaying || this.videoState.isPaused) return;

        this.videoState.isPaused = true;
        this.videoState.pausedAt = this.videoState.currentProgress;
        this.updateControlButtons();
    },

    resumeVideo() {
        console.log('영상 재생 재개');

        // YouTube Player API 사용 가능한 경우
        if (this.youtubePlayer && typeof this.youtubePlayer.playVideo === 'function') {
            try {
                this.youtubePlayer.playVideo();
                console.log('YouTube Player API로 재생 재개');
                return;
            } catch (error) {
                console.warn('YouTube Player API 재생 실패:', error);
            }
        }

        // 시뮬레이션 모드 또는 API 실패 시 기본 처리
        if (!this.videoState.isPaused) return;

        this.videoState.isPaused = false;
        this.startVideoSimulation();
        this.updateControlButtons();
    }
};

console.log('영상 관리자 로드 완료:', new Date().toLocaleTimeString());

// ========================================
// 🚀 앱 초기화
// ========================================
const App = {
    init() {
        console.log('앱 초기화 시작:', new Date().toLocaleTimeString());

        try {
            // 로딩 화면 즉시 숨기기
            this.hideLoading();

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 첫 화면 표시
            ScreenManager.showScreen('user-info');

            console.log('앱 초기화 완료:', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('앱 초기화 중 오류 발생:', error);
            // 오류가 발생해도 기본 화면은 표시
            this.hideLoading();
            ScreenManager.showScreen('user-info');
        }
    },

    hideLoading() {
        // 여러 가능한 ID들을 시도
        const possibleIds = ['loading', 'loader', 'loading-screen', 'preloader'];
        let loadingElement = null;

        for (const id of possibleIds) {
            loadingElement = document.getElementById(id);
            if (loadingElement) break;
        }

        // 또는 클래스명으로도 시도
        if (!loadingElement) {
            loadingElement = document.querySelector('.loading, .loader, .loading-screen');
        }

        if (loadingElement) {
            loadingElement.style.display = 'none';
            document.body.classList.add('loaded');
            console.log('로딩 화면이 성공적으로 숨겨졌습니다.');
        } else {
            console.error('로딩 화면 요소를 찾을 수 없습니다.');
            // 로딩 요소를 찾지 못해도 앱은 계속 진행
        }
    },

    setupEventListeners() {
        console.log('이벤트 리스너 설정 시작');

        // 1단계: 사용자 정보 입력
        const userInfoForm = document.getElementById('user-info-form');
        if (userInfoForm) {
            userInfoForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const name = document.getElementById('user-name').value.trim();
                const zodiac = document.getElementById('user-zodiac').value;

                // 유효성 검사
                let isValid = true;
                if (!Utils.validateName(name)) {
                    Utils.showError('name-error', '이름을 입력해주세요.');
                    isValid = false;
                } else {
                    Utils.clearError('name-error');
                }

                if (!Utils.validateZodiac(zodiac)) {
                    Utils.showError('zodiac-error', '띠를 선택해주세요.');
                    isValid = false;
                } else {
                    Utils.clearError('zodiac-error');
                }

                if (isValid) {
                    userSession.name = name;
                    userSession.zodiac = zodiac;

                    // 교육 시작 API 호출
                    try {
                        const startResponse = await Utils.fetchWithTimeout('/.netlify/functions/start-education', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                name: userSession.name,
                                zodiac: userSession.zodiac
                            })
                        });

                        const startResult = await startResponse.json();

                        if (startResult.success && startResult.data?.rowNumber) {
                            userSession.rowNumber = startResult.data.rowNumber;
                            console.log('교육 시작됨, 행 번호:', userSession.rowNumber);
                        } else {
                            console.warn('교육 시작 API 응답 이상:', startResult);
                        }
                    } catch (error) {
                        console.error('교육 시작 API 호출 실패:', error);
                        // 오류가 발생해도 계속 진행
                    }

                    await this.setupFortuneScreen();
                    ScreenManager.showScreen('fortune');
                }
            });
        }

        // 2단계: 운세 화면
        setTimeout(() => {
            const startBtn = document.getElementById('start-education-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    VideoManager.setupVideoPlayer();
                    ScreenManager.showScreen('video');
                });
            }
        }, 100);

        // 3단계: 영상 완료
        setTimeout(() => {
            const completeBtn = document.getElementById('video-complete-btn');
            if (completeBtn) {
                completeBtn.addEventListener('click', async () => {
                    if (userSession.videoCompleted) {
                        // Quiz Score 카운터 증가 (시청 완료 버튼 클릭 횟수)
                        userSession.quizScore++;
                        console.log('시청 완료 버튼 클릭 횟수:', userSession.quizScore);

                        await this.setupAssessmentScreen();
                        ScreenManager.showScreen('assessment');
                    }
                });
            }
        }, 100);

        // 4단계: 퀴즈 제출
        setTimeout(() => {
            const assessmentForm = document.getElementById('assessment-form');
            if (assessmentForm) {
                assessmentForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleQuizSubmit();
                });
            }
        }, 100);

        console.log('이벤트 리스너 설정 완료');
    },

    async setupFortuneScreen() {
        console.log('운세 화면 설정');

        // 띠 표시
        const zodiacDisplay = document.getElementById('user-zodiac-display');
        if (zodiacDisplay) {
            zodiacDisplay.textContent = userSession.zodiac;
        }

        // AI 운세 생성 API 호출
        const fortuneText = document.getElementById('fortune-text');
        if (fortuneText) {
            fortuneText.textContent = '맞춤형 운세를 생성하고 있습니다...';

            try {
                const response = await Utils.fetchWithTimeout('/.netlify/functions/generate-fortune', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: userSession.name,
                        zodiac: userSession.zodiac
                    })
                });

                const result = await response.json();

                if (result.success && result.fortune) {
                    fortuneText.textContent = result.fortune;
                } else {
                    // Fallback to default fortune
                    const defaultFortune = FORTUNE_DATA[userSession.zodiac] || '좋은 일이 생길 것입니다.';
                    fortuneText.textContent = defaultFortune;
                }
            } catch (error) {
                console.error('운세 생성 API 호출 실패:', error);
                // Fallback to default fortune
                const defaultFortune = FORTUNE_DATA[userSession.zodiac] || '좋은 일이 생길 것입니다.';
                fortuneText.textContent = defaultFortune;
            }
        }

        // 로또 번호 생성
        const lotteryNumbers = Utils.generateLotteryNumbers();
        const lotteryContainer = document.getElementById('lottery-numbers');
        if (lotteryContainer) {
            lotteryContainer.innerHTML = lotteryNumbers.map(num =>
                `<div class="lottery-number">${num}</div>`
            ).join('');
        }
    },

    async setupAssessmentScreen() {
        console.log('평가 화면 설정');

        try {
            // 백엔드에서 퀴즈 데이터 가져오기
            const response = await Utils.fetchWithTimeout('/.netlify/functions/get-quiz', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();

            if (result.success && result.data) {
                userSession.quizData = result.data;
            } else {
                // Fallback to default quiz data
                userSession.quizData = [
                    {
                        id: 1,
                        question: '전기 작업 시 가장 중요한 안전 수칙은 무엇입니까?',
                        options: ['작업 전 전원 차단 확인', '작업복 착용', '도구 점검', '작업 시간 단축'],
                        correctAnswer: 1
                    },
                    {
                        id: 2,
                        question: '전기 화재 발생 시 올바른 대처 방법은?',
                        options: ['물로 진화', '전원 차단 후 소화기 사용', '모래로 덮기', '바람으로 끄기'],
                        correctAnswer: 2
                    }
                ];
            }
        } catch (error) {
            console.error('퀴즈 데이터 로드 실패:', error);
            // Fallback to default quiz data
            userSession.quizData = [
                {
                    id: 1,
                    question: '전기 작업 시 가장 중요한 안전 수칙은 무엇입니까?',
                    options: ['작업 전 전원 차단 확인', '작업복 착용', '도구 점검', '작업 시간 단축'],
                    correctAnswer: 1
                },
                {
                    id: 2,
                    question: '전기 화재 발생 시 올바른 대처 방법은?',
                    options: ['물로 진화', '전원 차단 후 소화기 사용', '모래로 덮기', '바람으로 끄기'],
                    correctAnswer: 2
                }
            ];
        }

        this.renderQuiz();
    },

    renderQuiz() {
        const container = document.getElementById('quiz-questions-container');
        if (!container) return;

        container.innerHTML = '';

        userSession.quizData.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question-card';
            questionDiv.innerHTML = `
                <div class="question-header">
                    <div class="question-number">Q${index + 1}</div>
                    <h3 class="question-title">${question.question}</h3>
                </div>
                <div class="quiz-options">
                    ${question.options.map((option, optionIndex) => `
                        <label class="quiz-option-card">
                            <input type="radio" name="question-${question.id}" value="${optionIndex + 1}">
                            <div class="option-content">
                                <div class="option-number">${optionIndex + 1}</div>
                                <div class="option-text">${option}</div>
                                <div class="option-check">✓</div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            `;
            container.appendChild(questionDiv);
        });

        // 답변 변경 감지
        container.addEventListener('change', () => {
            this.checkQuizCompletion();
            this.updateQuizProgress();
        });
    },

    checkQuizCompletion() {
        const totalQuestions = userSession.quizData.length;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        const submitBtn = document.querySelector('#assessment-form button[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = answeredQuestions !== totalQuestions;

            // 버튼 텍스트 업데이트
            if (answeredQuestions === totalQuestions) {
                submitBtn.innerHTML = `
                    <span class="btn-icon">✅</span>
                    답변 확인하러 가기
                `;
                submitBtn.classList.add('btn-ready');
            } else {
                submitBtn.innerHTML = `
                    <span class="btn-icon">📝</span>
                    모든 문제에 답변해주세요 (${answeredQuestions}/${totalQuestions})
                `;
                submitBtn.classList.remove('btn-ready');
            }
        }
    },

    updateQuizProgress() {
        const totalQuestions = userSession.quizData.length;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        const progressText = document.getElementById('quiz-progress');
        const progressBar = document.getElementById('quiz-progress-bar');

        if (progressText) {
            progressText.textContent = `${answeredQuestions}/${totalQuestions}`;
        }

        if (progressBar) {
            const percentage = (answeredQuestions / totalQuestions) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    },

    handleQuizSubmit() {
        console.log('퀴즈 제출 처리');

        // 답변 수집
        userSession.quizAnswers = [];
        userSession.quizData.forEach(question => {
            const selectedOption = document.querySelector(`input[name="question-${question.id}"]:checked`);
            if (selectedOption) {
                // 1-based에서 0-based로 변환 (백엔드에서 0-based index 사용)
                userSession.quizAnswers.push(parseInt(selectedOption.value) - 1);
            }
        });

        // 답변 완료 시 바로 완료 화면으로 이동
        // (정답 확인은 백엔드에서 처리)
        console.log('수집된 답변:', userSession.quizAnswers);
        this.setupCompletionScreen();
        ScreenManager.showScreen('completion');
    },

    setupCompletionScreen() {
        console.log('완료 화면 설정');

        // 답변 요약 표시
        userSession.quizData.forEach((question, index) => {
            const answerNumber = userSession.quizAnswers[index];
            const answerText = question.options[answerNumber - 1];

            const numberElement = document.getElementById(`answer${index + 1}-number`);
            const textElement = document.getElementById(`answer${index + 1}-text`);

            if (numberElement) numberElement.textContent = `${answerNumber}.`;
            if (textElement) textElement.textContent = answerText;
        });

        // 해시태그 생성 및 표시
        const fortuneHashtags = FORTUNE_HASHTAGS[userSession.zodiac] || ['#행운', '#안전', '#성공'];
        const fortuneHashtagsContainer = document.getElementById('review-fortune-hashtags');
        if (fortuneHashtagsContainer) {
            fortuneHashtagsContainer.innerHTML = fortuneHashtags.map(tag =>
                `<span class="hashtag">${tag}</span>`
            ).join(' ');
        }

        const safetyHashtags = SAFETY_HASHTAGS.slice(0, 4);
        const safetyHashtagsContainer = document.getElementById('review-safety-hashtags');
        if (safetyHashtagsContainer) {
            safetyHashtagsContainer.innerHTML = safetyHashtags.map(tag =>
                `<span class="hashtag">${tag}</span>`
            ).join(' ');
        }

        // 완료 화면 이벤트 설정
        setTimeout(() => {
            const proceedBtn = document.getElementById('proceed-to-final-btn');
            if (proceedBtn) {
                proceedBtn.addEventListener('click', () => {
                    this.showLuckyButton();
                });
            }
        }, 100);
    },

    showLuckyButton() {
        console.log('행운 버튼 표시');

        // 완료 요약 섹션 숨기기
        const summarySection = document.querySelector('.completion-summary-section');
        if (summarySection) {
            summarySection.style.display = 'none';
        }

        // 행운 버튼 섹션 표시
        const completionContent = document.querySelector('.completion-content');
        if (completionContent) {
            const luckySection = document.createElement('div');
            luckySection.className = 'lucky-section';
            luckySection.innerHTML = `
                <h3>🍀 행운의 순간!</h3>
                <p>교육을 완료하셨습니다. 행운 버튼을 눌러 이벤트에 참여해보세요!</p>
                <button id="lucky-button" class="btn btn-lucky">🍀 행운 버튼</button>
            `;
            completionContent.appendChild(luckySection);

            // 행운 버튼 이벤트
            document.getElementById('lucky-button').addEventListener('click', () => {
                this.handleLuckyButton();
            });
        }
    },

    async handleLuckyButton() {
        console.log('행운 버튼 처리');

        try {
            // 당첨자 수 확인 API 호출
            const checkResponse = await Utils.fetchWithTimeout('/.netlify/functions/check-winners', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const checkResult = await checkResponse.json();

            if (!checkResult.success || !checkResult.data?.canWin) {
                // 당첨자 한도 초과
                userSession.isWinner = false;
                const currentWinners = checkResult.data?.currentWinners || 0;
                const maxWinners = checkResult.data?.maxWinners || 100;
                this.showModal('😢 아쉽네요', `당첨자 한도가 초과되었습니다!\n현재 당첨자: ${currentWinners}/${maxWinners}\n아쉽지만 꽝입니다!`, () => {
                    this.showEmployeeIdInput();
                });
                return;
            }

            // 당첨 여부 결정
            const isWinner = Math.random() < CONFIG.WIN_PROBABILITY;
            userSession.isWinner = isWinner;

            // 결과 표시
            const title = isWinner ? '🎉 축하합니다!' : '😢 아쉽네요';
            const message = isWinner ? '당첨되었습니다!' : '아쉽지만 꽝입니다!';

            this.showModal(title, message, () => {
                this.showEmployeeIdInput();
            });

        } catch (error) {
            console.error('당첨자 확인 API 호출 실패:', error);
            // 오류 시 기본 로직으로 진행
            const isWinner = Math.random() < CONFIG.WIN_PROBABILITY;
            userSession.isWinner = isWinner;

            const title = isWinner ? '🎉 축하합니다!' : '😢 아쉽네요';
            const message = isWinner ? '당첨되었습니다!' : '아쉽지만 꽝입니다!';

            this.showModal(title, message, () => {
                this.showEmployeeIdInput();
            });
        }
    },

    showEmployeeIdInput() {
        console.log('사번 입력 화면 표시');

        // 기존 섹션들 숨기기
        document.querySelectorAll('.completion-summary-section, .lucky-section').forEach(section => {
            section.style.display = 'none';
        });

        // 사번 입력 섹션 표시
        const employeeIdSection = document.getElementById('employee-id-section');
        if (employeeIdSection) {
            employeeIdSection.style.display = 'block';

            // 사번 입력 시 버튼 활성화
            const employeeIdInput = document.getElementById('employee-id');
            const finalBtn = document.getElementById('final-complete-btn');

            if (employeeIdInput && finalBtn) {
                employeeIdInput.addEventListener('input', (e) => {
                    finalBtn.disabled = !Utils.validateEmployeeId(e.target.value);
                });

                finalBtn.addEventListener('click', () => {
                    this.handleFinalSubmit();
                });
            }
        }
    },

    async handleFinalSubmit() {
        console.log('최종 제출 처리');

        const employeeId = document.getElementById('employee-id').value;

        if (!Utils.validateEmployeeId(employeeId)) {
            Utils.showError('employee-id-error', '7자리 숫자를 입력해주세요.');
            return;
        }

        userSession.employeeId = employeeId;

        // 버튼 로딩 상태로 변경
        const finalBtn = document.getElementById('final-complete-btn');
        if (finalBtn) {
            finalBtn.disabled = true;
            finalBtn.textContent = '제출 중...';
            finalBtn.classList.add('loading');
        }

        try {
            // rowNumber 확인
            if (!userSession.rowNumber) {
                throw new Error('교육 시작 정보가 없습니다. 페이지를 새로고침하고 다시 시도해주세요.');
            }

            // Google Sheets에 전송할 데이터 준비
            const submissionData = {
                name: userSession.name,
                zodiac: userSession.zodiac,
                employeeId: userSession.employeeId,
                quizAnswers: userSession.quizAnswers,
                rowNumber: userSession.rowNumber,
                isWinner: userSession.isWinner
            };

            console.log('제출 데이터:', submissionData);

            // 백엔드로 데이터 전송
            const response = await Utils.fetchWithTimeout('/.netlify/functions/complete-education', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            const result = await response.json();

            if (result.success) {
                // 성공 처리
                this.showModal('완료!', `교육이 성공적으로 완료되었습니다!\n\n시청 완료 횟수: ${userSession.quizScore}회\n사번: ${userSession.employeeId}\n\n데이터가 성공적으로 저장되었습니다.`, () => {
                    // 페이지 닫기
                    window.close();
                    // 만약 window.close()가 작동하지 않으면 새로고침으로 초기화
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                });
            } else {
                // 실패 처리
                this.showModal('오류 발생', `데이터 저장 중 오류가 발생했습니다.\n\n오류: ${result.error || '알 수 없는 오류'}\n\n다시 시도해주세요.`, () => {
                    if (finalBtn) {
                        finalBtn.disabled = false;
                        finalBtn.textContent = '최종 완료';
                        finalBtn.classList.remove('loading');
                    }
                });
            }

        } catch (error) {
            console.error('최종 제출 API 호출 실패:', error);

            // 오류 처리
            this.showModal('네트워크 오류', `서버와의 통신 중 오류가 발생했습니다.\n\n네트워크 연결을 확인하고 다시 시도해주세요.`, () => {
                if (finalBtn) {
                    finalBtn.disabled = false;
                    finalBtn.textContent = '최종 완료';
                    finalBtn.classList.remove('loading');
                }
            });
        }
    },



    showModal(title, message, onClose = null) {
        const modal = document.getElementById('modal-overlay');
        const titleElement = document.getElementById('modal-title');
        const messageElement = document.getElementById('modal-message');
        const closeBtn = document.getElementById('modal-close-btn');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) {
            // 줄바꿈 문자를 <br>로 변환
            messageElement.innerHTML = message.replace(/\n/g, '<br>');
        }
        if (modal) modal.style.display = 'flex';

        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                if (onClose) onClose();
            };
        }
    }
};

// ========================================
// 🎬 페이지 로드 시 초기화
// ========================================
function initializeApp() {
    console.log('DOM 로드 완료, 앱 초기화 시작:', new Date().toLocaleTimeString());
    App.init();
}

// DOM 상태에 따른 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM이 이미 로드된 경우 즉시 실행
    initializeApp();
}

console.log('Script 로드 완료:', new Date().toLocaleTimeString());