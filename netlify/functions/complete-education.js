// ========================================
// 📋 교육 완료 처리 API (Netlify Functions)
// ========================================

const { google } = require('googleapis');

exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // POST 요청만 허용
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                error: 'Method not allowed',
                message: 'POST 요청만 허용됩니다.' 
            })
        };
    }
    
    try {
        const { name, zodiac, employeeId, quizAnswers, rowNumber, isWinner } = JSON.parse(event.body || '{}');
        
        // 필수 데이터 검증
        if (!name || !zodiac || !employeeId || !quizAnswers || !rowNumber) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    message: '필수 데이터가 누락되었습니다.',
                    required: ['name', 'zodiac', 'employeeId', 'quizAnswers', 'rowNumber']
                })
            };
        }
        
        // Google Sheets에서 퀴즈 정답 데이터 가져오기
        const quizData = await getQuizDataFromSheets();
        
        // 퀴즈 점수 계산
        const quizScore = calculateQuizScore(quizAnswers, quizData);
        
        // 완료 시간 생성
        const completionTime = new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // Google Sheets 인증 설정
        const auth = await getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        
        // 기존 행 업데이트 (E, F, G, H 컬럼)
        // E: EmployeeID, F: QuizScore, G: IsWinner, H: CompletionTime
        const range = `교육참가자!E${rowNumber}:H${rowNumber}`;
        const values = [[
            employeeId,
            quizScore,
            isWinner ? '당첨' : '미당첨',
            completionTime
        ]];
        
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: { values }
        });
        
        // 성공 응답
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: '교육이 성공적으로 완료되었습니다.',
                data: {
                    name,
                    zodiac,
                    employeeId,
                    quizScore,
                    isWinner,
                    completionTime
                }
            })
        };
        
    } catch (error) {
        console.error('교육 완료 처리 중 오류 발생:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Server error',
                message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            })
        };
    }
};

// ========================================
// 📚 Google Sheets에서 퀴즈 데이터 가져오기
// ========================================
async function getQuizDataFromSheets() {
    try {
        // Google Sheets 인증 설정
        const auth = await getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const range = '퀴즈!A:D'; // 2번째 탭: 퀴즈 데이터
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        
        const rows = response.data.values || [];
        
        if (rows.length < 2) {
            console.warn('퀴즈 데이터가 없어 기본 퀴즈를 사용합니다.');
            return getDefaultQuizData();
        }
        
        // 헤더 제외하고 퀴즈 데이터 파싱
        const quizData = rows.slice(1).map((row, index) => {
            const [questionId, questionText, options, correctAnswer] = row;
            
            if (!questionText || !options || !correctAnswer) {
                throw new Error(`${index + 2}번째 행의 데이터가 불완전합니다.`);
            }
            
            const optionsArray = options.split(',').map(opt => opt.trim());
            const correctIndex = optionsArray.findIndex(opt => opt === correctAnswer.trim());
            
            if (correctIndex === -1) {
                throw new Error(`${index + 2}번째 행: 정답 "${correctAnswer}"이 보기에 없습니다.`);
            }
            
            return {
                id: questionId || (index + 1).toString(),
                question: questionText.trim(),
                options: optionsArray,
                correctAnswer: correctIndex
            };
        });
        
        console.log(`Google Sheets에서 ${quizData.length}개의 퀴즈를 로드했습니다.`);
        return quizData;
        
    } catch (error) {
        console.error('Google Sheets에서 퀴즈 데이터 로드 실패:', error);
        return getDefaultQuizData();
    }
}

// ========================================
// 📝 기본 퀴즈 데이터 (Google Sheets 연결 실패 시 사용)
// ========================================
function getDefaultQuizData() {
    return [
        {
            id: "1",
            question: "전기 작업 시 가장 먼저 해야 할 일은?",
            options: ["전원 차단", "안전모 착용", "작업 신고", "접지 확인"],
            correctAnswer: 0 // "전원 차단"
        },
        {
            id: "2", 
            question: "안전모의 올바른 착용법은?",
            options: ["턱끈을 조임", "느슨하게 착용", "뒤로 돌려 착용", "모자 위에 착용"],
            correctAnswer: 0 // "턱끈을 조임"
        }
    ];
}

// ========================================
// 📊 퀴즈 점수 계산 함수
// ========================================
function calculateQuizScore(userAnswers, quizData) {
    if (!Array.isArray(userAnswers) || !Array.isArray(quizData)) {
        return '0/0';
    }
    
    let correctCount = 0;
    const totalQuestions = Math.min(userAnswers.length, quizData.length);
    
    for (let i = 0; i < totalQuestions; i++) {
        if (userAnswers[i] === quizData[i].correctAnswer) {
            correctCount++;
        }
    }
    
    return `${correctCount}/${totalQuestions}`;
}

// ========================================
// 🔐 Google 인증 설정
// ========================================
async function getGoogleAuth() {
    const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`
    };
    
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    return auth;
}