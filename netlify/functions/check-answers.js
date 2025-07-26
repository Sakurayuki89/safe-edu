const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
                success: false, 
                message: 'Method not allowed' 
            })
        };
    }

    try {
        // 요청 데이터 파싱
        const { answers } = JSON.parse(event.body);
        
        if (!answers || !Array.isArray(answers)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Invalid answers format' 
                })
            };
        }

        // Google Sheets 연결
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        
        // 서비스 계정으로 인증
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });

        await doc.loadInfo();
        
        // 퀴즈 정답 시트에서 정답 가져오기
        const quizSheet = doc.sheetsByTitle['Quiz'] || doc.sheetsByIndex[1];
        const rows = await quizSheet.getRows();
        
        // 정답 비교
        let allCorrect = true;
        const correctAnswers = [];
        
        for (let i = 0; i < Math.min(answers.length, rows.length); i++) {
            const correctAnswer = parseInt(rows[i].correctAnswer || rows[i]['정답']);
            correctAnswers.push(correctAnswer);
            
            if (answers[i] !== correctAnswer) {
                allCorrect = false;
            }
        }

        console.log('제출된 답변:', answers);
        console.log('정답:', correctAnswers);
        console.log('결과:', allCorrect ? '정답' : '오답');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: allCorrect,
                message: allCorrect ? '모든 문제를 맞혔습니다!' : '일부 문제가 틀렸습니다.',
                correctAnswers: correctAnswers,
                userAnswers: answers
            })
        };

    } catch (error) {
        console.error('정답 확인 중 오류:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Internal server error',
                error: error.message 
            })
        };
    }
};