import * as _crypto from 'crypto';
const crypto = _crypto.webcrypto

export async function getKey(pubkey) {
    const algoParams = {
        name: 'ECDSA',
        namedCurve: 'P-256',
        hash: 'SHA-256',
      };
  return await crypto.subtle.importKey('spki', pubkey, algoParams, true, ['verify'])
}

export async function derToRS(der) {
    var offset = 3;
    var dataOffset;

    if (der[offset] == 0x21) {
      dataOffset = offset + 2;
    }
    else {
      dataOffset = offset + 1;
    }
    const r = der.slice(dataOffset, dataOffset + 32);
    offset = offset + der[offset] + 1 + 1
    if (der[offset] == 0x21) {
      dataOffset = offset + 2;
    }
    else {
      dataOffset = offset + 1;
    }
    const s = der.slice(dataOffset, dataOffset + 32);
    return [ r, s ]
  }

export function bufferFromBase64(value) {
    return Buffer.from(value, "base64")
}

export function bufferToHex (buffer) {
    return ("0x").concat([...new Uint8Array (buffer)]
      .map (b => b.toString (16).padStart (2, "0"))
      .join (""));
}

export function hexStringToUint8Array(hexString) {
    hexString.slice(2);
  
    // Convert the hexadecimal string to an array of uint8 values
    const uint8Array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = parseInt(hexString.substr(i * 2, 2), 16);
      uint8Array[i] = byte;
    }
  
    return uint8Array;
  }