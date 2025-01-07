import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { Counter } from "../target/types/Counter";

describe("Counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.Counter as Program<Counter>;

  const CounterKeypair = Keypair.generate();

  it("Initialize Counter", async () => {
    await program.methods
      .initialize()
      .accounts({
        Counter: CounterKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([CounterKeypair])
      .rpc();

    const currentCount = await program.account.Counter.fetch(
      CounterKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it("Increment Counter", async () => {
    await program.methods
      .increment()
      .accounts({ Counter: CounterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.Counter.fetch(
      CounterKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it("Increment Counter Again", async () => {
    await program.methods
      .increment()
      .accounts({ Counter: CounterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.Counter.fetch(
      CounterKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it("Decrement Counter", async () => {
    await program.methods
      .decrement()
      .accounts({ Counter: CounterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.Counter.fetch(
      CounterKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it("Set Counter value", async () => {
    await program.methods
      .set(42)
      .accounts({ Counter: CounterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.Counter.fetch(
      CounterKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it("Set close the Counter account", async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        Counter: CounterKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.Counter.fetchNullable(
      CounterKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
