# 1. Login as Employer
$loginBody = @{
  email = "emptest@example.com"
  password = "Password1!"
  userType = "employer"
} | ConvertTo-Json
$empLogin = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method Post -Body $loginBody -ContentType "application/json"
$empToken = $empLogin.access_token
Write-Host "Employer logged in successfully. Token: $($empToken.Substring(0, 10))..."

# 2. Employer posts a job
$jobBody = @{
  title = "Senior Software Engineer — Test Job"
  description = "This is a detailed description of the senior software engineer position. We require 5 years of experience."
  location = "Addis Ababa"
  job_type = "full-time"
  experience_level = "senior"
  salary_min = 1000
  salary_max = 5000
  salary_type = "monthly"
  category = "technology"
  is_remote = $true
  application_deadline = (Get-Date).AddDays(10).ToString("yyyy-MM-dd")
} | ConvertTo-Json

$headers = @{
  Authorization = "Bearer $empToken"
}
$jobResult = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/jobs" -Method Post -Body $jobBody -ContentType "application/json" -Headers $headers
$jobId = $jobResult.data.id
Write-Host "Job posted successfully. Job ID: $jobId, Status: $($jobResult.data.status)"

# 3. Login as Admin
$adminLoginBody = @{
  email = "admin@jobportal.com"
  password = "Admin123!"
  userType = "admin"
} | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminLogin.access_token
Write-Host "Admin logged in successfully. Token: $($adminToken.Substring(0, 10))..."

# 4. Admin approves the job
$adminHeaders = @{
  Authorization = "Bearer $adminToken"
}
$approveResult = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/jobs/$jobId/approve" -Method Put -Headers $adminHeaders
Write-Host "Job approved by Admin. New Status: $($approveResult.data.status)"

# 5. Login as Job Seeker
$jsLoginBody = @{
  email = "jstest@example.com"
  password = "Password1!"
  userType = "jobseeker"
} | ConvertTo-Json
$jsLogin = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/login" -Method Post -Body $jsLoginBody -ContentType "application/json"
$jsToken = $jsLogin.access_token
Write-Host "Job Seeker logged in successfully. Token: $($jsToken.Substring(0, 10))..."

# 6. Job Seeker applies for the job
$appBody = @{
  job_id = $jobId
  cover_letter = "This is a cover letter expressing my strong interest in the Senior Software Engineer position. I have the necessary skills and look forward to hearing from you."
  additional_skills = "PHP, Laravel, MySQL, JavaScript, React"
} | ConvertTo-Json

$jsHeaders = @{
  Authorization = "Bearer $jsToken"
}
$appResult = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/applications" -Method Post -Body $appBody -ContentType "application/json" -Headers $jsHeaders
$appId = $appResult.data.id
Write-Host "Job Seeker applied successfully. Application ID: $appId, Status: $($appResult.data.status)"

# 7. Employer updates application status
$statusBody = @{
  status = "accepted"
} | ConvertTo-Json
$statusResult = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/applications/$appId/status" -Method Put -Body $statusBody -ContentType "application/json" -Headers $headers
Write-Host "Employer updated application status. New Status: $($statusResult.data.status)"
