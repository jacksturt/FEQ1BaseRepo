use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        space = Escrow::INIT_SPACE,
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_x,
        associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = maker,
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_y,
        associated_token::authority = maker,
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Make<'info> {
    pub fn make(
        &mut self,
        seed: u64,
        amount_x: u64,
        amount_y: u64,
        bumps: &MakeBumps,
    ) -> Result<()> {
        self.escrow.set_inner(Escrow {
            seed,
            mint_x: self.mint_x.to_account_info().key(),
            mint_y: self.mint_y.to_account_info().key(),
            amount_x,
            amount_y,
            bump: bumps.escrow,
        });

        return self.transfer(amount_x);
    }

    pub fn transfer(&mut self, deposit: u64) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.maker_ata_x.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
            mint: self.mint_x.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, deposit, self.mint_x.decimals)
    }
}
