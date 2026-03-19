import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/config';
 
export const useWallet = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
 
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Please install MetaMask extension.');
      return;
    }
    setConnecting(true);
    setError(null);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send('eth_requestAccounts', []);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const network = await _provider.getNetwork();
      setProvider(_provider);
      setSigner(_signer);
      setAccount(_account);
      setChainId(Number(network.chainId));
    } catch (e) {
      setError(e.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);
 
  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);
 
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
      else setAccount(accounts[0]);
    };
    const handleChainChanged = (id) => setChainId(parseInt(id, 16));
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);
 
  return { account, provider, signer, chainId, connecting, error, connect, disconnect };
};
 
// Converts a 64-char hex SHA-256 string → proper bytes32 for Solidity
// MUST be identical in both issueCertificate and verifyCertificate
const toBytes32 = (fileHash) => {
  return "0x" + fileHash.slice(0, 64).padEnd(64, '0');
};
 
export const useContract = (signer, provider) => {
  const getContract = useCallback((signerOrProvider) => {
    if (!signerOrProvider || CONTRACT_ADDRESS === 'YOUR_CONTRACT_ADDRESS_HERE') return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
  }, []);
 
  const issueCertificate = useCallback(async ({ fileHash, studentName, courseName, instituteName, expiryDate }) => {
    const contract = getContract(signer);
    if (!contract) throw new Error('Contract not connected');
    const hashBytes32 = toBytes32(fileHash);
    const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
    const tx = await contract.issueCertificate(hashBytes32, studentName, courseName, instituteName, expiryTimestamp);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => {
      try { return contract.interface.parseLog(l)?.name === 'CertificateIssued'; } catch { return false; }
    });
    const parsed = event ? contract.interface.parseLog(event) : null;
    return { txHash: tx.hash, certId: parsed?.args?.certId || null, receipt };
  }, [signer, getContract]);
 
  const verifyCertificate = useCallback(async (fileHash) => {
    const contract = getContract(signer || provider);
    if (!contract) throw new Error('Contract not connected');
    const hashBytes32 = toBytes32(fileHash);
    const result = await contract.verifyCertificate.staticCall(hashBytes32);
    return { found: result[0], certId: result[1], cert: result[2] };
  }, [signer, provider, getContract]);
 
  const verifyCertById = useCallback(async (certId) => {
    const contract = getContract(signer || provider);
    if (!contract) throw new Error('Contract not connected');
    const result = await contract.verifyCertById(certId);
    return { found: result[0], cert: result[1] };
  }, [signer, provider, getContract]);
 
  const revokeCertificate = useCallback(async (certId) => {
    const contract = getContract(signer);
    if (!contract) throw new Error('Contract not connected');
    const tx = await contract.revokeCertificate(certId);
    await tx.wait();
    return tx.hash;
  }, [signer, getContract]);
 
  const getIssuerCertificates = useCallback(async (address) => {
    const contract = getContract(provider || signer);
    if (!contract) return [];
    const ids = await contract.getIssuerCertificates(address);
    const certs = await Promise.all(ids.map(async (id) => {
      const c = await contract.getCertificateById(id);
      return { id, ...c };
    }));
    return certs;
  }, [signer, provider, getContract]);
 
  return { issueCertificate, verifyCertificate, verifyCertById, revokeCertificate, getIssuerCertificates };
};
 
export const hashFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};