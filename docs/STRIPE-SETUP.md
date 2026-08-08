# AKIRA Stripe Setup

**Effective Date**: 2026-08-01  
**Status**: ⏳ In Progress — Awaiting price ID configuration

---

## Stripe Products & Pricing

### Product 1: AKIRA Starter

**Monthly Billing**:
- Amount: €29.00/month
- Billing Interval: Monthly
- Price ID: `price_1TzkX6JJopICFOM06cCOXnwb` ✅

**Annual Billing** (10% discount):
- Amount: €261.00/year
- Billing Interval: Annual
- Price ID: `price_1TzkX6JJopICFOM0jjonzXOG` ✅

---

### Product 2: AKIRA Professional

**Monthly Billing**:
- Amount: €79.00/month
- Billing Interval: Monthly
- Price ID: `price_1TzkZbJJopICFOM0juvmutSx` ✅

**Annual Billing** (10% discount):
- Amount: €711.00/year
- Billing Interval: Annual
- Price ID: `price_1TzkZvJJopICFOM02o4mgOAQ` ✅

---

### Product 3: AKIRA Enterprise

**Monthly Billing** (starting price, custom quotes available):
- Amount: €199.00/month
- Billing Interval: Monthly
- Price ID: `price_1Tzkb5JJopICFOM0oDVME56B` ✅

---

## How to Set Up in Stripe Dashboard

### Step 1: Create Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** (left sidebar)
3. Click **+ Add product**

**For AKIRA Starter**:
- Name: `AKIRA Starter`
- Description: `1 user account, up to 5 clients, CRM + Projects + Invoicing`
- Click **Create product**

**For AKIRA Professional**:
- Name: `AKIRA Professional`
- Description: `3 user accounts, unlimited clients, everything in Starter + Time Tracking + APIs`
- Click **Create product**

**For AKIRA Enterprise**:
- Name: `AKIRA Enterprise`
- Description: `5+ user accounts, unlimited everything, white-label, dedicated support`
- Click **Create product**

---

### Step 2: Add Prices to Each Product

1. Click on **AKIRA Starter** product
2. Scroll to **Pricing** section
3. Click **+ Add pricing**

**Monthly (Starter)**:
- Amount: `29.00`
- Currency: `EUR`
- Billing period: `Monthly`
- Click **Save**
- **Copy the Price ID** → paste in section above

**Annual (Starter)**:
- Amount: `261.00`
- Currency: `EUR`
- Billing period: `Annual`
- Click **Save**
- **Copy the Price ID** → paste in section above

**Repeat for Professional** (€79/month, €711/year) and **Enterprise** (€199/month)

---

### Step 3: Enable Payment Methods

1. Go to **Settings** → **Payment methods**
2. Enable:
   - ✅ Card (Visa, Mastercard, Amex)
   - ✅ SEPA Direct Debit (for EU customers)

---

### Step 4: Configure Billing Portal

1. Go to **Settings** → **Billing portal**
2. Click **Activate Stripe's billing portal**
3. Allow customers to:
   - ✅ Update payment method
   - ✅ Change subscription plan
   - ✅ Download invoices
   - ✅ Cancel subscription

---

## Environment Variables (add to `.env`)

Once you have all price IDs, add to `.env`:

```
VITE_STRIPE_PUBLIC_KEY=pk_live_... (or pk_test_... for testing)

# Starter
VITE_STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_STARTER_ANNUAL_PRICE_ID=price_...

# Professional
VITE_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_...

# Enterprise
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
```

---

## Testing

**Test Card Numbers** (Stripe provides these):
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

---

## Checklist

- [ ] Created AKIRA Starter product
- [ ] Created AKIRA Professional product
- [ ] Created AKIRA Enterprise product
- [ ] Added monthly prices (all 3 products)
- [ ] Added annual prices (Starter + Professional)
- [ ] Copied all price IDs → pasted above
- [ ] Added payment methods (Card + SEPA)
- [ ] Activated billing portal
- [ ] Tested with test card number
- [ ] Added price IDs to `.env` file

---

## References

- [Stripe Products Docs](https://stripe.com/docs/products-prices)
- [Stripe Billing Docs](https://stripe.com/docs/billing)
- [Stripe Test Mode](https://stripe.com/docs/testing)

---

**Next Steps**:
1. ✅ Complete Stripe setup (you're here)
2. Create Google Form for beta signup
3. Deploy landing to Vercel
4. Email invite 5-10 marketing agencies

---

**Status**: ✅ COMPLETE — Price IDs configured

