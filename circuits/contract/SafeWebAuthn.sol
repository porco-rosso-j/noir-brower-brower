// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './plonk_vk.sol';

contract Enum {
    enum Operation {
        Call,
        DelegateCall
    }
}

interface GnosisSafe {
    /// @dev Allows a Module to execute a Safe transaction without any further confirmations.
    /// @param to Destination address of module transaction.
    /// @param value Ether value of module transaction.
    /// @param data Data payload of module transaction.
    /// @param operation Operation type of module transaction.
    function execTransactionFromModule(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation
    ) external returns (bool success);

    function addOwnerWithThreshold(address owner, uint256 threshold) external;
}

contract SafeWebAuthn {
    error PROOF_VERIFICATION_FAILED();

    GnosisSafe public safe;
    UltraVerifier public verifier;
    bytes32[] public pubkey_x;
    bytes32[] public pubkey_y;

    //TODO make proxyable w/ initializer
    constructor(address _safe, address _verifier, bytes memory pubkey_x, bytes memory pubkey_y) {
        safe = GnosisSafe(_safe);
        verifier = UltraVerifier(_verifier);
        setCoordinates(pubkey_x, pubkey_y);
    }

    function setCoordinates(bytes memory _pubkey_x, bytes memory _pubkey_y) internal {
        pubkey_x = bytesToBytes32Array(_pubkey_x);
        pubkey_x = bytesToBytes32Array(_pubkey_y);
    }

    //, bytes calldata _webAuthnInputs
    function sendTxToSafe(
        address _to,
        uint256 _value,
        bytes calldata _data,
        Enum.Operation _operation,
        bytes calldata _proof
    ) public virtual returns (bool success) {
        // (bytes32 message, uint[2] memory signature) = getMessage(_webAuthnInputs);

        bytes32[] memory publicInputs = new bytes32[](64);
        publicInputs = putPubKeyToPublicInputs(pubkey_x, pubkey_y);

        if (!verifier.verify(_proof, publicInputs)) revert PROOF_VERIFICATION_FAILED();
        require(safe.execTransactionFromModule(_to, _value, _data, _operation), 'MODULE_TX_FAILED');
        return true;
    }

    // b can just be bignumber
    function bytesToBytes32Array(bytes memory _bytes) public pure returns (bytes32[] memory) {
        bytes32[] memory array = new bytes32[](32);
        for (uint i = 0; i < _bytes.length; i++) {
            array[i] = bytes32(_bytes[i]);
        }
        return array;
    }

    // used for passing uint8array pubkey for publicInputs
    function putPubKeyToPublicInputs(
        bytes32[] memory _pubkey_x,
        bytes32[] memory _pubkey_y
    ) public pure returns (bytes32[] memory publicInputs) {
        publicInputs = new bytes32[](64);
        for (uint i = 0; i < _pubkey_x.length; i++) {
            publicInputs[i] = _pubkey_x[i];
        }

        for (uint i = 0; i < _pubkey_y.length; i++) {
            publicInputs[32 + i] = _pubkey_y[i];
        }

        return publicInputs;
    }
}
