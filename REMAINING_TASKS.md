# Remaining Tasks - Vitalis Production Readiness

## ✅ COMPLETED (Already Done)
- [x] Fix email service import paths
- [x] Add bed assignment race condition prevention
- [x] Implement quiet hours enforcement
- [x] Fix alert severity for boolean fields
- [x] Setup test infrastructure (Jest + 27 tests passing)
- [x] Add missing database indexes (SharedLink)
- [x] Template CRUD endpoints (verified existing)
- [x] Dashboard routes (verified registered)
- [x] Pagination limits (verified existing)

---

## 🔴 PRIORITY 1 - Critical (Next 2 Hours)

### Backend Critical
- [ ] **Add JWT secret validation on startup** (5 min)
- [ ] **Adjust rate limiting** (500→200 req/15min) (5 min)
- [ ] **Add Settings auto-initialization** (10 min)
- [ ] **Add timezone normalization middleware** (15 min)
- [ ] **Create more integration tests** (30 min)
  - [ ] Patient CRUD tests
  - [ ] Vitals entry + alert generation tests

### Frontend Critical  
- [ ] **Setup React Testing Library** (15 min)
- [ ] **Create component tests** (45 min)
  - [ ] Login form validation
  - [ ] Patient list rendering
  - [ ] Dashboard stats display
  - [ ] Alert badges

---

## 🟡 PRIORITY 2 - High (Day 2)

### Backend
- [ ] **Add PDF export endpoint** (1 hour)
- [ ] **Standardize error responses** (1 hour)
- [ ] **Add reminder integration tests** (30 min)
- [ ] **Add share link tests** (30 min)

### Frontend
- [ ] **Add E2E test setup** (1 hour)
- [ ] **Create user journey tests** (2 hours)
  - [ ] Login → Add Patient → Record Vitals → View Alert

---

## 🟢 PRIORITY 3 - Medium (Week 2)

### Backend
- [ ] **Add performance tests** (2 hours)
- [ ] **Load testing with 500+ patients** (2 hours)
- [ ] **Add audit log tests** (1 hour)

### Frontend
- [ ] **Accessibility testing** (2 hours)
- [ ] **Mobile responsiveness tests** (2 hours)
- [ ] **Cross-browser testing** (2 hours)

---

## 📊 Current Status
- **Backend Tests:** 27/27 passing ✅
- **Frontend Tests:** 0 (not setup yet) ❌
- **Test Coverage:** ~15% (goal: 70%+)
- **Integration Tests:** 3 suites
- **E2E Tests:** 0

---

## 🎯 Session Goals (Next 2 Hours)

### Must Complete:
1. JWT secret validation
2. Rate limiting adjustment
3. Settings initialization
4. Frontend test setup
5. Basic component tests (3-5 tests)
6. Patient CRUD integration tests

### Should Complete:
7. Vitals + Alert integration tests
8. Timezone middleware
9. PDF export endpoint

### Nice to Have:
10. Error response standardization
11. More frontend tests
