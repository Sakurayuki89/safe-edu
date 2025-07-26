# Requirements Document

## Introduction

The electrical safety education web application ("Kiro Spec") is a comprehensive online training platform designed to guide users through a step-by-step educational flow from personal information input to course completion. The application features interactive elements to maintain user engagement, including fortune telling and lottery number generation, video-based safety training, assessment quizzes, and a gamified completion event with prizes. The system is built as a Single Page Application (SPA) using vanilla JavaScript and deployed on Vercel with Google Sheets for data storage.

## Requirements

### Requirement 1

**User Story:** As a trainee, I want to input my personal information (name and zodiac animal) so that the system can personalize my learning experience and track my progress.

#### Acceptance Criteria

1. WHEN the user accesses the application THEN the system SHALL display a user information input form
2. WHEN the user enters their name in the text field THEN the system SHALL validate that the name is not empty
3. WHEN the user selects their zodiac animal from a dropdown menu THEN the system SHALL provide all 12 zodiac options (쥐, 소, 호랑이, 토끼, 용, 뱀, 말, 양, 원숭이, 닭, 개, 돼지)
4. WHEN the user clicks the "다음" button THEN the system SHALL send the data to api/start-education endpoint
5. WHEN the data is successfully submitted THEN the system SHALL transition to the next screen without page refresh
6. IF the user attempts to proceed without completing required fields THEN the system SHALL display validation error messages

### Requirement 2

**User Story:** As a trainee, I want to see personalized fortune content and lottery numbers so that I remain engaged and motivated to continue the training.

#### Acceptance Criteria

1. WHEN the user reaches the fortune screen THEN the system SHALL display weekly fortune content based on their zodiac animal
2. WHEN the fortune content is displayed THEN the system SHALL generate and show 6 random lottery numbers (1-45 range)
3. WHEN the user clicks "안전교육 시작" button THEN the system SHALL transition to the video education screen
4. WHEN the screen loads THEN the system SHALL display content without requiring additional user input

### Requirement 3

**User Story:** As a trainee, I want to watch the safety education video with controlled playback so that I receive complete training content.

#### Acceptance Criteria

1. WHEN the user reaches the video screen THEN the system SHALL embed and display the Google Drive hosted safety education video
2. WHEN the video is playing THEN the system SHALL prevent fast-forwarding or skipping ahead
3. WHEN the video starts THEN the "시청 완료" button SHALL be hidden
4. WHEN the video playback is completed THEN the "시청 완료" button SHALL become visible and enabled
5. WHEN the user clicks "시청 완료" THEN the system SHALL transition to the assessment screen
6. IF the user attempts to proceed before video completion THEN the system SHALL prevent navigation

### Requirement 4

**User Story:** As a trainee, I want to complete an assessment quiz about the video content so that I can demonstrate my understanding of the safety material.

#### Acceptance Criteria

1. WHEN the user reaches the assessment screen THEN the system SHALL display 2 multiple-choice questions with 4 options each
2. WHEN the user selects an answer THEN the system SHALL allow answer modification before final submission
3. WHEN the user selects answers for both questions THEN the "행운 버튼 누르러 가기" button SHALL become enabled
4. WHEN the user clicks "행운 버튼 누르러 가기" THEN the system SHALL store the quiz responses and transition to the completion screen
5. IF the user attempts to proceed without answering all questions THEN the system SHALL display a validation message

### Requirement 5

**User Story:** As a trainee, I want to participate in a luck-based prize event after completing my training so that I feel rewarded for my participation.

#### Acceptance Criteria

1. WHEN the user reaches the completion screen THEN the system SHALL display a "행운 버튼"
2. WHEN the user clicks the "행운 버튼" THEN the system SHALL call api/check-winners to verify winner quota availability
3. IF the winner quota (100 people) is reached THEN the system SHALL display "이벤트가 종료되었습니다" message
4. IF the winner quota is not reached THEN the system SHALL calculate win/loss based on predetermined probability (10%)
5. WHEN the probability calculation results in a win THEN the system SHALL display "🎉 당첨되었습니다!" popup
6. WHEN the probability calculation results in a loss THEN the system SHALL display "아쉽지만 꽝! 😢" popup
7. WHEN the user closes the popup THEN the system SHALL display a 7-digit employee ID input field

### Requirement 6

**User Story:** As a trainee, I want to submit my final information so that my training completion and results are properly recorded in the system.

#### Acceptance Criteria

1. WHEN the popup is closed THEN the system SHALL display a 7-digit employee ID input field
2. WHEN the user enters their employee ID THEN the system SHALL validate the format (exactly 7 digits)
3. WHEN the user clicks "최종 완료" THEN the system SHALL send all collected data to api/complete-education endpoint
4. WHEN the data is submitted THEN the system SHALL record name, zodiac animal, quiz answers, prize result, and employee ID to Google Sheets
5. WHEN the submission is successful THEN the system SHALL display a completion confirmation message
6. IF the submission fails THEN the system SHALL display an error message and allow retry

### Requirement 7

**User Story:** As a system administrator, I want all sensitive information to be securely managed so that the application maintains proper security standards.

#### Acceptance Criteria

1. WHEN the application accesses external services THEN the system SHALL use environment variables for all API keys and sensitive data
2. WHEN code is deployed THEN the system SHALL NOT contain any hardcoded API keys or credentials
3. WHEN the application handles user data THEN the system SHALL use secure transmission methods
4. WHEN data is stored THEN the system SHALL follow data protection best practices

### Requirement 8

**User Story:** As a user, I want a smooth and responsive interface so that I can complete the training without technical interruptions.

#### Acceptance Criteria

1. WHEN navigating between screens THEN the system SHALL transition without full page refreshes (SPA behavior)
2. WHEN the application loads THEN the system SHALL display content within 3 seconds
3. WHEN user interactions occur THEN the system SHALL provide immediate visual feedback
4. WHEN errors occur THEN the system SHALL display user-friendly error messages in Korean
5. WHEN the application is accessed on different devices THEN the system SHALL maintain responsive design compatibility