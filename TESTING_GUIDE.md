# Event Platform - Concurrency & Capacity Testing Guide

This guide will help you test the critical features: **Capacity Enforcement**, **Concurrency Handling**, and **No Duplicate RSVPs**.

---

## 🧪 What We're Testing

1. **Capacity Enforcement** - Event capacity is never exceeded
2. **Concurrency Handling** - Multiple simultaneous RSVPs don't cause overbooking
3. **No Duplicates** - A user can only RSVP once per event

---

## 📋 Prerequisites

1. Backend running on `http://localhost:5000`
2. At least one event created with **low capacity** (e.g., 5-10 slots)
3. Multiple user accounts OR use the testing script below

---

## Method 1: Using PowerShell Script (Recommended)

### Step 1: Create Test Script

Create a file `test-concurrency.ps1` in your project root:

```powershell
# Configuration
$API_URL = "http://localhost:5000/api"
$EVENT_ID = "YOUR_EVENT_ID_HERE"  # Replace with actual event ID
$TOKEN = "YOUR_JWT_TOKEN_HERE"     # Replace with your JWT token

# Number of concurrent requests to simulate
$CONCURRENT_REQUESTS = 20

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Event RSVP Concurrency Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing with $CONCURRENT_REQUESTS concurrent RSVP requests..." -ForegroundColor Yellow
Write-Host ""

# Get event details before test
Write-Host "Fetching event details..." -ForegroundColor White
try {
    $event = Invoke-RestMethod -Uri "$API_URL/events/$EVENT_ID" -Method GET
    Write-Host "Event: $($event.title)" -ForegroundColor Green
    Write-Host "Capacity: $($event.capacity)" -ForegroundColor Green
    Write-Host "Current Attendees: $($event.attendeesCount)" -ForegroundColor Green
    Write-Host "Available Slots: $($event.capacity - $event.attendeesCount)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error fetching event: $_" -ForegroundColor Red
    exit
}

# Create concurrent RSVP requests
Write-Host "Sending $CONCURRENT_REQUESTS concurrent RSVP requests..." -ForegroundColor Yellow
$jobs = @()

for ($i = 1; $i -le $CONCURRENT_REQUESTS; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $token)
        try {
            $headers = @{
                "Authorization" = "Bearer $token"
                "Content-Type" = "application/json"
            }
            $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -ErrorAction Stop
            return @{ Success = $true; Message = "RSVP Successful" }
        } catch {
            $errorMessage = $_.Exception.Message
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd() | ConvertFrom-Json
                $errorMessage = $responseBody.message
            }
            return @{ Success = $false; Message = $errorMessage }
        }
    } -ArgumentList "$API_URL/events/$EVENT_ID/rsvp", $TOKEN
    
    $jobs += $job
}

# Wait for all jobs to complete
Write-Host "Waiting for responses..." -ForegroundColor Yellow
$jobs | Wait-Job | Out-Null

# Collect results
$results = $jobs | Receive-Job
$jobs | Remove-Job

# Analyze results
$successCount = ($results | Where-Object { $_.Success -eq $true }).Count
$failureCount = ($results | Where-Object { $_.Success -eq $false }).Count
$duplicateErrors = ($results | Where-Object { $_.Message -like "*already RSVP*" }).Count
$fullErrors = ($results | Where-Object { $_.Message -like "*full*" }).Count

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Test Results" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Total Requests: $CONCURRENT_REQUESTS" -ForegroundColor White
Write-Host "Successful RSVPs: $successCount" -ForegroundColor Green
Write-Host "Failed RSVPs: $failureCount" -ForegroundColor Red
Write-Host "  - Duplicate attempts: $duplicateErrors" -ForegroundColor Yellow
Write-Host "  - Event full: $fullErrors" -ForegroundColor Yellow
Write-Host ""

# Verify final state
Write-Host "Verifying final event state..." -ForegroundColor White
Start-Sleep -Seconds 1
try {
    $eventAfter = Invoke-RestMethod -Uri "$API_URL/events/$EVENT_ID" -Method GET
    Write-Host "Final Attendees Count: $($eventAfter.attendeesCount)" -ForegroundColor Green
    Write-Host "Capacity: $($eventAfter.capacity)" -ForegroundColor Green
    Write-Host ""
    
    # Check if capacity was respected
    if ($eventAfter.attendeesCount -le $eventAfter.capacity) {
        Write-Host "✓ PASS: Capacity enforcement working!" -ForegroundColor Green
        Write-Host "  No overbooking detected." -ForegroundColor Green
    } else {
        Write-Host "✗ FAIL: Overbooking occurred!" -ForegroundColor Red
        Write-Host "  Attendees ($($eventAfter.attendeesCount)) exceeds capacity ($($eventAfter.capacity))" -ForegroundColor Red
    }
    
    # Check if duplicate prevention worked
    if ($duplicateErrors -gt 0) {
        Write-Host "✓ PASS: Duplicate RSVP prevention working!" -ForegroundColor Green
        Write-Host "  Detected $duplicateErrors duplicate attempts." -ForegroundColor Green
    }
    
} catch {
    Write-Host "Error fetching final event state: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
```

### Step 2: Get Your Credentials

**Get Event ID:**
1. Go to Events page
2. Right-click on an event card → Inspect
3. Look for `_id` in the HTML or network tab

**Get JWT Token:**
1. Login to your app
2. Open DevTools (F12) → Application tab → Local Storage
3. Copy the `token` value

### Step 3: Run the Test

```powershell
# Edit the script with your values, then run:
.\test-concurrency.ps1
```

---

## Method 2: Using Browser DevTools (Quick Test)

### Step 1: Open Browser Console

1. Go to Events page
2. Press `F12` → Console tab

### Step 2: Run This JavaScript

```javascript
// Configuration
const EVENT_ID = 'YOUR_EVENT_ID_HERE'; // Replace with real event ID
const CONCURRENT_REQUESTS = 15;

// Get token from localStorage
const token = localStorage.getItem('token');

console.log('🚀 Starting concurrency test...');
console.log(`Sending ${CONCURRENT_REQUESTS} concurrent RSVP requests`);

// Create concurrent requests
const promises = [];
for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
  const promise = fetch(`http://localhost:5000/api/events/${EVENT_ID}/rsvp`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => ({ success: true, data }))
  .catch(err => ({ success: false, error: err.message }));
  
  promises.push(promise);
}

// Wait for all requests to complete
Promise.all(promises).then(results => {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('================================');
  console.log('📊 Test Results:');
  console.log(`Total Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('================================');
  
  // Refresh to see updated event
  setTimeout(() => window.location.reload(), 1000);
});
```

---

## Method 3: Manual Testing (Simple)

### Test 1: Capacity Enforcement

1. Create event with capacity of **3**
2. Login with User A → RSVP
3. Login with User B → RSVP
4. Login with User C → RSVP
5. Login with User D → Try RSVP
6. **Expected**: User D should see "Event is full" error
7. **Check**: Event shows 3/3 attendees (not 4/3)

### Test 2: No Duplicates

1. Login as User A
2. RSVP to an event → Should show "Registered" badge
3. Try to RSVP again (shouldn't be possible)
4. **Expected**: Button shows "Registered" with green badge
5. **Check**: Attendees count doesn't increase

### Test 3: Concurrent Load (Multiple Browsers)

1. Create event with capacity of **5**
2. Open 10 different browser windows (or incognito tabs)
3. Create/login 10 different users
4. **Simultaneously** click RSVP in all 10 windows
5. **Expected**: Only 5 RSVPs succeed, 5 fail with "Event is full"
6. **Check**: Final count is exactly 5/5

---

## 📊 What Success Looks Like

✅ **Capacity Never Exceeded**
- If capacity is 10, attendeesCount stays ≤ 10
- No matter how many concurrent requests

✅ **No Duplicate RSVPs**
- Same user can't RSVP twice
- Shows "Registered" badge after RSVP
- Alert/error if trying again

✅ **Race Conditions Handled**
- Multiple simultaneous requests
- Only available slots are filled
- Others get "Event is full" error

✅ **Data Consistency**
- `attendeesCount` always matches `attendees.length`
- No phantom attendees

---

## 🔍 Monitoring Tips

### Check MongoDB (MongoDB Compass)

1. Open MongoDB Compass
2. Connect to your database
3. Browse `events` collection
4. Check event document:
   - `capacity`: Max allowed
   - `attendeesCount`: Current count
   - `attendees`: Array of user IDs
5. Verify: `attendees.length === attendeesCount`

### Check Backend Logs

Watch your backend terminal for:
```
RSVP attempt for event XXX
Event is full
User already RSVP'd
```

---

## 🐛 Common Issues

**Issue**: All requests succeed (overbooking)
**Cause**: Atomic operations not working
**Fix**: Check MongoDB version (should be 4.0+)

**Issue**: Button still shows "RSVP" after registering
**Cause**: Frontend not refreshing
**Fix**: Clear browser cache, check if attendees are populated

**Issue**: Duplicate RSVPs allowed
**Cause**: User ID comparison failing
**Fix**: Check if `user._id` matches `attendee._id`

---

## 📝 Test Checklist

- [ ] Create event with small capacity (5-10)
- [ ] Test single RSVP (should work)
- [ ] Test duplicate RSVP (should fail)
- [ ] Test RSVP when full (should fail)
- [ ] Test concurrent RSVPs (capacity enforced)
- [ ] Verify MongoDB data consistency
- [ ] Check UI shows correct status
- [ ] Test Cancel RSVP (should work)
- [ ] Re-RSVP after cancel (should work)

---

## 🎯 Expected Behavior Summary

| Scenario | Expected Result |
|----------|----------------|
| First RSVP | Success, count +1, button → "Registered" |
| Duplicate RSVP | Fail, "Already RSVP'd" message |
| RSVP when full | Fail, "Event is full" message |
| 20 concurrent to 10-capacity event | 10 succeed, 10 fail with "full" |
| Cancel RSVP | Success, count -1, button → "RSVP Now" |
| RSVP after cancel | Success (allowed) |

---

**Remember**: The atomic operations in MongoDB ensure all these guarantees at the database level, not just in the application code. This is production-grade concurrency handling! 🚀
