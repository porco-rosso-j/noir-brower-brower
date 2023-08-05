// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import './SafeWebAuthn.sol';

contract SafeWebAuthnFactory {
    address public verifier;

    constructor(address _verifier) {
        verifier = _verifier;
    }

    // safe deployment function can be added

    function deploySafeWebatuhnModule(
        address _safe,
        bytes memory pubkey_x,
        bytes memory pubkey_y
    ) public returns (address) {
        address safeWebauthn = address(new SafeWebAuthn(_safe, verifier, pubkey_x, pubkey_y));
        return safeWebauthn;
    }
}
