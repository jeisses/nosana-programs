# Nosana Jobs

## Program Information

| Info            | Description                                                                                                                         |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Type            | [⚙️ Solana Program](https://docs.solana.com/developing/intro/programs#on-chain-programs)                                            |
| Source Code     | [👨‍💻GitHub](https://github.com/nosana-ci/nosana-programs)                                                                         |
| Build Status    | [✅ Anchor Verified](https://www.apr.dev/program/nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM)                                        |
| Accounts        | [`3` account types](#accounts)                                                                                                      |
| Instructions    | [`10` instructions](#instructions)                                                                                                  |
| Domain          | 🌐 `nosana-jobs.sol`                                                                                                                |
| Program Address | [🧭 `nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM`](https://explorer.solana.com/address/nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM) |

## Instructions

A number of 10 instruction are defined in the Nosana Jobs program.
To load the program with [Anchor](https://coral-xyz.github.io/anchor/ts/index.html) in `TypeScript`:

```typescript
const programId = new PublicKey('nosJhNRqr2bc9g1nfGDcXXTXvYUmxD4cVwy2pMWhrYM');
const idl = await Program.fetchIdl(programId.toString());
const program = new Program(idl, programId);
```

### Init

The `init()` instruction initializes a [MarketAccount](#market-account) and an
associated [VaultAccount](#vault-account) for token deposits.

```typescript
let tx = await program.methods
  .init(
    jobPrice,          // type: u64
    jobTimeout,        // type: i64
    jobType,           // type: u8
    nodeStakeMinimum,  // type: u64
  )
  .accounts({
    mint,              // 𐄂 writable, 𐄂 signer
    market,            // ✓ writable, ✓ signer
    vault,             // ✓ writable, 𐄂 signer
    authority,         // ✓ writable, ✓ signer
    accessKey,         // 𐄂 writable, 𐄂 signer
    rent,              // 𐄂 writable, 𐄂 signer
    systemProgram,     // 𐄂 writable, 𐄂 signer
    tokenProgram,      // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

### Stop

The `stop()` instruction closes a [MarketAccount](#market-account) and an
associated [VaultAccount](#vault-account).
The vault has to be empty of tokens.

```typescript
let tx = await program.methods
  .stop()
  .accounts({
    market,            // ✓ writable, 𐄂 signer
    vault,             // 𐄂 writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
    tokenProgram,      // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

### Update

The `update()` instruction update a [MarketAccount](#market-account).

```typescript
let tx = await program.methods
  .update(
    jobPrice,          // type: u64
    jobTimeout,        // type: i64
    jobType,           // type: u8
    nodeStakeMinimum,  // type: u64
  )
  .accounts({
    market,            // ✓ writable, 𐄂 signer
    accessKey,         // 𐄂 writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
  })
  .rpc();
```

### Create

The `create()` instruction creates a [JobAccount](#job-account) with its required data.
When there is a node ready in the queue it will immediately start running.

```typescript
let tx = await program.methods
  .create(
    ipfsJob,           // type: [u8; 32]
  )
  .accounts({
    job,               // ✓ writable, ✓ signer
    market,            // ✓ writable, 𐄂 signer
    vault,             // ✓ writable, 𐄂 signer
    user,              // ✓ writable, 𐄂 signer
    feePayer,          // ✓ writable, ✓ signer
    authority,         // 𐄂 writable, ✓ signer
    rewardsReflection, // ✓ writable, 𐄂 signer
    rewardsVault,      // ✓ writable, 𐄂 signer
    rewardsProgram,    // 𐄂 writable, 𐄂 signer
    tokenProgram,      // 𐄂 writable, 𐄂 signer
    systemProgram,     // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

### Close

The `close()` instruction closes an existing [JobAccount](#job-account).
When the job was still queued the tokens will be returned to the user.

```typescript
let tx = await program.methods
  .close()
  .accounts({
    job,               // ✓ writable, 𐄂 signer
    market,            // 𐄂 writable, 𐄂 signer
    vault,             // ✓ writable, 𐄂 signer
    user,              // ✓ writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
    tokenProgram,      // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

### Cancel

With the `cancel()` instruction a node can stop running a job that it has started.

```typescript
let tx = await program.methods
  .cancel()
  .accounts({
    job,               // ✓ writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
  })
  .rpc();
```

### Claim

With the claim() instruction a node can claim a job that is:

- In the Queued (`0`) state.
- In the Running (`1`) state, but after is has expired.

```typescript
let tx = await program.methods
  .claim()
  .accounts({
    job,               // ✓ writable, 𐄂 signer
    market,            // ✓ writable, 𐄂 signer
    vault,             // ✓ writable, 𐄂 signer
    stake,             // 𐄂 writable, 𐄂 signer
    nft,               // 𐄂 writable, 𐄂 signer
    metadata,          // 𐄂 writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
  })
  .rpc();
```

### Enter

With the `enter()` instruction a node enters the [MarketAccount](#market-account) queue.

A few requirements are enforced:

- A node needs to have a minimum stake in Nosana Staking.
- A node needs to hold an official Nosana NFT.
- A node can only enter the queue once

```typescript
let tx = await program.methods
  .enter()
  .accounts({
    authority,         // 𐄂 writable, ✓ signer
    market,            // ✓ writable, 𐄂 signer
    vault,             // ✓ writable, 𐄂 signer
    stake,             // 𐄂 writable, 𐄂 signer
    nft,               // 𐄂 writable, 𐄂 signer
    metadata,          // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

### Exit

With the `exit()` instruction a node exits the node queue
from a [MarketAccount](#market-account).

```typescript
let tx = await program.methods
  .exit()
  .accounts({
    market,            // ✓ writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
  })
  .rpc();
```

### Finish

With the `finish()` instruction a node can can post the result for a job it has finished,
and be reimbursed for the work.

```typescript
let tx = await program.methods
  .finish(
    ipfsResult,        // type: [u8; 32]
  )
  .accounts({
    job,               // ✓ writable, 𐄂 signer
    market,            // 𐄂 writable, 𐄂 signer
    vault,             // ✓ writable, 𐄂 signer
    user,              // ✓ writable, 𐄂 signer
    authority,         // 𐄂 writable, ✓ signer
    tokenProgram,      // 𐄂 writable, 𐄂 signer
  })
  .rpc();
```

## Accounts

A number of 3 accounts make up for the Nosana Jobs Program's state.

### Vault Account

The `VaultAccount` is a regular Solana Token Account.

### Market Account

The `MarketAccount` struct holds all the information about jobs and the nodes queue.

| Name                        | Type                        | Offset  |
|-----------------------------|-----------------------------|---------|
| `authority`                 | `publicKey`                 | `8`     |
| `jobPrice`                  | `u64`                       | `40`    |
| `jobTimeout`                | `i64`                       | `48`    |
| `jobType`                   | `u8`                        | `64`    |
| `vault`                     | `publicKey`                 | `65`    |
| `vaultBump`                 | `u8`                        | `97`    |
| `nodeAccessKey`             | `publicKey`                 | `98`    |
| `nodeStakeMinimum`          | `u64`                       | `130`   |
| `nodeQueue`                 | `Vec<publicKey>`            | `138`   |

### Job Account

The `JobAccount` struct holds all the information about any individual jobs.

| Name                        | Type                        | Offset  |
|-----------------------------|-----------------------------|---------|
| `authority`                 | `publicKey`                 | `8`     |
| `ipfsJob`                   | `[u8; 32]`                  | `40`    |
| `ipfsResult`                | `[u8; 32]`                  | `72`    |
| `market`                    | `publicKey`                 | `104`   |
| `node`                      | `publicKey`                 | `136`   |
| `price`                     | `u64`                       | `168`   |
| `status`                    | `u8`                        | `176`   |
| `timeEnd`                   | `i64`                       | `177`   |
| `timeStart`                 | `i64`                       | `193`   |

## Types

A number of 2 type variants are defined in the Nosana Jobs Program's state.

### Job Status

The `JobStatus` describes the status of any job

A number of 3 variants are defined:
| Name                                  | byte                                  |
|---------------------------------------|---------------------------------------|
| `Queued`                              | `0`                                   |
| `Running`                             | `1`                                   |
| `Done`                                | `2`                                   |

### Job Type

The `JobType` describes the type of any job.

A number of 6 variants are defined:
| Name                                  | byte                                  |
|---------------------------------------|---------------------------------------|
| `Default`                             | `0`                                   |
| `Small`                               | `1`                                   |
| `Medium`                              | `2`                                   |
| `Large`                               | `3`                                   |
| `Gpu`                                 | `4`                                   |
| `Unknown`                             | `255`                                 |