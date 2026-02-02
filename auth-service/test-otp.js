// test-otp.js - Test the OTP service locally
const otpService = require('./src/utils/otpService');

console.log('🧪 Testing Stateless OTP Service\n');

// Test 1: Generate OTP
console.log('1️⃣ Generating OTP for test@uiu.ac.bd...');
const testEmail = 'test@uiu.ac.bd';
const { otp, hash } = otpService.generateOtp(testEmail);
console.log('   OTP:', otp);
console.log('   Hash:', hash);
console.log('   ✅ OTP generated successfully\n');

// Test 2: Verify correct OTP (should pass)
console.log('2️⃣ Verifying CORRECT OTP...');
const isValid = otpService.verifyOtp(testEmail, otp, hash);
console.log('   Result:', isValid ? '✅ VALID' : '❌ INVALID');
console.log('   Expected: VALID\n');

// Test 3: Verify wrong OTP (should fail)
console.log('3️⃣ Verifying WRONG OTP...');
const isInvalid = otpService.verifyOtp(testEmail, '999999', hash);
console.log('   Result:', isInvalid ? '✅ VALID' : '❌ INVALID');
console.log('   Expected: INVALID\n');

// Test 4: Verify expired OTP (simulate)
console.log('4️⃣ Testing EXPIRED OTP...');
const expiredHash = 'somehash.1000000000000'; // Old timestamp
const isExpired = otpService.verifyOtp(testEmail, otp, expiredHash);
console.log('   Result:', isExpired ? '✅ VALID' : '❌ INVALID (Expired)');
console.log('   Expected: INVALID (Expired)\n');

// Test 5: Verify tampered hash (should fail)
console.log('5️⃣ Testing TAMPERED hash...');
const tamperedHash = hash.replace('a', 'b'); // Change one character
const isTampered = otpService.verifyOtp(testEmail, otp, tamperedHash);
console.log('   Result:', isTampered ? '✅ VALID' : '❌ INVALID (Tampered)');
console.log('   Expected: INVALID (Tampered)\n');

console.log('🎉 All tests completed!');
