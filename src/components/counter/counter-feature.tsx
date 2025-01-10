"use client";

import {
  AnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useCounterProgram } from "@/components/counter/counter-data-access";
import { CounterCreate } from "@/components/counter/counter-ui";
import {
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getCounterProgram } from "@project/anchor";

export function TestTransaction() {
  const { initialize } = useCounterProgram();
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={async () => {
        console.log("clicked");
        if (!signTransaction || !publicKey) return;
        // const dummyWallet = {
        //   publicKey: publicKey,
        //   signTransaction: () => {
        //     throw new Error("Not implemented");
        //   },
        //   signAllTransactions: () => {
        //     throw new Error("Not implemented");
        //   },
        // };

        // const provider = new AnchorProvider(
        //   connection,
        //   dummyWallet as unknown as AnchorWallet,
        //   { commitment: "confirmed", skipPreflight: true }
        // );

        // const keypair = Keypair.generate();
        // const program = getCounterProgram(provider);

        // // Get the instruction
        // const ix = await program.methods
        //   .initialize()
        //   .accounts({ counter: keypair.publicKey })
        //   .signers([keypair])
        //   .instruction();

        // // Get latest blockhash
        // const { blockhash, lastValidBlockHeight } =
        //   await connection.getLatestBlockhash();
        // // Create transaction
        // const transaction = new Transaction({
        //   feePayer: publicKey,
        //   blockhash,
        //   lastValidBlockHeight,
        // }).add(ix);

        // // Sign with the keypair
        // transaction.partialSign(keypair);
        // const serializedTransaction = transaction
        //   .serialize({
        //     requireAllSignatures: false,
        //     verifySignatures: false,
        //   })
        //   .toString("base64");
        // console.log(serializedTransaction);
        // const decodedTransaction = Transaction.from(
        //   Buffer.from(serializedTransaction, "base64")
        // );

        const serializedTransaction = await fetch(
          "/api/actions/create-counter",
          {
            method: "POST",
            body: JSON.stringify({ account: publicKey.toString() }),
          }
        );

        const { transaction } = await serializedTransaction.json();

        const decodedTransaction = Transaction.from(
          Buffer.from(transaction, "base64")
        );
        // const signedTransaction = await signTransaction(tx);

        decodedTransaction.feePayer = publicKey;
        // Send the signed transaction
        const signature = await signTransaction(decodedTransaction);

        // signature.partialSign(keypair);

        const tx = await connection.sendRawTransaction(signature.serialize());

        console.log("hi", tx);
      }}
      disabled={initialize.isPending}
    >
      Test {initialize.isPending && "..."}
    </button>
  );
}

export default function CounterFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCounterProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Counter"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <TestTransaction />
        <CounterCreate />
      </AppHero>
      {/* <CounterList /> */}
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
