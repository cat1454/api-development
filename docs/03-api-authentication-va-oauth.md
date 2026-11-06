# CHUYÊN ĐỀ 3: API AUTHENTICATION & OAUTH

Tài liệu này bao quát toàn bộ nội dung của phần **Outline 3**:
1. Introduction
2. Compare authenticate method
   - 2.1. HTTP Basic
   - 2.2. Json Web Token (JWT)
3. OAuth
   - 3.1. OAuth 1.0
   - 3.2. OAuth 2.0

---

## 1. Introduction (Giới thiệu về Bảo mật API)

### 1.1. Phân biệt Authentication vs Authorization
Trong bảo mật hệ thống thông tin, hai khái niệm này luôn đi liền nhưng hoàn toàn khác nhau:

| Tiêu chí | Authentication (AuthN - Xác thực) | Authorization (AuthZ - Phân quyền) |
| :--- | :--- | :--- |
| **Câu hỏi cốt lõi** | **"Bạn là ai?"** | **"Bạn được phép làm gì?"** |
| **Mục đích** | Xác minh danh tính người dùng thông qua thông tin nhận dạng (Username/Password, OTP, Sinh trắc học, Token). | Xác minh quyền hạn của người dùng đối với một tài nguyên cụ thể (Xem, Sửa, Xóa). |
| **Thứ tự thực hiện**| Luôn thực hiện **trước**. | Thực hiện **sau** khi danh tính đã được xác thực thành công. |
| **HTTP Status Code** | Trả về `401 Unauthorized` nếu thất bại. | Trả về `403 Forbidden` nếu không đủ quyền. |

### 1.2. Tại sao API cần cơ chế xác thực riêng biệt?
- Trong ứng dụng Web truyền thống (Monolithic MVC): Server lưu trạng thái đăng nhập vào **Session Memory/Redis** và Client lưu **Session Cookie**.
- Trong kiến trúc RESTful hiện đại:
  - Vi phạm ràng buộc **Stateless** nếu lưu session state trên server.
  - Client đa dạng (Mobile App iOS/Android, Single Page App React/Vue, IoT) không hỗ trợ cơ chế cookie đồng nhất.
  - Gặp sự cố **CORS (Cross-Origin Resource Sharing)** khi Frontend và Backend nằm ở hai tên miền khác nhau.
  - Do đó, RESTful API sử dụng **Token-based Authentication** truyền qua HTTP Headers.

---

## 2. Compare Authenticate Method (So sánh phương thức xác thực)

---

### 2.1. HTTP Basic Authentication

#### Cơ chế hoạt động:
- Đây là cơ chế xác thực đơn giản và nguyên thủy nhất được tích hợp trực tiếp vào chuẩn HTTP (RFC 7617).
- Với mỗi request, Client ghép cặp `username:password`, sau đó mã hóa chuỗi này sang định dạng **Base64** và đính kèm vào Header:
  ```http
  GET /api/v1/profile HTTP/1.1
  Host: api.example.com
  Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
  ```
  *(Chuỗi `dXNlcm5hbWU6cGFzc3dvcmQ=` là kết quả mã hóa Base64 của `username:password`)*.

#### Ưu điểm:
- Cực kỳ đơn giản, dễ cài đặt.
- Được hỗ trợ sẵn bởi tất cả trình duyệt và thư viện HTTP client.

#### Nhược điểm nghiêm trọng:
- **Kém an toàn:** Base64 chỉ là một thuật toán **Encoding (đổi định dạng)**, hoàn toàn **KHÔNG PHẢI là Encryption (mã hóa)**. Bất kỳ ai bắt được gói tin đều giải mã ngược ra password trong tích tắc.
- **Rủi ro lộ mật khẩu:** Bắt buộc phải chạy trên đường truyền mã hóa **HTTPS**.
- **Phải gửi mật khẩu ở mọi request:** Tăng bề mặt tấn công.
- **Không có cơ chế Đăng xuất (Logout) hay Thu hồi (Revoke):** Trình duyệt sẽ tự động cache header này và gửi đi vô thời hạn cho tới khi tắt trình duyệt.

---

### 2.2. JSON Web Token (JWT)

#### Định nghĩa:
- **JWT (JSON Web Token)** là một chuẩn mở (**RFC 7519**) định nghĩa phương thức truyền tải thông tin an toàn giữa các bên dưới dạng một đối tượng JSON nhỏ gọn, độc lập (self-contained).
- JWT được sử dụng phổ biến nhất cho việc **Stateless Authentication** trong RESTful API và Microservices.

#### Cấu trúc 3 phần của JWT:
Một chuỗi JWT gồm 3 phần được phân tách bằng dấu chấm (`.`): `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJuYW1lIjoiQWxpY2UiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NjI0MTYwMDB9.4ZbH7...
\___________________________________/ \________________________________________________________________________________/ \___________/
              (1) Header                                (2) Payload                                                       (3) Signature
```

1. **Header (Đầu mục):**
   - Chứa thông tin về loại token và thuật toán ký mã hóa:
     ```json
     {
       "alg": "HS256",
       "typ": "JWT"
     }
     ```
2. **Payload (Tải trọng dữ liệu / Claims):**
   - Chứa thông tin người dùng và metadata (claims):
     ```json
     {
       "sub": "123456",
       "name": "Nguyen Van A",
       "role": "admin",
       "exp": 1762416000
     }
     ```
   - *Lưu ý:* Payload chỉ được Base64Url encode chứ **không được mã hóa bí mật**. Không bao giờ được lưu password, số thẻ tín dụng hoặc thông tin nhạy cảm vào Payload!
3. **Signature (Chữ ký số):**
   - Được tạo ra bằng cách lấy chuỗi mã hóa của `Header` và `Payload`, kết hợp cùng một **Mã bí mật (Secret Key)** phía Server thông qua thuật toán băm (ví dụ HMAC SHA-256):
     ```text
     Signature = HMACSHA256(
       base64UrlEncode(header) + "." + base64UrlEncode(payload),
       secret_key
     )
     ```
   - **Tác dụng:** Giúp Server kiểm tra tính toàn vẹn (Integrity) của dữ liệu. Nếu hacker sửa đổi bất kỳ ký tự nào trong Payload, chữ ký số sẽ không khớp và Server sẽ từ chối token ngay lập tức.

#### Luồng hoạt động hoàn chỉnh của JWT (JWT Authentication Flow):

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as Frontend (SPA / Mobile)
    participant Server as Backend API Server
    participant DB as Database

    User->>Client: Nhập email & password
    Client->>Server: POST /auth/login {email, password}
    Server->>DB: Kiểm tra tài khoản & hash password
    DB-->>Server: Tài khoản hợp lệ
    Server->>Server: Sinh ra Access Token (JWT) & Refresh Token
    Server-->>Client: 200 OK {accessToken: "eyJ...", refreshToken: "..."}
    Client->>Client: Lưu Token an toàn (Memory / Secure Storage)

    Note over Client,Server: CÁC REQUEST TIẾP THEO
    Client->>Server: GET /api/v1/orders<br/>Header: Authorization: Bearer eyJ...
    Server->>Server: Verify chữ ký Signature bằng Secret Key (Không cần query DB!)
    Server-->>Client: 200 OK [Danh sách đơn hàng]
```

---

### 2.3. Bảng so sánh toàn diện: HTTP Basic vs JWT

| Tiêu chí | HTTP Basic Authentication | JSON Web Token (JWT) |
| :--- | :--- | :--- |
| **Bản chất truyền gửi** | `username:password` mã hóa Base64 thuần. | Token chứa dữ liệu có chữ ký số (Cryptographic Signature). |
| **Mức độ an toàn** | Rất thấp nếu không có HTTPS. | Cao. Server phát hiện được ngay nếu token bị chỉnh sửa. |
| **Bảo mật mật khẩu** | Mật khẩu được gửi đi trong mọi request. | Mật khẩu chỉ gửi 1 lần duy nhất lúc đăng nhập. |
| **Tải trên Server** | Server phải query DB để verify password mỗi request. | **Stateless:** Server chỉ cần giải mã và verify chữ ký bằng Secret Key, không cần query DB. |
| **Khả năng phân quyền** | Không mang theo thông tin role/permission trong header. | Tích hợp sẵn role, permission ngay trong payload của token. |
| **Hạn sử dụng (Expiry)** | Không có ngày hết hạn tích hợp sẵn. | Tích hợp sẵn trường `exp` quy định thời gian sống của token. |
| **Khả năng thu hồi (Revocation)** | Rất khó đăng xuất/thu hồi token. | Có thể thu hồi thông qua mô hình Access Token (ngắn hạn) + Refresh Token (dài hạn lưu blacklist). |

---

## 3. OAuth (Open Authorization)

### 3.1. OAuth là gì?
- **OAuth** là một **chuẩn mở cho việc ủy quyền (Authorization Framework)**.
- Cho phép người dùng cấp quyền cho ứng dụng của bên thứ ba (Third-party Client) truy cập vào tài nguyên của họ đang được lưu trữ trên một máy chủ dịch vụ khác (Google, Facebook, GitHub), **mà không cần cung cấp mật khẩu tài khoản** của mình cho ứng dụng thứ ba đó.
- *Ví dụ thực tế:* Ứng dụng "Canva" muốn lấy ảnh từ "Google Drive" của bạn. Bạn không bao giờ cung cấp mật khẩu tài khoản Google cho Canva, mà Google sẽ hiện màn hình hỏi: *"Bạn có cho phép Canva truy cập xem ảnh trong Google Drive không?"*.

---

### 3.2. OAuth 1.0 (và bản cập nhật OAuth 1.0a)
- **Lịch sử ra đời:** Phát triển vào năm 2007 bởi các kỹ sư từ Twitter, Ma.gnolia để thay thế giao thức xác thực mật khẩu trực tiếp.
- **Cơ chế hoạt động:**
  - Hoạt động dựa trên nguyên tắc ký mã hóa mật mã học (**Cryptographic Signatures**).
  - Mọi HTTP request phải tính toán một chuỗi chữ ký số phức tạp (HMAC-SHA1 hoặc RSA-SHA1) kết hợp từ: HTTP Method, URL, Nonce (chuỗi ngẫu nhiên), Timestamp, Consumer Secret và Token Secret.
- **Nhược điểm của OAuth 1.0:**
  - **Cực kỳ phức tạp:** Lập trình viên phải tự viết mã tính toán chữ ký số, rất dễ sai sót dù chỉ lệch một khoảng trắng.
  - **Khó mở rộng:** Không hỗ trợ tốt cho các ứng dụng chạy trên trình duyệt (Single Page Apps) hoặc thiết bị di động (Mobile native apps) do không thể lưu giữ an toàn bí mật khóa (`Consumer Secret`).
  - **Tồn tại lỗ hổng bảo mật:** Bản 1.0 có lỗ hổng "Session fixation", sau đó phải cập nhật vội lên chuẩn **OAuth 1.0a**.

---

### 3.3. OAuth 2.0

- **Lịch sử ra đời:** Xuất bản năm 2012 (**RFC 6749**), được thiết kế lại hoàn toàn mới và **hoàn toàn không tương thích ngược với OAuth 1.0**.
- **Cải tiến cốt lõi:**
  - Thay vì tự tính toán chữ ký phức tạp cho từng request, OAuth 2.0 **ủy thác toàn bộ việc mã hóa đường truyền cho TLS/HTTPS**.
  - Sử dụng **Bearer Token** (thường chính là JWT): Bất kỳ ai nắm giữ token hợp lệ đều có quyền truy cập phạm vi tài nguyên được cấp.

#### 4 Vai trò chính (Roles) trong OAuth 2.0:
1. **Resource Owner (Chủ sở hữu tài nguyên):** Người dùng sở hữu tài khoản và dữ liệu (ví dụ: Bạn).
2. **Client (Ứng dụng khách):** Ứng dụng bên thứ ba muốn truy cập tài nguyên (ví dụ: Spotify, Canva).
3. **Authorization Server (Máy chủ ủy quyền):** Máy chủ xác thực danh tính người dùng và cấp phát Token (ví dụ: `accounts.google.com`).
4. **Resource Server (Máy chủ tài nguyên):** Máy chủ lưu trữ dữ liệu người dùng và tiếp nhận API request kèm Token (ví dụ: `drive.googleapis.com`).

#### Các luồng cấp quyền chính (Grant Types) trong OAuth 2.0:
1. **Authorization Code Grant (Phổ biến và an toàn nhất):**
   - Dùng cho Web ứng dụng Server-side (có backend an toàn để lưu `Client Secret`).
   - Đối với Mobile App và SPA (React, Vue), chuẩn khuyến nghị mở rộng thêm cơ chế **PKCE (Proof Key for Code Exchange)** để ngăn chặn việc đánh cắp Authorization Code.
2. **Client Credentials Grant:**
   - Dùng cho giao tiếp nội bộ giữa 2 hệ thống máy chủ (Machine-to-Machine / Microservice-to-Microservice), không có sự tham gia trực tiếp của người dùng.
3. **Refresh Token Grant:**
   - Dùng để đổi lấy Access Token mới khi Access Token cũ đã hết hạn mà không bắt người dùng phải đăng nhập lại từ đầu.
4. **Implicit Grant & Resource Owner Password Credentials Grant:**
   - ⚠️ **Lưu ý quan trọng:** Hai luồng này **đã bị DEPRECATED (ngừng hỗ trợ)** trong các khuyến nghị bảo mật OAuth 2.1 mới nhất do nguy cơ lộ Token trên URL và lộ trực tiếp Password người dùng.

#### Sơ đồ hoạt động Authorization Code Flow:

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Resource Owner)
    participant App as Ứng dụng bên thứ ba (Client)
    participant AuthServer as Authorization Server (Google/GitHub)
    participant ResourceServer as Resource Server (API)

    User->>App: Bấm "Đăng nhập bằng Google"
    App-->>User: Điều hướng tới Google Login URL<br/>(kèm client_id, scope, redirect_uri)
    User->>AuthServer: Đăng nhập & Đồng ý cấp quyền (Consent)
    AuthServer-->>User: Redirect về App kèm Authorization Code
    User->>App: Gửi Authorization Code
    App->>AuthServer: POST /token (Code + Client Secret + redirect_uri)
    AuthServer-->>App: Trả về Access Token (& Refresh Token)
    App->>ResourceServer: GET /userinfo (Header: Authorization: Bearer <AccessToken>)
    ResourceServer-->>App: Trả về thông tin cá nhân người dùng
```

---

### 3.4. Bảng so sánh tổng kết: OAuth 1.0 vs OAuth 2.0

| Đặc điểm | OAuth 1.0 / 1.0a | OAuth 2.0 |
| :--- | :--- | :--- |
| **Chuẩn tài liệu** | RFC 5849 | RFC 6749 & RFC 6750 |
| **Cơ chế bảo vệ thông điệp** | Chữ ký số mã hóa trên từng Request (HMAC-SHA1). | Bắt buộc sử dụng mã hóa đường truyền **HTTPS / TLS**. |
| **Loại Token** | Request Token, Access Token với Token Secret. | **Bearer Token** (thường kết hợp JWT) & Refresh Token. |
| **Độ phức tạp cài đặt** | Cực kỳ phức tạp và dễ lỗi tính toán chữ ký. | Đơn giản, rõ ràng, dễ tích hợp cho nhiều ngôn ngữ. |
| **Phù hợp thiết bị di động & SPA** | Kém, không có cơ chế hỗ trợ tối ưu. | Rất tốt (hỗ trợ chuẩn PKCE cho Mobile và SPA). |
| **Tách biệt vai trò Server** | Auth Server và Resource Server thường gộp chung. | Tách biệt hoàn toàn Authorization Server và Resource Server. |
| **Tình trạng sử dụng hiện nay** | Đã lỗi thời (gần như bị thay thế hoàn toàn). | **Tiêu chuẩn số 1 thế giới** cho ủy quyền API ngày nay. |

