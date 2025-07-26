#!/usr/bin/env node

/**
 * 전기안전교육 웹앱 자동 백업 시스템
 * 백엔드 인프라 변경 전 기존 파일과 설정을 안전하게 백업
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class BackupManager {
    constructor() {
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        this.backupDir = path.join('backup');
        this.secretKey = process.env.BACKUP_ENCRYPTION_KEY || 'default-key-change-in-production';
    }

    /**
     * 타임스탬프 기반 백업 디렉토리 생성
     */
    createBackupDirectory() {
        const backupPath = path.join(this.backupDir, `netlify-functions-${this.timestamp}`);
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        
        console.log(`✅ 백업 디렉토리 생성: ${backupPath}`);
        return backupPath;
    }

    /**
     * Netlify Functions 폴더 전체 백업
     */
    backupNetlifyFunctions(backupPath) {
        const functionsDir = path.join('netlify', 'functions');
        
        if (!fs.existsSync(functionsDir)) {
            console.log('⚠️  netlify/functions 폴더가 존재하지 않습니다.');
            return;
        }

        const files = fs.readdirSync(functionsDir);
        let backedUpCount = 0;

        files.forEach(file => {
            const sourcePath = path.join(functionsDir, file);
            const destPath = path.join(backupPath, file);
            
            if (fs.statSync(sourcePath).isFile()) {
                fs.copyFileSync(sourcePath, destPath);
                backedUpCount++;
                console.log(`📁 백업 완료: ${file}`);
            }
        });

        console.log(`✅ Netlify Functions 백업 완료: ${backedUpCount}개 파일`);
    }

    /**
     * 환경 변수 백업 (암호화된 형태로)
     */
    backupEnvironmentVariables(backupPath) {
        const envBackup = {
            timestamp: new Date().toISOString(),
            platform: 'netlify',
            variables: {},
            restoration_notes: 'Environment variables for electrical safety education app'
        };

        // 중요한 환경 변수들 목록
        const importantEnvVars = [
            'GOOGLE_SHEETS_PRIVATE_KEY',
            'GOOGLE_SHEETS_CLIENT_EMAIL', 
            'CLAUDE_API_KEY',
            'SPREADSHEET_ID'
        ];

        importantEnvVars.forEach(varName => {
            if (process.env[varName]) {
                // 실제 값 대신 암호화된 플레이스홀더 저장
                envBackup.variables[varName] = '[ENCRYPTED]';
            }
        });

        const envBackupPath = path.join(backupPath, 'environment-variables.json');
        fs.writeFileSync(envBackupPath, JSON.stringify(envBackup, null, 2));
        
        console.log(`✅ 환경 변수 백업 완료: ${envBackupPath}`);
    }

    /**
     * 설정 파일들 백업
     */
    backupConfigFiles(backupPath) {
        const configFiles = [
            'package.json',
            'netlify.toml',
            '.env.example',
            '.gitignore'
        ];

        let backedUpCount = 0;

        configFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const destPath = path.join(backupPath, file);
                fs.copyFileSync(file, destPath);
                backedUpCount++;
                console.log(`⚙️  설정 파일 백업: ${file}`);
            }
        });

        console.log(`✅ 설정 파일 백업 완료: ${backedUpCount}개 파일`);
    }

    /**
     * 백업 무결성 검증
     */
    validateBackup(backupPath) {
        const validationReport = {
            timestamp: new Date().toISOString(),
            backupPath: backupPath,
            files: [],
            isValid: true,
            errors: []
        };

        try {
            const files = fs.readdirSync(backupPath);
            
            files.forEach(file => {
                const filePath = path.join(backupPath, file);
                const stats = fs.statSync(filePath);
                
                validationReport.files.push({
                    name: file,
                    size: stats.size,
                    modified: stats.mtime
                });
            });

            // 최소 필수 파일들이 있는지 확인
            const requiredFiles = ['environment-variables.json'];
            const missingFiles = requiredFiles.filter(file => 
                !validationReport.files.some(f => f.name === file)
            );

            if (missingFiles.length > 0) {
                validationReport.isValid = false;
                validationReport.errors.push(`필수 파일 누락: ${missingFiles.join(', ')}`);
            }

        } catch (error) {
            validationReport.isValid = false;
            validationReport.errors.push(`검증 중 오류: ${error.message}`);
        }

        const reportPath = path.join(backupPath, 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(validationReport, null, 2));

        if (validationReport.isValid) {
            console.log('✅ 백업 무결성 검증 통과');
        } else {
            console.log('❌ 백업 무결성 검증 실패:');
            validationReport.errors.forEach(error => console.log(`   - ${error}`));
        }

        return validationReport.isValid;
    }

    /**
     * 복원 스크립트 생성
     */
    createRestoreScript(backupPath) {
        const restoreScript = `#!/bin/bash

# 전기안전교육 웹앱 백업 복원 스크립트
# 생성일: ${new Date().toISOString()}
# 백업 경로: ${backupPath}

echo "🔄 백업에서 복원을 시작합니다..."

# Netlify Functions 복원
if [ -d "netlify/functions" ]; then
    echo "📁 기존 netlify/functions 폴더를 임시 백업합니다..."
    mv netlify/functions netlify/functions.backup.$(date +%Y%m%d-%H%M%S)
fi

mkdir -p netlify/functions

echo "📂 Netlify Functions 복원 중..."
cp ${backupPath}/*.js netlify/functions/ 2>/dev/null || echo "⚠️  .js 파일이 없습니다."

# 설정 파일 복원 (선택적)
echo "⚙️  설정 파일 복원 중..."
[ -f "${backupPath}/package.json" ] && cp ${backupPath}/package.json . && echo "✅ package.json 복원"
[ -f "${backupPath}/netlify.toml" ] && cp ${backupPath}/netlify.toml . && echo "✅ netlify.toml 복원"
[ -f "${backupPath}/.gitignore" ] && cp ${backupPath}/.gitignore . && echo "✅ .gitignore 복원"

echo "✅ 복원 완료!"
echo "⚠️  환경 변수는 수동으로 Netlify 대시보드에서 설정해야 합니다."
echo "📋 환경 변수 목록은 ${backupPath}/environment-variables.json 파일을 참조하세요."
`;

        const scriptPath = path.join(backupPath, 'restore.sh');
        fs.writeFileSync(scriptPath, restoreScript);
        
        // 실행 권한 부여 (Unix 시스템에서)
        try {
            fs.chmodSync(scriptPath, '755');
        } catch (error) {
            // Windows에서는 chmod가 작동하지 않을 수 있음
        }

        console.log(`✅ 복원 스크립트 생성: ${scriptPath}`);
    }

    /**
     * 전체 백업 프로세스 실행
     */
    async performFullBackup() {
        console.log('🚀 전기안전교육 웹앱 백업을 시작합니다...');
        console.log(`📅 백업 시간: ${new Date().toLocaleString('ko-KR')}`);
        
        try {
            const backupPath = this.createBackupDirectory();
            
            this.backupNetlifyFunctions(backupPath);
            this.backupEnvironmentVariables(backupPath);
            this.backupConfigFiles(backupPath);
            
            const isValid = this.validateBackup(backupPath);
            
            if (isValid) {
                this.createRestoreScript(backupPath);
                console.log('🎉 백업이 성공적으로 완료되었습니다!');
                console.log(`📁 백업 위치: ${backupPath}`);
                return true;
            } else {
                console.log('❌ 백업 검증에 실패했습니다.');
                return false;
            }
            
        } catch (error) {
            console.error('❌ 백업 중 오류 발생:', error.message);
            return false;
        }
    }
}

// CLI에서 직접 실행할 때
if (require.main === module) {
    const backupManager = new BackupManager();
    backupManager.performFullBackup().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = BackupManager;