// ملف تكوين API الجديد
module.exports = {
  // إعدادات API الجديد
  newApi: {
    baseUrl: 'http://13.51.195.216:3000',
    endpoints: {
      sendMessage: '/api/send-message',
      status: '/api/status'
    },
    timeout: 30000, // 30 ثانية
    retries: 3
  },
  
  // إعدادات البروكسي
  proxy: {
    port: process.env.PORT || 3000,
    httpsPort: process.env.HTTPS_PORT || 443,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  
  // إعدادات SSL (اختيارية)
  ssl: {
    keyPath: '/etc/ssl/private/proxy.elliaa.com.key',
    certPath: '/etc/ssl/certs/proxy.elliaa.com.crt'
  },
  
  // إعدادات التسجيل
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: false
  },
  
  // إعدادات الأمان
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      max: 100 // حد أقصى 100 طلب لكل IP
    }
  }
}; 