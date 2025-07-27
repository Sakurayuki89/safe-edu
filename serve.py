#!/usr/bin/env python3
"""
Safe Edu 로컬 개발 서버
Python 3의 내장 HTTP 서버를 사용하여 로컬에서 테스트할 수 있습니다.

사용법:
    python3 serve.py
    또는
    python serve.py

브라우저에서 http://localhost:8000 접속
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS 헤더 추가 (개발용)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # 현재 디렉토리에서 서버 실행
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Safe Edu 로컬 개발 서버 시작")
        print(f"📡 서버 주소: http://localhost:{PORT}")
        print(f"🔧 개발 모드로 실행됩니다 (API 시뮬레이션)")
        print(f"⏹️  서버 중지: Ctrl+C")
        print("-" * 50)
        
        # 브라우저 자동 열기
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 서버가 중지되었습니다.")
            sys.exit(0)

if __name__ == "__main__":
    main()