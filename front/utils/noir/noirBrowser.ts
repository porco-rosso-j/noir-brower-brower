// TODO use the JSON directly for now
// import { compile } from '@noir-lang/noir_wasm';
import { decompressSync } from 'fflate';
import {
  BarretenbergApiAsync,
  Crs,
  newBarretenbergApiAsync,
  RawBuffer,
} from '@aztec/bb.js/dest/browser/index.js';
import initACVM, { executeCircuit, compressWitness } from '@noir-lang/acvm_js';
import { ethers } from 'ethers'; // I'm lazy so I'm using ethers to pad my input
import circuit from '../../../circuits/target/main.json';
import { Ptr } from '@aztec/bb.js/dest/node/types';

export class NoirBrowser {
  acir: string = '';
  acirBuffer: Uint8Array = Uint8Array.from([]);
  acirBufferUncompressed: Uint8Array = Uint8Array.from([]);

  api = {} as BarretenbergApiAsync;
  acirComposer = {} as Ptr;

  async init() {
    await initACVM();
    // TODO disabled until we get a fix for std
    // const compiled_noir = compile({
    //   entry_point: `${__dirname}/../../circuits/src/main.nr`,
    // });
    this.acirBuffer = Buffer.from(circuit.bytecode, 'base64');
    this.acirBufferUncompressed = decompressSync(this.acirBuffer);

    this.api = await newBarretenbergApiAsync(4);

    const [exact, total, subgroup] = await this.api.acirGetCircuitSizes(
      this.acirBufferUncompressed,
    );
    const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));
    const crs = await Crs.new(subgroupSize + 1);
    await this.api.commonInitSlabAllocator(subgroupSize);
    await this.api.srsInitSrs(
      new RawBuffer(crs.getG1Data()),
      crs.numPoints,
      new RawBuffer(crs.getG2Data()),
    );

    this.acirComposer = await this.api.acirNewAcirComposer(subgroupSize);
  }

      //console.log("input.x: ", input.x)
    // add return witness
    // initialWitness.set(total + 1, ethers.utils.hexZeroPad(`0x${Number(1).toString(16)}`, 32));

  async generateWitness(input: any): Promise<Uint8Array, any> {
    let initialWitness = new Map<number, string>();
    let publicInput: any = [];

    // const length = input.x.length + input.y.length + input.s.length + input.m.length;

    let total: number = 0;
    let i = 0;
    

    for (i; i < 4; i++) {
      // console.log("i: ", i)
      // inputs = i == 0 ? input.x : (1 ? input.y : (2 ? input.s : (3 ? input.m : null)));
      let inputs;
      if ( i == 0 ) { inputs = input.x} 
      else if ( i == 1 ) { inputs = input.y } 
      else if ( i == 2 ) { inputs = input.s } 
      else { inputs = input.m }

      console.log("inputs: ", inputs)
      // console.log("inputs.length: ", inputs.length)

      for (let j = 1; j < inputs.length; j++) {
        //console.log("inputs[j]: ", inputs[j])
        let value = ethers.utils.hexZeroPad(`0x${inputs[j].toString(16)}`, 32)
        // console.log("value: ", value)
        total = total + 1;
        // console.log("total: ", total)
        initialWitness.set(total, value);

        if (i == 0) {
          publicInput[j - 1] = value;
        } else if ( i == 1) {
          publicInput[j + 31] = value;
        }
      }

      console.log("publicInput: ", publicInput)

    }

    console.log("initialWitness final: ", initialWitness)

    const witnessMap = await executeCircuit(this.acirBuffer, initialWitness, () => {
      throw Error('unexpected oracle');
    });

    const witnessBuff = compressWitness(witnessMap);
    return [witnessBuff, publicInput];
  }

  async generateProof(witness: Uint8Array) {
    const proof = await this.api.acirCreateProof(
      this.acirComposer,
      this.acirBufferUncompressed,
      decompressSync(witness),
      false,
    );
    return proof;
  }

  async verifyProof(proof: Uint8Array) {
    await this.api.acirInitProvingKey(this.acirComposer, this.acirBufferUncompressed);
    const verified = await this.api.acirVerifyProof(this.acirComposer, proof, false);
    console.log("verified: ", verified)
    return verified;
  }

  async destroy() {
    await this.api.destroy();
  }
}
