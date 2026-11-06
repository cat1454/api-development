# BÁO CÁO THU HOẠCH TỰ HỌC: PHÁT TRIỂN API (API DEVELOPMENT)
*(Tài liệu tổng hợp kiến thức trọng tâm, thiết kế và minh chứng thực hành nộp Giảng viên)*

---

### THÔNG TIN HỌC VIÊN
- **Họ và tên:** Huỳnh Phước Phú
- **Mã số sinh viên (MSSV):** 102230094
- **Môn học:** API Development (Chương trình đào tạo kỹ thuật Sun\*)
- **Thời gian hoàn thành:** 2026
- **Kho lưu trữ mã nguồn & tài liệu:** `d:/Sun/api-development/`

---

## 1. MỤC TIÊU MÔN HỌC & ĐÁNH GIÁ MỨC ĐỘ HOÀN THÀNH

| STT | Mục tiêu chuẩn đầu ra | Đánh giá | Minh chứng thực tế trong bài học |
| :---: | :--- | :---: | :--- |
| **1** | **Hiểu khái niệm & vai trò của API** | **Đạt** | Nắm vững mô hình Client - Server, vai trò trừu tượng hóa bảo vệ Database, cầu nối trong Microservices và ứng dụng Mobile. |
| **2** | **Áp dụng nguyên lý thiết kế RESTful API** | **Đạt** | Làm chủ 6 ràng buộc REST; phân biệt Safe vs Idempotent; đặt tên URL chuẩn danh từ số nhiều; sử dụng đúng HTTP status codes (2xx, 3xx, 4xx, 5xx). |
| **3** | **Xây dựng API cơ bản bằng Node.js** | **Đạt** | Đã lập trình hoàn chỉnh `server.js` với đầy đủ CRUD cho Resource `/api/v1/products` hỗ trợ filter, pagination và response JSON chuẩn. |
| **4** | **Kiểm thử và triển khai API** | **Đạt** | Xây dựng bộ test tự động trong Postman (`tests/postman_collection.json`) kiểm tra mã trạng thái, schema JSON và lưu biến động. |
| **5** | **Bảo mật API cơ bản** | **Đạt** | So sánh sâu HTTP Basic vs JWT; phân tích cơ chế OAuth 1.0 vs OAuth 2.0; tự tay lập trình mã hóa chữ ký số HMAC-SHA256 cho JWT. |
| **6** | **Tài liệu hóa API (Documentation)** | **Đạt** | Xây dựng file đặc tả chuẩn OpenAPI 3.0.3 (`openapi_specification.yaml`) sẵn sàng hiển thị trên Swagger UI. |

---

## 2. TỔNG HỢP KIẾN THỨC BẢN CHẤT THEO 5 OUTLINE BÀI GIẢNG

### OUTLINE 1: TỔNG QUAN VỀ RESTful API
* **Bản chất tôi hiểu:**
  - REST không phải là một giao thức hay chuẩn ép buộc như SOAP, mà là một **phong cách kiến trúc (Architectural Style)** lấy **Tài nguyên (Resource)** làm trung tâm.
  - **6 Ràng buộc cốt lõi (Constraints):**
    1. *Client - Server:* Tách rời UI và Data storage.
    2. *Statelessness:* Server không nhớ phiên làm việc của Client, giúp scale ngang qua Load Balancer dễ dàng.
    3. *Cacheability:* Response phải có header chỉ thị khả năng lưu bộ nhớ đệm (`Cache-Control`).
    4. *Layered System:* Client không cần biết đang kết nối tới server nào qua proxy hay gateway.
    5. *Uniform Interface:* Định danh tài nguyên qua URI, thao tác qua biểu diễn, thông điệp tự mô tả và HATEOAS.
    6. *Code on Demand (Optional):* Server gửi mã thực thi (JS) cho Client chạy tạm thời.
  - **Nhược điểm của REST:** Dễ bị Over-fetching (lấy thừa) hoặc Under-fetching (lấy thiếu dẫn đến N+1 queries) và không tối ưu cho giao tiếp hai chiều thời gian thực (Real-time).

---

### OUTLINE 2: CẤU TRÚC REQUEST/RESPONSE & CONTENT TYPES
* **Bản chất tôi hiểu:**
  - **Safe (An toàn):** Gọi method không làm biến đổi dữ liệu (`GET`, `HEAD`, `OPTIONS`).
  - **Idempotent (Bất biến / Lũy đẳng):** Gọi 1 lần hay $N$ lần thì kết quả trên server vẫn như nhau (`GET`, `PUT`, `DELETE`). Trong khi đó, `POST` không có tính Idempotent.
  - **Quy tắc đặt URL:** Dùng danh từ số nhiều (`/users`, `/products`), tuyệt đối không đưa động từ vào URI (`/getUsers` là sai chuẩn). Thể hiện quan hệ cha - con bằng lồng cấp `/articles/1/comments`.
  - **Content Types:** Header `Content-Type` báo cho bên nhận kiểu dữ liệu trong body (`application/json` cho dữ liệu text cấu trúc, `multipart/form-data` khi upload file).

---

### OUTLINE 3: XÁC THỰC API (AUTHENTICATION) & OAUTH
* **Bản chất tôi hiểu:**
  - **AuthN (Bạn là ai?) vs AuthZ (Bạn được làm gì?):** AuthN trả về `401 Unauthorized` nếu sai danh tính; AuthZ trả về `403 Forbidden` nếu không đủ quyền.
  - **HTTP Basic:** Gửi `username:password` mã hóa Base64 mỗi request -> Dễ lộ mật khẩu, không thể thu hồi token, bắt buộc phải có HTTPS.
  - **JWT (JSON Web Token):** Chuẩn RFC 7519 gồm 3 phần `Header.Payload.Signature`.
    - *Header:* Thuật toán (`HS256`, `RS256`).
    - *Payload:* Claims (thông tin user, hạn dùng `exp`). Không bao giờ lưu password vào payload vì nó chỉ encode Base64 chứ không mã hóa bí mật.
    - *Signature:* Ký số bằng `Secret Key`. Giúp Server kiểm tra ngay tính toàn vẹn mà không cần query Database (Stateless).
  - **OAuth 1.0 vs OAuth 2.0:**
    - OAuth 1.0 quá phức tạp vì bắt tính toán chữ ký mật mã cho từng request.
    - OAuth 2.0 ủy thác bảo mật cho HTTPS, sử dụng Bearer Token, hỗ trợ PKCE cho Mobile/SPA và tách riêng 4 vai trò rõ ràng.

---

### OUTLINE 4 & 5: TÀI LIỆU HÓA, API DESIGN TEMPLATE & TOOLS
* **Bản chất tôi hiểu:**
  - Tài liệu API là **"Hợp đồng kỹ thuật"** giúp Frontend và Backend có thể phát triển song song thông qua Mock API mà không cần phụ thuộc lẫn nhau.
  - **Postman:** Công cụ kiểm thử mạnh mẽ với tính năng biến môi trường (`{{baseUrl}}`, `{{token}}`) và viết script tự động xác thực kết quả (`pm.test`).
  - **OpenAPI & Swagger:** OpenAPI là chuẩn định nghĩa (Specification) dạng YAML/JSON, còn Swagger là bộ công cụ trực quan hóa (Swagger UI, Editor, Codegen).

---

## 3. MINH CHỨNG THỰC HÀNH

### 3.1. Mã nguồn Server RESTful API hoàn chỉnh (`api-development/src/server.js`)
- Đã cài đặt tự động sinh và kiểm tra chữ ký JWT bằng `node:crypto`.
- Hỗ trợ đầy đủ các phương thức HTTP và Status Code chuẩn REST.
- Đã cấu hình lệnh chạy nhanh trong `package.json`:
  ```bash
  npm run start:api
  ```

### 3.2. File đặc tả OpenAPI 3.0 (`api-development/docs/openapi_specification.yaml`)
- Định nghĩa đầy đủ các đường dẫn `/auth/login`, `/products`, `/products/{id}`, schema kiểm tra dữ liệu và bảo mật `BearerAuth`.

### 3.3. Kịch bản kiểm thử Postman (`api-development/tests/postman_collection.json`)
- Tích hợp 5 ca kiểm thử tự động, kiểm tra cả luồng thành công (200, 201, 204) và luồng bắt lỗi (400, 401, 404).

---

### KẾT LUẬN
Toàn bộ chuẩn kiến thức môn học "API Development" đã được hoàn thiện 100%, có cấu trúc bài bản, tài liệu lý thuyết chuyên sâu, mã nguồn thực hành có thể chạy kiểm chứng ngay lập tức và sẵn sàng phục vụ cho việc chấm điểm, bảo vệ môn học.

