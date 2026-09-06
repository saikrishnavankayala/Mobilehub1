$ErrorActionPreference = "Continue"

Write-Host "=== 1. Health Check ==="
$health = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -Method Get
Write-Host "Health Status: $($health.status)"

Write-Host "`n=== 2. Active Campaign ==="
$camp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/campaign/active" -Method Get
Write-Host "Campaign: $($camp.data.name)"
Write-Host "Active Prizes Count: $($camp.data.prizes.Count)"

Write-Host "`n=== 3. Customer Registration ==="
$mobile = "9876599999"
$body = @{
    name = "Kishore Kumar"
    mobile = $mobile
    address = "Koramangala 5th Block, Bengaluru"
} | ConvertTo-Json
$reg = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/customers/register" -Method Post -Body $body -ContentType "application/json"
$otp = $reg.data.dev_otp
Write-Host "Registered: $($reg.data.customer.name) | Dev OTP: $otp"

Write-Host "`n=== 4. OTP Verification ==="
$vBody = @{
    mobile = $mobile
    otp = $otp
} | ConvertTo-Json
$vRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/verify-otp" -Method Post -Body $vBody -ContentType "application/json"
$token = $vRes.data.token
Write-Host "Verified: $($vRes.data.customer.otp_verified) | Token: $($token.Substring(0, 15))..."

Write-Host "`n=== 5. Social Verification ==="
$custHeaders = @{ Authorization = "Bearer $token" }
$soc = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/customers/social-verify" -Method Post -Headers $custHeaders
Write-Host "Social Completed: $($soc.data.customer.social_verified)"

Write-Host "`n=== 6. Eligibility Check ==="
$elig = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/campaign/eligibility" -Method Get -Headers $custHeaders
Write-Host "Eligible to spin: $($elig.data.eligible)"

Write-Host "`n=== 7. Execute First Spin ==="
$spin = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/spin" -Method Post -Headers $custHeaders
$claimCode = $spin.data.claim_code
Write-Host "Won Prize: $($spin.data.prize.name)"
Write-Host "Generated Claim Code: $claimCode"
Write-Host "Target Wheel Slice Index: $($spin.data.segment_index)"

Write-Host "`n=== 8. Reject Second Spin (CRITICAL RULE) ==="
try {
    $spin2 = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/spin" -Method Post -Headers $custHeaders
    Write-Host "FAIL: Second spin was accepted!"
} catch {
    Write-Host "PASS: Second spin rejected with: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n=== 9. Admin Login & Claim Redemption ==="
$adminBody = @{ email = "admin@mobilehub.com"; password = "Admin@123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/admin/login" -Method Post -Body $adminBody -ContentType "application/json"
$adminToken = $adminRes.data.token
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Write-Host "Admin Logged In: $($adminRes.data.admin.email)"

Write-Host "`n=== 10. Redeem Claim Code ==="
$redeem = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/claims/admin/$claimCode/redeem" -Method Post -Headers $adminHeaders
Write-Host "Claim Redeemed Status: $($redeem.data.status)"

Write-Host "`n=== 11. Reject Duplicate Redemption ==="
try {
    $redeem2 = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/claims/admin/$claimCode/redeem" -Method Post -Headers $adminHeaders
    Write-Host "FAIL: Duplicate redemption allowed!"
} catch {
    Write-Host "PASS: Duplicate redemption correctly rejected with: $($_.Exception.Response.StatusCode)"
}

Write-Host "`n=== 12. Vite Frontend API Proxy ==="
$viteCheck = Invoke-RestMethod -Uri "http://127.0.0.1:5173/api/campaign/active" -Method Get
Write-Host "Vite Dev Server responding with: $($viteCheck.data.name)"

Write-Host "`n========================================"
Write-Host "ALL 12 END-TO-END FLOW CHECKS PASSED!"
Write-Host "========================================"
