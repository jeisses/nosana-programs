use crate::*;

use anchor_spl::token::{Token, TokenAccount};
use nosana_common::{nos, transfer_tokens, NosanaError};

#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(mut, seeds = [ nos::ID.key().as_ref() ], bump)]
    pub ata_vault: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        has_one = authority,
        close = authority,
        seeds = [ b"stake", nos::ID.key().as_ref(), authority.key().as_ref() ],
        bump = stake.bump
    )]
    pub stake: Account<'info, StakeAccount>,
    #[account(mut)]
    pub ata_to: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<Claim>) -> Result<()> {
    // get and check the stake
    let stake: &mut Account<StakeAccount> = &mut ctx.accounts.stake;
    require!(stake.amount != 0, NosanaError::StakeAlreadyClaimed);
    require!(
        stake.duration
            >= u64::try_from(
                ctx.accounts
                    .clock
                    .unix_timestamp
                    .checked_sub(stake.time_unstake)
                    .unwrap()
            )
            .unwrap(),
        NosanaError::StakeLocked
    );

    // return tokens, the stake account is closed so no need to update it.
    transfer_tokens(
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.ata_vault.to_account_info(),
        ctx.accounts.ata_to.to_account_info(),
        ctx.accounts.ata_vault.to_account_info(),
        *ctx.bumps.get("ata_vault").unwrap(),
        stake.amount,
    )?;

    // finish
    Ok(())
}
