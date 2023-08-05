// // TODO use the JSON directly for now
// // import { compile } from '@noir-lang/noir_wasm';
// import { decompressSync } from 'fflate';
// import {
//   BarretenbergApiAsync,
//   Crs,
//   newBarretenbergApiAsync,
//   RawBuffer,
// } from '@aztec/bb.js/dest/node/index.js';
// import { executeCircuit, compressWitness } from '@noir-lang/acvm_js';
// import { ethers } from 'ethers'; // I'm lazy so I'm using ethers to pad my input
// import circuit from '../../../circuits/target/main.json';
// import { Ptr } from '@aztec/bb.js/dest/node/types';

// export class NoirNode {
//   acir: string = '';
//   acirBuffer: Uint8Array = Uint8Array.from([]);
//   acirBufferUncompressed: Uint8Array = Uint8Array.from([]);

//   api = {} as BarretenbergApiAsync;
//   acirComposer = {} as Ptr;

//   async init() {
//     // TODO disabled until we get a fix for std
//     // const compiled_noir = compile({
//     //   entry_point: `${__dirname}/../../circuits/src/main.nr`,
//     // });
//     this.acirBuffer = Buffer.from(circuit.bytecode, 'base64');
//     this.acirBufferUncompressed = decompressSync(this.acirBuffer);

//     this.api = await newBarretenbergApiAsync(4);

//     const [exact, total, subgroup] = await this.api.acirGetCircuitSizes(
//       this.acirBufferUncompressed,
//     );
//     const subgroupSize = Math.pow(2, Math.ceil(Math.log2(total)));
//     const crs = await Crs.new(subgroupSize + 1);
//     await this.api.commonInitSlabAllocator(subgroupSize);
//     await this.api.srsInitSrs(
//       new RawBuffer(crs.getG1Data()),
//       crs.numPoints,
//       new RawBuffer(crs.getG2Data()),
//     );

//     this.acirComposer = await this.api.acirNewAcirComposer(subgroupSize);
//   }

//     // initialWitness.set(1, ethers.utils.hexZeroPad(`0x${input.x.toString(16)}`, 32));
//     // initialWitness.set(2, ethers.utils.hexZeroPad(`0x${input.y.toString(16)}`, 32));
//     // const length = input.x.length + input.y.length + input.s.length + input.m.length;

//   async generateWitness(input: any, acirBuffer: Buffer): Promise<Uint8Array> {
//     let initialWitness= new Map<number, string>();

//     let i = 1;
//     for (i; i <= input.x.length; i++) {
//       //console.log("valeu: ", value)
//       initialWitness.set(i, ethers.utils.hexZeroPad(`0x${input.x[i].toString(16)}`, 32));
//       console.log("initialWitness: ", initialWitness)
//     }

//     // let j = i + 1;
//     // for (j; j <= input.y.length + i; j++) {
//     //   initialWitness.set(i, ethers.utils.hexZeroPad(`0x${input.y[j].toString(16)}`, 32));
//     //   console.log("initialWitness: ", initialWitness)
//     // }

//     // let k = j + 1;
//     // for (k; k <= input.s.length + j; k++) {
//     //   initialWitness.set(k, ethers.utils.hexZeroPad(`0x${input.s[k].toString(16)}`, 32));
//     //   console.log("initialWitness: ", initialWitness)
//     // }
  
//     // let l = k + 1;
//     // for (l; l <= input.m.length + k; l++) {
//     //   initialWitness.set(l, ethers.utils.hexZeroPad(`0x${input.m[l].toString(16)}`, 32));
//     //   console.log("initialWitness: ", initialWitness)
//     // }

//     console.log("initialWitness final: ", initialWitness)

//     const witnessMap = await executeCircuit(this.acirBuffer, initialWitness, () => {
//       throw Error('unexpected oracle');
//     });

//     console.log("witnessMap: ", witnessMap)

//     const witnessBuff = compressWitness(witnessMap);
//     console.log("witnessBuff: ", witnessBuff)
//     return witnessBuff;
//   }

//   async generateProof(witness: Uint8Array) {
//     const proof = await this.api.acirCreateProof(
//       this.acirComposer,
//       this.acirBufferUncompressed,
//       decompressSync(witness),
//       false,
//     );
//     return proof;
//   }

//   async verifyProof(proof: Uint8Array) {
//     await this.api.acirInitProvingKey(this.acirComposer, this.acirBufferUncompressed);
//     const verified = await this.api.acirVerifyProof(this.acirComposer, proof, false);
//     return verified;
//   }

//   async destroy() {
//     await this.api.destroy();
//   }
// }
