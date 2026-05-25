export type SdkLanguage = "nodejs" | "python" | "curl" | "go"

export const SDK_TABS: { id: SdkLanguage; label: string }[] = [
  { id: "nodejs", label: "Node.js" },
  { id: "python", label: "Python" },
  { id: "curl", label: "cURL" },
  { id: "go", label: "Go" },
]

export const SDK_CODE_SAMPLES: Record<SdkLanguage, string> = {
  curl: `curl -X POST https://api.gemrails.com/v1/payments/initiate \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "currency": "NGN",
    "cryptoNetwork": "TRC20",
    "cryptoAsset": "USDT"
  }'`,

  nodejs: `import { GemRails } from "@gemrails/sdk";

const gemrails = new GemRails({ apiKey: process.env.GEMRAILS_SECRET_KEY });

const payment = await gemrails.payments.initiate({
  amount: 25000,
  currency: "NGN",
  cryptoNetwork: "TRC20",
  cryptoAsset: "USDT",
});

console.log(payment.walletAddress);`,

  python: `from gemrails import GemRails

client = GemRails(api_key="sk_live_...")

payment = client.payments.initiate(
    amount=25000,
    currency="NGN",
    crypto_network="TRC20",
    crypto_asset="USDT",
)

print(payment["wallet_address"])`,

  go: `package main

import (
  "fmt"
  "github.com/gemrails/gemrails-go"
)

func main() {
  client := gemrails.NewClient("sk_live_...")
  payment, err := client.Payments.Initiate(gemrails.InitiatePaymentParams{
    Amount:        25000,
    Currency:      "NGN",
    CryptoNetwork: "TRC20",
    CryptoAsset:   "USDT",
  })
  if err != nil {
    panic(err)
  }
  fmt.Println(payment.WalletAddress)
}`,
}

export const MOCK_API_RESPONSE = {
  success: true,
  data: {
    transactionId: "TXN_8f2a9c1b4e7d",
    status: "awaiting_crypto",
    walletAddress: "TXkH7n9pQw2mR4sL8vB3cF6dE1aY5uJ9",
    amount: 25000,
    currency: "NGN",
    nairaAmount: 25000,
    cryptoAsset: "USDT",
    cryptoNetwork: "TRC20",
    rate: 1650.42,
    expiresAt: "2026-05-21T18:45:00.000Z",
    merchantBonusNgn: 50,
  },
}
