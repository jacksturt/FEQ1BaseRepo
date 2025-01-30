use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub seed: u64,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub amount_x: u64,
    pub amount_y: u64,
    pub bump: u8,
}

impl Space for Escrow {
    const INIT_SPACE: usize = 8 + 8 + 32 + 32 + 8 + 8 + 1;
}
