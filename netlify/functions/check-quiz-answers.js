// ========================================
// ✅ 퀴즈 정답 확인 API (Netlify Functions)
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
        // 요청 데이터 파싱
        const requestData = JSON.parse(event.body);
        const { answers } = requestData;
        
        if (!answers || !Array.isArray(answers)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Invalid request',
                    message: '답변 데이터가 올바르지 않습니다.'
                })
            };
        }
        
        // Google Sheets에서 퀴즈 정답 가져오기
        const quizData = await getQuizDataFromSheets();
        
        // 정답 확인
        const results = [];
        let correctCount = 0;
        
        answers.forEach((userAnswer, index) => {
            const question = quizData[index];
            if (question) {
                const isCorrect = userAnswer === question.correctAnswer;
                if (isCorrect) correctCount++;
                
                console.log(`문제 ${index + 1}: 사용자답변=${userAnswer}, 정답=${question.correctAnswer}, 정답여부=${isCorrect}`);
                
                results.push({
                    questionId: question.id,
                    userAnswer: userAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect: isCorrect
                });
            }
        });
        
        const totalQuestions = quizData.length;
        const isAllCorrect = correctCount === totalQuestions;
        const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
        
        console.log(`최종 결과: ${correctCount}/${totalQuestions} 정답 (${scorePercentage}%), 모든문제정답=${isAllCorrect}`);
        
        // 성공 응답
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    isAllCorrect: isAllCorrect,
                    correctCount: correctCount,
                    totalQuestions: totalQuestions,
                    scorePercentage: scorePercentage,
                    results: results
                }
            })
        };
        
    } catch (error) {
        console.error('퀴즈 정답 확인 중 오류 발생:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Server error',
                message: '퀴즈 정답 확인 중 오류가 발생했습니다.'
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
// 🔐 Google Sheets 인증 설정
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
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)}`
    };

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return await auth.getClient();
}