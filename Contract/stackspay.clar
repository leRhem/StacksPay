;; StacksPay - Blockchain Payroll System with Commitment-Based Architecture
;; Inspired by DoOrPay structure: Companies make "commitments" to pay employees each period

;; ============================================================================
;; ERROR CONSTANTS (DoOrPay style)
;; ============================================================================
(define-constant ERR-INVALID-AMOUNT (err u100))
(define-constant ERR-COMPANY-NOT-FOUND (err u101))
(define-constant ERR-UNAUTHORIZED (err u102))
(define-constant ERR-ALREADY-EXISTS (err u103))
(define-constant ERR-EMPLOYEE-NOT-FOUND (err u104))
(define-constant ERR-INVALID-FREQUENCY (err u105))
(define-constant ERR-INVALID-PAY-DAY (err u106))
(define-constant ERR-INSUFFICIENT-BALANCE (err u107))
(define-constant ERR-NOT-PAYDAY (err u108))
(define-constant ERR-ALREADY-CLAIMED (err u109))
(define-constant ERR-EMPLOYEE-INACTIVE (err u110))
(define-constant ERR-CANNOT-ADVANCE-PERIOD (err u111))
(define-constant ERR-INVALID-COMPANY-ID (err u112))
(define-constant ERR-INVALID-NAME (err u113))
(define-constant ERR-PERIOD-NOT-STARTED (err u114))
(define-constant ERR-ADVANCE-EXISTS (err u115))
(define-constant ERR-ADVANCE-NOT-FOUND (err u116))
(define-constant ERR-ADVANCE-TOO-LARGE (err u117))

;; ============================================================================
;; CONSTANTS (Like DoOrPay's platform constants)
;; ============================================================================
(define-constant MIN-PERIOD-BLOCKS u144) ;; ~1 day minimum
(define-constant WEEKLY-BLOCKS u1008) ;; ~7 days
(define-constant BIWEEKLY-BLOCKS u2016) ;; ~14 days
(define-constant MONTHLY-BLOCKS u4320) ;; ~30 days
(define-constant MAX-ADVANCE-PERCENT u50) ;; 50% max advance
(define-constant PERCENT-DENOMINATOR u100)

;; Pay frequency constants
(define-constant FREQ-WEEKLY u1)
(define-constant FREQ-BIWEEKLY u2)
(define-constant FREQ-MONTHLY u3)

;; Status constants (like DoOrPay's status strings)
(define-constant STATUS-ACTIVE "active")
(define-constant STATUS-PAUSED "paused")
(define-constant STATUS-CLAIMED "claimed")
(define-constant STATUS-UNCLAIMED "unclaimed")
(define-constant STATUS-PENDING "pending")
(define-constant STATUS-APPROVED "approved")
(define-constant STATUS-REJECTED "rejected")

;; ============================================================================
;; DATA MAPS (DoOrPay inspired structure)
;; ============================================================================

;; Main "Commitment" = Company's commitment to pay employees
(define-map Companies
  {company-id: (string-utf8 50)}
  {
    owner: principal,
    name: (string-utf8 100),
    description: (optional (string-utf8 256)),
    pay-frequency: uint, ;; 1=weekly, 2=bi-weekly, 3=monthly
    pay-day-of-cycle: uint, ;; Day 1-31 for monthly, 1-7 for weekly
    current-period: uint,
    period-start-block: uint,
    total-balance: uint, ;; STX held in contract (like DoOrPay's stake)
    employees-count: uint,
    active-employees-count: uint,
    status: (string-ascii 20),
    created-at: uint
  }
)

;; Like DoOrPay's user commitments, but for employees
(define-map Employees
  {
    company-id: (string-utf8 50),
    employee-address: principal
  }
  {
    employee-name: (string-utf8 100),
    salary-per-period: uint,
    department: (optional (string-utf8 50)),
    role: (optional (string-utf8 50)),
    start-period: uint, ;; Which period they started
    is-active: bool,
    total-earned: uint,
    total-claimed: uint,
    last-claimed-period: uint, ;; Track last claim (like DoOrPay tracks completion)
    joined-at: uint
  }
)

;; Payment tracking (like DoOrPay's completion/forfeit tracking)
(define-map PeriodClaims
  {
    company-id: (string-utf8 50),
    employee-address: principal,
    period: uint
  }
  {
    amount: uint,
    claimed-at: (optional uint),
    status: (string-ascii 20) ;; "claimed" or "unclaimed"
  }
)

;; Bonus tracking (one-time payments outside regular salary)
(define-map Bonuses
  {
    company-id: (string-utf8 50),
    employee-address: principal,
    bonus-id: uint
  }
  {
    amount: uint,
    notes: (optional (string-utf8 100)),
    created-at: uint,
    claimed-at: (optional uint),
    status: (string-ascii 20)
  }
)

;; Advance requests (like DoOrPay's pending states)
(define-map AdvanceRequests
  {
    company-id: (string-utf8 50),
    employee-address: principal,
    request-id: uint
  }
  {
    amount: uint,
    requested-at: uint,
    approved-at: (optional uint),
    rejected-at: (optional uint),
    status: (string-ascii 20),
    deducted-from-period: (optional uint)
  }
)

;; Company stats (like DoOrPay's user stats)
(define-map CompanyStats
  {company-id: (string-utf8 50)}
  {
    total-periods-completed: uint,
    total-paid-out: uint,
    total-deposited: uint,
    total-bonuses-paid: uint,
    total-advances-given: uint
  }
)

;; Employee stats (like DoOrPay's user stats)
(define-map EmployeeStats
  {
    company-id: (string-utf8 50),
    employee-address: principal
  }
  {
    periods-worked: uint,
    periods-claimed: uint,
    total-salary-earned: uint,
    total-bonuses-earned: uint,
    total-advances-taken: uint,
    current-advance-debt: uint
  }
)

;; ============================================================================
;; DATA VARIABLES (Like DoOrPay's counters)
;; ============================================================================
(define-data-var company-counter uint u0)
(define-data-var bonus-counter uint u0)
(define-data-var advance-counter uint u0)

;; ============================================================================
;; PRIVATE HELPER FUNCTIONS
;; ============================================================================

(define-private (get-period-blocks (frequency uint))
  (if (is-eq frequency FREQ-WEEKLY)
    WEEKLY-BLOCKS
    (if (is-eq frequency FREQ-BIWEEKLY)
      BIWEEKLY-BLOCKS
      MONTHLY-BLOCKS
    )
  )
)

(define-private (is-valid-frequency (freq uint))
  (or (is-eq freq FREQ-WEEKLY)
      (or (is-eq freq FREQ-BIWEEKLY)
          (is-eq freq FREQ-MONTHLY)))
)

(define-private (calculate-required-balance (company-id (string-utf8 50)))
  (let
    (
      (company (unwrap! (map-get? Companies {company-id: company-id}) u0))
      (active-count (get active-employees-count company))
    )
    ;; Sum all active employee salaries
    ;; In real implementation, would iterate through employees
    ;; For now, return 0 as placeholder
    u0
  )
)

;; ============================================================================
;; READ-ONLY FUNCTIONS (DoOrPay style)
;; ============================================================================

(define-read-only (get-company (company-id (string-utf8 50)))
  (map-get? Companies {company-id: company-id})
)

(define-read-only (get-employee (company-id (string-utf8 50)) (employee-address principal))
  (map-get? Employees {company-id: company-id, employee-address: employee-address})
)

(define-read-only (get-company-stats (company-id (string-utf8 50)))
  (default-to
    {
      total-periods-completed: u0,
      total-paid-out: u0,
      total-deposited: u0,
      total-bonuses-paid: u0,
      total-advances-given: u0
    }
    (map-get? CompanyStats {company-id: company-id})
  )
)

(define-read-only (get-employee-stats (company-id (string-utf8 50)) (employee-address principal))
  (default-to
    {
      periods-worked: u0,
      periods-claimed: u0,
      total-salary-earned: u0,
      total-bonuses-earned: u0,
      total-advances-taken: u0,
      current-advance-debt: u0
    }
    (map-get? EmployeeStats {company-id: company-id, employee-address: employee-address})
  )
)

(define-read-only (get-period-claim (company-id (string-utf8 50)) (employee-address principal) (period uint))
  (map-get? PeriodClaims {company-id: company-id, employee-address: employee-address, period: period})
)

(define-read-only (get-current-period (company-id (string-utf8 50)))
  (match (map-get? Companies {company-id: company-id})
    company-data
    (ok {
      period-number: (get current-period company-data),
      period-start-block: (get period-start-block company-data),
      blocks-per-period: (get-period-blocks (get pay-frequency company-data)),
      next-payday: (+ (get period-start-block company-data) (get-period-blocks (get pay-frequency company-data)))
    })
    ERR-COMPANY-NOT-FOUND
  )
)

(define-read-only (is-payday (company-id (string-utf8 50)))
  (match (map-get? Companies {company-id: company-id})
    company-data
    (let
      (
        (period-blocks (get-period-blocks (get pay-frequency company-data)))
        (next-payday (+ (get period-start-block company-data) period-blocks))
      )
      (ok (>= stacks-block-height next-payday))
    )
    ERR-COMPANY-NOT-FOUND
  )
)

(define-read-only (get-company-balance (company-id (string-utf8 50)))
  (match (map-get? Companies {company-id: company-id})
    company-data
    (ok (get total-balance company-data))
    ERR-COMPANY-NOT-FOUND
  )
)

(define-read-only (can-advance-period (company-id (string-utf8 50)))
  (match (map-get? Companies {company-id: company-id})
    company-data
    (let
      (
        (is-payday-now (>= stacks-block-height (+ (get period-start-block company-data) 
                                                   (get-period-blocks (get pay-frequency company-data)))))
        ;; For MVP, assume balance is sufficient (real implementation would calculate)
        (has-sufficient-balance true)
      )
      (ok (and is-payday-now has-sufficient-balance))
    )
    ERR-COMPANY-NOT-FOUND
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - COMPANY MANAGEMENT
;; ============================================================================

(define-public (create-company
    (company-id (string-utf8 50))
    (name (string-utf8 100))
    (description (optional (string-utf8 256)))
    (pay-frequency uint)
    (pay-day uint)
  )
  (begin
    ;; Validate inputs
    (asserts! (> (len company-id) u0) ERR-INVALID-COMPANY-ID)
    (asserts! (> (len name) u0) ERR-INVALID-NAME)
    (asserts! (is-none (map-get? Companies {company-id: company-id})) ERR-ALREADY-EXISTS)
    (asserts! (is-valid-frequency pay-frequency) ERR-INVALID-FREQUENCY)
    (asserts! (and (>= pay-day u1) (<= pay-day u31)) ERR-INVALID-PAY-DAY)

    ;; Create company (like creating a commitment in DoOrPay)
    (map-set Companies
      {company-id: company-id}
      {
        owner: tx-sender,
        name: name,
        description: description,
        pay-frequency: pay-frequency,
        pay-day-of-cycle: pay-day,
        current-period: u0, ;; Period 0 = not started yet
        period-start-block: u0,
        total-balance: u0,
        employees-count: u0,
        active-employees-count: u0,
        status: STATUS-ACTIVE,
        created-at: stacks-block-height
      }
    )

    ;; Initialize stats
    (map-set CompanyStats
      {company-id: company-id}
      {
        total-periods-completed: u0,
        total-paid-out: u0,
        total-deposited: u0,
        total-bonuses-paid: u0,
        total-advances-given: u0
      }
    )

    (ok company-id)
  )
)

(define-public (fund-payroll
    (company-id (string-utf8 50))
    (amount uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (current-stats (get-company-stats company-id))
    )
    ;; Only owner can fund (like only user can stake in DoOrPay)
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)

    ;; Transfer STX to contract (like staking in DoOrPay)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    ;; Update company balance
    (map-set Companies
      {company-id: company-id}
      (merge company-data {total-balance: (+ (get total-balance company-data) amount)})
    )

    ;; Update stats
    (map-set CompanyStats
      {company-id: company-id}
      (merge current-stats {total-deposited: (+ (get total-deposited current-stats) amount)})
    )

    (ok (+ (get total-balance company-data) amount))
  )
)

(define-public (withdraw-excess
    (company-id (string-utf8 50))
    (amount uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (required-balance (calculate-required-balance company-id))
      (available-balance (- (get total-balance company-data) required-balance))
    )
    ;; Only owner can withdraw
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount available-balance) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer STX back to owner (like completing commitment in DoOrPay)
    (try! (as-contract (stx-transfer? amount tx-sender (get owner company-data))))

    ;; Update company balance
    (map-set Companies
      {company-id: company-id}
      (merge company-data {total-balance: (- (get total-balance company-data) amount)})
    )

    (ok (- (get total-balance company-data) amount))
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - EMPLOYEE MANAGEMENT
;; ============================================================================

(define-public (add-employee
    (company-id (string-utf8 50))
    (employee-address principal)
    (employee-name (string-utf8 100))
    (salary-per-period uint)
    (department (optional (string-utf8 50)))
    (role (optional (string-utf8 50)))
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (current-period (get current-period company-data))
    )
    ;; Only owner can add employees
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (> (len employee-name) u0) ERR-INVALID-NAME)
    (asserts! (> salary-per-period u0) ERR-INVALID-AMOUNT)
    (asserts! (is-none (map-get? Employees {company-id: company-id, employee-address: employee-address})) ERR-ALREADY-EXISTS)

    ;; Add employee
    (map-set Employees
      {company-id: company-id, employee-address: employee-address}
      {
        employee-name: employee-name,
        salary-per-period: salary-per-period,
        department: department,
        role: role,
        start-period: current-period,
        is-active: true,
        total-earned: u0,
        total-claimed: u0,
        last-claimed-period: u0,
        joined-at: stacks-block-height
      }
    )

    ;; Initialize employee stats
    (map-set EmployeeStats
      {company-id: company-id, employee-address: employee-address}
      {
        periods-worked: u0,
        periods-claimed: u0,
        total-salary-earned: u0,
        total-bonuses-earned: u0,
        total-advances-taken: u0,
        current-advance-debt: u0
      }
    )

    ;; Update company employee count
    (map-set Companies
      {company-id: company-id}
      (merge company-data {
        employees-count: (+ (get employees-count company-data) u1),
        active-employees-count: (+ (get active-employees-count company-data) u1)
      })
    )

    (ok employee-address)
  )
)

(define-public (update-salary
    (company-id (string-utf8 50))
    (employee-address principal)
    (new-salary uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (employee-data (unwrap! (map-get? Employees {company-id: company-id, employee-address: employee-address}) ERR-EMPLOYEE-NOT-FOUND))
    )
    ;; Only owner can update salary
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (> new-salary u0) ERR-INVALID-AMOUNT)

    ;; Update employee salary
    (map-set Employees
      {company-id: company-id, employee-address: employee-address}
      (merge employee-data {salary-per-period: new-salary})
    )

    (ok new-salary)
  )
)

(define-public (remove-employee
    (company-id (string-utf8 50))
    (employee-address principal)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (employee-data (unwrap! (map-get? Employees {company-id: company-id, employee-address: employee-address}) ERR-EMPLOYEE-NOT-FOUND))
    )
    ;; Only owner can remove employees
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (get is-active employee-data) ERR-EMPLOYEE-INACTIVE)

    ;; Mark employee as inactive (they can still claim past periods)
    (map-set Employees
      {company-id: company-id, employee-address: employee-address}
      (merge employee-data {is-active: false})
    )

    ;; Update company active count
    (map-set Companies
      {company-id: company-id}
      (merge company-data {
        active-employees-count: (- (get active-employees-count company-data) u1)
      })
    )

    (ok true)
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - PAYMENT & CLAIMS (DoOrPay inspired)
;; ============================================================================

(define-public (claim-salary
    (company-id (string-utf8 50))
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (employee-data (unwrap! (map-get? Employees {company-id: company-id, employee-address: tx-sender}) ERR-EMPLOYEE-NOT-FOUND))
      (employee-stats (get-employee-stats company-id tx-sender))
      (company-stats (get-company-stats company-id))
      (current-period (get current-period company-data))
      (last-claimed (get last-claimed-period employee-data))
      (start-period (get start-period employee-data))
      (salary (get salary-per-period employee-data))
      (advance-debt (get current-advance-debt employee-stats))
    )
    ;; Must be on payday or after
    (asserts! (>= stacks-block-height (+ (get period-start-block company-data) 
                                         (get-period-blocks (get pay-frequency company-data)))) ERR-NOT-PAYDAY)
    
    ;; Period must have started
    (asserts! (> current-period u0) ERR-PERIOD-NOT-STARTED)
    
    ;; Employee must have started before or during this period
    (asserts! (<= start-period current-period) ERR-PERIOD-NOT-STARTED)

    ;; Calculate total owed (all unclaimed periods from last-claimed to current)
    ;; For simplicity in MVP, claim current period only
    (let
      (
        (claim-exists (map-get? PeriodClaims {company-id: company-id, employee-address: tx-sender, period: current-period}))
        (net-salary (if (> advance-debt u0)
                      (if (>= salary advance-debt)
                        (- salary advance-debt)
                        u0)
                      salary))
      )
      ;; Check if already claimed this period
      (asserts! (is-none claim-exists) ERR-ALREADY-CLAIMED)
      
      ;; Check sufficient balance
      (asserts! (>= (get total-balance company-data) net-salary) ERR-INSUFFICIENT-BALANCE)

      ;; Transfer salary (like completing commitment in DoOrPay)
      (try! (as-contract (stx-transfer? net-salary tx-sender tx-sender)))

      ;; Record claim
      (map-set PeriodClaims
        {company-id: company-id, employee-address: tx-sender, period: current-period}
        {
          amount: salary,
          claimed-at: (some stacks-block-height),
          status: STATUS-CLAIMED
        }
      )

      ;; Update employee data
      (map-set Employees
        {company-id: company-id, employee-address: tx-sender}
        (merge employee-data {
          total-earned: (+ (get total-earned employee-data) salary),
          total-claimed: (+ (get total-claimed employee-data) net-salary),
          last-claimed-period: current-period
        })
      )

      ;; Update employee stats
      (map-set EmployeeStats
        {company-id: company-id, employee-address: tx-sender}
        (merge employee-stats {
          periods-claimed: (+ (get periods-claimed employee-stats) u1),
          total-salary-earned: (+ (get total-salary-earned employee-stats) salary),
          current-advance-debt: u0 ;; Clear debt after deduction
        })
      )

      ;; Update company balance
      (map-set Companies
        {company-id: company-id}
        (merge company-data {total-balance: (- (get total-balance company-data) net-salary)})
      )

      ;; Update company stats
      (map-set CompanyStats
        {company-id: company-id}
        (merge company-stats {total-paid-out: (+ (get total-paid-out company-stats) net-salary)})
      )

      (ok net-salary)
    )
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - PERIOD MANAGEMENT (Commitment advancement)
;; ============================================================================

(define-public (advance-period
    (company-id (string-utf8 50))
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (company-stats (get-company-stats company-id))
      (period-blocks (get-period-blocks (get pay-frequency company-data)))
      (next-payday (+ (get period-start-block company-data) period-blocks))
      (required-balance (calculate-required-balance company-id))
    )
    ;; Only owner can advance period
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    
    ;; Must be payday or after
    (asserts! (>= stacks-block-height next-payday) ERR-NOT-PAYDAY)
    
    ;; Must have sufficient balance (CRITICAL: Cannot advance without funds!)
    (asserts! (>= (get total-balance company-data) required-balance) ERR-CANNOT-ADVANCE-PERIOD)

    ;; Advance to next period (like completing and starting new commitment)
    (let
      (
        (new-period (+ (get current-period company-data) u1))
        (new-start-block stacks-block-height)
      )
      (map-set Companies
        {company-id: company-id}
        (merge company-data {
          current-period: new-period,
          period-start-block: new-start-block
        })
      )

      ;; Update stats
      (map-set CompanyStats
        {company-id: company-id}
        (merge company-stats {total-periods-completed: (+ (get total-periods-completed company-stats) u1)})
      )

      (ok new-period)
    )
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - BONUSES
;; ============================================================================

(define-public (add-bonus
    (company-id (string-utf8 50))
    (employee-address principal)
    (bonus-amount uint)
    (notes (optional (string-utf8 100)))
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (employee-data (unwrap! (map-get? Employees {company-id: company-id, employee-address: employee-address}) ERR-EMPLOYEE-NOT-FOUND))
      (bonus-id (+ (var-get bonus-counter) u1))
    )
    ;; Only owner can add bonuses
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    (asserts! (> bonus-amount u0) ERR-INVALID-AMOUNT)

    ;; Create bonus
    (map-set Bonuses
      {company-id: company-id, employee-address: employee-address, bonus-id: bonus-id}
      {
        amount: bonus-amount,
        notes: notes,
        created-at: stacks-block-height,
        claimed-at: none,
        status: STATUS-UNCLAIMED
      }
    )

    ;; Increment bonus counter
    (var-set bonus-counter bonus-id)

    (ok bonus-id)
  )
)

(define-public (claim-bonus
    (company-id (string-utf8 50))
    (bonus-id uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (bonus-data (unwrap! (map-get? Bonuses {company-id: company-id, employee-address: tx-sender, bonus-id: bonus-id}) ERR-EMPLOYEE-NOT-FOUND))
      (employee-stats (get-employee-stats company-id tx-sender))
      (company-stats (get-company-stats company-id))
      (bonus-amount (get amount bonus-data))
    )
    ;; Must be unclaimed
    (asserts! (is-eq (get status bonus-data) STATUS-UNCLAIMED) ERR-ALREADY-CLAIMED)
    
    ;; Check sufficient balance
    (asserts! (>= (get total-balance company-data) bonus-amount) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer bonus
    (try! (as-contract (stx-transfer? bonus-amount tx-sender tx-sender)))

    ;; Mark as claimed
    (map-set Bonuses
      {company-id: company-id, employee-address: tx-sender, bonus-id: bonus-id}
      (merge bonus-data {
        claimed-at: (some stacks-block-height),
        status: STATUS-CLAIMED
      })
    )

    ;; Update stats
    (map-set EmployeeStats
      {company-id: company-id, employee-address: tx-sender}
      (merge employee-stats {total-bonuses-earned: (+ (get total-bonuses-earned employee-stats) bonus-amount)})
    )

    ;; Update company balance and stats
    (map-set Companies
      {company-id: company-id}
      (merge company-data {total-balance: (- (get total-balance company-data) bonus-amount)})
    )

    (map-set CompanyStats
      {company-id: company-id}
      (merge company-stats {
        total-bonuses-paid: (+ (get total-bonuses-paid company-stats) bonus-amount),
        total-paid-out: (+ (get total-paid-out company-stats) bonus-amount)
      })
    )

    (ok bonus-amount)
  )
)

;; ============================================================================
;; PUBLIC FUNCTIONS - ADVANCES (Like DoOrPay's pending requests)
;; ============================================================================

(define-public (request-advance
    (company-id (string-utf8 50))
    (amount uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (employee-data (unwrap! (map-get? Employees {company-id: company-id, employee-address: tx-sender}) ERR-EMPLOYEE-NOT-FOUND))
      (employee-stats (get-employee-stats company-id tx-sender))
      (advance-id (+ (var-get advance-counter) u1))
      (salary (get salary-per-period employee-data))
      (max-advance (/ (* salary MAX-ADVANCE-PERCENT) PERCENT-DENOMINATOR))
      (current-debt (get current-advance-debt employee-stats))
    )
    ;; Must be active employee
    (asserts! (get is-active employee-data) ERR-EMPLOYEE-INACTIVE)
    
    ;; Amount must be within limit
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount max-advance) ERR-ADVANCE-TOO-LARGE)
    
    ;; Cannot have existing debt
    (asserts! (is-eq current-debt u0) ERR-ADVANCE-EXISTS)

    ;; Create advance request (pending state, like DoOrPay)
    (map-set AdvanceRequests
      {company-id: company-id, employee-address: tx-sender, request-id: advance-id}
      {
        amount: amount,
        requested-at: stacks-block-height,
        approved-at: none,
        rejected-at: none,
        status: STATUS-PENDING,
        deducted-from-period: none
      }
    )

    ;; Increment counter
    (var-set advance-counter advance-id)

    (ok advance-id)
  )
)

(define-public (approve-advance
    (company-id (string-utf8 50))
    (employee-address principal)
    (request-id uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (advance-data (unwrap! (map-get? AdvanceRequests {company-id: company-id, employee-address: employee-address, request-id: request-id}) ERR-ADVANCE-NOT-FOUND))
      (employee-stats (get-employee-stats company-id employee-address))
      (company-stats (get-company-stats company-id))
      (advance-amount (get amount advance-data))
    )
    ;; Only owner can approve
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    
    ;; Must be pending
    (asserts! (is-eq (get status advance-data) STATUS-PENDING) ERR-ALREADY-CLAIMED)
    
    ;; Check sufficient balance
    (asserts! (>= (get total-balance company-data) advance-amount) ERR-INSUFFICIENT-BALANCE)

    ;; Transfer advance immediately
    (try! (as-contract (stx-transfer? advance-amount tx-sender employee-address)))

    ;; Mark as approved
    (map-set AdvanceRequests
      {company-id: company-id, employee-address: employee-address, request-id: request-id}
      (merge advance-data {
        approved-at: (some stacks-block-height),
        status: STATUS-APPROVED,
        deducted-from-period: (some (get current-period company-data))
      })
    )

    ;; Update employee stats - add debt
    (map-set EmployeeStats
      {company-id: company-id, employee-address: employee-address}
      (merge employee-stats {
        total-advances-taken: (+ (get total-advances-taken employee-stats) advance-amount),
        current-advance-debt: advance-amount
      })
    )

    ;; Update company balance and stats
    (map-set Companies
      {company-id: company-id}
      (merge company-data {total-balance: (- (get total-balance company-data) advance-amount)})
    )

    (map-set CompanyStats
      {company-id: company-id}
      (merge company-stats {
        total-advances-given: (+ (get total-advances-given company-stats) advance-amount),
        total-paid-out: (+ (get total-paid-out company-stats) advance-amount)
      })
    )

    (ok advance-amount)
  )
)

(define-public (reject-advance
    (company-id (string-utf8 50))
    (employee-address principal)
    (request-id uint)
  )
  (let
    (
      (company-data (unwrap! (map-get? Companies {company-id: company-id}) ERR-COMPANY-NOT-FOUND))
      (advance-data (unwrap! (map-get? AdvanceRequests {company-id: company-id, employee-address: employee-address, request-id: request-id}) ERR-ADVANCE-NOT-FOUND))
    )
    ;; Only owner can reject
    (asserts! (is-eq tx-sender (get owner company-data)) ERR-UNAUTHORIZED)
    
    ;; Must be pending
    (asserts! (is-eq (get status advance-data) STATUS-PENDING) ERR-ALREADY-CLAIMED)

    ;; Mark as rejected
    (map-set AdvanceRequests
      {company-id: company-id, employee-address: employee-address, request-id: request-id}
      (merge advance-data {
        rejected-at: (some stacks-block-height),
        status: STATUS-REJECTED
      })
    )

    (ok true)
  )
)
