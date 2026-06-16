#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
一次性 Google 授權小工具：把你下載的 credentials.json 換成 token.json，
讓 content-schedule 能讀寫你的「內容地圖 Google 表」。

白話：
  1. 先到 Google Cloud Console 建一個專案、啟用「Google Sheets API」、建一個
     「OAuth 用戶端（桌面應用程式 Desktop app）」，下載那個 credentials.json。
  2. 把 credentials.json 放到 ~/.config/google/credentials.json
  3. 跑這支：python3 authorize_sheets.py
     → 會自動打開瀏覽器，你登入「要放內容地圖的那個 Google 帳號」並按允許。
  4. 完成後會在 ~/.config/google/token.json 產生 token —— 就這樣，之後都不用再弄。

需要套件：pip3 install google-auth-oauthlib google-api-python-client
"""
import argparse, os, sys

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def main():
    ap = argparse.ArgumentParser(description='一次性 Google Sheets 授權 → 產生 token.json')
    ap.add_argument('--credentials', default=os.path.expanduser('~/.config/google/credentials.json'),
                    help='你從 Google Cloud 下載的 OAuth 用戶端 JSON')
    ap.add_argument('--token', default=os.path.expanduser('~/.config/google/token.json'),
                    help='要產生的 token 存放路徑（content-schedule 會讀這個）')
    a = ap.parse_args()

    if not os.path.exists(a.credentials):
        print('✗ 找不到 credentials.json：', a.credentials)
        print('  請先到 Google Cloud Console 建 OAuth 用戶端(Desktop app)並下載，放到上面路徑。')
        print('  教學：https://wolfganghuang0083.github.io/content-ops-toolkit/setup.html （內容地圖那一步）')
        sys.exit(1)
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print('✗ 缺套件，請先執行： pip3 install google-auth-oauthlib google-api-python-client')
        sys.exit(1)

    os.makedirs(os.path.dirname(a.token), exist_ok=True)
    flow = InstalledAppFlow.from_client_secrets_file(a.credentials, SCOPES)
    creds = flow.run_local_server(port=0)   # 會打開瀏覽器讓你登入＋允許
    with open(a.token, 'w') as f:
        f.write(creds.to_json())
    print('✅ 授權完成！token 已存到：', a.token)
    print('   現在可以把這個帳號當「內容地圖 Google 表」的擁有者來用了。')

if __name__ == '__main__':
    main()
