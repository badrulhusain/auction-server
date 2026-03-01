# Testing Forgot Password Endpoints

Here is how you can test the new admin forgot password flow using Postman (or cURL).

## Prerequisites
Ensure your backend server is running (`npm run start:dev` or `npm run start`). The default base URL assumed below is `http://localhost:3000` but replace it with your hosted URL (`https://auction-api-5chh.onrender.com`) if you are testing the live server.

---

## 1. Check Admin Email

This endpoint validates whether an admin account exists for the given email address.

**Endpoint:** `POST /auth/admin/check-email`
**Content-Type:** `application/json`

### Request Body (Raw JSON):
```json
{
    "email": "admin@example.com"
}
```

### Expected Responses:

**Success (200 OK):**
```json
{
    "message": "Email valid",
    "email": "admin@example.com"
}
```

**Not Found (404 Not Found):**
```json
{
    "message": "Account not registered",
    "error": "Not Found",
    "statusCode": 404
}
```

---

## 2. Reset Admin Password

This endpoint resets the password for the given admin email. 

**Endpoint:** `POST /auth/admin/reset-password`
**Content-Type:** `application/json`

### Request Body (Raw JSON):
```json
{
    "email": "admin@example.com",
    "newPassword": "newpassword123"
}
```

### Expected Responses:

**Success (200 OK):**
```json
{
    "message": "Password successfully changed"
}
```

**Same as Old Password (400 Bad Request):**
```json
{
    "message": "New password cannot be the same as your old password.",
    "error": "Bad Request",
    "statusCode": 400
}
```

**Not Found (404 Not Found):**
```json
{
    "message": "Account not registered",
    "error": "Not Found",
    "statusCode": 404
}
```

---

## Testing with cURL

If you prefer using your terminal, you can run these commands directly:

**Check Email:**
```bash
curl -X POST http://localhost:3000/auth/admin/check-email \
-H "Content-Type: application/json" \
-d '{"email":"admin@example.com"}'
```

**Reset Password:**
```bash
curl -X POST http://localhost:3000/auth/admin/reset-password \
-H "Content-Type: application/json" \
-d '{"email":"admin@example.com", "newPassword":"newpassword123"}'
```
