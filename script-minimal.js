// 최소한의 JavaScript로 테스트
console.log('Script 로드 시작:', new Date().toLocaleTimeString());

// 기본 설정만
const CONFIG = {
    LOADING_DELAY: 0, // 로딩 지연 없음
    DEVELOPMENT_MODE: true
};

// 최소한의 초기화
const MinimalApp = {
    initialize() {
        console.log('앱 초기화 시작:', new Date().toLocaleTimeString());
        
        // 로딩 화면 즉시 숨기기
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
            console.log('로딩 화면 숨김 완료');
        }
        
        // 기본 폼 이벤트만 설정
        this.setupBasicForm();
        
        console.log('앱 초기화 완료:', new Date().toLocaleTimeString());
    },
    
    setupBasicForm() {
        const form = document.getElementById('user-info-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('user-name').value;
                const zodiac = document.getElementById('user-zodiac').value;
                
                if (name && zodiac) {
                    alert(`이름: ${name}, 띠: ${zodiac}\n\n기본 기능 테스트 성공!`);
                } else {
                    alert('이름과 띠를 입력해주세요.');
                }
            });
        }
    }
};

// DOM 로드 시 즉시 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 로드 완료:', new Date().toLocaleTimeString());
    MinimalApp.initialize();
});

console.log('Script 로드 완료:', new Date().toLocaleTimeString());