// Test script to debug profile API calls
// Run this in browser console to test the API directly

console.log('🧪 TESTING PROFILE API DIRECTLY');

const API_BASE = 'http://localhost:8000/api'; // Adjust if needed

// Test 1: Get current profile
async function testGetProfile() {
    try {
        console.log('📥 Testing GET /profile');
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust token retrieval
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log('📥 GET Profile Response:', response.status, data);

        if (data.data) {
            console.log('📞 Current phone from API:', data.data.phone);
        }

        return data;
    } catch (error) {
        console.error('❌ GET Profile Error:', error);
    }
}

// Test 2: Update profile
async function testUpdateProfile(phoneNumber) {
    try {
        console.log('📤 Testing PUT /profile with phone:', phoneNumber);

        const formData = new FormData();
        formData.append('name', 'Test User');
        formData.append('phone', phoneNumber);
        formData.append('location', 'Test City');

        const response = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust token retrieval
            },
            body: formData
        });

        const data = await response.json();
        console.log('📤 PUT Profile Response:', response.status, data);

        if (data.data) {
            console.log('📞 Updated phone from API:', data.data.phone);
        }

        return data;
    } catch (error) {
        console.error('❌ PUT Profile Error:', error);
    }
}

// Test 3: Complete flow
async function runCompleteTest() {
    console.log('🚀 ========== COMPLETE PROFILE TEST ==========');

    // Get initial profile
    console.log('1️⃣ Getting initial profile...');
    const initialProfile = await testGetProfile();

    // Update profile
    console.log('2️⃣ Updating profile...');
    const updatedProfile = await testUpdateProfile('+1234567890');

    // Get profile again to verify
    console.log('3️⃣ Verifying update...');
    const finalProfile = await testGetProfile();

    console.log('🎯 TEST COMPLETE');
    console.log('Initial phone:', initialProfile?.data?.phone);
    console.log('Updated phone:', updatedProfile?.data?.phone);
    console.log('Final phone:', finalProfile?.data?.phone);
}

// Make functions available globally
window.testGetProfile = testGetProfile;
window.testUpdateProfile = testUpdateProfile;
window.runCompleteTest = runCompleteTest;

console.log('✅ Test functions loaded!');
console.log('💡 Run these commands in console:');
console.log('   testGetProfile() - Test getting profile');
console.log('   testUpdateProfile("+1234567890") - Test updating profile');
console.log('   runCompleteTest() - Run complete test flow');