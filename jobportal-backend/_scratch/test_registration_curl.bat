@echo off
echo Testing registration with curl...

curl -X POST http://localhost/api/register ^
  -H "Content-Type: application/json" ^
  -d "{
    \"name\": \"Test User\",
    \"username\": \"testuser123\",
    \"email\": \"test123@example.com\",
    \"password\": \"TestPass123!\",
    \"password_confirmation\": \"TestPass123!\",
    \"degree\": \"Computer Science\",
    \"fieldOfStudy\": \"Software Engineering\",
    \"graduationYear\": 2020,
    \"experience\": 5,
    \"hasCompany\": false
  }"

echo.
echo Registration test completed.
pause