# StacksPay - Decentralized Payroll System
## Complete Project Specification

---

## 🎯 PROJECT OVERVIEW

**What:** A blockchain-based payroll management system where companies pay employees in STX with full transparency and automation.

**Why:** 
- Traditional payroll is opaque (employees can't verify)
- International payments are expensive (wire fees, exchange rates)
- Crypto workers want crypto payments
- Transparency builds trust

**Target Users:**
1. **Companies** - DAOs, crypto startups, remote teams
2. **Employees** - Crypto workers, international contractors
3. **Freelancers** - Project-based payments

---

## 🏗️ CORE FEATURES

### Phase 1: Basic Payroll (MVP - 2 weeks)

1. **Create Company**
   - Company name, description
   - Owner/admin wallet
   - Pay frequency (weekly, bi-weekly, monthly)
   - Pay day (which day of cycle)

2. **Add Employees**
   - Employee wallet address
   - Employee name/ID
   - Salary amount (in microSTX)
   - Start date
   - Role/department (optional)

3. **Fund Payroll**
   - Company deposits STX into contract
   - Covers upcoming pay period
   - Shows balance vs required amount

4. **Automatic Pay Cycles**
   - Starts on first pay day
   - Tracks current pay period
   - Shows next pay date

5. **Claim Salary**
   - Employees claim their salary
   - Can only claim once per period
   - Automatic transfer from contract

### Phase 2: Advanced Features (2-3 weeks)

6. **Partial Payments**
   - Employees can request advances (50% max)
   - Deducted from next paycheck
   - Requires company approval

7. **Bonuses**
   - Company can add one-time bonuses
   - Separate from regular salary
   - Tracked separately in history

8. **Payment History**
   - Complete payment log per employee
   - Shows: date, amount, type, status
   - Export as CSV

9. **Multi-Currency** (Optional)
   - Pay in different tokens (not just STX)
   - Conversion rates
   - Employee chooses preferred token

### Phase 3: Pro Features (3-4 weeks)

10. **Automatic Deductions**
    - Taxes (if applicable)
    - Benefits
    - Retirement contributions
    - All configurable per employee

11. **Recurring Contractors**
    - Not full employees
    - Project-based payments
    - Milestone-based releases

12. **Escrow for Milestones**
    - Lock funds for project
    - Release on milestone completion
    - Both parties must approve

---

## 📊 DATA STRUCTURES

### Named Constants

> All magic numeric enums used in data maps and function parameters are defined as named constants for clarity and maintainability.

```clarity
;; ── Pay Frequency ──
(define-constant PAY-FREQ-WEEKLY    u1)
(define-constant PAY-FREQ-BI-WEEKLY u2)
(define-constant PAY-FREQ-MONTHLY   u3)

;; Approximate block counts for each frequency (assuming ~12 min/block,
;; i.e. 120 blocks/day — the observed mainnet average).
;; WARNING: These are block-based approximations and will NOT match
;; calendar durations on mainnet. Actual block times vary; the on-chain
;; logic uses raw block counts, not wall-clock durations.
(define-constant BLOCKS-PER-WEEK      u840)    ;; 7 * 120
(define-constant BLOCKS-PER-BI-WEEK   u1680)   ;; 14 * 120
(define-constant BLOCKS-PER-MONTH     u3600)   ;; 30 * 120

;; ── Payment Types ──
(define-constant PAYMENT-TYPE-SALARY  u1)
(define-constant PAYMENT-TYPE-BONUS   u2)
(define-constant PAYMENT-TYPE-ADVANCE u3)

;; ── Company Status ──
(define-constant STATUS-ACTIVE u1)
(define-constant STATUS-PAUSED u2)

;; ── Claim Window ──
;; Number of blocks after period-start during which employees can claim
(define-constant CLAIM-WINDOW-BLOCKS u288)  ;; ~2 days

;; ── Emergency Pause State ──
(define-data-var contract-paused bool false)
(define-data-var pause-reason (string-utf8 100) u"")
(define-data-var recovery-unlock-block uint u0)
```

### Companies Map

```clarity
(define-map companies
  { company_id: (string-utf8 50) }
  {
    owner: principal,
    name: (string-utf8 100),
    description: (optional (string-utf8 256)),
    pay_frequency: uint,          ;; PAY-FREQ-WEEKLY | PAY-FREQ-BI-WEEKLY | PAY-FREQ-MONTHLY
    pay_period_blocks: uint,      ;; Blocks per pay period (derived from pay_frequency)
    claim_window_blocks: uint,    ;; Blocks after period-start during which claims are open
    employees_count: uint,
    current_period: uint,
    period_start_block: uint,
    total_balance: uint,          ;; STX held in contract
    status: uint,                 ;; STATUS-ACTIVE | STATUS-PAUSED
    created_at: uint
  }
)
```

### Employees Map
```clarity
(define-map employees
  { 
    company_id: (string-utf8 50),
    employee_address: principal
  }
  {
    employee_name: (string-utf8 100),
    salary_per_period: uint,  ;; microSTX
    department: (optional (string-utf8 50)),
    role: (optional (string-utf8 50)),
    start_date: uint,  ;; Block height
    is_active: bool,
    total_earned: uint,  ;; Lifetime earnings
    joined_at: uint
  }
)
```

### Payments Map
```clarity
(define-map payments
  {
    company_id: (string-utf8 50),
    employee_address: principal,
    period: uint
  }
  {
    amount: uint,
    payment_type: uint,  ;; PAYMENT-TYPE-SALARY | PAYMENT-TYPE-BONUS | PAYMENT-TYPE-ADVANCE
    paid_at_block: uint,
    is_paid: bool,
    notes: (optional (string-utf8 100))
  }
)
```

### Advance Requests Map
```clarity
(define-map advance-requests
  {
    company_id: (string-utf8 50),
    employee_address: principal
  }
  {
    amount: uint,
    requested_at_block: uint,
    expires_at_block: uint,       ;; request auto-expires after this block
    status: uint                  ;; 1=pending, 2=approved, 3=rejected, 4=expired
  }
)
```

---

## 🔧 CORE FUNCTIONS

### 1. Company Management

```clarity
(define-public (create-company
  (company_id (string-utf8 50))
  (name (string-utf8 100))
  (description (optional (string-utf8 256)))
  (pay_frequency uint)  ;; PAY-FREQ-WEEKLY | PAY-FREQ-BI-WEEKLY | PAY-FREQ-MONTHLY
)
  ;; Validates pay_frequency is one of the named constants
  ;; Derives pay_period_blocks from frequency constant
  ;; Sets claim_window_blocks = CLAIM-WINDOW-BLOCKS
  ;; Owner = tx-sender
  ;; Status = STATUS-ACTIVE
  ;; Asserts: (not (var-get contract-paused))
)

(define-public (fund-payroll
  (company_id (string-utf8 50))
  (amount uint)
)
  ;; VALIDATION:
  ;;   1. assert (not (var-get contract-paused))  → ERR-CONTRACT-PAUSED
  ;;   2. assert msg-sender == company.owner      → ERR-UNAUTHORIZED
  ;;   3. assert company.status == STATUS-ACTIVE   → ERR-COMPANY-PAUSED
  ;;   4. assert amount >= MIN_AMOUNT (e.g. u1000) → ERR-AMOUNT-TOO-LOW
  ;;   5. assert amount <= MAX_AMOUNT (u10_000_000_000_000 i.e. 10T microSTX / 10,000,000 STX) → ERR-AMOUNT-TOO-HIGH
  ;;
  ;; EXECUTION:
  ;;   6. (stx-transfer? amount tx-sender (as-contract tx-sender))
  ;;      → on failure: return ERR-TRANSFER-FAILED (NO state mutation)
  ;;   7. Update total_balance only AFTER transfer succeeds
  ;;
  ;; EVENT:
  ;;   8. (print { event: "funding-deposited", company_id, amount, sender: tx-sender, new_total })
  ;;
  ;; Returns (ok new_total_balance)
)

(define-public (withdraw-excess
  (company_id (string-utf8 50))
  (amount uint)
)
  ;; VALIDATION:
  ;;   1. assert (not (var-get contract-paused))    → ERR-CONTRACT-PAUSED
  ;;   2. assert msg-sender == company.owner        → ERR-UNAUTHORIZED
  ;;   3. Compute required_next_period = sum(active employee salaries)
  ;;   4. Apply safety buffer:  required_with_buffer = required * 110 / 100
  ;;   5. Compute available = company.total_balance - required_with_buffer
  ;;   6. assert amount <= available                → ERR-INSUFFICIENT-EXCESS
  ;;   7. assert no pending/unclaimed payments exist → ERR-PENDING-PAYMENTS
  ;;   8. Perform stx-transfer? and update total_balance only on success
  ;;
  ;; Returns (ok amount)
)
```

### 2. Employee Management

```clarity
(define-public (add-employee
  (company_id (string-utf8 50))
  (employee_address principal)
  (employee_name (string-utf8 100))
  (salary_per_period uint)
  (department (optional (string-utf8 50)))
  (role (optional (string-utf8 50)))
)
  ;; Only owner can call
  ;; Adds employee to company
  ;; Sets their salary
)

(define-public (update-salary
  (company_id (string-utf8 50))
  (employee_address principal)
  (new_salary uint)
)
  ;; Only owner can call
  ;; Updates salary for NEXT period
  ;; Current period unchanged
)

(define-public (remove-employee
  (company_id (string-utf8 50))
  (employee_address principal)
)
  ;; Only owner can call
  ;; Sets is_active = false
  ;; Can still claim past unpaid salaries
)
```

### 3. Payment Functions

```clarity
(define-public (claim-salary
  (company_id (string-utf8 50))
)
  ;; Employee claims current period salary
  ;; Can only claim once per period
  ;; Must be active employee
  ;; Transfers STX from contract to employee
)

(define-public (add-bonus
  (company_id (string-utf8 50))
  (employee_address principal)
  (bonus_amount uint)
  (notes (optional (string-utf8 100)))
)
  ;; Only owner can call
  ;; Adds one-time bonus
  ;; Employee can claim immediately
)

(define-public (request-advance
  (company_id (string-utf8 50))
  (amount uint)
)
  ;; VALIDATION:
  ;;   1. assert (not (var-get contract-paused))   → ERR-CONTRACT-PAUSED
  ;;   2. assert caller is an active employee      → ERR-UNAUTHORIZED
  ;;   3. assert amount <= (salary_per_period / 2)  → ERR-EXCEEDS-ADVANCE-LIMIT
  ;;   4. assert NO existing pending request for
  ;;      this employee (map-get? advance-requests) → ERR-ADVANCE-ALREADY-PENDING
  ;;
  ;; EXECUTION:
  ;;   5. Store advance-request with:
  ;;      - amount
  ;;      - requested_at_block = block-height
  ;;      - expires_at_block   = block-height + u1000
  ;;      - status             = u1 (pending)
  ;;
  ;; Returns (ok true)
)

(define-public (cancel-pending-advance
  (company_id (string-utf8 50))
)
  ;; VALIDATION: caller must be the employee who requested
  ;; EXECUTION: delete from advance-requests map
  ;; Returns (ok true)
)

(define-public (approve-advance
  (company_id (string-utf8 50))
  (employee_address principal)
)
  ;; VALIDATION:
  ;;   1. assert (not (var-get contract-paused))              → ERR-CONTRACT-PAUSED
  ;;   2. assert msg-sender == company.owner                  → ERR-UNAUTHORIZED
  ;;   3. Load pending request from advance-requests map      → ERR-NO-PENDING-ADVANCE
  ;;   4. assert request.expires_at_block > block-height       → ERR-ADVANCE-EXPIRED
  ;;   5. Re-verify employee is still active                   → ERR-EMPLOYEE-INACTIVE
  ;;   6. Re-validate amount <= (current salary / 2)           → ERR-EXCEEDS-ADVANCE-LIMIT
  ;;   7. assert company.total_balance >= request.amount        → ERR-INSUFFICIENT-FUNDS
  ;;
  ;; EXECUTION:
  ;;   8. (stx-transfer? amount (as-contract tx-sender) employee_address)
  ;;   9. Update advance-requests status = u2 (approved)
  ;;  10. Deduct from *next* period's salary claim (current-advance-debt += amount)
  ;;
  ;; Returns (ok amount)
)
```

### 4. Period Management

```clarity
(define-public (advance-period
  (company_id (string-utf8 50))
)
  ;; VALIDATION:
  ;;   1. assert (not (var-get contract-paused))  → ERR-CONTRACT-PAUSED
  ;;   2. Only owner can call
  ;;   3. Current block must be past current period end
  ;;
  ;; CIRCUIT BREAKER (threshold is configurable, default 80%):
  ;;   If > 80% of total_balance was claimed in the current period, auto-pause contract
  ;;   and set pause-reason = "anomalous-claims"
  ;;
  ;; EXECUTION:
  ;;   Moves to next pay period
  ;;   Sets period_start_block = block-height
  ;;   Increments current_period
  ;;   Expires any pending advance requests past their expiry
)

(define-read-only (get-current-period
  (company_id (string-utf8 50))
)
  ;; Returns current period info:
  ;;   - period_number
  ;;   - start_block = company.period_start_block
  ;;   - end_block   = period_start_block + pay_period_blocks
  ;;   - blocks_remaining = end_block - block-height  (or 0 if past)
)

(define-read-only (is-payday
  (company_id (string-utf8 50))
)
  ;; BLOCK-RANGE based (not calendar-day):
  ;; A "payday" is when block-height falls within the claim window
  ;; of the current period:
  ;;
  ;;   period_start = company.period_start_block
  ;;   window_start = period_start
  ;;   window_end   = window_start + claim_window_blocks
  ;;
  ;;   is_payday = (block-height >= window_start) AND (block-height <= window_end)
  ;;
  ;; NOTE: "monthly" semantics are approximate (±blocks variance)
  ;; since block times vary. The claim window provides tolerance.
  ;;
  ;; Returns bool
)
```

### 5. Emergency Pause & Recovery

```clarity
(define-public (emergency-pause (reason (string-utf8 100)))
  ;; GUARD: tx-sender == contract-owner
  ;; Sets (var-set contract-paused true)
  ;; Sets (var-set pause-reason reason)
  ;; Sets recovery-unlock-block = block-height + u4320 (~30 days)
  ;; All fund/withdraw/payment/advance/period functions check this flag.
)

(define-public (emergency-unpause)
  ;; GUARD: tx-sender == contract-owner
  ;; Sets (var-set contract-paused false)
  ;; Clears pause-reason
)

(define-public (recovery-withdraw (amount uint))
  ;; GUARD: tx-sender == contract-owner
  ;; GUARD: (var-get contract-paused) == true           — contract MUST be paused
  ;; GUARD: block-height >= recovery-unlock-block        — time-locked
  ;; Allows owner to withdraw funds for migration after unpause delay.
  ;; Should only be used in critical contract migration scenarios.
)
```

> **Pause threading:** Every public function that mutates state
> (`fund-payroll`, `withdraw-excess`, `claim-salary`, `add-bonus`,
> `approve-advance`, `request-advance`, `advance-period`)
> must include `(asserts! (not (var-get contract-paused)) ERR-CONTRACT-PAUSED)`
> as its first assertion.

---

## 🎨 UI REQUIREMENTS

### Page 1: Company Dashboard

```
╔════════════════════════════════════════════════════════╗
║  StacksPay - Acme Corp                                 ║
║  ────────────────────                                  ║
║                                                        ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐║
║  │ Balance  │  │ Employees│  │ Next Pay │  │ Status │║
║  │ 50K STX  │  │    25    │  │  3 days  │  │ Active │║
║  └──────────┘  └──────────┘  └──────────┘  └────────┘║
║                                                        ║
║  ⚠️ Balance Low! Need 52K STX for next period         ║
║  [Fund Payroll]                                        ║
║                                                        ║
║  [All Employees] [Active] [Pending Claims]            ║
║                                                        ║
║  Employee List:                                        ║
║  ┌──────────────────────────────────────────┐         ║
║  │ Alice Johnson    Engineering   2000 STX  │         ║
║  │ Bob Smith        Marketing     1500 STX  │         ║
║  │ Carol Davis      Design        1800 STX  │         ║
║  └──────────────────────────────────────────┘         ║
╚════════════════════════════════════════════════════════╝
```

### Page 2: Employee View

```
╔════════════════════════════════════════════════════════╗
║  Your Payroll - Alice Johnson                          ║
║  ────────────────────────────                          ║
║                                                        ║
║  Current Period: Dec 1-31, 2024                        ║
║  Your Salary: 2,000 STX/month                          ║
║                                                        ║
║  [✓] Claimed  or  [Claim Salary] [Request Advance]    ║
║                                                        ║
║  Payment History:                                      ║
║  ┌──────────────────────────────────────────┐         ║
║  │ Dec 2024     2,000 STX    Salary    Paid │         ║
║  │ Nov 2024     2,000 STX    Salary    Paid │         ║
║  │ Nov 2024       500 STX    Bonus     Paid │         ║
║  │ Oct 2024     2,000 STX    Salary    Paid │         ║
║  └──────────────────────────────────────────┘         ║
║                                                        ║
║  Total Earned: 24,500 STX                              ║
╚════════════════════════════════════════════════════════╝
```

### Page 3: Add Employee Modal

```
╔════════════════════════════════════════╗
║  Add Employee                          ║
║  ────────────                          ║
║                                        ║
║  Employee Wallet Address *             ║
║  [ST1ABC...XYZ                     ]   ║
║                                        ║
║  Employee Name *                       ║
║  [Alice Johnson                    ]   ║
║                                        ║
║  Monthly Salary (STX) *                ║
║  [2000                             ]   ║
║                                        ║
║  Department                            ║
║  [Engineering        ▼]                ║
║                                        ║
║  Role                                  ║
║  [Senior Developer                 ]   ║
║                                        ║
║  ┌────────────────────────────────┐   ║
║  │ Summary:                       │   ║
║  │ Salary: 2000 STX/month         │   ║
║  │ Annual: 24,000 STX             │   ║
║  │ Start: Next pay period         │   ║
║  └────────────────────────────────┘   ║
║                                        ║
║  [Cancel]  [Add Employee]              ║
╚════════════════════════════════════════╝
```

---

## 🎯 LEARNING OBJECTIVES

Your friend will learn:

1. **Clarity Programming**
   - Map structures
   - Principal addresses
   - STX transfers
   - Access control
   - Time/block calculations

2. **Smart Contract Patterns**
   - Authorization (owner-only functions)
   - State management (periods, claims)
   - Fund custody (holding & distributing STX)
   - Event tracking (payment history)

3. **Frontend Integration**
   - Wallet connection (Stacks Connect)
   - Contract interactions (read/write)
   - Post-conditions (for safety)
   - Real-time updates

4. **Product Thinking**
   - User flows (company vs employee)
   - Edge cases (what if no funds?)
   - Security (who can do what?)
   - UX (make it easy!)

---

## 🚀 IMPLEMENTATION ROADMAP

### Week 1: Core Contract
- [ ] Set up project structure
- [ ] Define data maps
- [ ] Create company function
- [ ] Add employee function
- [ ] Basic claim-salary function
- [ ] Test on Clarinet

### Week 2: Payment Logic
- [ ] Fund payroll function
- [ ] Period management
- [ ] Payment tracking
- [ ] Bonus system
- [ ] Deploy to testnet

### Week 3: Frontend Basics
- [ ] Landing page
- [ ] Company dashboard
- [ ] Employee dashboard
- [ ] Add employee flow
- [ ] Claim salary flow

### Week 4: Polish
- [ ] Payment history
- [ ] Advance requests
- [ ] Better period handling
- [ ] Error handling
- [ ] Documentation

### Week 5+: Advanced (Optional)
- [ ] Multi-currency
- [ ] Contractor payments
- [ ] Escrow system
- [ ] Export features
- [ ] Analytics

---

## 🎓 DIFFICULTY COMPARISON

| Feature | Your ROSCA Project | StacksPay Project | Similarity |
|---------|-------------------|-------------------|------------|
| **Groups/Companies** | Create groups | Create companies | ✅ Very similar |
| **Members/Employees** | Add members | Add employees | ✅ Very similar |
| **Deposits** | Members deposit monthly | Company deposits | ✅ Similar |
| **Payouts** | Rotating payouts | Salary claims | ✅ Similar |
| **Time Management** | Cycles | Pay periods | ✅ Similar |
| **Access Control** | Creator privileges | Owner privileges | ✅ Same |
| **Complexity** | Medium | Medium | ✅ Equal |

**Verdict:** Perfect companion project! Same difficulty, different domain.

---

## 💡 UNIQUE CHALLENGES

Things that are DIFFERENT from your ROSCA:

1. **Balance Management**
   - Your project: Pool accumulates
   - StacksPay: Balance depletes
   - Challenge: Ensure sufficient funds

2. **Payment Patterns**
   - Your project: One person gets lump sum
   - StacksPay: Everyone gets paid same day
   - Challenge: Batch processing

3. **Time Calculations**
   - Your project: Simple cycles
   - StacksPay: Calendar-aware (1st of month, etc.)
   - Challenge: Block → Date mapping

4. **User Types**
   - Your project: Members are equal
   - StacksPay: Owner vs Employees (different permissions)
   - Challenge: Role-based access

---

## 🔥 BONUS IDEAS

Make it unique:

1. **Salary Streaming**
   - Instead of monthly lump sum
   - Employees can claim any time (proportional)
   - Unlocks gradually per block

2. **DAO Integration**
   - Multi-sig for large companies
   - Vote on salary changes
   - Transparent governance

3. **Invoice System**
   - Contractors submit invoices
   - Company approves
   - Auto-payment on approval

4. **Recurring Bills**
   - Employees can set up auto-deductions
   - Rent, subscriptions, etc.
   - Paid automatically from salary

5. **Savings Integration**
   - Auto-transfer % to your ROSCA groups!
   - Payroll → Savings pipeline
   - **COLLABORATION OPPORTUNITY!**

---

## 📦 DELIVERABLES

What your friend should produce:

1. **Smart Contract**
   - `stackspay.clar` (main contract)
   - Comprehensive tests
   - Documentation

2. **Frontend**
   - Company dashboard
   - Employee dashboard
   - Admin panel
   - Mobile-responsive

3. **Documentation**
   - README with setup
   - Contract function reference
   - User guide
   - Deployment guide

4. **Demo**
   - Live testnet deployment
   - Demo video
   - Example company with fake employees

---

## 🎯 SUCCESS CRITERIA

Project is "complete" when:

> These checkboxes should be checked off during implementation.

- [ ] Company can create payroll
- [ ] Company can add 10+ employees
- [ ] Company can fund payroll
- [ ] Employees can claim salary
- [ ] Payment history is visible
- [ ] Works on testnet
- [ ] UI is clean & functional
- [ ] No critical bugs
- [ ] Emergency pause/recovery tested
- [ ] Block-range payday logic verified

---

## 🤝 COLLABORATION OPPORTUNITY

**YOUR ROSCA + THEIR STACKSPAY = SUPER APP!**

```
Employee gets paid via StacksPay
  ↓
Auto-joins your ROSCA group
  ↓
Saves 10% automatically
  ↓
Builds emergency fund
  ↓
Financial wellness! 🎉
```

**Potential Integration:**
- Shared wallet connection
- Cross-contract calls
- Unified dashboard
- "Save from Salary" feature

---

## 📚 RESOURCES FOR YOUR FRIEND

**Stacks Docs:**
- https://docs.stacks.co/clarity/
- https://book.clarity-lang.org/

**Similar Projects:**
- Sablier (Ethereum salary streaming)
- Request Network (invoicing)
- Opolis (crypto payroll service)

**Tools:**
- Clarinet (testing)
- Stacks.js (frontend)
- Hiro Wallet (testing)

---

## 🎁 COMPLETE STARTER TEMPLATE

Want me to generate:
- [ ] Complete contract skeleton
- [ ] Test suite template
- [ ] Frontend boilerplate
- [ ] Documentation template
- [ ] Deployment scripts

Just say "Generate StacksPay starter kit" and I'll create everything!

---

**THIS PROJECT WILL TAKE YOUR FRIEND 4-6 WEEKS (SAME AS YOURS)!**

**Perfect difficulty, perfect timing, perfect portfolio piece!** 🎯

---

*Would you like me to generate the complete starter kit for your friend right now?* 🚀
