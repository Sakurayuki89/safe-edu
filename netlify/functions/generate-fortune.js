// ========================================
// 🔮 AI 기반 맞춤형 운세 생성 API (Netlify Functions)
// ========================================

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
        console.log('🔮 Claude API 함수 호출됨');
        const { name, zodiac, context } = JSON.parse(event.body || '{}');
        console.log('📝 입력 데이터:', { name, zodiac, context });
        
        // 입력 데이터 검증
        if (!name || !zodiac) {
            console.log('❌ 필수 데이터 누락');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields',
                    message: '이름과 띠 정보가 필요합니다.'
                })
            };
        }
        
        // Claude API 키 확인
        const apiKey = process.env.CLAUDE_API_KEY;
        console.log('🔑 Claude API 키 확인:', apiKey ? '설정됨' : '누락됨');
        
        if (!apiKey) {
            console.log('⚠️ Claude API 키가 없어 기본 운세 사용');
            const fallbackFortune = getFallbackFortune(zodiac);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    fortune: fallbackFortune,
                    fallback: true,
                    message: 'AI 서비스 설정에 문제가 있어 기본 운세를 제공합니다.'
                })
            };
        }
        
        // Claude API 호출을 위한 프롬프트 생성
        const prompt = createFortunePrompt(name, zodiac, context);
        console.log('📝 생성된 프롬프트 길이:', prompt.length);
        
        // Claude API 호출
        console.log('🤖 Claude API 호출 시작');
        const fortuneResponse = await callClaudeAPI(apiKey, prompt);
        console.log('✅ Claude API 응답 성공:', fortuneResponse.substring(0, 50) + '...');
        
        // 성공 응답
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                fortune: fortuneResponse,
                metadata: {
                    name: name,
                    zodiac: zodiac,
                    generatedAt: new Date().toISOString()
                }
            })
        };
        
    } catch (error) {
        console.error('❌ AI 운세 생성 중 오류 발생:', error);
        
        // 오류 시 기본 운세 반환
        const zodiacFromBody = JSON.parse(event.body || '{}')?.zodiac;
        const fallbackFortune = getFallbackFortune(zodiacFromBody);
        console.log('🔄 기본 운세로 폴백:', fallbackFortune.substring(0, 30) + '...');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                fortune: fallbackFortune,
                fallback: true,
                message: 'AI 서비스 일시 장애로 기본 운세를 제공합니다.',
                error: error.message
            })
        };
    }
};

// ========================================
// 🎯 프롬프트 생성 함수
// ========================================
function createFortunePrompt(name, zodiac, context) {
    return `당신은 전문적인 운세 상담사입니다. 다음 조건에 맞는 맞춤형 운세를 생성해주세요:

**대상자 정보:**
- 이름: ${name}
- 띠: ${zodiac}띠
- 직업: ${context || '제철소 전기설비 정비 작업자'}

**운세 생성 조건:**
1. 길이: 2-3문장, 100-150자 내외
2. 톤: 따뜻하고 격려적이며 전문적
3. 내용: 전기설비 안전작업과 관련된 조언 포함
4. 스타일: 한국어, 존댓말 사용
5. 포함 요소: 
   - ${zodiac}띠의 특성 반영
   - 전기 안전 작업 관련 조언
   - 긍정적이고 실용적인 메시지
   - 동료와의 협력 또는 안전 의식 강조

**예시 스타일:**
"${name}님, ${zodiac}띠의 특성상 이번 주는 신중함이 빛을 발하는 시기입니다. 전기설비 점검 시 평소보다 꼼꼼히 확인하시면 큰 성과를 거둘 것입니다. 동료들과의 소통을 통해 더욱 안전한 작업환경을 만들어가세요."

위 조건에 맞는 운세를 생성해주세요. 운세 내용만 반환하고, 다른 설명은 포함하지 마세요.`;
}

// ========================================
// 🤖 Claude API 호출 함수
// ========================================
async function callClaudeAPI(apiKey, prompt) {
    console.log('🌐 Claude API 요청 시작');
    
    const requestBody = {
        model: 'claude-3-haiku-20240307', // 빠르고 경제적인 모델 사용
        max_tokens: 200,
        temperature: 0.7,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    };
    
    console.log('📤 요청 데이터:', { 
        model: requestBody.model, 
        max_tokens: requestBody.max_tokens,
        prompt_length: prompt.length 
    });
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Claude API 응답 상태:', response.status);
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Claude API 오류 응답:', errorText);
        const errorData = JSON.parse(errorText).catch(() => ({}));
        throw new Error(`Claude API 호출 실패: ${response.status} - ${errorData.error?.message || errorText}`);
    }
    
    const data = await response.json();
    console.log('📋 Claude API 응답 구조:', Object.keys(data));
    
    // Claude API 응답에서 텍스트 추출
    if (data.content && data.content[0] && data.content[0].text) {
        const fortuneText = data.content[0].text.trim();
        console.log('✨ 생성된 운세:', fortuneText.substring(0, 50) + '...');
        return fortuneText;
    } else {
        console.error('❌ 잘못된 응답 형식:', data);
        throw new Error('Claude API 응답 형식이 올바르지 않습니다.');
    }
}

// ========================================
// 🛡️ 기본 운세 생성 함수 (AI 실패 시 사용)
// ========================================
function getFallbackFortune(zodiac) {
    const fallbackFortunes = {
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
    
    return fallbackFortunes[zodiac] || '이번 주는 안전을 최우선으로 하며 좋은 성과를 거둘 것입니다. 항상 조심하시고 건강하세요.';
}