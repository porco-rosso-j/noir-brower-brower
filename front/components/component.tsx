import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import Ethers from '../utils/ethers';
import React from 'react';
import { NoirBrowser } from '../utils/noir/noirBrowser';

import { ThreeDots } from 'react-loader-spinner';
import { BigNumber } from 'ethers';
import * as utils from "../utils/webauthn/utils"
import { ethers } from 'ethers';

function Component() {
  const [input, setInput] = useState({ x: '', y: '', s: '', m: ''});
  const [pending, setPending] = useState(false);
  const [publicInput, setpublicInput] = useState(null);
  const [proof, setProof] = useState(Uint8Array.from([]));
  const [verification, setVerification] = useState(false);
  const [noir, setNoir] = useState(new NoirBrowser());

  // Handles input state
  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  // Calculates proof
  const calculateProof = async () => {
    setPending(true);

    try {
      const inputs = { 
        x: utils.hexStringToUint8Array(input.x), 
        y: utils.hexStringToUint8Array(input.y), 
        s: utils.hexStringToUint8Array(input.s), 
        m: utils.hexStringToUint8Array(input.m), 
      }

      const [witness, publicInput] = await noir.generateWitness(inputs);
      setpublicInput(publicInput)
      const proof = await noir.generateProof(witness);
      console.log("proof: ", proof)
      setProof(proof);
    } catch (err) {
      console.log(err);
      toast.error('Error generating proof');
    }

    setPending(false);
  };

  /*

inputs

0x0873dcbc0494eccea0a842a731ac7f2804edff2786502dc64b78e2e119baa7a6
0x30f46d04b51fc3fc97446d3ee8df91a0c0f4d64ce969fa416176b5ee95bc61e3
0x879e8a6e942796074f8f4616e1c0e8d930ad39a55b4aef86f9f2dda25599435b6ff025a245eea7eaec68de376fec363a840973103c1cfde4702af8c19d07f6e9
0x89b0cf220d854c15f48fdc12c9e609c04b856949e96109a4c8743e5292cf3e93
*/

  const verifyProof = async () => {
    // only launch if we do have an acir and a proof to verify
    // if (proof) {
    //   try {
        console.log("proof: ", proof)
        // const verification = await noir.verifyProof(proof);
        // console.log("verification: ", verification)
        // setVerification(verification);
        // toast.success('Proof verified!');
        
        const ethers = new Ethers();

        console.log("publicInputs: ", publicInput)

        const slicedProof = proof.slice(2048);
        console.log("slicedProof: ", slicedProof)


        const ver = await ethers.contract.verify(slicedProof, publicInput);
        if (ver) {
          toast.success('Proof verified on-chain!');
          setVerification(true);
        } else {
          toast.error('Proof failed on-chain verification');
          setVerification(false);
        }
  //     } catch (err) {
  //       toast.error('Error verifying your proof');
  //     } finally {
  //       noir.destroy();
  //     }
  //   }
   };

  // Verifier the proof if there's one in state
  useEffect(() => {
    if (proof.length > 0) {
      verifyProof();
    }
  }, [proof]);

  const initNoir = async () => {
    setPending(true);

    await noir.init();
    setNoir(noir);

    setPending(false);
  };

  useEffect(() => {
    initNoir();
  }, [proof]);

  return (
    <div className="gameContainer" align="center">
      <h1>Example starter</h1>
      <h2>This circuit checks that ecdsa_secp256r1 works</h2>
      <p>Try it!</p>
      <input name="x" type={'text'} onChange={handleChange} value={input.x} />
      <br></br>
      <input name="y" type={'text'} onChange={handleChange} value={input.y} />
      <br></br>
      <input name="s" type={'text'} onChange={handleChange} value={input.s} />
      <br></br>
      <input name="m" type={'text'} onChange={handleChange} value={input.m} />
      <br></br>
      <button onClick={calculateProof}>Calculate proof</button>
      <br></br>
      <p>Test Inputs</p>
      pubkey x: 0x0873dcbc0494eccea0a842a731ac7f2804edff2786502dc64b78e2e119baa7a6
      <br></br>
      pubkey y: 0x30f46d04b51fc3fc97446d3ee8df91a0c0f4d64ce969fa416176b5ee95bc61e3
      <br></br>
      signature: <br></br>
      0x879e8a6e942796074f8f4616e1c0e8d930ad39a55b4aef86f9f2dda25599435b6ff025a245eea7eaec68de376fec363a840973103c1cfde4702af8c19d07f6e9
      <br></br>
      message: 0x89b0cf220d854c15f48fdc12c9e609c04b856949e96109a4c8743e5292cf3e93
      {pending && <ThreeDots wrapperClass="spinner" color="#000000" height={100} width={100} />}
    </div>
  );
}

export default Component;