const axios = require('axios');

// تكوين الاختبار
const TEST_CONFIG = {
  proxyUrl: 'http://localhost:3000',
  newApiUrl: 'http://13.51.195.216:3000/api/send-message',
  testPhone: '201234567890',
  testMessage: 'رسالة اختبار من API الجديد'
};

// اختبار حالة API الجديد
async function testNewApiStatus() {
  try {
    console.log('🔍 اختبار حالة API الجديد...');
    const response = await axios.get('http://13.51.195.216:3000/api/status', {
      timeout: 10000
    });
    console.log('✅ API الجديد يعمل:', response.data);
    return true;
  } catch (error) {
    console.log('❌ فشل في الاتصال بـ API الجديد:', error.message);
    return false;
  }
}

// اختبار البروكسي مع API الجديد
async function testProxyWithNewApi() {
  try {
    console.log('\n📤 اختبار البروكسي مع API الجديد...');
    
    const requestBody = {
      number: TEST_CONFIG.testPhone,  // سيتم تحويله إلى 'phone'
      message: TEST_CONFIG.testMessage
    };
    
    console.log('📝 إرسال الطلب:', requestBody);
    
    const response = await axios.post(`${TEST_CONFIG.proxyUrl}/send-message`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ استجابة البروكسي:', response.data);
    
    // التحقق من تنسيق الاستجابة
    if (response.data.success) {
      console.log('🎉 الرسالة أرسلت بنجاح!');
      console.log('📱 Message ID:', response.data.messageId);
      console.log('⏰ Timestamp:', response.data.timestamp);
      console.log('📞 Phone:', response.data.phone);
    } else {
      console.log('⚠️ فشل في إرسال الرسالة:', response.data.error);
    }
    
    return true;
  } catch (error) {
    console.log('❌ فشل في اختبار البروكسي:', error.message);
    if (error.response) {
      console.log('📊 تفاصيل الخطأ:', error.response.data);
    }
    return false;
  }
}

// اختبار صحة الخادم
async function testServerHealth() {
  try {
    console.log('\n🏥 اختبار صحة الخادم...');
    const response = await axios.get(`${TEST_CONFIG.proxyUrl}/health`);
    console.log('✅ حالة الخادم:', response.data);
    return true;
  } catch (error) {
    console.log('❌ فشل في اختبار صحة الخادم:', error.message);
    return false;
  }
}

// اختبار الراوت الجديد
async function testNewEndpoint() {
  try {
    console.log('\n🆕 اختبار الراوت الجديد /api-status...');
    const response = await axios.get(`${TEST_CONFIG.proxyUrl}/api-status`);
    console.log('✅ حالة API الجديد عبر البروكسي:', response.data);
    return true;
  } catch (error) {
    console.log('❌ فشل في اختبار الراوت الجديد:', error.message);
    return false;
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبارات API الجديد...\n');
  
  const results = {
    newApiStatus: await testNewApiStatus(),
    serverHealth: await testServerHealth(),
    newEndpoint: await testNewEndpoint(),
    proxyTest: await testProxyWithNewApi()
  };
  
  console.log('\n📊 نتائج الاختبارات:');
  console.log('='.repeat(40));
  console.log(`🔍 حالة API الجديد: ${results.newApiStatus ? '✅' : '❌'}`);
  console.log(`🏥 صحة الخادم: ${results.serverHealth ? '✅' : '❌'}`);
  console.log(`🆕 الراوت الجديد: ${results.newEndpoint ? '✅' : '❌'}`);
  console.log(`📤 اختبار البروكسي: ${results.proxyTest ? '✅' : '❌'}`);
  console.log('='.repeat(40));
  
  const successCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 النتيجة النهائية: ${successCount}/${totalCount} اختبارات نجحت`);
  
  if (successCount === totalCount) {
    console.log('🎉 جميع الاختبارات نجحت! API الجديد يعمل بشكل صحيح.');
  } else {
    console.log('⚠️ بعض الاختبارات فشلت. يرجى مراجعة الإعدادات.');
  }
}

// تشغيل الاختبارات إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testNewApiStatus,
  testProxyWithNewApi,
  testServerHealth,
  testNewEndpoint,
  runAllTests
}; 