"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useCounterProgram } from "@/components/counter/counter-data-access";
import { CounterCreate } from "@/components/counter/counter-ui";
import { Transaction, sendAndConfirmTransaction } from "@solana/web3.js";

export function TestTransaction() {
  const { initialize } = useCounterProgram();
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={async () => {
        if (!signTransaction || !publicKey) return;
        const decodedTransaction = Transaction.from(
          Buffer.from(
            "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACNni9t1h8EJKUPudUvdczZQRpykRwu3qmgkzhNOpsStIvyQKlSMvNho3gpRxm5+wei1bWPn3z00uPYCKPBzEsIAgACBKIlyemBY4g7L563vSR4+p3xBm27mp7k3LotsmtC+Td2LxfYVDVjW2R8m2RpHrCmDkPzF3mB0j8xNbV/toBc2AsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkr4ebtDdjtLHmqyqsNe3oRTBylFm1UYfwWFDsBdFiufzQ1rLgY8fUD5+QzParpEfP7iD8cC1XxrjQPSumjE70BAwMAAQIIr69tHw2Ym+0=",
            "base64"
          )
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const tx = new Transaction({
          feePayer: publicKey,
          blockhash,
          lastValidBlockHeight,
        }).add(decodedTransaction);
        const signedTransaction = await signTransaction(tx);

        // Send the signed transaction
        const signature = await connection.sendRawTransaction(
          signedTransaction.serialize(),
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 5,
          }
        );

        console.log(signature);
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
