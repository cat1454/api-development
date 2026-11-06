# CHUYÊN ĐỀ 2: CẤU TRÚC REQUEST/RESPONSE & CONTENT TYPES

Tài liệu này bao quát toàn bộ nội dung của phần **Outline 2**:
1. Request/Response Structure
   - 1.1. HTTP Method
   - 1.2. Resource names and request URL
   - 1.3. Request structure
   - 1.4. Response structure
2. Content types

---

## 1. Request / Response Structure

Mô hình giao tiếp của RESTful API dựa trên chuẩn HTTP Client-Server:
- **Client** đóng gói thông điệp gửi đi gọi là **HTTP Request**.
- **Server** nhận, xử lý và đóng gói thông điệp trả về gọi là **HTTP Response**.

---

### 1.1. HTTP Method (Phương thức HTTP)

HTTP Method (còn gọi là HTTP Verbs) thể hiện **hành động** mà Client muốn thực hiện lên tài nguyên trên Server.

#### Bảng tổng hợp các HTTP Method thông dụng:
| Method | Hành động | An toàn (Safe)? | Bất biến (Idempotent)? | Có Request Body? |
| :--- | :--- | :---: | :---: | :---: |
| **`GET`** | Lấy dữ liệu tài nguyên (Đọc) | **Có** | **Có** | Không |
| **`POST`** | Tạo mới một tài nguyên con | **Không** | **Không** | **Có** |
| **`PUT`** | Cập nhật / Thay thế toàn bộ tài nguyên | **Không** | **Có** | **Có** |
| **`PATCH`** | Cập nhật một phần dữ liệu tài nguyên | **Không** | **Không** (hoặc Có tuỳ chuẩn) | **Có** |
| **`DELETE`** | Xóa một tài nguyên | **Không** | **Có** | Tùy chọn (hiếm khi) |
| **`HEAD`** | Lấy Headers tương tự GET nhưng không lấy Body | **Có** | **Có** | Không |
| **`OPTIONS`**| Kiểm tra các method và CORS mà server hỗ trợ | **Có** | **Có** | Không |

> [!NOTE] Khái niệm kỹ thuật quan trọng:
> - **Safe (An toàn):** Lệnh gọi method không làm thay đổi trạng thái của server (chỉ đọc dữ liệu, không ghi/sửa/xóa).
> - **Idempotent (Tính bất biến / Tính lũy đẳng):** Gọi method 1 lần hay gọi liên tiếp $N$ lần với cùng tham số thì kết quả trên server vẫn hoàn toàn như nhau.
>   - *Ví dụ:* `DELETE /users/10` chạy 1 lần xóa user 10, chạy tiếp 5 lần nữa user 10 vẫn ở trạng thái đã bị xóa. Trong khi đó, `POST /orders` chạy 5 lần sẽ sinh ra 5 đơn hàng khác nhau (Không Idempotent).

---

### 1.2. Resource names and request URL (Quy ước đặt tên URL chuẩn RESTful)

Một URL tốt phải phản ánh rõ ràng cấu trúc dữ liệu và mối quan hệ giữa các tài nguyên.

#### Các nguyên tắc thiết kế URL chuẩn:
1. **Sử dụng danh từ số nhiều (Plural Nouns), KHÔNG dùng động từ:**
   - ✅ Đúng: `GET /users`, `POST /products`, `DELETE /articles/5`
   - ❌ Sai: `GET /getUsers`, `POST /createProduct`, `POST /deleteArticle?id=5`
2. **Thể hiện quan hệ phân cấp Cha - Con (Hierarchy):**
   - Lấy danh sách bình luận của bài viết số 10:
     `GET /articles/10/comments`
   - Tạo đơn hàng cho khách hàng số 8:
     `POST /customers/8/orders`
   - *Lưu ý:* Không nên lồng quá 2-3 cấp để tránh URL bị dài và phức tạp (nếu sâu hơn, nên phẳng hóa URL: `GET /comments?articleId=10`).
3. **Quy ước chữ thường và dấu gạch nối (kebab-case):**
   - ✅ Đúng: `/user-profiles`, `/order-items`
   - ❌ Sai: `/userProfiles` (camelCase) hoặc `/user_profiles` (snake_case).
4. **Sử dụng Query Parameters cho Lọc, Sắp xếp, Phân trang:**
   - Lọc dữ liệu: `GET /products?category=electronics&status=in_stock`
   - Sắp xếp: `GET /users?sort=-created_at` (dấu `-` thể hiện giảm dần DESC)
   - Phân trang: `GET /articles?page=2&limit=20`

---

### 1.3. Request Structure (Cấu trúc thông điệp Request)

Một HTTP Request gửi đi từ Client bao gồm 4 thành phần chính:

```http
POST /api/v1/users HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json
Accept: application/json
User-Agent: PostmanRuntime/7.32.0

{
  "name": "Nguyen Van B",
  "email": "vanb@example.com",
  "role": "editor"
}
```

```
+--------------------------------------------------------+
| 1. Request Line: METHOD + URI PATH + HTTP VERSION      |
+--------------------------------------------------------+
| 2. Request Headers: Cặp Key-Value thông tin ngữ cảnh   |
+--------------------------------------------------------+
| [Dòng trống CRLF phân tách]                            |
+--------------------------------------------------------+
| 3. Request Body: Dữ liệu tải trọng (Payload) gửi kèm   |
+--------------------------------------------------------+
```

1. **Request Line:**
   - Gồm: Phương thức (`POST`) + Đường dẫn (`/api/v1/users`) + Phiên bản giao thức (`HTTP/1.1` hoặc `HTTP/2`).
2. **Request Headers:**
   - `Host`: Tên miền của máy chủ nhận request.
   - `Authorization`: Token xác thực định danh người dùng.
   - `Content-Type`: Khai báo định dạng của dữ liệu nằm trong phần Body gửi lên.
   - `Accept`: Báo cho server định dạng dữ liệu mà client mong muốn nhận lại.
3. **Request Body (Payload):**
   - Chứa dữ liệu cần gửi lên Server (thường là chuỗi JSON), áp dụng cho `POST`, `PUT`, `PATCH`.

---

### 1.4. Response Structure (Cấu trúc thông điệp Response)

Một HTTP Response do Server trả về bao gồm:

```http
HTTP/1.1 201 Created
Date: Fri, 06 Nov 2026 07:15:00 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 142
Connection: keep-alive

{
  "success": true,
  "data": {
    "id": 105,
    "name": "Nguyen Van B",
    "email": "vanb@example.com",
    "createdAt": "2026-11-06T07:15:00Z"
  },
  "message": "User created successfully"
}
```

#### Phân loại HTTP Status Code theo nhóm chuẩn:
Mỗi Status Code gồm 3 chữ số:
- **`1xx` (Informational - Thông tin):** Server đã nhận request, đang tiếp tục xử lý (Ví dụ: `100 Continue`, `101 Switching Protocols`).
- **`2xx` (Success - Thành công):**
  - `200 OK`: Thành công với phương thức `GET`, `PUT`, `PATCH`.
  - `201 Created`: Tạo mới thành công (thường dùng cho `POST`).
  - `204 No Content`: Xử lý thành công nhưng không cần trả về nội dung Body (thường dùng cho `DELETE`).
- **`3xx` (Redirection - Điều hướng):**
  - `301 Moved Permanently`: Tài nguyên đã chuyển vĩnh viễn sang URI mới.
  - `304 Not Modified`: Dữ liệu không thay đổi kể từ lần cache trước (giúp tiết kiệm băng thông).
- **`4xx` (Client Error - Lỗi do phía Client):**
  - `400 Bad Request`: Cú pháp request sai, JSON lỗi, thiếu tham số.
  - `401 Unauthorized`: Chưa xác thực danh tính (thiếu hoặc sai Token).
  - `403 Forbidden`: Đã xác thực nhưng không có quyền truy cập tài nguyên này.
  - `404 Not Found`: Không tìm thấy tài nguyên theo URI yêu cầu.
  - `409 Conflict`: Xung đột dữ liệu (ví dụ: đăng ký tài khoản với email đã tồn tại).
  - `422 Unprocessable Entity`: Dữ liệu gửi đúng cú pháp JSON nhưng không vượt qua được validation logic nghiệp vụ.
  - `429 Too Many Requests`: Vượt quá giới hạn tần suất gọi API (Rate limit).
- **`5xx` (Server Error - Lỗi do phía Server):**
  - `500 Internal Server Error`: Server gặp lỗi không mong muốn trong mã nguồn (crash, unhandled exception).
  - `502 Bad Gateway`: Server trung gian nhận phản hồi không hợp lệ từ server gốc.
  - `503 Service Unavailable`: Server quá tải hoặc đang bảo trì.
  - `504 Gateway Timeout`: Server trung gian hết thời gian chờ phản hồi từ server đích.

---

## 2. Content Types (MIME Types)

### 2.1. Content-Type là gì?
- **Content-Type** là một HTTP Header chỉ định kiểu định dạng phương tiện truyền thông (**MIME Type**) của dữ liệu đang được gửi trong Body của Request hoặc Response.
- **Content Negotiation:** Cơ chế thỏa thuận định dạng giữa Client và Server thông qua cặp Header:
  - Client gửi: `Accept: application/json` -> "Server ơi hãy trả kết quả về dạng JSON".
  - Server trả về: `Content-Type: application/json` -> "Dữ liệu trả về đúng là định dạng JSON".

### 2.2. Các Content-Type phổ biến trong lập trình API:

| Content-Type (MIME Type) | Mục đích sử dụng thực tế |
| :--- | :--- |
| **`application/json`** | Định dạng chuẩn số 1 hiện nay cho RESTful API. Dữ liệu dạng text có cấu trúc JSON, dung lượng nhẹ, thân thiện với JavaScript và mọi ngôn ngữ. |
| **`multipart/form-data`** | Sử dụng khi Client cần **upload file** (ảnh, tài liệu, video) hoặc form kết hợp cả dữ liệu chữ và file đính kèm. Dữ liệu được chia thành nhiều phần bởi chuỗi `boundary`. |
| **`application/x-www-form-urlencoded`** | Định dạng mặc định của Form HTML thuần. Dữ liệu được encode dưới dạng cặp khóa-giá trị tương tự query string (`name=Nguyen+Van+A&email=a%40gmail.com`). |
| **`application/xml` / `text/xml`** | Định dạng dữ liệu dạng cây thẻ XML. Thường gặp trong các hệ thống cũ (legacy system) hoặc giao thức SOAP. |
| **`text/plain`** | Văn bản thô không qua định dạng cấu trúc. |
| **`application/octet-stream`** | Dữ liệu nhị phân thô (Binary file download, export file zip,...). |

### 2.3. Ví dụ so sánh `application/json` và `multipart/form-data`
- **JSON Request:**
  ```http
  POST /api/v1/users HTTP/1.1
  Content-Type: application/json

  {"name": "Alice", "role": "admin"}
  ```
- **Multipart Form Data (Upload ảnh đại diện):**
  ```http
  POST /api/v1/users/avatar HTTP/1.1
  Content-Type: multipart/form-data; boundary=---------------------------974767299852498929531610575

  -----------------------------974767299852498929531610575
  Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
  Content-Type: image/jpeg

  <dữ liệu nhị phân của ảnh>
  -----------------------------974767299852498929531610575--
  ```

