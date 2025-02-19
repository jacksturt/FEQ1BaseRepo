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
import { EscrowCreate, CreateAsset, EscrowList } from "./escrow-ui";

export default function CounterFeature() {
  const { publicKey } = useWallet();
  const { programId } = useCounterProgram();
  // If the user is connected, show the escrow feature
  // Else, show the connect wallet button
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
        <div className="flex flex-col gap-2">
          {/* Create an escrow */}
          <EscrowCreate />
          {/* Create an asset */}
          <CreateAsset />
        </div>
      </AppHero>
      {/* List all escrows */}
      <EscrowList />
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
