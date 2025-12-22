require('dotenv').config();

console.log('🔍 CURRENT .env CONFIGURATION:');
console.log('================================');

console.log('\n🤖 AI PROVIDERS:');
console.log('PRIMARY_MODEL_PROVIDER:', process.env.PRIMARY_MODEL_PROVIDER || 'NOT SET');
console.log('PRIMARY_MODEL:', process.env.PRIMARY_MODEL || 'NOT SET');
console.log('FALLBACK_MODEL_PROVIDER:', process.env.FALLBACK_MODEL_PROVIDER || 'NOT SET');
console.log('FALLBACK_MODEL:', process.env.FALLBACK_MODEL || 'NOT SET');

console.log('\n🔑 API KEYS:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET');

console.log('\n🎯 WHAT WILL BE USED:');
if (process.env.PRIMARY_MODEL_PROVIDER === 'gemini') {
  console.log('✅ HIGH/MEDIUM priority RFPs → GEMINI');
} else {
  console.log('❌ HIGH/MEDIUM priority RFPs → OPENAI');
}

if (process.env.FALLBACK_MODEL_PROVIDER === 'gemini') {
  console.log('✅ LOW priority RFPs → GEMINI');
} else {
  console.log('❌ LOW priority RFPs → OPENAI');
}
