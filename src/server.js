/**
 * ==============================================================================
 * DỰ ÁN THỰC HÀNH MÔN HỌC: API DEVELOPMENT (Sun* Curriculum)
 * File: server.js
 * Mục đích: Triển khai một RESTful API Server hoàn chỉnh bằng Node.js thuần (Pure Node.js)
 *           Không cần cài đặt thư viện ngoài, minh họa trực quan:
 *           - Chuẩn RESTful endpoints (GET, POST, PUT, DELETE)
 *           - HTTP Status Codes (200, 201, 204, 400, 401, 404, 405)
 *           - Cơ chế xác thực JWT (tự tạo và kiểm tra chữ ký HMAC SHA-256)
 *           - Cấu trúc Request / Response chuẩn hóa (Content-Type: application/json)
 * ==============================================================================
 */

const http = require('node:http');
const url = require('node:url');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 3000;
const JWT_SECRET = 'sun-asterisk-super-secret-key-2026';

// ------------------------------------------------------------------------------
// 1. CƠ SỞ DỮ LIỆU TẠM THỜI (IN-MEMORY DATABASE)
// ------------------------------------------------------------------------------
let products = [
  { id: 1, name: 'Bàn phím cơ Sun* Mechanical Pro', price: 1500000, category: 'electronics', inStock: true },
  { id: 2, name: 'Chuột không dây Silent Sun*', price: 450000, category: 'electronics', inStock: true },
  { id: 3, name: 'Sổ tay lập trình viên Sun*', price: 120000, category: 'stationery', inStock: false },
  { id: 4, name: 'Áo khoác đồng phục Sun* Asterisk', price: 380000, category: 'fashion', inStock: true }
];
let nextId = 5;

// ------------------------------------------------------------------------------
// 2. HELPER: TRIỂN KHAI JWT THUẦN (HEADER.PAYLOAD.SIGNATURE)
// ------------------------------------------------------------------------------
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

// Tạo JWT Access Token
function generateJWT(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Xác thực tính hợp lệ của JWT Access Token
function verifyJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null; // Chữ ký không khớp - Token đã bị giả mạo!
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Token đã hết hạn sử dụng
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// ------------------------------------------------------------------------------
// 3. HELPER: ĐỌC DỮ LIỆU BODY TỪ HTTP REQUEST
// ------------------------------------------------------------------------------
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
}

// Helper gửi Response JSON chuẩn
function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    ...headers
  });
  res.end(JSON.stringify(data, null, 2));
}

// ------------------------------------------------------------------------------
// 4. HTTP REQUEST ROUTER & CONTROLLERS
// ------------------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Xử lý Preflight Request (CORS OPTIONS)
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  try {
    // --------------------------------------------------------------------------
    // ENDPOINT 1: POST /api/v1/auth/login (Đăng nhập lấy Token)
    // --------------------------------------------------------------------------
    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseRequestBody(req);
      const { username, password } = body;

      // Giả lập kiểm tra tài khoản (student / password123)
      if (username === 'student' && password === 'password123') {
        const token = generateJWT({
          sub: 'user_101',
          username: 'student',
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + 3600 // Hết hạn sau 1 tiếng
        });

        return sendJson(res, 200, {
          success: true,
          message: 'Đăng nhập thành công! Hãy lưu lại Token bên dưới để gọi các API được bảo vệ.',
          token: token,
          tokenType: 'Bearer',
          expiresInSeconds: 3600
        });
      } else {
        return sendJson(res, 401, {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Tài khoản hoặc mật khẩu không chính xác (Thử: student / password123)'
        });
      }
    }

    // --------------------------------------------------------------------------
    // ENDPOINT 2: GET /api/v1/products (Lấy danh sách sản phẩm)
    // Safe & Idempotent
    // --------------------------------------------------------------------------
    if (pathname === '/api/v1/products' && method === 'GET') {
      let result = [...products];

      // Hỗ trợ lọc theo query param: ?category=electronics
      if (parsedUrl.query.category) {
        result = result.filter(p => p.category === parsedUrl.query.category);
      }

      // Hỗ trợ giới hạn số lượng: ?limit=2
      if (parsedUrl.query.limit) {
        const limit = parseInt(parsedUrl.query.limit, 10);
        if (!isNaN(limit)) {
          result = result.slice(0, limit);
        }
      }

      return sendJson(res, 200, {
        success: true,
        total: result.length,
        data: result
      });
    }

    // --------------------------------------------------------------------------
    // ENDPOINT 3: GET /api/v1/products/:id (Lấy chi tiết 1 sản phẩm)
    // --------------------------------------------------------------------------
    const productDetailMatch = pathname.match(/^\/api\/v1\/products\/(\d+)$/);
    if (productDetailMatch && method === 'GET') {
      const id = parseInt(productDetailMatch[1], 10);
      const product = products.find(p => p.id === id);

      if (!product) {
        return sendJson(res, 404, {
          success: false,
          error: 'NOT_FOUND',
          message: `Không tìm thấy sản phẩm có ID: ${id}`
        });
      }

      return sendJson(res, 200, {
        success: true,
        data: product
      });
    }

    // --------------------------------------------------------------------------
    // AUTHENTICATION MIDDLEWARE DÀNH CHO CÁC API THAY ĐỔI DỮ LIỆU (POST, PUT, DELETE)
    // --------------------------------------------------------------------------
    const requireAuth = () => {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendJson(res, 401, {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Thiếu Authorization Bearer Token. Vui lòng login tại POST /api/v1/auth/login để lấy token.'
        });
        return null;
      }

      const token = authHeader.split(' ')[1];
      const decodedUser = verifyJWT(token);
      if (!decodedUser) {
        sendJson(res, 401, {
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Token không hợp lệ, bị giả mạo hoặc đã hết hạn.'
        });
        return null;
      }

      return decodedUser;
    };

    // --------------------------------------------------------------------------
    // ENDPOINT 4: POST /api/v1/products (Tạo mới sản phẩm - Yêu cầu Token)
    // Non-safe, Non-idempotent
    // --------------------------------------------------------------------------
    if (pathname === '/api/v1/products' && method === 'POST') {
      const user = requireAuth();
      if (!user) return;

      const body = await parseRequestBody(req);
      if (!body.name || !body.price || !body.category) {
        return sendJson(res, 400, {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Các trường `name`, `price`, và `category` là bắt buộc.'
        });
      }

      const newProduct = {
        id: nextId++,
        name: body.name,
        price: Number(body.price),
        category: body.category,
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : true
      };

      products.push(newProduct);

      return sendJson(res, 201, {
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: newProduct
      }, {
        'Location': `/api/v1/products/${newProduct.id}`
      });
    }

    // --------------------------------------------------------------------------
    // ENDPOINT 5: PUT /api/v1/products/:id (Cập nhật sản phẩm - Idempotent)
    // --------------------------------------------------------------------------
    if (productDetailMatch && method === 'PUT') {
      const user = requireAuth();
      if (!user) return;

      const id = parseInt(productDetailMatch[1], 10);
      const index = products.findIndex(p => p.id === id);

      if (index === -1) {
        return sendJson(res, 404, {
          success: false,
          error: 'NOT_FOUND',
          message: `Không tìm thấy sản phẩm có ID: ${id} để cập nhật`
        });
      }

      const body = await parseRequestBody(req);
      products[index] = {
        id: id,
        name: body.name || products[index].name,
        price: body.price !== undefined ? Number(body.price) : products[index].price,
        category: body.category || products[index].category,
        inStock: body.inStock !== undefined ? Boolean(body.inStock) : products[index].inStock
      };

      return sendJson(res, 200, {
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: products[index]
      });
    }

    // --------------------------------------------------------------------------
    // ENDPOINT 6: DELETE /api/v1/products/:id (Xóa sản phẩm - Idempotent)
    // --------------------------------------------------------------------------
    if (productDetailMatch && method === 'DELETE') {
      const user = requireAuth();
      if (!user) return;

      const id = parseInt(productDetailMatch[1], 10);
      const index = products.findIndex(p => p.id === id);

      if (index === -1) {
        return sendJson(res, 404, {
          success: false,
          error: 'NOT_FOUND',
          message: `Không tìm thấy sản phẩm có ID: ${id}`
        });
      }

      products.splice(index, 1);

      // Trả về 204 No Content theo chuẩn REST
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*'
      });
      return res.end();
    }

    // --------------------------------------------------------------------------
    // ENDPOINT 7: GET /api/v1/openapi (Đọc trực tiếp file đặc tả OpenAPI)
    // --------------------------------------------------------------------------
    if (pathname === '/api/v1/openapi' && method === 'GET') {
      const specPath = path.join(__dirname, '..', 'docs', 'openapi_specification.yaml');
      if (fs.existsSync(specPath)) {
        const yamlContent = fs.readFileSync(specPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/yaml; charset=utf-8' });
        return res.end(yamlContent);
      }
    }

    // 404 Not Found cho mọi URL không khớp
    return sendJson(res, 404, {
      success: false,
      error: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${method} ${pathname} không tồn tại trong hệ thống API.`
    });

  } catch (error) {
    if (error.message === 'INVALID_JSON') {
      return sendJson(res, 400, {
        success: false,
        error: 'BAD_REQUEST',
        message: 'Request body gửi lên không đúng định dạng JSON hợp lệ.'
      });
    }

    console.error('Unhandled Server Error:', error);
    return sendJson(res, 500, {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Có lỗi không mong muốn phát sinh tại máy chủ.'
    });
  }
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 RESTful API Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📖 Tài liệu OpenAPI YAML:           http://localhost:${PORT}/api/v1/openapi`);
  console.log(`🔐 Đăng nhập (Lấy token):           POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`📦 Danh sách sản phẩm:              GET  http://localhost:${PORT}/api/v1/products`);
  console.log('====================================================');
});

