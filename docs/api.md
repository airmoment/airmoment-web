# AirMoment API 명세

> 📌 **원본:** 노션
> 🕒 **최종 동기화:** 2026-06-02
> 🌐 **Base URL:** `http://15.165.123.108:8080`

---

## 1. 항공권 조회

**`GET /api/v1/flights?departureCode={출발공항Code}&arrivalCode={도착공항Code}&departureAt={출발일자}&sort={정렬기준}&nonstopOnly={직항여부}&maxPrice={가격상한}`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

입력 조건에 대해 항공권 정보를 반환하는 GET API.

### 2️⃣ Request

#### Query Parameters

| Field | Type | Required | Description |
|---|---|:---:|---|
| `departureCode` | string | ✅ | 공항 코드 ENUM |
| `arrivalCode` | string | ✅ | 공항 코드 ENUM |
| `departureAt` | LocalDate | ✅ | 출발 일자 (`YYYY-MM-DD`) |
| `sort` | string | | 정렬 기준 ENUM (예: `PRICE_ASC`) |
| `nonstopOnly` | boolean | | 직항 여부 (`true`면 직항만 포함) |
| `maxPrice` | int | | 가격 상한 |

> `Required`가 비어있는 항목은 필요할 때만 입력하면 되는 옵셔널 파라미터입니다. (필요없으면 아예 입력 X)

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

#### 예시

**26.07.17 인천 → 파리, 필터/옵션 없음**
```
GET /api/v1/flights?departureCode=ICN&arrivalCode=CDG&departureAt=2026-07-17
```

**26.07.17 인천 → 파리, 직항만**
```
GET /api/v1/flights?departureCode=ICN&arrivalCode=CDG&departureAt=2026-07-17&nonstopOnly=true
```

**26.07.17 인천 → 파리, 직항만 + 낮은 가격순 + 80만원 이하**
```
GET /api/v1/flights?departureCode=ICN&arrivalCode=CDG&departureAt=2026-07-17&sort=PRICE_ASC&nonstopOnly=true&maxPrice=800000
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | jsonObject | 응답 데이터 |

#### `data` 구조

| Field | Type | Description |
|---|---|---|
| `totalCount` | int | 총 검색결과 수 |
| `flightList` | Array&lt;json&gt; | 항공권 리스트 |
| ↳ `airlineName` | string | 항공사 이름 |
| ↳ `airlinePhoto` | string | 항공사 이미지 URL |
| ↳ `departureTime` | LocalTime | 출발 시각 |
| ↳ `arrivalTime` | LocalTime | 도착 시각 |
| ↳ `duration` | int | 소요 시간 (분) |
| ↳ `price` | int | 가격 |
| `predict` | jsonObject | AI 모델 예측 결과 |
| ↳ `decision` | string | `BUY` 또는 `WAIT` |
| `priceForecast` | jsonObject | 가격 예측 (분위수 밴드용) |
| ↳ `route` | string | 노선 (예: `ICN-JFK`) |
| ↳ `daysUntilDeparture` | int | 출발까지 남은 일수 |
| ↳ `currentPrice` | int | 현재가 |
| ↳ `predictions` | Array&lt;json&gt; | 시점별 분위수 가격 (day, q10~q90) |
| ↳ `predictedAt` | LocalDateTime | 예측 수행 일시 |
| `explain` | jsonObject | 예측 근거 설명 |
| ↳ `reasons` | Array&lt;string&gt; | SHAP 기반 요인 추출 + LLM 자연어 설명 문장들 |

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "항공권 조회 성공",
    "data": {
        "totalCount": 15,
        "predict": {
            "decision": "BUY"
        },
        "priceForecast": {
            "route": "ICN-SYD",
            "daysUntilDeparture": 55,
            "currentPrice": 823441,
            "predictions": [
                {
                    "day": 0,
                    "q10": 823441,
                    "q25": 823441,
                    "q50": 823441,
                    "q75": 823441,
                    "q90": 823441
                },
                {
                    "day": 1,
                    "q10": 757315,
                    "q25": 805138,
                    "q50": 815226,
                    "q75": 825314,
                    "q90": 873137
                },
                {
                    "day": 3,
                    "q10": 763872,
                    "q25": 793153,
                    "q50": 803926,
                    "q75": 814699,
                    "q90": 843980
                },
                {
                    "day": 7,
                    "q10": 785209,
                    "q25": 832641,
                    "q50": 852895,
                    "q75": 873149,
                    "q90": 920581
                },
                {
                    "day": 14,
                    "q10": 734494,
                    "q25": 781787,
                    "q50": 797953,
                    "q75": 814119,
                    "q90": 861412
                }
            ],
            "predictedAt": "2026-05-31T18:47:19.083767+09:00"
        },
        "flightList": [
            {
                "airlineName": "스쿳항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "23:00:00",
                "arrivalTime": "19:20:00",
                "duration": 1160,
                "price": 823441
            },
            {
                "airlineName": "동방항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "12:15:00",
                "arrivalTime": "08:00:00",
                "duration": 1125,
                "price": 881928
            },
            {
                "airlineName": "홍콩항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "14:35:00",
                "arrivalTime": "09:35:00",
                "duration": 1080,
                "price": 958067
            },
            {
                "airlineName": "비엣젯항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "11:40:00",
                "arrivalTime": "07:20:00",
                "duration": 1120,
                "price": 1042454
            },
            {
                "airlineName": "샤먼항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "13:30:00",
                "arrivalTime": "09:20:00",
                "duration": 1130,
                "price": 1069000
            },
            {
                "airlineName": "젯스타",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "21:30:00",
                "arrivalTime": "14:50:00",
                "duration": 980,
                "price": 1074217
            },
            {
                "airlineName": "젯스타",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "21:30:00",
                "arrivalTime": "14:15:00",
                "duration": 945,
                "price": 1090649
            },
            {
                "airlineName": "동방항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "16:20:00",
                "arrivalTime": "12:35:00",
                "duration": 1155,
                "price": 1113432
            },
            {
                "airlineName": "THAI",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "16:55:00",
                "arrivalTime": "10:20:00",
                "duration": 985,
                "price": 1134900
            },
            {
                "airlineName": "젯스타",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "21:50:00",
                "arrivalTime": "09:05:00",
                "duration": 615,
                "price": 1206741
            },
            {
                "airlineName": "동방항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "16:20:00",
                "arrivalTime": "09:00:00",
                "duration": 940,
                "price": 1210717
            },
            {
                "airlineName": "캐세이패시픽항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "01:55:00",
                "arrivalTime": "20:10:00",
                "duration": 1035,
                "price": 1255900
            },
            {
                "airlineName": "캐세이패시픽항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "15:10:00",
                "arrivalTime": "06:10:00",
                "duration": 840,
                "price": 1255900
            },
            {
                "airlineName": "아시아나항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "08:00:00",
                "arrivalTime": "19:25:00",
                "duration": 625,
                "price": 2115004
            },
            {
                "airlineName": "대한항공",
                "airlinePhoto": "https://www.logoyogo.com/web/wp-content/uploads/edd/2021/03/logoyogo-1-164.jpg",
                "departureTime": "19:10:00",
                "arrivalTime": "06:20:00",
                "duration": 610,
                "price": 2482300
            }
        ]
    }
}
```

### 5️⃣ Error ❌

> 백엔드 명세에 별도 에러 케이스 정의 없음 — 추가되면 여기 정리.

| Status | Message | When |
|---|---|---|
| 400 | 잘못된 요청 | 필수 파라미터 누락/형식 오류 |
| 401 | 인증 실패 | 토큰 없음/만료 |
| 500 | 서버 오류 | 내부 에러 |

---
## 2. 회원가입

**`POST /api/v1/members/signup`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ❌

### 1️⃣ 어떤 API인가요?

email(id), password, 이름으로 회원가입을 진행하는 POST API.

### 2️⃣ Request

#### Request Body

| Field | Type | Nullable | Description |
|---|---|:---:|---|
| `email` | string | X | 메일주소 (로그인 ID로 사용) |
| `password` | string | X | 비밀번호 |
| `name` | string | X | 이름 |

#### 예시

```json
{
    "email": "lollol0617@gmail.com",
    "password": "abcabc",
    "name": "세히히"
}
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | null | 회원가입 응답엔 데이터 없음 |

### 4️⃣ Success ✅ `201 CREATED`

```json
{
    "status": 201,
    "message": "회원가입이 완료되었습니다",
    "data": null
}
```

### 5️⃣ Error ❌

> 백엔드 명세에 별도 에러 케이스 정의 없음 — 확인되면 여기 정리.

| Status | Message | When (추정) |
|---|---|---|
| 400 | 잘못된 요청 | 필수 필드 누락 / 이메일 형식 오류 / 비밀번호 정책 위반 |
| 409 | 이미 가입된 이메일 | 동일 email로 이미 회원가입된 경우 |
| 500 | 서버 오류 | 내부 에러 |

---
## 3. 로그인

**`POST /api/v1/members/login`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ❌ (로그인 후 토큰을 발급받는 API)

### 1️⃣ 어떤 API인가요?

email(id), password로 로그인을 진행하는 POST API. 성공 시 `accessToken`을 발급받고, 이후 "토큰 필요"가 ✅인 API 호출 시 이 토큰을 헤더에 담아 보낸다.

### 2️⃣ Request

#### Request Body

| Field | Type | Nullable | Description |
|---|---|:---:|---|
| `email` | string | X | 메일주소 |
| `password` | string | X | 비밀번호 |

#### 예시

```json
{
    "email": "lollol0617@gmail.com",
    "password": "abcabc"
}
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | jsonObject | 토큰 정보 |

#### `data` 구조

| Field | Type | Description |
|---|---|---|
| `accessToken` | string | 액세스 토큰 (토큰 필요한 API 요청 시 헤더에 담아 사용) |
| `refreshToken` | string | 리프레쉬 토큰 (지금은 신경 X — TTL 길게 설정됨) |

> 💡 **백엔드 안내:** `accessToken`의 TTL이 충분히 길게 설정되어 있어 프로젝트 기간 내 만료될 일이 없습니다. **`refreshToken`은 무시해도 됩니다.**

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "로그인이 완료되었습니다.",
    "data": {
        "accessToken": "eyJhbGciOiJIUzUxMiJ9.eyJtZW1iZXJJZCI6MSwiaWF0IjoxNzc3OTc2ODkzLCJleHAiOjE4Mzg0NTY4OTN9.zwJXkoPc17MGXyJOuYZTk1YkTGOJWgDoxCyN0xc8FR9kZfaoM1z7r3eZWrq8Gh0UDlaFCgNmutFoITlrT8au2w",
        "refreshToken": "eyJhbGciOiJIUzUxMiJ9.eyJtZW1iZXJJZCI6MSwiaWF0IjoxNzc3OTc2ODkzLCJleHAiOjE3Nzg1ODE2OTN9.WDeVarqff8_Cu5eyAnHCKBcKrYDGtvuG-t7vBezyLSEEcUnEeXu9xApjV4y96BtkYA80Cl4QFDk0kTMIRJgBug"
    }
}
```

### 5️⃣ Error ❌

> 백엔드 명세에 별도 에러 케이스 정의 없음 — 확인되면 여기 정리.

| Status | Message | When (추정) |
|---|---|---|
| 400 | 잘못된 요청 | email/password 형식 오류 |
| 401 | 로그인 실패 | 이메일 없음 / 비밀번호 불일치 |
| 500 | 서버 오류 | 내부 에러 |

### 🔑 프론트엔드 토큰 사용 가이드

로그인 성공 후 `accessToken`을 받아서:

1. **저장** — 브라우저의 `localStorage` 또는 쿠키에 저장
   ```ts
   localStorage.setItem("accessToken", data.accessToken)
   ```
2. **사용** — 토큰이 필요한 API 호출 시 헤더에 담음
   ```ts
   fetch(url, {
     headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
   })
   ```
3. **로그아웃** — `localStorage.removeItem("accessToken")`

> ⚠️ `localStorage`는 XSS 공격에 노출될 수 있어서, 운영 서비스에선 보통 `httpOnly` 쿠키를 쓰는 게 더 안전합니다. 졸업프로젝트 수준에선 `localStorage`로 충분.

---
## 4. 관심 노선 설정

**`POST /api/v1/interests/bookmark`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

노선을 관심 노선으로 설정(북마크)하는 POST API.

### 2️⃣ Request

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

#### Request Body

| Field | Type | Nullable | Description |
|---|---|:---:|---|
| `departureCode` | string | X | 출발지 공항 코드 ENUM |
| `arrivalCode` | string | X | 도착지 공항 코드 ENUM |
| `departureAt` | LocalDate | X | 출발 일자 (`YYYY-MM-DD`) |
| `nonstopOnly` | boolean | X | '직항만' 여부 |

#### 예시

```json
{
    "departureCode": "ICN",
    "arrivalCode": "SYD",
    "departureAt": "2026-05-08",
    "nonstopOnly": true
}
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | jsonObject | 응답 데이터 |

#### `data` 구조

| Field | Type | Description |
|---|---|---|
| `interestId` | Long | 북마크한 노선 id (해제 시 사용) |

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "관심 노선 설정이 성공하였습니다.",
    "data": {
        "interestId": 3
    }
}
```

### 5️⃣ Error ❌

| Status | Message | When |
|---|---|---|
| 400 | 이미 관심노선 설정이 되어있습니다. | 같은 조건의 노선이 이미 북마크된 상태 |
| 403 | (Forbidden) | 토큰 미포함 / 유효하지 않은 토큰 |

---
## 5. 관심 노선 해제

**`DELETE /api/v1/interests/bookmark/{interestId}`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

설정되어있는 관심 노선을 해제하는 DELETE API.

### 2️⃣ Request

#### Path Parameters

| Field | Type | Description |
|---|---|---|
| `interestId` | Long | 관심 노선 id (설정 API 응답으로 받은 값) |

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

#### 예시

```
DELETE /api/v1/interests/3
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | null | 해제 응답엔 데이터 없음 |

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "관심 노선 해제가 성공하였습니다.",
    "data": null
}
```

### 5️⃣ Error ❌

| Status | Message | When |
|---|---|---|
| 400 | 이미 관심노선 설정이 해제되어있습니다. | 이미 해제된 상태에서 다시 해제 요청 |
| 403 | (Forbidden) | 토큰 미포함 / 유효하지 않은 토큰 |

---
## 6. 이메일 수신 설정

**`POST /api/v1/interests/email-notification`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

최저가 도달 시 메일로 알림을 수신하도록 설정하는 POST API.

### 2️⃣ Request

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

#### Request Body

| Field | Type | Nullable | Description |
|---|---|:---:|---|
| `departureCode` | string | X | 출발지 공항 코드 ENUM |
| `arrivalCode` | string | X | 도착지 공항 코드 ENUM |
| `departureAt` | LocalDate | X | 출발 일자 (`YYYY-MM-DD`) |
| `nonstopOnly` | boolean | X | '직항만' 여부 |

#### 예시

```json
{
    "departureCode": "ICN",
    "arrivalCode": "SYD",
    "departureAt": "2026-05-08",
    "nonstopOnly": true
}
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | jsonObject | 응답 데이터 |

#### `data` 구조

| Field | Type | Description |
|---|---|---|
| `interestId` | Long | 알림 수신 설정한 노선 id (해제 시 사용) |

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "이메일 수신 설정이 완료되었습니다.",
    "data": {
        "interestId": 3
    }
}
```

### 5️⃣ Error ❌

| Status | Message | When |
|---|---|---|
| 400 | 이미 이메일 수신 설정이 되어있습니다. | 같은 조건의 노선에 이미 알림 설정된 상태 |
| 403 | (Forbidden) | 토큰 미포함 / 유효하지 않은 토큰 |

---
## 7. 이메일 수신 해제

**`DELETE /api/v1/interests/email-notification/{interestId}`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

수신 설정되어 있는 최저가 도달 알림을 해제하는 DELETE API.

### 2️⃣ Request

#### Path Parameters

| Field | Type | Description |
|---|---|---|
| `interestId` | Long | 노선 id (설정 API 응답으로 받은 값) |

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

#### 예시

```
DELETE /api/v1/interests/email-notification/1
```

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | null | 해제 응답엔 데이터 없음 |

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "이메일 수신 해제가 완료되었습니다.",
    "data": null
}
```

### 5️⃣ Error ❌

| Status | Message | When |
|---|---|---|
| 400 | 이미 이메일 수신 설정이 해제되어있습니다. | 이미 해제된 상태에서 다시 해제 요청 |
| 403 | (Forbidden) | 토큰 미포함 / 유효하지 않은 토큰 |

---
## 8. 마이페이지 조회

**`GET /api/v1/mypage`**

- **백엔드 상태:** ✅ 배포 완료
- **프론트 연동:** 🟦 API 연동 중
- **토큰 필요:** ✅

### 1️⃣ 어떤 API인가요?

**관심노선 설정 + 알림 설정한 노선 목록**과 **노선별 가격 밴드그래프 데이터**를 한 번에 조회하는 GET API.
→ 마이페이지의 핵심 API. 한 번 호출로 사용자가 등록한 모든 관심/알림 노선과 각 노선의 예측 데이터를 받아온다.

### 2️⃣ Request

#### Request Headers

| Field | Type | Description |
|---|---|---|
| `Authorization` | string | Bearer 토큰 (`Bearer {token}`) |

> Request Body 없음. Query/Path 파라미터 없음.

### 3️⃣ Response

#### 공통 Body

| Field | Type | Description |
|---|---|---|
| `status` | int | 상태 코드 |
| `message` | string | 상태 설명 |
| `data` | jsonObject | 응답 데이터 |

#### `data` 구조

| Field | Type | Description |
|---|---|---|
| `interests` | Array&lt;json&gt; | 관심/알림 노선 목록 |
| ↳ `interestId` | Long | 관심/알림 노선 id (해제 API 호출 시 사용) |
| ↳ `departureCode` | string | 출발 공항 코드 |
| ↳ `arrivalCode` | string | 도착 공항 코드 |
| ↳ `departureAt` | LocalDate | 출발 일자 (`YYYY-MM-DD`) |
| ↳ `departureDayOfWeek` | string | 출발일자 요일 (예: `수`, `목`, `금`) |
| ↳ `nonStopOnly` | boolean | 직항 여부 (`true`면 직항) |
| ↳ `isBookmarked` | boolean | 관심노선 설정 여부 |
| ↳ `isEmailNotificationEnabled` | boolean | 알림 수신 설정 여부 |
| ↳ `predictions` | Array&lt;json&gt; \| null | 시점별 가격 예측 리스트 (예측 미수행 시 `null`) |
|     ▸ `day` | int | n일 차 (0, 1, 3, 7, 14) |
|     ▸ `q10` | int | q10 분위수 가격 |
|     ▸ `q25` | int | q25 분위수 가격 |
|     ▸ `q50` | int | q50 분위수(중앙값) 가격 |
|     ▸ `q75` | int | q75 분위수 가격 |
|     ▸ `q90` | int | q90 분위수 가격 |
| ↳ `predictedAt` | LocalDateTime \| null | 예측 수행 일시 (예측 미수행 시 `null`) |

> 💡 **`isBookmarked`와 `isEmailNotificationEnabled`가 분리되어 있음.** 한 노선에 관심노선만 설정, 알림만 설정, 둘 다 설정 — 3가지 케이스가 모두 가능. 마이페이지 UI에서 이 두 플래그로 각 노선의 토글 상태를 표시하면 됨.

> 💡 **`predictions` / `predictedAt`은 `null`일 수 있음**. 해당 노선에 대한 예측이 아직 수행되지 않은 경우. 차트 영역엔 "예측 데이터 준비 중" 같은 안내 또는 스켈레톤을 표시.

### 4️⃣ Success ✅ `200 OK`

```json
{
    "status": 200,
    "message": "마이페이지 조회에 성공하였습니다.",
    "data": {
        "interests": [
            {
                "interestId": 2,
                "departureCode": "ICN",
                "arrivalCode": "SYD",
                "departureAt": "2026-07-08",
                "departureDayOfWeek": "수",
                "nonStopOnly": true,
                "isBookmarked": true,
                "isEmailNotificationEnabled": true,
                "predictions": null,
                "predictedAt": null
            },
            {
                "interestId": 3,
                "departureCode": "ICN",
                "arrivalCode": "SYD",
                "departureAt": "2026-07-31",
                "departureDayOfWeek": "금",
                "nonStopOnly": true,
                "isBookmarked": false,
                "isEmailNotificationEnabled": true,
                "predictions": null,
                "predictedAt": null
            }
        ]
    }
}
```

### 5️⃣ Error ❌

| Status | Message | When |
|---|---|---|
| 400 | 필수 데이터가 누락되었습니다. | 필수 필드 누락 |
| 400 | 잘못된 데이터 형식입니다. | 데이터 타입/형식 오류 |
| 400 | 잘못된 요청 형식입니다. | Request 형식 자체가 잘못됨 |
| 401 | 유효한 토큰이 필요합니다. | JWT 토큰 누락/만료/위조 |
| 404 | (메시지 미정) | 해당 리소스 없음 |
| 500 | 서버 내부 오류입니다. | 서버 내부 에러 |

### 🧩 UI에서 활용 팁

이 한 번의 호출로 마이페이지에서 보여줄 모든 정보가 들어옵니다:

```
interests[]
  ├─ 노선 정보 (출발/도착/날짜/직항여부)
  ├─ 토글 2개 (관심노선 ON/OFF, 알림수신 ON/OFF)
  └─ 가격 밴드 그래프 (predictions의 q10~q90으로 신뢰구간 차트)
```

해제 동작 시엔 별도 API를 호출:
- 관심노선 해제 → `DELETE /api/v1/interests/{interestId}` (5번 API)
- 알림 해제 → `DELETE /api/v1/interests/email-notification/{interestId}` (7번 API)

> ✅ `interestId`가 응답에 포함되어 있어서, 마이페이지와 검색 결과 페이지 어디서든 토글 ON/OFF가 정상 동작합니다.

---
## 🔧 호출 시 주의사항

### 1. Base URL 붙이기
모든 요청에 `http://15.165.123.108:8080` 접두사가 붙습니다.

```
실제 호출 URL = Base URL + Path + Query
예) http://15.165.123.108:8080/api/v1/flights?departureCode=ICN&...
```

### 2. HTTPS 환경에서 Mixed Content 주의
Base URL이 `http://`이므로, Vercel(HTTPS)에 배포된 사이트에서 **브라우저에서 직접 호출**하면 Mixed Content 차단됩니다.
→ 서버 컴포넌트(`app/**/page.tsx`)에서 `fetch`하는 건 OK (서버→서버 통신).
→ 클라이언트에서 호출이 필요하면 Next.js API Route로 프록시 필요.

### 3. 토큰 관리
- 로컬: `.env.local`에 `API_TOKEN=...`
- 배포(Vercel): Settings → Environment Variables에 동일하게 등록
- 절대 git에 commit 금지 (`.env.local`은 `.gitignore`에 포함됨)
