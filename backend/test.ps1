$response = Invoke-RestMethod -Uri 'http://localhost:5005/api/auth/login' -Method Post -Body (@{username="Ashu";password="Test@123"} | ConvertTo-Json) -ContentType 'application/json'
$token = $response.token
Write-Host "Token: $token"

$payload = @{
    title="Test Issue"
    description="This is a test issue"
    category="Others"
    district="Patna"
    ward="1"
    location="Test Location"
}

$compResponse = Invoke-RestMethod -Uri 'http://localhost:5005/api/complaints/create' -Method Post -Body ($payload | ConvertTo-Json) -ContentType 'application/json' -Headers @{Authorization="Bearer $token"}
Write-Host ($compResponse | ConvertTo-Json)
