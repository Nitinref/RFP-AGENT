const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function testAIConfig() {
  console.log('🎯 AI PROVIDER DIAGNOSTIC TEST');
  console.log('===============================');
  
  // 1. Check environment variables
  console.log('\n1️⃣ ENVIRONMENT CHECK:');
  const env = process.env;
  console.log('   GEMINI_API_KEY:', env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   OPENAI_API_KEY:', env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   PRIMARY_MODEL:', env.PRIMARY_MODEL || 'Not set (default: gpt-4o)');
  console.log('   PRIMARY_PROVIDER:', env.PRIMARY_PROVIDER || 'Not set (default: openai)');
  
  // 2. Check your config files
  console.log('\n2️⃣ CONFIG FILE CHECK:');
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check config/environment.js
    const configPath = path.join(__dirname, 'config', 'environment.js');
    if (fs.existsSync(configPath)) {
      console.log('   config/environment.js: ✅ Found');
      const configContent = fs.readFileSync(configPath, 'utf8');
      const hasGemini = configContent.includes('gemini');
      console.log('   Contains "gemini":', hasGemini ? '✅ Yes' : '❌ No');
    } else {
      console.log('   config/environment.js: ❌ Not found');
    }
    
    // Check .env file
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      console.log('   .env file: ✅ Found');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n').filter(l => l.includes('GEMINI') || l.includes('OPENAI'));
      lines.forEach(line => {
        const [key] = line.split('=');
        console.log(`   ${key}: ${line.includes('your_') ? '⚠️ Needs update' : '✅ Set'}`);
      });
    }
  } catch (error) {
    console.log('   Config check error:', error.message);
  }
  
  // 3. Test Gemini API directly
  console.log('\n3️⃣ GEMINI API TEST:');
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    if (!env.GEMINI_API_KEY) {
      console.log('   ❌ Skipping - No API key');
    } else {
      const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { maxOutputTokens: 50 }
      });
      
      const result = await model.generateContent('Say "Gemini is working"');
      const text = result.response.text();
      console.log('   ✅ Gemini API: WORKING');
      console.log('   Response:', text);
    }
  } catch (error) {
    console.log('   ❌ Gemini API test failed:', error.message);
  }
  
  // 4. Test ModelService selection logic
  console.log('\n4️⃣ MODEL SELECTION LOGIC:');
  
  // Simulate what your ModelService does
  function simulateModelSelection(complexity) {
    const primaryModel = env.PRIMARY_MODEL || 'gpt-4o';
    const primaryProvider = env.PRIMARY_PROVIDER || 'openai';
    const fallbackModel = env.FALLBACK_MODEL || 'gpt-4o-mini';
    const fallbackProvider = env.FALLBACK_PROVIDER || 'openai';
    
    console.log(`   For complexity: ${complexity}`);
    
    if (complexity === 'LOW') {
      console.log(`   ➡️ Would use: ${fallbackModel} (${fallbackProvider})`);
      return { model: fallbackModel, provider: fallbackProvider };
    } else {
      console.log(`   ➡️ Would use: ${primaryModel} (${primaryProvider})`);
      return { model: primaryModel, provider: primaryProvider };
    }
  }
  
  simulateModelSelection('LOW');
  simulateModelSelection('HIGH');
  simulateModelSelection('CRITICAL');
  
  console.log('\n🎯 TEST SUMMARY:');
  console.log('================');
  
  if (env.PRIMARY_PROVIDER === 'gemini') {
    console.log('✅ PRIMARY AI: Gemini');
    console.log('   Model will be used for HIGH/CRITICAL tasks');
  } else if (env.FALLBACK_PROVIDER === 'gemini') {
    console.log('✅ FALLBACK AI: Gemini');
    console.log('   Model will be used for LOW complexity tasks');
  } else {
    console.log('⚠️ Gemini NOT configured as primary or fallback');
    console.log('   Current setup will use OpenAI only');
  }
  
  console.log('\n💡 To use Gemini for all tasks:');
  console.log('   export PRIMARY_MODEL=gemini-2.5-flash');
  console.log('   export PRIMARY_PROVIDER=gemini');
  console.log('   Then restart your server');
}

testAIConfig().catch(console.error);
