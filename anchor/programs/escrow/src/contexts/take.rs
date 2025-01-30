use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::Escrow;

#[derive(Accounts)]
pub struct Take<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = escrow.mint_x,
        associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        has_one = mint_x,
        has_one = mint_y,
        close = maker,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = maker,
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_y,
        associated_token::authority = taker,
    )]
    pub taker_ata_y: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = mint_x,
        associated_token::authority = taker,
    )]
    pub taker_ata_x: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Take<'info> {
    pub fn vault_to_taker(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();
        let bump = self.escrow.bump;

        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.taker_ata_x.to_account_info(),
            authority: self.escrow.to_account_info(),
            mint: self.mint_x.to_account_info(),
        };

        let seeds = &[
            "escrow".as_bytes(),
            &self.maker.key.to_bytes(),
            &self.escrow.seed.to_le_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer_checked(cpi_ctx, self.escrow.amount_x, self.mint_x.decimals)?;
        Ok(())
    }

    pub fn taker_to_maker(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.taker_ata_y.to_account_info(),
            to: self.maker_ata_y.to_account_info(),
            authority: self.taker.to_account_info(),
            mint: self.mint_y.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, self.escrow.amount_y, self.mint_y.decimals)
    }

    pub fn close_vault(&mut self) -> Result<()> {
        // close vault -> CPI close_account()

        let cpi_program = self.token_program.to_account_info();
        let bump = self.escrow.bump;
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let seeds = &[
            "escrow".as_bytes(),
            &self.maker.key.to_bytes(),
            &self.escrow.seed.to_le_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        close_account(cpi_ctx)?;
        Ok(())
    }
}
