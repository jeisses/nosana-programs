import { TOKEN_PROGRAM_ID, createAssociatedTokenAccount, getAssociatedTokenAddress, transfer } from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { expect } from 'chai';
import * as utils from '../utils';
import { getTokenBalance } from '../utils';
import c from '../constants';

const now = function () {
  return Math.floor(Date.now() / 1e3);
};

export default function suite() {
  before(async function () {
    this.pool = anchor.web3.Keypair.generate();
    [this.poolVault] = await anchor.web3.PublicKey.findProgramAddress(
      [utils.utf8_encode('vault'), this.pool.publicKey.toBuffer()],
      global.poolsProgram.programId
    );

    // helper to add funds to the pool
    this.fundPool = async function (amount) {
      await transfer(
        global.connection,
        global.payer,
        await getAssociatedTokenAddress(global.accounts.mint, global.wallet.publicKey),
        this.poolVault,
        global.payer,
        amount
      );
      this.amount += amount;
    };

    this.getPool = async function () {
      return await global.poolsProgram.account.poolAccount.fetch(this.pool.publicKey);
    };

    this.emmission = 20;
    this.amount = 0;
  });

  beforeEach(async function () {
    global.accounts.pool = this.pool.publicKey;
    global.accounts.vault = this.poolVault;

    global.accounts.rewardsStats = global.stats.rewards;
    global.accounts.rewardsVault = global.ata.vaultRewards;
    global.accounts.rewardsProgram = global.rewardsProgram.programId;

    this.rewardsBalanceBefore = await getTokenBalance(global.provider, global.ata.vaultRewards);
  });

  it('can open a pool', async function () {
    // start pool 3 second ago
    let startTime = now() - 3;

    await global.poolsProgram.methods
      .open(new BN(this.emmission), new BN(startTime), true)
      .accounts(global.accounts)
      .signers([this.pool])
      .rpc();

    const pool = await this.getPool();

    expect(pool.emmission.toNumber()).to.equal(this.emmission);
    expect(pool.startTime.toNumber()).to.equal(startTime);
    expect(pool.claimedTokens.toNumber()).to.equal(0);
    expect(pool.closeable).to.equal(true);
  });

  it('can fill pool vault', async function () {
    await this.fundPool(14);
    expect(await getTokenBalance(global.provider, this.poolVault)).to.equal(this.amount);
  });

  it('can not claim underfunded', async function () {
    let msg = '';
    await global.poolsProgram.methods
      .claimFee()
      .accounts(global.accounts)
      .rpc()
      .catch((e) => (msg = e.error.errorMessage));
    expect(msg).to.equal(c.errors.PoolUnderfunded);
  });

  it('can claim a multiple of emmission', async function () {
    await this.fundPool(this.emmission * 3);

    expect(await getTokenBalance(global.provider, this.poolVault)).to.equal(this.amount);

    await global.poolsProgram.methods.claimFee().accounts(global.accounts).rpc();
    const after = await getTokenBalance(global.provider, global.ata.vaultRewards);

    expect(after).to.equal(this.amount);
    expect(await getTokenBalance(global.provider, this.poolVault)).to.equal(0);
  });

  it('can claim for full ellapsed time', async function () {
    // fund for 5 seconds
    await this.fundPool(this.emmission * 5);

    let pool = await this.getPool();

    // sleep at least 1 second
    await utils.sleep(1000);

    let ellapsed = now() - pool.startTime;
    expect(ellapsed).to.be.above(1);
    await global.poolsProgram.methods.claimFee().accounts(global.accounts).rpc();

    const after = await getTokenBalance(global.provider, global.ata.vaultRewards);
    let claimed = after - this.rewardsBalanceBefore;

    // allow a second of drift
    expect(claimed).to.be.closeTo(ellapsed * this.emmission - pool.claimedTokens, 1 * this.emmission);
  });

  it('can close', async function () {
    await global.poolsProgram.methods.close().accounts(global.accounts).rpc();
  });
}
