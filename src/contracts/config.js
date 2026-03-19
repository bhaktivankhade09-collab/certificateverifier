// After deploying via Remix IDE, paste your contract address here
export const CONTRACT_ADDRESS = "0xc42a71dB9c33a66CaF41c6f1F77ECf2AEc7aA55d";

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "_hash", "type": "bytes32" },
      { "internalType": "string", "name": "_studentName", "type": "string" },
      { "internalType": "string", "name": "_courseName", "type": "string" },
      { "internalType": "string", "name": "_instituteName", "type": "string" },
      { "internalType": "uint256", "name": "_expiryDate", "type": "uint256" }
    ],
    "name": "issueCertificate",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_hash", "type": "bytes32" }],
    "name": "verifyCertificate",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      { "internalType": "bytes32", "name": "", "type": "bytes32" },
      {
        "components": [
          { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
          { "internalType": "string", "name": "studentName", "type": "string" },
          { "internalType": "string", "name": "courseName", "type": "string" },
          { "internalType": "string", "name": "instituteName", "type": "string" },
          { "internalType": "uint256", "name": "issueDate", "type": "uint256" },
          { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
          { "internalType": "address", "name": "issuedBy", "type": "address" },
          { "internalType": "bool", "name": "revoked", "type": "bool" },
          { "internalType": "uint256", "name": "verifyCount", "type": "uint256" }
        ],
        "internalType": "struct CertChain.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_certId", "type": "bytes32" }],
    "name": "verifyCertById",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" },
      {
        "components": [
          { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
          { "internalType": "string", "name": "studentName", "type": "string" },
          { "internalType": "string", "name": "courseName", "type": "string" },
          { "internalType": "string", "name": "instituteName", "type": "string" },
          { "internalType": "uint256", "name": "issueDate", "type": "uint256" },
          { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
          { "internalType": "address", "name": "issuedBy", "type": "address" },
          { "internalType": "bool", "name": "revoked", "type": "bool" },
          { "internalType": "uint256", "name": "verifyCount", "type": "uint256" }
        ],
        "internalType": "struct CertChain.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_certId", "type": "bytes32" }],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_issuer", "type": "address" }],
    "name": "getIssuerCertificates",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "_certId", "type": "bytes32" }],
    "name": "getCertificateById",
    "outputs": [
      {
        "components": [
          { "internalType": "bytes32", "name": "hash", "type": "bytes32" },
          { "internalType": "string", "name": "studentName", "type": "string" },
          { "internalType": "string", "name": "courseName", "type": "string" },
          { "internalType": "string", "name": "instituteName", "type": "string" },
          { "internalType": "uint256", "name": "issueDate", "type": "uint256" },
          { "internalType": "uint256", "name": "expiryDate", "type": "uint256" },
          { "internalType": "address", "name": "issuedBy", "type": "address" },
          { "internalType": "bool", "name": "revoked", "type": "bool" },
          { "internalType": "uint256", "name": "verifyCount", "type": "uint256" }
        ],
        "internalType": "struct CertChain.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCertificates",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "certId", "type": "bytes32" },
      { "indexed": false, "internalType": "string", "name": "studentName", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "courseName", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "issuedBy", "type": "address" }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "certId", "type": "bytes32" },
      { "indexed": false, "internalType": "address", "name": "revokedBy", "type": "address" }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  }
];
