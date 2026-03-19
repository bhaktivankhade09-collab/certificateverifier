// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertChain {
    struct Certificate {
        bytes32 hash;
        string studentName;
        string courseName;
        string instituteName;
        uint256 issueDate;
        uint256 expiryDate;
        address issuedBy;
        bool revoked;
        uint256 verifyCount;
    }

    mapping(bytes32 => Certificate) private certificates;
    mapping(address => bytes32[]) private issuerCerts;
    bytes32[] private allCertIds;

    event CertificateIssued(bytes32 indexed certId, string studentName, string courseName, address issuedBy);
    event CertificateRevoked(bytes32 indexed certId, address revokedBy);
    event CertificateVerified(bytes32 indexed certId);

    modifier onlyIssuer(bytes32 certId) {
        require(certificates[certId].issuedBy == msg.sender, "Not the issuer");
        _;
    }

    function issueCertificate(
        bytes32 _hash,
        string memory _studentName,
        string memory _courseName,
        string memory _instituteName,
        uint256 _expiryDate
    ) external returns (bytes32) {
        bytes32 certId = keccak256(abi.encodePacked(_hash, msg.sender, block.timestamp));
        require(certificates[certId].issueDate == 0, "Certificate already exists");

        certificates[certId] = Certificate({
            hash: _hash,
            studentName: _studentName,
            courseName: _courseName,
            instituteName: _instituteName,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            issuedBy: msg.sender,
            revoked: false,
            verifyCount: 0
        });

        issuerCerts[msg.sender].push(certId);
        allCertIds.push(certId);

        emit CertificateIssued(certId, _studentName, _courseName, msg.sender);
        return certId;
    }

    function verifyCertificate(bytes32 _hash) external returns (bool, bytes32, Certificate memory) {
        for (uint i = 0; i < allCertIds.length; i++) {
            bytes32 id = allCertIds[i];
            if (certificates[id].hash == _hash) {
                certificates[id].verifyCount++;
                emit CertificateVerified(id);
                return (true, id, certificates[id]);
            }
        }
        Certificate memory empty;
        return (false, bytes32(0), empty);
    }

    function verifyCertById(bytes32 _certId) external returns (bool, Certificate memory) {
        Certificate storage cert = certificates[_certId];
        if (cert.issueDate == 0) return (false, cert);
        cert.verifyCount++;
        emit CertificateVerified(_certId);
        return (true, cert);
    }

    function revokeCertificate(bytes32 _certId) external onlyIssuer(_certId) {
        require(!certificates[_certId].revoked, "Already revoked");
        certificates[_certId].revoked = true;
        emit CertificateRevoked(_certId, msg.sender);
    }

    function getIssuerCertificates(address _issuer) external view returns (bytes32[] memory) {
        return issuerCerts[_issuer];
    }

    function getCertificateById(bytes32 _certId) external view returns (Certificate memory) {
        return certificates[_certId];
    }

    function getTotalCertificates() external view returns (uint256) {
        return allCertIds.length;
    }
}
