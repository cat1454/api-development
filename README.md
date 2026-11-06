# MÔN HỌC: API DEVELOPMENT (PHÁT TRIỂN API)

> **Chương trình đào tạo kỹ thuật Sun\***  
> **Thời gian:** 2026  
> **Kho lưu trữ:** `d:/Sun/api-development/`

---

## 🎯 1. Mục Tiêu Môn Học (Course Objectives)

Môn học **"API Development"** nhằm trang bị cho học viên kiến thức và kỹ năng nền tảng để thiết kế, xây dựng và triển khai các API (*Application Programming Interface*) sử dụng các công nghệ phổ biến hiện nay như **RESTful API** và **JSON**.

### Chuẩn đầu ra (Sau khi hoàn thành môn học, học viên sẽ có khả năng):
1. **Hiểu rõ khái niệm và vai trò của API:** Nắm vững vai trò của API trong phát triển phần mềm và trong kiến trúc hệ thống hiện đại như microservices, mobile app backend, và tích hợp hệ thống.
2. **Áp dụng nguyên lý thiết kế RESTful API:** Thành thạo các phương thức HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), quy ước đặt tên endpoint, status code, và định dạng dữ liệu như JSON hoặc XML.
3. **Xây dựng API cơ bản:** Lập trình xây dựng API bằng ngôn ngữ/framework phổ biến (Node.js/Express, Python/Flask, TypeScript,...).
4. **Kiểm thử và triển khai API:** Thực hành triển khai API lên môi trường thử nghiệm/sản xuất, đồng thời sử dụng công cụ kiểm thử như **Postman** hoặc **curl**.
5. **Bảo mật API cơ bản:** Hiểu và áp dụng các nguyên tắc bảo mật cơ bản: Xác thực (*Authentication*), Phân quyền (*Authorization*), và Hạn chế truy cập (*Rate limiting/CORS*).
6. **Tài liệu hóa API (API Documentation):** Sử dụng tài liệu API và tạo tài liệu API cơ bản (Swagger / OpenAPI) giúp dễ dàng duy trì và tích hợp hệ thống.

---

## 📚 2. Danh Mục Các Chuyên Đề Đào Tạo Chi Tiết (Syllabus)

Toàn bộ nội dung từ các Outline bài giảng của Sun\* đã được nghiên cứu, tổng hợp chi tiết thành 4 chuyên đề chuẩn:

| Chuyên đề | Nội dung bài học chính | File tài liệu chi tiết |
| :--- | :--- | :--- |
| **Chuyên đề 1: Tổng quan về API & RESTful API** | - 1. What is API?<br>- 2. What is REST, RESTful API<br>- 3. How does REST work?<br>- 4. REST constraints (6 ràng buộc kiến trúc)<br>- 5. Advantages & Defects of REST | [01-tong-quan-rest-api.md](docs/01-tong-quan-rest-api.md) |
| **Chuyên đề 2: Cấu trúc Request/Response & Content Types** | - 1. Request/Response Structure (`HTTP Methods`, `Resource URLs`, `Request/Response Structure`)<br>- 2. Content types (`application/json`, `multipart/form-data`, Content Negotiation) | [02-request-response-va-content-types.md](docs/02-request-response-va-content-types.md) |
| **Chuyên đề 3: API Authentication & OAuth** | - 1. Introduction (AuthN vs AuthZ)<br>- 2. Compare authenticate method (`HTTP Basic` vs `JWT`)<br>- 3. OAuth (`OAuth 1.0` vs `OAuth 2.0`, Roles, Grant types) | [03-api-authentication-va-oauth.md](docs/03-api-authentication-va-oauth.md) |
| **Chuyên đề 4: Tài liệu hóa & Công cụ** | - 1. API Documentation<br>- 2. Why Document APIs?<br>- 3. API Design Template (Chuẩn doanh nghiệp)<br>- 4. Tools (`Postman` test script, `Swagger / OpenAPI`) | [04-api-documentation-va-tools.md](docs/04-api-documentation-va-tools.md) |

---

## 🛠️ 3. Mã Nguồn Thực Hành & Công Cụ Đi Kèm

Hệ thống đã chuẩn bị sẵn mã nguồn thực hành và công cụ để bạn kiểm thử ngay lập tức:

### 3.1. Máy chủ RESTful API mẫu (`src/server.js`)
- Triển khai bằng Node.js thuần (Zero dependencies).
- Đầy đủ các endpoint CRUD cho Resource `/api/v1/products`.
- Tự triển khai thuật toán ký và giải mã JWT (HMAC-SHA256).
- Lọc theo query string, xử lý lỗi chuẩn HTTP Status Codes (200, 201, 204, 400, 401, 404).

**Cách khởi chạy:**
```bash
# Cách 1: Dùng npm script từ thư mục gốc
npm run start:api

# Cách 2: Chạy trực tiếp qua Node.js
node api-development/src/server.js
```
Server sẽ lắng nghe tại: `http://localhost:3000`

---

### 3.2. File đặc tả OpenAPI 3.0 (`docs/openapi_specification.yaml`)
- Chứa toàn bộ định nghĩa các Endpoint, Request Body, Schema và Security Schemes.
- Có thể copy nội dung dán trực tiếp vào [Swagger Editor Online](https://editor.swagger.io/) để xem giao diện Swagger UI và bấm "Try it out".

---

### 3.3. Bộ kịch bản kiểm thử Postman (`tests/postman_collection.json`)
- Hỗ trợ import trực tiếp vào phần mềm **Postman**.
- Tích hợp sẵn mã kiểm thử tự động JavaScript (`pm.test()`).
- Tự động lưu `access_token` sau khi gọi API login để truyền sang các request tiếp theo.

---

## 📁 4. Cấu Trúc Tổng Thể Thư Mục

```text
api-development/
├── README.md                                  # Tài liệu tổng quan & Hướng dẫn môn học
├── docs/                                      # Hệ thống lý thuyết & Đặc tả
│   ├── 01-tong-quan-rest-api.md               # Outline 1: What is API & REST
│   ├── 02-request-response-va-content-types.md # Outline 2: Request/Response & MIME
│   ├── 03-api-authentication-va-oauth.md      # Outline 3: Basic Auth, JWT, OAuth 1.0 & 2.0
│   ├── 04-api-documentation-va-tools.md      # Outline 4 & 5: Docs, Template, Postman, Swagger
│   └── openapi_specification.yaml             # File đặc tả chuẩn OpenAPI 3.0.3
├── src/                                       # Mã nguồn backend thực hành
│   └── server.js                              # RESTful API Server với JWT & Full CRUD
└── tests/                                     # Kiểm thử tự động
    └── postman_collection.json                # Postman Collection v2.1 đầy đủ test scripts
```
