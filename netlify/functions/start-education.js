// ========================================
// 🚀 교육 시작 처리 API (Netlify Functions)
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
        const { name, zodiac } = JSON.parse(event.body || '{}');
        
        // 필수 데이터 검증
        if (!name || !zodiac) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    message: '이름과 띠 정보가 필요합니다.',
                    required: ['name', 'zodiac']
                })
            };
        }
        
        // 시작 시간 생성
        const startTime = new Date().toLocaleString('ko-KR', {
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
        
        // 새 행 추가 (A, B, C, D 컬럼)
        // A: Name, B: Zodiac, C: StartTime, D: Status
        const range = '교육참가자!A:D';
        const values = [[
            name,
            zodiac,
            startTime,
            '진행중'
        ]];
        
        const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values }
        });
        
        // 추가된 행 번호 계산
        const updatedRange = appendResponse.data.updates.updatedRange;
        const rowNumber = parseInt(updatedRange.split('!')[1].split(':')[0].replace(/[A-Z]/g, ''));
        
        // 성공 응답
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: '교육이 시작되었습니다.',
                data: {
                    name,
                    zodiac,
                    startTime,
                    rowNumber
                }
            })
        };
        
    } catch (error) {
        console.error('교육 시작 처리 중 오류 발생:', error);
        
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