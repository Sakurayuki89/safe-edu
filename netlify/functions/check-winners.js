// ========================================
// 🏆 당첨자 수 확인 API (Netlify Functions)
// ========================================

const { google } = require('googleapis');

const MAX_WINNERS = 8; // 매월 최대 당첨자 수

exports.handler = async (event, context) => {
    // CORS 헤더 설정
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    
    // GET 요청만 허용
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                error: 'Method not allowed',
                message: 'GET 요청만 허용됩니다.' 
            })
        };
    }
    
    try {
        // Google Sheets 인증 설정
        const auth = await getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        const range = '교육참가자!G:H'; // 당첨여부(G열)와 완료시간(H열) 조회
        
        // Google Sheets에서 당첨여부와 완료시간 데이터 조회
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        });
        
        const values = response.data.values || [];
        
        // 현재 월의 시작일과 종료일 계산 (한국 시간 기준)
        const now = new Date();
        const koreaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
        const currentYear = koreaTime.getFullYear();
        const currentMonth = koreaTime.getMonth();
        
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        
        console.log(`이번 달 범위: ${monthStart.toLocaleDateString('ko-KR')} ~ ${monthEnd.toLocaleDateString('ko-KR')}`);
        
        // 헤더 제외하고 이번 달 당첨자 수 계산
        const winnerCount = values.slice(1).filter(row => {
            const isWinner = row[0] && (row[0].toString().toLowerCase() === 'true' || row[0] === '당첨');
            
            if (!isWinner) return false;
            
            // 완료시간이 있는 경우 이번 달인지 확인
            if (row[1]) {
                try {
                    // 한국 시간 형식 파싱 (예: "2025. 1. 27. 오후 4:58:17")
                    const completionTimeStr = row[1].toString();
                    const completionDate = new Date(completionTimeStr);
                    
                    // 유효한 날짜인지 확인
                    if (!isNaN(completionDate.getTime())) {
                        return completionDate >= monthStart && completionDate <= monthEnd;
                    }
                } catch (error) {
                    console.warn('날짜 파싱 오류:', row[1], error);
                }
            }
            
            // 완료시간이 없거나 파싱 실패 시 당첨자로 계산 (안전장치)
            return true;
        }).length;
        
        const canWin = winnerCount < MAX_WINNERS;
        
        // 성공 응답
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    currentWinners: winnerCount,
                    maxWinners: MAX_WINNERS,
                    canWin: canWin,
                    remainingSlots: Math.max(0, MAX_WINNERS - winnerCount),
                    month: `${currentYear}년 ${currentMonth + 1}월`
                }
            })
        };
        
    } catch (error) {
        console.error('당첨자 수 확인 중 오류 발생:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Server error',
                message: '당첨자 수를 확인하는 중 오류가 발생했습니다.'
            })
        };
    }
};

// ========================================
// 🔐 Google 인증 설정
// ========================================
async function getGoogleAuth() {
    // 필수 환경 변수 확인
    const requiredEnvVars = [
        'GOOGLE_PROJECT_ID',
        'GOOGLE_PRIVATE_KEY_ID', 
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_SERVICE_ACCOUNT_EMAIL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_SHEETS_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`);
    }
    
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