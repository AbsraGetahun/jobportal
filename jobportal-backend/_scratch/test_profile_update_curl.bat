@echo off
echo Testing Profile Update with curl
echo ================================
echo.

echo Run this curl command to update the profile:
echo.
echo curl -X PUT "http://127.0.0.1:8000/api/profile" ^
  -H "Authorization: Bearer 119^|gBNBLcbWruHQmZFgXE2KxHA33seGwdBzctdk70Anf8ddc1c1" ^
  -H "Content-Type: application/json" ^
  -d "{^"name^": ^"Henoke Adroxs androws^", ^"phone^": ^"+251977586823^", ^"degree^": ^"Bachelor^", ^"fieldOfStudy^": ^"Computer Science^", ^"experience^": 8, ^"age^": 36, ^"gender^": ^"female^", ^"address^": ^"bahirDar^", ^"website^": ^"https://www.example.com^", ^"location^": ^"b.d^"}"
echo.

echo For form-data (multipart) request with profile picture, use this format:
echo.
echo curl -X PUT "http://127.0.0.1:8000/api/profile" ^
  -H "Authorization: Bearer 119^|gBNBLcbWruHQmZFgXE2KxHA33seGwdBzctdk70Anf8ddc1c1" ^
  -F "name=Henoke Adroxs androws" ^
  -F "phone=+251977586823" ^
  -F "degree=Bachelor" ^
  -F "fieldOfStudy=Computer Science" ^
  -F "experience=8" ^
  -F "age=36" ^
  -F "gender=female" ^
  -F "address=bahirDar" ^
  -F "website=https://www.example.com" ^
  -F "location=b.d" ^
  -F "profile_picture=@C:\path\to\your\profile.jpg"
echo.

echo To test with a real token, first get a valid token by logging in:
echo.
echo curl -X POST "http://127.0.0.1:8000/api/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\", \"password\": \"password\"}"
echo.

pause