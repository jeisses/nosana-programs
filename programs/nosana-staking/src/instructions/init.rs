use crate::*;
use nosana_common::{authority, token_account};

#[derive(Accounts)]
pub struct Init<'info> {
    #[account(init, payer = authority, space = SETTINGS_SIZE, seeds = [ b"settings" ], bump)]
    pub settings: Account<'info, SettingsAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Init>) -> Result<()> {
    // get settings account and init
    let settings: &mut Account<SettingsAccount> = &mut ctx.accounts.settings;
    settings.set(authority::ID, token_account::ID);
    Ok(())
}
