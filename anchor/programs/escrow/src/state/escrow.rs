use anchor_lang::prelude::*;

// Define the escrow account
// We want to store the seed, the bump, the two mints, and the amounts for each side of the escrow
#[account]
pub struct Escrow {
    pub seed: u64,
    pub maker: Pubkey,
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub amount_x: u64,
    pub amount_y: u64,
    pub bump: u8,
}

impl Space for Escrow {
    const INIT_SPACE: usize = 8 + 8 + 32 + 32 + 32 + 8 + 8 + 1;
}
