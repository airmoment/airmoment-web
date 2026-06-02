# 폰트 파일 위치

이 폴더는 자체 호스팅 폰트 파일을 두는 곳입니다.

## Nico Moji (로고용)

`app/page.tsx`와 `components/header.tsx`의 "AirMoment" 로고에 사용됩니다.

### 받는 방법
1. 공식 배포처에서 다운로드 (예: `https://font.kim/font/nicomoji-plus/` 등)
2. 라이선스 확인 (개인/비상업 사용 무료인지)

### 둘 위치
받은 파일을 이 폴더(`public/fonts/`)에 넣어주세요. 다음 파일명 중 가지고 있는 형식 아무거나 OK — `app/globals.css`의 `@font-face`가 자동으로 찾습니다.

| 우선순위 | 파일명 | 비고 |
|---|---|---|
| 1 | `nicomoji.woff2` | 가장 작고 빠름 — 권장 |
| 2 | `nicomoji.woff` | 구형 브라우저 호환 |
| 3 | `nicomoji.ttf` | macOS/Windows 표준 |
| 4 | `nicomoji.otf` | OpenType |

### 파일이 없을 때
브라우저는 자동으로 `cursive` 시스템 폰트로 폴백합니다 (dev 서버는 정상 동작).

### TTF → WOFF2 변환 (선택)
용량 줄이고 싶으면 https://transfonter.org 에서 변환 가능. 굳이 안 해도 OK.
