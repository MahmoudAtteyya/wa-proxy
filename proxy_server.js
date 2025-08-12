const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const config = require('./config');

const app = express();
const PORT = config.proxy.port;
const HTTPS_PORT = config.proxy.httpsPort;

// تفعيل CORS للسماح بالاتصال من أي دومين
app.use(cors(config.proxy.cors));

// تفعيل استقبال JSON
app.use(express.json({ limit: '10mb' }));

// middleware للتسجيل
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// الراوت الرئيسي للبروكسي - محدث لاستخدام API الجديد
app.post('/send-message', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    // تحويل المعاملات من API القديم إلى الجديد
    const { number, message, ...otherParams } = req.body;
    
    // إنشاء body جديد مع المعاملات المحدثة
    const newRequestBody = {
      phone: number, // تغيير من 'number' إلى 'phone'
      message: message,
      ...otherParams // الاحتفاظ بأي معاملات إضافية
    };
    
    console.log('Transformed request body:', newRequestBody);
    
    // إعادة توجيه الطلب إلى API الجديد
    const response = await axios.post(`${config.newApi.baseUrl}${config.newApi.endpoints.sendMessage}`, newRequestBody, {
      headers: {
        'Content-Type': 'application/json',
        // نقل أي headers إضافية من الطلب الأصلي
        ...req.headers,
        // إزالة headers معينة لتجنب التعارضات
        host: undefined,
        'content-length': undefined
      },
      timeout: config.newApi.timeout
    });

    console.log('New API Response Status:', response.status);
    console.log('New API Response Data:', response.data);
    
    // معالجة الاستجابة الجديدة من API
    if (response.data.success) {
      // نجح إرسال الرسالة
      res.status(200).json({
        success: true,
        messageId: response.data.messageId,
        timestamp: response.data.timestamp,
        phone: response.data.phone,
        message: 'Message sent successfully'
      });
    } else {
      // فشل إرسال الرسالة
      res.status(400).json({
        success: false,
        error: response.data.error || 'Failed to send message',
        message: response.data.message || 'Unknown error occurred'
      });
    }
    
  } catch (error) {
    console.error('Proxy Error:', error.message);
    
    // معالجة أخطاء الشبكة والاتصال
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Unable to connect to the new WhatsApp API service',
        code: 'CONNECTION_REFUSED'
      });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        error: 'Gateway Timeout',
        message: 'Request timeout while connecting to new WhatsApp API',
        code: 'TIMEOUT'
      });
    }
    
    // معالجة أخطاء HTTP من API الجديد
    if (error.response) {
      const errorData = error.response.data;
      return res.status(error.response.status).json({
        success: false,
        error: errorData?.error || 'API Error',
        message: errorData?.message || 'Error from new WhatsApp API',
        data: errorData,
        status: error.response.status
      });
    }
    
    // خطأ عام
    res.status(500).json({
      success: false,
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
    service: 'WhatsApp Proxy Server (Updated)',
    newApiEndpoint: `${config.newApi.baseUrl}${config.newApi.endpoints.sendMessage}`
  });
});

// راوت للتحقق من حالة API الجديد
app.get('/api-status', async (req, res) => {
  try {
    const response = await axios.get(`${config.newApi.baseUrl}${config.newApi.endpoints.status}`, {
      timeout: 10000
    });
    
    res.json({
      success: true,
      newApiStatus: response.data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'New API Status Check Failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// راوت افتراضي
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Proxy Server is running (Updated to New API)',
    endpoints: {
      proxy: 'POST /send-message',
      health: 'GET /health',
      apiStatus: 'GET /api-status'
    },
    newApiEndpoint: `${config.newApi.baseUrl}${config.newApi.endpoints.sendMessage}`,
    changes: {
      parameterMapping: 'number -> phone',
      responseFormat: 'Updated to new API format',
      errorHandling: 'Enhanced for new API'
    }
  });
});

// معالجة الراوتات غير الموجودة
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
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
      console.log(`🔗 Proxying to: ${config.newApi.baseUrl}${config.newApi.endpoints.sendMessage} (NEW API)`);
      console.log(`📱 Parameter mapping: number -> phone`);
    });
    
  } catch (sslError) {
    console.log('SSL certificates not found, falling back to HTTP...');
    
    // تشغيل HTTP إذا لم تكن شهادات SSL متوفرة
    app.listen(PORT, () => {
      console.log(`🚀 HTTP Proxy Server running on http://localhost:${PORT}`);
      console.log(`🔗 Proxying to: ${config.newApi.baseUrl}${config.newApi.endpoints.sendMessage} (NEW API)`);
      console.log(`📱 Parameter mapping: number -> phone`);
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