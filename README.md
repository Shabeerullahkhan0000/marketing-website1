# Marketing website + Stripe (Payment Links)

This is a static marketing site. Payments are handled via **Stripe Payment Links** (no backend required).

## Files

- `index.html`: main website (pricing buttons link to Stripe)
- `success.html`: shown after successful checkout (set as Stripe “success URL”)
- `cancel.html`: shown if checkout is cancelled (set as Stripe “cancel URL”)
- `styles.css`, `main.js`: styling + small UI scripts

## Set up Stripe pricing (recommended: Payment Links)

1. In the Stripe Dashboard, create 3 **Products** (Starter, Growth, Partner).
2. For each product, create a **Recurring price** (monthly) that matches your pricing.
3. Create a **Payment Link** for each price.
4. In each Payment Link settings, set:
   - **After payment → Redirect** to your deployed site’s `success.html`
   - **Cancel URL** to your deployed site’s `cancel.html`

Example (after you deploy to a domain):

- Success URL: `https://yourdomain.com/success.html`
- Cancel URL: `https://yourdomain.com/cancel.html`

5. Copy each Payment Link URL (it looks like `https://buy.stripe.com/...`) and paste it into `index.html`:

- Replace `https://buy.stripe.com/REPLACE_STARTER`
- Replace `https://buy.stripe.com/REPLACE_GROWTH`
- Replace `https://buy.stripe.com/REPLACE_PARTNER`

## Run locally

You can open `index.html` directly in a browser.

Note: Stripe redirects work best after you deploy (because the redirect URLs should be real HTTPS URLs).

