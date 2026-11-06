# CHUYÊN ĐỀ 4: TÀI LIỆU HÓA API, THIẾT KẾ & CÔNG CỤ (SWAGGER & POSTMAN)

Tài liệu này bao quát toàn bộ nội dung của phần **Outline 4 & Outline 5**:
1. API documentation
2. Why Document APIs?
3. API Design Template (Mẫu thiết kế tài liệu API chuẩn doanh nghiệp)
4. Tools:
   - 4.1. Postman
   - 4.2. Swagger / OpenAPI

---

## 1. API Documentation (Tài liệu hóa API là gì?)

### 1.1. Định nghĩa
**API Documentation** (Tài liệu API) là bản hướng dẫn kỹ thuật chi tiết chứa đầy đủ các thông tin cần thiết về cách kết nối, tương tác và sử dụng các dịch vụ API của một hệ thống. 

Một tài liệu API hoàn chỉnh đóng vai trò như một **"Hợp đồng giao tiếp kỹ thuật" (Interface Contract)** giữa bên cung cấp API (Backend Developer) và bên tiêu thụ API (Frontend, Mobile Developer, Đối tác bên thứ ba).

### 1.2. Các thành phần bắt buộc của một tài liệu API:
1. **Tổng quan & Môi trường:** Base URL cho các môi trường (Development, Staging, Production).
2. **Cơ chế xác thực (Authentication):** Quy định cách truyền Token (`Bearer <JWT>`, API Key, Basic Auth,...).
3. **Danh sách Endpoints:**
   - URL đường dẫn và phương thức HTTP (`GET`, `POST`, `PUT`, `DELETE`,...).
   - Mục đích và nghiệp vụ của từng endpoint.
4. **Chi tiết Request:**
   - Headers yêu cầu (`Content-Type`, `Authorization`,...).
   - Path Parameters (`/users/{id}`) và Query Parameters (`?page=1&limit=10`).
   - Request Body schema: Tên trường, kiểu dữ liệu, bắt buộc hay tùy chọn, quy tắc validate.
5. **Chi tiết Response:**
   - HTTP Status codes trả về (200, 201, 400, 401, 404, 422, 500).
   - Cấu trúc dữ liệu JSON kèm ví dụ thực tế (Example payload).
6. **Bảng mã lỗi (Error Codes & Messages):** Danh sách mã lỗi nghiệp vụ để phía Client hiển thị thông báo phù hợp cho người dùng cuối.

---

## 2. Why Document APIs? (Tại sao cần viết tài liệu API?)

Trong các dự án phần mềm chuyên nghiệp (đặc biệt tại Sun* và các công ty công nghệ), việc viết tài liệu API là **bắt buộc** vì những lý do sau:

```
                    TẦM QUAN TRỌNG CỦA TÀI LIỆU API
                                   |
      +--------------------+-------+-------+--------------------+
      |                    |               |                    |
1. Phát triển song song   2. Giảm thiểu   3. Tăng tốc độ      4. Tự động hóa
   (Parallel Dev)            hiểu lầm        Onboarding          kiểm thử & SDK
```

1. **Cho phép phát triển song song (Parallel Development):**
   - Khi có bản thiết kế API từ đầu (Design-first), Frontend và Mobile Developer có thể chủ động giả lập dữ liệu (**Mock API**) để code giao diện mà **không cần chờ Backend code xong**.
2. **Giảm thiểu tối đa tranh cãi và lỗi tích hợp:**
   - Loại bỏ tình trạng: *"Ủa trường này trả về kiểu số hay kiểu chuỗi?", "Sao gọi endpoint này mà bị lỗi 500?", "Header này truyền như thế nào?"*.
   - Mọi thứ đều được quy ước rõ ràng bằng văn bản ("Nói có sách, mách có chứng").
3. **Tăng tốc độ làm quen dự án (Onboarding) & Giảm chi phí bảo trì:**
   - Thành viên mới gia nhập dự án chỉ cần đọc tài liệu API là có thể nắm bắt toàn bộ luồng dữ liệu của hệ thống mà không cần người cũ phải kèm cặp giải thích từng dòng code.
4. **Trải nghiệm lập trình viên tốt hơn (Developer Experience - DX):**
   - Nếu bạn xây dựng Public API (như Stripe, Twilio, OpenAI, Momo), tài liệu API chuẩn chỉ và dễ hiểu quyết định 90% sự thành bại trong việc thu hút lập trình viên tích hợp dịch vụ.
5. **Hỗ trợ sinh mã tự động (Code Generation):**
   - Từ một file tài liệu chuẩn OpenAPI, ta có thể tự động sinh ra mã nguồn TypeScript SDK, thư viện kết nối mạng cho Flutter/Swift chỉ bằng một dòng lệnh.

---

## 3. API Design Template (Mẫu thiết kế đặc tả API chuẩn doanh nghiệp)

Dưới đây là mẫu biểu chuẩn thiết kế API chi tiết (API Specification Template):

### 📋 MẪU ĐẶC TẢ CHI TIẾT ENDPOINT: TẠO ĐƠN HÀNG MỚI

#### 1. Thông tin chung (General Information)
- **Tên API:** Tạo mới đơn hàng (Create New Order)
- **Mã chức năng:** `API_ORD_001`
- **Endpoint:** `/api/v1/orders`
- **Method:** `POST`
- **Yêu cầu xác thực:** Bắt buộc (Bearer Token - Role: `customer`)

#### 2. Request Headers
| Tên Header | Kiểu dữ liệu | Bắt buộc | Giá trị mẫu | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `Content-Type` | String | **Có** | `application/json` | Định dạng dữ liệu gửi lên |
| `Authorization`| String | **Có** | `Bearer eyJhbGci...`| Access Token của người dùng |

#### 3. Request Body (JSON Schema)
| Tên trường | Kiểu dữ liệu | Bắt buộc | Ràng buộc validation | Mô tả |
| :--- | :--- | :---: | :--- | :--- |
| `shippingAddress` | String | **Có** | Tối thiểu 10 ký tự | Địa chỉ giao hàng chi tiết |
| `phone` | String | **Có** | Định dạng SĐT VN (10 số) | Số điện thoại liên hệ nhận hàng |
| `paymentMethod` | String | **Có** | `COD`, `VNPAY`, `MOMO` | Phương thức thanh toán |
| `items` | Array | **Có** | Tối thiểu 1 phần tử | Danh sách sản phẩm mua |
| `items[].productId`| Integer | **Có** | Số nguyên dương > 0 | ID của sản phẩm |
| `items[].quantity` | Integer | **Có** | $1 \le quantity \le 50$ | Số lượng sản phẩm cần mua |

*Ví dụ Request Body mẫu:*
```json
{
  "shippingAddress": "Toà nhà Fivestar, 285 Đội Cấn, Ba Đình, Hà Nội",
  "phone": "0987654321",
  "paymentMethod": "COD",
  "items": [
    {
      "productId": 101,
      "quantity": 2
    },
    {
      "productId": 205,
      "quantity": 1
    }
  ]
}
```

#### 4. Response Specification (Đặc tả phản hồi)

##### Trường hợp thành công (HTTP 201 Created):
```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "message": "Đơn hàng đã được tạo thành công",
  "data": {
    "orderId": 8801,
    "orderCode": "ORD-20261106-8801",
    "totalAmount": 1250000,
    "status": "PENDING",
    "createdAt": "2026-11-06T14:30:00Z"
  }
}
```

##### Bảng mã lỗi xử lý thất bại (Error Matrix):
| HTTP Status Code | Error Code | Lý do phát sinh | Ví dụ Message phản hồi |
| :---: | :--- | :--- | :--- |
| **`400`** | `VALIDATION_FAILED` | Dữ liệu gửi lên sai định dạng hoặc thiếu trường bắt buộc | `"items array must not be empty"` |
| **`401`** | `UNAUTHORIZED` | Không truyền hoặc token hết hạn/sai chữ ký | `"Token has expired or is invalid"` |
| **`403`** | `FORBIDDEN` | Tài khoản bị khóa hoặc không phải quyền customer | `"You don't have permission to perform this action"` |
| **`404`** | `PRODUCT_NOT_FOUND` | `productId` không tồn tại trong hệ thống | `"Product with ID 205 does not exist"` |
| **`409`** | `OUT_OF_STOCK` | Số lượng hàng tồn kho không đủ để đặt | `"Product 101 only has 1 item left in stock"` |
| **`500`** | `INTERNAL_SERVER_ERROR` | Lỗi phát sinh ngoài dự kiến tại backend | `"An unexpected error occurred. Please try again later"` |

---

## 4. Tools (Công cụ kiểm thử & Tài liệu hóa API)

---

### 4.1. Postman

**Postman** là công cụ hàng đầu thế giới được sử dụng bởi hàng triệu lập trình viên để thiết kế, gửi thử nghiệm, gỡ lỗi và tự động hóa kiểm thử API.

#### Các tính năng cốt lõi cần làm chủ trong Postman:
1. **Collections & Folders:**
   - Giúp gom nhóm và phân loại các API request theo từng phân hệ (Auth, Products, Cart, Orders) một cách khoa học.
   - Có thể xuất (Export) ra file JSON để chia sẻ trong nhóm dự án hoặc đưa lên Git.
2. **Environments & Variables (Biến môi trường):**
   - Cho phép định nghĩa các biến linh hoạt như `{{baseUrl}}`, `{{token}}`.
   - Giúp chuyển đổi nhanh giữa môi trường `Local` (`http://localhost:3000`), `Staging`, và `Production` mà không cần chỉnh sửa lại URL từng request.
3. **Scripts & Test Automation:**
   - **Pre-request Script:** Chạy mã JavaScript trước khi request được gửi (ví dụ: tạo timestamp, tính toán chuỗi hash).
   - **Tests Script:** Chạy mã JavaScript ngay sau khi nhận phản hồi để kiểm tra tính đúng đắn:
     ```javascript
     // 1. Kiểm tra Status Code
     pm.test("Status code is 200 OK", function () {
         pm.response.to.have.status(200);
     });

     // 2. Kiểm tra thời gian phản hồi (Response time)
     pm.test("Response time is less than 500ms", function () {
         pm.expect(pm.response.responseTime).to.be.below(500);
     });

     // 3. Tự động lưu Token vào biến môi trường sau khi Login thành công
     var jsonData = pm.response.json();
     if (jsonData.data && jsonData.data.token) {
         pm.environment.set("access_token", jsonData.data.token);
         console.log("Đã lưu token thành công:", jsonData.data.token);
     }
     ```
4. **Mock Server:**
   - Tạo ra một Server giả lập trên đám mây của Postman chỉ trong 2 phút dựa trên Response mẫu, giúp Frontend team có thể gọi API ngay lập tức.
5. **Newman:**
   - Công cụ dòng lệnh (CLI) chạy toàn bộ Postman Collection tích hợp vào quy trình **CI/CD** (GitHub Actions, GitLab CI) để tự động kiểm thử hồi quy (Regression Testing).

---

### 4.2. Swagger / OpenAPI

#### Phân biệt OpenAPI và Swagger:
- **OpenAPI Specification (OAS):** Là một **chuẩn quy cách mở** (Specification) độc lập với ngôn ngữ lập trình, dùng để mô tả giao diện RESTful API bằng định dạng `YAML` hoặc `JSON`. Hiện tại chuẩn phổ biến là **OpenAPI 3.0 / 3.1**.
- **Swagger:** Là **bộ công cụ phần mềm** mã nguồn mở (do SmartBear phát triển) để hỗ trợ triển khai chuẩn OpenAPI:
  - **Swagger Editor:** Trình soạn thảo file OpenAPI trực quan, tự động báo lỗi cú pháp.
  - **Swagger UI:** Công cụ tự động dựng trang Web HTML từ file OpenAPI. Cung cấp giao diện trực quan cho phép người dùng đọc tài liệu và bấm nút **"Try it out"** để gửi request trực tiếp trên trình duyệt.
  - **Swagger Codegen / OpenAPI Generator:** Công cụ tự động sinh mã nguồn (Client SDK hoặc Server Stubs) cho hơn 40 ngôn ngữ lập trình khác nhau.

#### Ví dụ định nghĩa OpenAPI 3.0 bằng YAML:
```yaml
openapi: 3.0.0
info:
  title: Sun* E-Commerce API
  description: Tài liệu chuẩn RESTful API cho ứng dụng bán hàng
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
    description: Production Server
  - url: http://localhost:3000/api/v1
    description: Local Dev Server

paths:
  /products:
    get:
      summary: Lấy danh sách sản phẩm
      parameters:
        - name: limit
          in: query
          required: false
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Lấy danh sách thành công
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: integer
                        name:
                          type: string
                        price:
                          type: number
```

#### Hai trường phái tiếp cận khi xây dựng API:
1. **Design-First (Thiết kế trước):**
   - Viết đặc tả OpenAPI (file YAML) trước -> Thảo luận thống nhất giữa Frontend, Mobile và Backend -> Sau đó Backend mới bắt đầu viết code thực hiện.
   - *Ưu điểm:* Tiết kiệm thời gian, tính tương thích cao, frontend không bị phụ thuộc.
2. **Code-First (Viết code trước):**
   - Lập trình viên viết mã nguồn API trước, sau đó dùng các thư viện (ví dụ `@nestjs/swagger` trong NestJS, `swagger-jsdoc` trong Express) để tự động sinh ra file OpenAPI từ các chú thích (annotations/decorators) trong mã nguồn.
   - *Ưu điểm:* Dễ tiếp cận với người mới, tài liệu luôn đồng bộ với code đang chạy.

