"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { ellipsify } from "@/components/ui/ui-layout";
import { ExplorerLink } from "@/components/cluster/cluster-ui";
import {
  useEscrowProgram,
  useEscrowProgramAccount,
} from "./escrow-data-access";
import { useWallet } from "@solana/wallet-adapter-react";

// Very simple escrow creation component
export function EscrowCreate() {
  const { make } = useEscrowProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => make.mutateAsync()}
      disabled={make.isPending}
    >
      Create {make.isPending && "..."}
    </button>
  );
}

// Very simple asset creation component
export function CreateAsset() {
  const { createAsset } = useEscrowProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => createAsset.mutateAsync()}
      disabled={createAsset.isPending}
    >
      Create NFT {createAsset.isPending && "..."}
    </button>
  );
}

export function EscrowList() {
  const { accounts, getProgramAccount } = useEscrowProgram();

  // If the program account is loading, show a loading spinner
  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  // If the program account is not found, show an alert
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  // If the program account is found, show the escrow list
  return (
    <div className={"space-y-6"}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <EscrowCard
              key={account.publicKey.toString()}
              account={account.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={"text-2xl"}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function EscrowCard({ account }: { account: PublicKey }) {
  const { accountQuery, takeMutation, vaultQuery, refundMutation } =
    useEscrowProgramAccount({
      account,
    });
  const { publicKey } = useWallet();

  // Memoize the maker's public key, or "..." if the maker query is still loading
  const maker = useMemo(
    () => accountQuery.data?.maker.toString() ?? "...",
    [accountQuery.data?.maker]
  );

  // Memoize the mintA, or "..." if the mintA query is still loading
  const mintX = useMemo(
    () => accountQuery.data?.mintX.toString() ?? "...",
    [accountQuery.data?.mintX]
  );

  // Memoize the mintB, or "..." if the mintB query is still loading
  const mintY = useMemo(
    () => accountQuery.data?.mintY.toString() ?? "...",
    [accountQuery.data?.mintY]
  );

  // Memoize the amount, or "..." if the amount query is still loading
  const amount = useMemo(
    () => accountQuery.data?.amountY.toString() ?? "...",
    [accountQuery.data?.amountY]
  );

  // Memoize the vault amount, or "..." if the vault amount query is still loading
  const vaultAmount = useMemo(
    () =>
      vaultQuery.data?.value?.data?.parsed?.info?.tokenAmount?.uiAmount ??
      "...",
    [vaultQuery.data?.value?.data?.parsed?.info?.tokenAmount?.uiAmount]
  );

  // If the escrow account is loading, show a loading spinner
  if (accountQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  // If the escrow account is not loading, show the escrow card
  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="flex flex-col justify-center gap-4">
            <h2 className="justify-center text-md cursor-pointer">
              Maker: {maker}
            </h2>
            <h2 className=" justify-center text-md cursor-pointer text-primary">
              Mint X (Taker Receives) {vaultAmount} of {mintX}
            </h2>
            <h2 className=" justify-center text-md cursor-pointer text-primary">
              Mint Y (Maker Receives) {amount} of {mintY}
            </h2>
          </div>
          <div className="text-center space-y-4">
            {/* Link to the escrow account on the explorer */}
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <div className="flex flex-col gap-4">
              {/* Button to take the escrow */}
              <button
                className="btn btn-xs btn-secondary btn-outline"
                onClick={() => {
                  return takeMutation.mutateAsync();
                }}
                disabled={takeMutation.isPending}
              >
                Take
              </button>
              {accountQuery.data?.maker.toString() ===
                publicKey?.toString() && (
                <button
                  className="btn btn-xs btn-secondary btn-outline"
                  onClick={() => {
                    return refundMutation.mutateAsync();
                  }}
                  disabled={refundMutation.isPending}
                >
                  Refund
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
