const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// تفعيل CORS للسماح بالاتصال من أي دومين
app.use(cors({
  origin: '*', // يمكنك تحديد النطاقات المسموحة بدلاً من * للأمان
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// تفعيل استقبال JSON
app.use(express.json({ limit: '10mb' }));

// middleware للتسجيل
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// الراوت الرئيسي للبروكسي
app.post('/send-message', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // إعادة توجيه الطلب إلى API الداخلي
    const response = await axios.post('http://wa.elliaa.com/send-message', req.body, {
      headers: {
        'Content-Type': 'application/json',
        // نقل أي headers إضافية من الطلب الأصلي
        ...req.headers,
        // إزالة headers معينة لتجنب التعارضات
        host: undefined,
        'content-length': undefined
      },
      timeout: 30000 // 30 ثانية timeout
    });

    console.log('API Response Status:', response.status);
    
    // إرسال الرد الأصلي من API إلى الواجهة
    res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error('Proxy Error:', error.message);
    
    // معالجة أخطاء الشبكة والاتصال
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Unable to connect to the WhatsApp API service',
        code: 'CONNECTION_REFUSED'
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request timeout while connecting to WhatsApp API',
        code: 'TIMEOUT'
      });
    }
    
    // معالجة أخطاء HTTP من API
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'API Error',
        message: error.response.data?.message || 'Error from WhatsApp API',
        data: error.response.data,
        status: error.response.status
      });
    }
    
    // خطأ عام
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing your request',
      code: 'INTERNAL_ERROR'
    });
  }
});

// راوت للتحقق من صحة السيرفر
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'WhatsApp Proxy Server'
  });
});

// راوت افتراضي
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Proxy Server is running',
    endpoints: {
      proxy: 'POST /send-message',
      health: 'GET /health'
    }
  });
});

// معالجة الراوتات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

// تشغيل السيرفر مع HTTPS
function startServer() {
  // محاولة تشغيل HTTPS إذا كانت الشهادات متوفرة
  try {
    const sslOptions = {
      key: fs.readFileSync('/etc/ssl/private/proxy.elliaa.com.key'),
      cert: fs.readFileSync('/etc/ssl/certs/proxy.elliaa.com.crt')
    };
    
    https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
      console.log(`🚀 HTTPS Proxy Server running on https://proxy.elliaa.com:${HTTPS_PORT}`);
      console.log(`🔗 Proxying to: http://wa.elliaa.com/send-message`);
    });
    
  } catch (sslError) {
    console.log('SSL certificates not found, falling back to HTTP...');
    
    // تشغيل HTTP إذا لم تكن شهادات SSL متوفرة
    app.listen(PORT, () => {
      console.log(`🚀 HTTP Proxy Server running on http://localhost:${PORT}`);
      console.log(`🔗 Proxying to: http://wa.elliaa.com/send-message`);
      console.log('⚠️  Note: For production, configure SSL certificates for HTTPS');
    });
  }
}

// التعامل مع إيقاف السيرفر بشكل آمن
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();