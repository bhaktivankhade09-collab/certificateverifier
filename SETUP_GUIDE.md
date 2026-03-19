# CertChain — Complete Setup Guide
## Blockchain Certificate Verifier | Hackathon Edition

---

## WHAT YOU'RE BUILDING

A full-stack blockchain application where:
- **Colleges/Institutes** issue tamper-proof certificates on Ethereum
- **Employers/Anyone** can verify certificates by uploading the file
- **No database, no server** — blockchain is the storage

---

## FOLDER STRUCTURE (after setup)

```
certchain/
├── src/
│   ├── contracts/
│   │   ├── CertChain.sol        ← Smart contract (deploy this)
│   │   └── config.js            ← Paste your contract address here
│   ├── hooks/
│   │   └── useBlockchain.js     ← Wallet + contract logic
│   ├── App.jsx                  ← Full UI with dark/light theme
│   └── main.jsx                 ← Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## STEP 1 — Install Prerequisites

### 1.1 Install Node.js
- Go to: https://nodejs.org
- Download and install **LTS version** (v18 or higher)
- Verify: open terminal and type `node --version`

### 1.2 Install MetaMask
- Go to: https://metamask.io
- Add the browser extension (Chrome/Firefox/Brave)
- Create a new wallet (save your seed phrase safely!)

### 1.3 Get Sepolia Test ETH (FREE)
- Open MetaMask → click network dropdown → Add Network
- Search for **Sepolia** and enable it
- Go to: https://sepoliafaucet.com
- Paste your MetaMask wallet address → get free test ETH
- Wait ~1 minute for it to arrive

---

## STEP 2 — Deploy the Smart Contract

### 2.1 Open Remix IDE
- Go to: https://remix.ethereum.org
- No installation needed — runs in browser!

### 2.2 Create the contract file
- In the left sidebar, click the **Files** icon
- Click **"+"** to create new file → name it `CertChain.sol`
- Copy the entire content from `src/contracts/CertChain.sol`
- Paste it into Remix

### 2.3 Compile the contract
- Click the **Solidity Compiler** icon (second icon in left sidebar)
- Select compiler version: **0.8.19**
- Click **"Compile CertChain.sol"**
- You should see a green checkmark ✅

### 2.4 Deploy to Sepolia
- Click the **Deploy & Run** icon (third icon in left sidebar)
- Under "Environment", select **"Injected Provider - MetaMask"**
- MetaMask will pop up — click **Connect** and select your account
- Make sure MetaMask is on **Sepolia** network
- Click the orange **"Deploy"** button
- MetaMask will ask to confirm — click **Confirm**
- Wait ~15 seconds for the transaction to complete

### 2.5 Copy your Contract Address
- After deployment, look at the bottom of Remix
- You'll see **"Deployed Contracts"** section
- Copy the address next to your contract (looks like: `0xAbC123...`)
- **SAVE THIS ADDRESS — you'll need it in Step 4!**

---

## STEP 3 — Set Up the React Project

### 3.1 Open your terminal

**Windows:** Press `Win + R`, type `cmd`, press Enter
**Mac:** Press `Cmd + Space`, type `Terminal`, press Enter

### 3.2 Navigate to the project folder
```bash
# If you downloaded the project to Desktop:
cd Desktop/certchain

# Or wherever you saved it:
cd path/to/certchain
```

### 3.3 Install dependencies
```bash
npm install
```
This downloads all required packages (ethers.js, React, etc.)
Wait ~1-2 minutes for it to complete.

---

## STEP 4 — Connect Your Contract

### 4.1 Open `src/contracts/config.js` in any text editor

Find this line:
```js
export const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
```

Replace `YOUR_CONTRACT_ADDRESS_HERE` with your actual contract address from Step 2.5:
```js
export const CONTRACT_ADDRESS = "0xYourActualAddressHere";
```

**Save the file.**

---

## STEP 5 — Run the App

### 5.1 Start the development server
```bash
npm run dev
```

### 5.2 Open in browser
- You'll see: `Local: http://localhost:5173`
- Open that URL in your browser
- The CertChain app should load with a beautiful dark UI!

---

## STEP 6 — Test the Full Flow

### Test 1: Issue a Certificate
1. Click **"Connect Wallet"** in the navbar
2. MetaMask pops up → click Confirm
3. Make sure you're on **Sepolia** network
4. Go to **"Issue Certificate"** tab
5. Upload any PDF or image file
6. Fill in: Student Name, Course, Institution, Expiry Date
7. Click **"Issue Certificate on Blockchain"**
8. MetaMask confirmation popup → click **Confirm**
9. Wait ~15 seconds → you'll see a success message with Certificate ID + QR code!

### Test 2: Verify a Certificate
1. Go to **"Verify Certificate"** tab
2. Upload the **same file** you just issued
3. Click **"Verify Certificate"**
4. You should see a ✅ green "Certificate Verified" result
5. Try with a different file → you'll see ❌ "Not Found"

### Test 3: Revoke a Certificate
1. Go to **"My Certificates"** tab
2. You'll see all certificates you've issued
3. Click **"Revoke"** on any certificate
4. Confirm in MetaMask
5. Status changes to "REVOKED"
6. If you verify this certificate now, it shows as revoked

---

## STEP 7 — For the Hackathon Demo

### Prepare your pitch with these points:

**Problem:** India loses crores annually to fake degrees and certificates.
CBSE marksheets, college degrees, professional certifications are all forgeable.

**Solution:** CertChain — once a certificate hash is on the blockchain, it's
permanent and tamper-proof. Even we (the creators) cannot alter or delete it.

**How it works (3 sentences):**
1. College uploads the certificate file → we generate a fingerprint (hash) → store it on Ethereum
2. Employer uploads the same file → we generate the same fingerprint → check blockchain
3. Match = Real ✅ | No match = Fake ❌

**Why blockchain over a database:**
- Nobody controls it — not us, not the government, not hackers
- 0% downtime — Ethereum has never gone down
- Transparent — anyone can audit it

**Demo flow (2 minutes):**
1. Show issuing a certificate (15 seconds)
2. Show verifying the same file → green result (10 seconds)
3. Show verifying a different file → red result (10 seconds)
4. Show QR code scan on mobile → verify page opens (10 seconds)
5. Show revoking a certificate (10 seconds)

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| MetaMask not found | Install MetaMask extension |
| Wrong network | Switch MetaMask to Sepolia testnet |
| Transaction failed | Make sure you have Sepolia ETH from the faucet |
| Contract not connected | Double-check the address in config.js |
| npm not found | Install Node.js from nodejs.org |
| Port already in use | Change port: `npm run dev -- --port 3001` |

---

## QUICK REFERENCE

| Tool | URL |
|------|-----|
| Remix IDE | https://remix.ethereum.org |
| MetaMask | https://metamask.io |
| Sepolia Faucet | https://sepoliafaucet.com |
| Sepolia Explorer | https://sepolia.etherscan.io |

---

## YOU'RE DONE! 🎉

Your blockchain certificate verifier is live with:
- ✅ Smart contract on Sepolia testnet
- ✅ Issue certificates with metadata + expiry
- ✅ Verify by file upload
- ✅ QR code for every certificate
- ✅ Revocation system
- ✅ My Certificates dashboard
- ✅ Dark + Light theme
- ✅ Mobile responsive
