async function testSecureFlow() {
    try {
        console.log('1. Registering an admin...');
        let res = await fetch('http://localhost:3000/auth/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Secure',
                email: 'secure@example.com',
                username: 'testsecure',
                password: 'password123'
            })
        });
        console.log('Register Response:', await res.json());

        console.log('\n2. Requesting Password Reset (Check Email)...');
        res = await fetch('http://localhost:3000/auth/admin/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'secure@example.com' })
        });
        const checkResult = await res.json();
        console.log('Check Email Result:', checkResult);
        
        const otp = checkResult.dev_otp;
        console.log('\nExtracted OTP from response:', otp);

        console.log('\n3. Verifying the OTP...');
        res = await fetch('http://localhost:3000/auth/admin/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'secure@example.com', otp: otp })
        });
        console.log('Verify OTP Response:', await res.json());

        console.log('\n4. Attempting to Reset Password...');
        res = await fetch('http://localhost:3000/auth/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'secure@example.com', 
                otp: otp,
                newPassword: 'newsecurepassword'
            })
        });
        console.log('Reset Password Response:', await res.json());

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

testSecureFlow();
