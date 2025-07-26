# Design Document

## Overview

The electrical safety education application is a Single Page Application (SPA) built with vanilla JavaScript, HTML5, and CSS3. The application guides users through a 5-step educational journey with engaging interactive elements. The system uses Vercel Serverless Functions for backend processing and Google Sheets as the data storage solution. The architecture emphasizes security, user experience, and maintainability while avoiding external frameworks.

## Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: All screen transitions occur without page refreshes using JavaScript DOM manipulation
- **Vanilla JavaScript**: No frameworks or libraries, ensuring lightweight and fast loading
- **Modular Design**: Code organized into logical modules for each screen and functionality
- **State Management**: Simple JavaScript object to maintain user session data throughout the flow

### Backend Architecture
- **Vercel Serverless Functions**: Node.js-based API endpoints for data processing
- **Google Sheets API**: Data persistence layer using Google Sheets as a database
- **Environment Variables**: Secure configuration management through Vercel environment variables

### Data Flow
```
User Input → Frontend Validation → API Endpoint → Google Sheets → Response → UI Update
```

## Components and Interfaces

### Frontend Components

#### 1. Screen Manager
- **Purpose**: Handles SPA navigation and screen transitions
- **Methods**:
  - `showScreen(screenId)`: Display specific screen and hide others
  - `validateCurrentScreen()`: Validate current screen data before transition
  - `initializeScreen(screenId)`: Set up screen-specific functionality

#### 2. User Information Screen
- **Elements**: Name input field, zodiac dropdown, next button
- **Validation**: Required field validation, input sanitization
- **API Integration**: Calls `/api/start-education` endpoint

#### 3. Fortune Screen
- **Elements**: Fortune text display, lottery numbers display, start education button
- **Logic**: Zodiac-based fortune selection, random lottery number generation (1-45)

#### 4. Video Education Screen
- **Elements**: Embedded Google Drive video, completion button (initially hidden)
- **Video Controls**: Disabled seeking, progress tracking, completion detection
- **Integration**: Google Drive embed with restricted controls

#### 5. Assessment Screen
- **Elements**: 2 multiple-choice questions with 4 options each
- **Logic**: Answer selection, modification capability, validation
- **Data Storage**: Temporary storage of quiz responses

#### 6. Completion Screen
- **Elements**: Lucky button, popup modals, employee ID input, final submit button
- **Logic**: Prize probability calculation, winner quota checking, final data submission
- **API Integration**: Calls `/api/check-winners` and `/api/complete-education`

### Backend API Endpoints

#### `/api/start-education`
- **Method**: POST
- **Purpose**: Record initial user information
- **Input**: `{ name: string, zodiac: string }`
- **Output**: `{ success: boolean, message: string }`
- **Google Sheets**: Creates new row with timestamp, name, zodiac

#### `/api/check-winners`
- **Method**: GET
- **Purpose**: Check current winner count against quota
- **Output**: `{ canWin: boolean, currentWinners: number, maxWinners: number }`
- **Google Sheets**: Counts rows where winner status is true

#### `/api/complete-education`
- **Method**: POST
- **Purpose**: Record final education completion data
- **Input**: `{ name: string, zodiac: string, quizAnswers: array, isWinner: boolean, employeeId: string }`
- **Output**: `{ success: boolean, message: string }`
- **Google Sheets**: Updates row with complete information

## Data Models

### User Session Data
```javascript
const userSession = {
  name: string,
  zodiac: string,
  quizAnswers: [
    { questionId: number, selectedAnswer: number },
    { questionId: number, selectedAnswer: number }
  ],
  isWinner: boolean,
  employeeId: string,
  startTime: timestamp,
  completionTime: timestamp
}
```

### Google Sheets Schema
| Column | Type | Description |
|--------|------|-------------|
| A | Timestamp | 교육 시작 시간 |
| B | String | 사용자 이름 |
| C | String | 띠 (12지신) |
| D | String | 퀴즈 1번 답 |
| E | String | 퀴즈 2번 답 |
| F | Boolean | 당첨 여부 |
| G | String | 사번 (7자리) |
| H | Timestamp | 교육 완료 시간 |

### Quiz Questions Data Structure
```javascript
const quizQuestions = [
  {
    id: 1,
    question: "전기 안전에 관한 질문 1",
    options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "전기 안전에 관한 질문 2", 
    options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
    correctAnswer: 3
  }
]
```

## Error Handling

### Frontend Error Handling
- **Input Validation**: Real-time validation with Korean error messages
- **API Error Handling**: User-friendly error messages for network failures
- **Video Loading Errors**: Fallback messaging and retry options
- **Session Recovery**: Local storage backup for critical user data

### Backend Error Handling
- **Google Sheets API Errors**: Retry logic with exponential backoff
- **Authentication Failures**: Secure error logging without exposing credentials
- **Rate Limiting**: Request throttling to prevent abuse
- **Data Validation**: Server-side validation of all incoming data

### Error Message Examples
```javascript
const errorMessages = {
  nameRequired: "이름을 입력해주세요.",
  zodiacRequired: "띠를 선택해주세요.",
  videoNotComplete: "영상을 끝까지 시청해주세요.",
  quizIncomplete: "모든 문제에 답해주세요.",
  employeeIdInvalid: "7자리 사번을 정확히 입력해주세요.",
  networkError: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
  serverError: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
}
```

## Testing Strategy

### Frontend Testing
- **Manual Testing**: Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)
- **Responsive Testing**: Mobile and desktop layout verification
- **User Flow Testing**: Complete end-to-end user journey validation
- **Input Validation Testing**: Edge cases and invalid input handling
- **Video Integration Testing**: Google Drive embed functionality and controls

### Backend Testing
- **API Endpoint Testing**: Individual endpoint functionality verification
- **Google Sheets Integration Testing**: Data read/write operations validation
- **Error Handling Testing**: Various failure scenarios and recovery
- **Security Testing**: Environment variable usage and data sanitization
- **Load Testing**: Concurrent user handling and rate limiting

### Integration Testing
- **End-to-End Flow**: Complete user journey from start to finish
- **Data Persistence**: Verify data accuracy throughout the entire flow
- **Prize Logic Testing**: Winner quota and probability calculation accuracy
- **Cross-Device Testing**: Functionality across different devices and browsers

### Security Testing
- **Environment Variable Verification**: Ensure no hardcoded credentials
- **Input Sanitization**: SQL injection and XSS prevention
- **API Security**: Proper authentication and authorization
- **Data Privacy**: User information protection and secure transmission

## Technical Implementation Details

### SPA Navigation System
```javascript
const screenManager = {
  currentScreen: 'user-info',
  screens: ['user-info', 'fortune', 'video', 'assessment', 'completion'],
  
  showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    
    // Show target screen
    document.getElementById(screenId).style.display = 'block';
    this.currentScreen = screenId;
    
    // Initialize screen-specific functionality
    this.initializeScreen(screenId);
  }
}
```

### Video Control Implementation
```javascript
const videoController = {
  player: null,
  isCompleted: false,
  
  initializeVideo() {
    // Embed Google Drive video with restricted controls
    // Monitor playback progress
    // Enable completion button when video ends
  },
  
  preventSeeking() {
    // Disable seeking functionality
    // Override default video controls
  }
}
```

### Prize Logic Implementation
```javascript
const prizeLogic = {
  winProbability: 0.1, // 10%
  maxWinners: 100,
  
  async checkEligibility() {
    const response = await fetch('/api/check-winners');
    const data = await response.json();
    return data.canWin;
  },
  
  calculateWin() {
    return Math.random() < this.winProbability;
  }
}
```

This design provides a comprehensive foundation for implementing the electrical safety education application with proper separation of concerns, security considerations, and maintainable code structure.