export async function getPaymobPaymentKey(
  priceInCents: number, // Paymob expects price in CENTS (e.g. 10.00 OMR = 1000)
  orderData: {
    bookingId: string
    email: string
    firstName: string
    lastName: string
    phone: string
  }
) {
  try {
    // 1. AUTHENTICATION REQUEST (Get Token)
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.NEXT_PUBLIC_PAYMOB_API_KEY })
    })
    const authData = await authResponse.json()
    const token = authData.token

    // 2. ORDER REGISTRATION API (Create Order)
    const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: "false",
        amount_cents: priceInCents,
        currency: "OMR", // Use OMR for Oman
        items: [], // You can list items here if you want
        merchant_order_id: orderData.bookingId // Link it to your Booking ID
      })
    })
    const orderResult = await orderResponse.json()
    const paymobOrderId = orderResult.id

    // 3. PAYMENT KEY REQUEST (Get the Key to show the iFrame)
    const keyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: priceInCents,
        expiration: 3600, // Expires in 1 hour
        order_id: paymobOrderId,
        billing_data: {
          apartment: "NA",
          email: orderData.email,
          floor: "NA",
          first_name: orderData.firstName,
          street: "NA",
          building: "NA",
          phone_number: orderData.phone,
          shipping_method: "NA",
          postal_code: "NA",
          city: "Muscat",
          country: "OM",
          last_name: orderData.lastName,
          state: "Muscat"
        },
        currency: "OMR",
        integration_id: process.env.PAYMOB_INTEGRATION_ID
      })
    })
    
    const keyData = await keyResponse.json()
    return keyData.token // This is the "Payment Key" you need for the iFrame

  } catch (error) {
    console.error('Paymob Error:', error)
    return null
  }
}