# Duel Race Condition Fix - Test Documentation

## Bug Description
The duel command had a race condition vulnerability where player balances were checked at challenge time but deducted after user interaction (accepting the duel). This could lead to:
1. Negative balances if players spent silver between challenge and acceptance
2. Players stuck in "active duel" state if transactions failed after marking them as active

## Fix Implementation
1. **Re-check balances** immediately before deducting (after duel acceptance)
2. **Deduct bets BEFORE** marking players as active in duels
3. **Add rollback logic** if one transaction succeeds but the other fails
4. **Proper error handling** with user-friendly messages

## Test Scenarios

### Scenario 1: Normal Duel Flow
**Steps:**
1. Player A challenges Player B with 100 silver bet
2. Both players have 200 silver
3. Player B accepts
4. Bets are deducted successfully
5. Duel proceeds normally

**Expected Result:** ✅ Both players have 100 silver deducted, duel starts

### Scenario 2: Challenger Spends Silver Before Acceptance
**Steps:**
1. Player A challenges Player B with 100 silver bet (has 150 silver)
2. Player A uses another command and spends 100 silver (now has 50)
3. Player B accepts the duel
4. System re-checks balances

**Expected Result:** ✅ Duel cancelled with error message, no silver deducted, players not marked as active

### Scenario 3: Opponent Spends Silver Before Acceptance
**Steps:**
1. Player A challenges Player B with 100 silver bet
2. Player B has 150 silver initially
3. Player B uses another command and spends 100 silver (now has 50)
4. Player B tries to accept the duel
5. System re-checks balances

**Expected Result:** ✅ Duel cancelled with error message, no silver deducted, players not marked as active

### Scenario 4: Transaction Fails After One Succeeds
**Steps:**
1. Player A challenges Player B with 100 silver bet
2. Both players have sufficient silver
3. Player B accepts
4. Player A's silver is deducted successfully
5. Player B's deduction fails (e.g., inventory full)

**Expected Result:** ✅ Player A's silver is refunded, duel cancelled, error message shown, players not marked as active

### Scenario 5: Both Transactions Fail
**Steps:**
1. Player A challenges Player B with 100 silver bet
2. Both players accept
3. Both deductions fail

**Expected Result:** ✅ Duel cancelled, error message shown, players not marked as active

## Manual Testing Instructions

### Setup
1. Create two test Discord accounts
2. Give both accounts 500 silver using `/addsilver`
3. Ensure both are in the same server

### Test 1: Basic Functionality
```
/duel @opponent bet:100
- Opponent clicks "Accept Duel"
- Verify both players lose 100 silver
- Verify duel starts
```

### Test 2: Race Condition Prevention
```
Terminal 1: /duel @opponent bet:100
Terminal 2 (as challenger): /give @someone item:silver amount:450
Terminal 1 (as opponent): Click "Accept Duel"
- Verify error message about insufficient funds
- Verify no silver was deducted
- Verify players can start new duels (not stuck)
```

### Test 3: Rollback on Partial Failure
This requires simulating an inventory full condition:
```
1. Fill opponent's inventory to max weight
2. /duel @opponent bet:100
3. Opponent accepts
4. Verify challenger's silver is refunded
5. Verify error message is shown
6. Verify both players can start new duels
```

## Code Changes Summary

### Before (Vulnerable Code)
```typescript
// Check balances early (vulnerable to race condition)
const challengerBalance = getUserSilver(challenger.id);
const opponentBalance = getUserSilver(opponent.id);

// ... user interaction happens here (time passes) ...

// Mark as active BEFORE deducting (wrong order)
activeDuels.set(challenger.id, true);
activeDuels.set(opponent.id, true);

// Deduct without re-checking (race condition)
const challengerRemove = removeUserSilver(challenger.id, bet);
const opponentRemove = removeUserSilver(opponent.id, bet);

// Incomplete error handling
if (!challengerRemove.success || !opponentRemove.success) {
  activeDuels.delete(challenger.id);
  activeDuels.delete(opponent.id);
  // No rollback if one succeeded!
}
```

### After (Fixed Code)
```typescript
// Re-check balances immediately before deduction
const challengerCurrentBalance = getUserSilver(challenger.id);
const opponentCurrentBalance = getUserSilver(opponent.id);

// Validate balances
if (challengerCurrentBalance < bet) {
  // Show error, cancel duel
  return;
}

if (opponentCurrentBalance < bet) {
  // Show error, cancel duel
  return;
}

// Deduct bets BEFORE marking as active
const challengerRemove = removeUserSilver(challenger.id, bet);
const opponentRemove = removeUserSilver(opponent.id, bet);

// Proper rollback on failure
if (!challengerRemove.success || !opponentRemove.success) {
  if (challengerRemove.success) {
    addUserSilver(challenger.id, bet);
  }
  if (opponentRemove.success) {
    addUserSilver(opponent.id, bet);
  }
  // Show error, cancel duel
  return;
}

// Only mark as active after successful transaction
activeDuels.set(challenger.id, true);
activeDuels.set(opponent.id, true);
```

## Impact
- **Security:** Prevents negative balance exploits
- **User Experience:** Players won't get stuck in "active duel" state
- **Data Integrity:** Ensures atomic transactions with proper rollback
- **Reliability:** Handles edge cases gracefully with clear error messages
