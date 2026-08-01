/**
 * Debug script for Profile Update functionality
 * Run this in the browser console to test profile update
 */

window.debugProfileUpdate = {
    // Test current profile state
    checkCurrentState: () => {
        console.log('🔍 Current Profile State Debug');
        console.log('================================');

        // This would need to be run in the context of the EmployerAccount component
        console.log('To test profile update:');
        console.log('1. Open browser console');
        console.log('2. Navigate to employer account page');
        console.log('3. Try to edit and save profile');
        console.log('4. Check console logs for:');
        console.log('   - "Sending profile update request with data:"');
        console.log('   - "Profile update response:"');
        console.log('   - "Response data structure:"');
        console.log('   - "Updated profile object:"');
        console.log('   - "Phone field value:"');
        console.log('   - "Profile state updated successfully"');

        console.log('================================');
    },

    // Simulate API response
    simulateResponse: () => {
        const mockResponse = {
            data: {
                data: {
                    name: 'Test User Updated',
                    phone: '+1234567890',
                    email: 'test@example.com',
                    age: 30,
                    location: 'Test City',
                    companyName: 'Test Company'
                }
            }
        };

        console.log('🎭 Simulated API Response:');
        console.log(JSON.stringify(mockResponse, null, 2));

        // Test field mapping
        if (mockResponse.data && mockResponse.data.data) {
            const updatedProfile = mockResponse.data.data;
            const frontendState = {
                firstName: updatedProfile.name ? updatedProfile.name.split(' ')[0] : '',
                phoneNumber: updatedProfile.phone, // This is the key fix
                email: updatedProfile.email,
                age: updatedProfile.age,
                location: updatedProfile.location,
                companyName: updatedProfile.companyName
            };

            console.log('📝 Mapped Frontend State:');
            console.log(JSON.stringify(frontendState, null, 2));

            console.log('✅ Key mapping verified:');
            console.log(`Backend 'phone': ${updatedProfile.phone}`);
            console.log(`Frontend 'phoneNumber': ${frontendState.phoneNumber}`);
        }
    },

    // Check API configuration
    checkAPIConfig: () => {
        console.log('🔧 API Configuration Check');
        console.log('===========================');

        // Check if API is properly configured
        if (typeof window.api !== 'undefined') {
            console.log('✅ API object found');
            if (typeof window.api.updateProfile === 'function') {
                console.log('✅ updateProfile function exists');
            } else {
                console.log('❌ updateProfile function missing');
            }
        } else {
            console.log('❌ API object not found');
        }

        // Check localStorage
        const token = localStorage.getItem('access_token');
        if (token) {
            console.log('✅ Access token found in localStorage');
        } else {
            console.log('❌ No access token found');
        }

        console.log('===========================');
    }
};

console.log('🔧 Profile Update Debug Tools Loaded!');
console.log('Run the following commands in the console:');
console.log('- debugProfileUpdate.checkCurrentState()');
console.log('- debugProfileUpdate.simulateResponse()');
console.log('- debugProfileUpdate.checkAPIConfig()');