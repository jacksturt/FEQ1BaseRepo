"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { ellipsify } from "@/components/ui/ui-layout";
import { ExplorerLink } from "@/components/cluster/cluster-ui";
import {
  useEscrowProgram,
  useEscrowProgramAccount,
} from "./escrow-data-access";

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

export function EscrowCreateAsset() {
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

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
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
  const { accountQuery, takeMutation, vaultQuery } = useEscrowProgramAccount({
    account,
  });

  const maker = useMemo(
    () => accountQuery.data?.maker.toString() ?? "...",
    [accountQuery.data?.maker]
  );

  const mintA = useMemo(
    () => accountQuery.data?.mintA.toString() ?? "...",
    [accountQuery.data?.mintA]
  );

  const mintB = useMemo(
    () => accountQuery.data?.mintB.toString() ?? "...",
    [accountQuery.data?.mintB]
  );

  const amount = useMemo(
    () => accountQuery.data?.recieve.toString() ?? "...",
    [accountQuery.data?.recieve]
  );

  const vaultAmount = useMemo(
    () =>
      vaultQuery.data?.value?.data?.parsed?.info?.tokenAmount?.uiAmount ??
      "...",
    [vaultQuery.data?.value?.data?.parsed?.info?.tokenAmount?.uiAmount]
  );

  // if (!counterQuery.data) {
  //   return <></>;
  // }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <div className="flex flex-col justify-center gap-4">
            <h2 className="justify-center text-md cursor-pointer">
              Maker: {maker}
            </h2>
            <h2 className=" justify-center text-md cursor-pointer text-primary">
              Mint A (Taker Receives) {vaultAmount} of {mintA}
            </h2>
            <h2 className=" justify-center text-md cursor-pointer text-primary">
              Mint B (Maker Receives) {amount} of {mintB}
            </h2>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                return takeMutation.mutateAsync();
              }}
              disabled={takeMutation.isPending}
            >
              Take
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
