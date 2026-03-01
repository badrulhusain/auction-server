$body = @{
    name = 'Test Admin'
    email = 'admin@example.com'
    username = 'testadmin1'
    password = 'password123'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/auth/admin/register' -Method Post -ContentType 'application/json' -Body $body

$checkBody = @{
    email = 'admin@example.com'
} | ConvertTo-Json

$checkResponse = Invoke-RestMethod -Uri 'http://localhost:3000/auth/admin/check-email' -Method Post -ContentType 'application/json' -Body $checkBody
Write-Output $checkResponse

$otp = $checkResponse.dev_otp

$verifyBody = @{
    email = 'admin@example.com'
    otp = $otp
} | ConvertTo-Json

$verifyResponse = Invoke-RestMethod -Uri 'http://localhost:3000/auth/admin/verify-otp' -Method Post -ContentType 'application/json' -Body $verifyBody
Write-Output $verifyResponse

$resetBody = @{
    email = 'admin@example.com'
    otp = $otp
    newPassword = 'newpassword123'
} | ConvertTo-Json

$resetResponse = Invoke-RestMethod -Uri 'http://localhost:3000/auth/admin/reset-password' -Method Post -ContentType 'application/json' -Body $resetBody
Write-Output $resetResponse
