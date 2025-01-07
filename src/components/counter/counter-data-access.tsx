"use client";

import { getCounterProgram, getCounterProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { api } from "@/trpc/react";

export function useCounterProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const initializeCounter = api.counter.create.useMutation();
  const programId = useMemo(
    () => getCounterProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getCounterProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["Counter", "all", { cluster }],
    queryFn: () => program.account.counter.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ["Counter", "initialize", { cluster }],
    mutationFn: async (keypair: Keypair) => {
      const tx = await program.methods
        .initialize()
        .accounts({ counter: keypair.publicKey })
        .signers([keypair])
        .rpc();
      return {
        publicKey: keypair.publicKey,
        signature: tx,
      };
    },
    onSuccess: async ({ publicKey, signature }) => {
      transactionToast(signature);
      await initializeCounter.mutate({
        publicKey: publicKey.toBase58(),
      });
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to initialize account"),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useCounterProgram();

  const incrementCounter = api.counter.increment.useMutation();
  const decrementCounter = api.counter.decrement.useMutation();
  const setCounter = api.counter.set.useMutation();
  const closeCounter = api.counter.delete.useMutation();

  const accountQuery = useQuery({
    queryKey: ["Counter", "fetch", { cluster, account }],
    queryFn: () => program.account.counter.fetch(account),
  });

  const counterQuery = api.counter.read.useQuery(
    {
      publicKey: account.toBase58(),
    },
    {
      enabled: !!account.toBase58(),
    }
  );

  const closeMutation = useMutation({
    mutationKey: ["Counter", "close", { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx);
      await closeCounter.mutate({
        publicKey: account.toBase58(),
      });
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ["Counter", "decrement", { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx);
      await decrementCounter.mutate(
        {
          publicKey: account.toBase58(),
        },
        {
          onSuccess: async () => {
            await accountQuery.refetch();
            return await counterQuery.refetch();
          },
        }
      );
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ["Counter", "increment", { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ counter: account }).rpc(),
    onSuccess: async (tx) => {
      transactionToast(tx);
      await incrementCounter.mutate(
        {
          publicKey: account.toBase58(),
        },
        {
          onSuccess: async () => {
            await accountQuery.refetch();
            return await counterQuery.refetch();
          },
        }
      );
    },
  });

  const setMutation = useMutation({
    mutationKey: ["Counter", "set", { cluster, account }],
    mutationFn: async (value: number) => {
      const tx = await program.methods
        .set(value)
        .accounts({ counter: account })
        .rpc();
      return {
        signature: tx,
        value,
      };
    },
    onSuccess: async ({ value, signature }) => {
      transactionToast(signature);
      await setCounter.mutate(
        {
          publicKey: account.toBase58(),
          count: value,
        },
        {
          onSuccess: async () => {
            await accountQuery.refetch();
            return await counterQuery.refetch();
          },
        }
      );
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
    counterQuery,
  };
}
