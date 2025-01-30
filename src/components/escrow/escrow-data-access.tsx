"use client";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { getEscrowProgram, getEscrowProgramId } from "@project/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AccountInfo,
  Cluster,
  Keypair,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
  SystemProgram,
} from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { api } from "@/trpc/react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { BN } from "@coral-xyz/anchor";
import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  signerIdentity,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";

export function useEscrowProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const wallet = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const createEscrow = api.escrow.create.useMutation();
  const programId = useMemo(
    () => getEscrowProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getEscrowProgram(provider, programId),
    [provider, programId]
  );

  const accounts = useQuery({
    queryKey: ["Escrow", "all", { cluster }],
    queryFn: () => program.account.escrow.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createAsset = useMutation({
    mutationKey: ["Escrow", "create-asset", { cluster }],
    mutationFn: async () => {
      const umi = createUmi("https://api.devnet.solana.com")
        .use(mplCore())
        .use(walletAdapterIdentity(wallet));

      const asset = generateSigner(umi);

      const tx = await create(umi, {
        asset,
        name: "My NFT",
        uri: "https://escrow.com",
      }).sendAndConfirm(umi);
    },
  });

  const make = useMutation({
    mutationKey: ["Escrow", "make", { cluster }],
    mutationFn: async () => {
      const mintA = new PublicKey(
        "3mfzSSRKGHmmhQuK4e3AMf3vFepR3PavGwXMAP1qqMuU"
      );

      const makerAtaA = await getAssociatedTokenAddress(
        mintA,
        provider.publicKey
      );
      const seed = new BN(Date.now().toString());
      console.log(seed.toString());
      let escrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          provider.publicKey.toBuffer(),
          seed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      )[0];
      const vault = await getAssociatedTokenAddress(
        mintA,
        escrow,
        true,
        TOKEN_PROGRAM_ID
      );
      const mintB = new PublicKey(
        "8TPeGMnHwsz5izHkgfq6cTgsep87VudMns7SbwEDPjTH"
      );

      const context = {
        maker: provider.publicKey,
        mintA,
        mintB,
        makerAtaA,
        escrow,
        vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      };

      Object.entries(context).forEach(([key, value]) => {
        console.log(key, value.toString());
      });
      const deposit = new BN(500);
      const receive = new BN(100);

      const tx = await program.methods
        .make(seed, deposit, receive)
        .accounts(context)
        .rpc({
          skipPreflight: true,
        });
      return {
        signature: tx,
        escrow,
        vault,
        mintA,
        mintB,
        deposit,
        receive,
        seed,
      };
    },
    onSuccess: async ({
      signature,
      seed,
      escrow,
      vault,
      mintA,
      mintB,
      deposit,
      receive,
    }) => {
      transactionToast(signature);
      await createEscrow.mutate({
        publicKey: escrow.toBase58(),
        vaultPublicKey: vault.toBase58(),
        mintA: mintA.toBase58(),
        mintB: mintB.toBase58(),
        amountInVault: deposit.toString(),
        amountToReceive: receive.toString(),
        seed: seed.toString(),
        maker: provider.publicKey.toBase58(),
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
    make,
    createAsset,
  };
}

export function useEscrowProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useEscrowProgram();
  const provider = useAnchorProvider();
  const { connection } = useConnection();
  const addTaker = api.escrow.addTaker.useMutation();

  const accountQuery = useQuery({
    queryKey: ["Escrow", "fetch", { cluster, account }],
    queryFn: () => program.account.escrow.fetch(account),
  });

  const vaultQuery = useQuery({
    queryKey: ["Escrow", "vault", { cluster, account }],
    queryFn: async () => {
      if (!accountQuery.data?.mintA) {
        return;
      }
      const vault = await getAssociatedTokenAddress(
        accountQuery.data?.mintA,
        account,
        true,
        TOKEN_PROGRAM_ID
      );

      const vaultAccount = (await connection.getParsedAccountInfo(
        vault
      )) as unknown as RpcResponseAndContext<AccountInfo<ParsedAccountData>>;
      console.log(vaultAccount);
      return vaultAccount;
    },
    enabled: !!accountQuery.data?.mintA,
  });

  const escrowQuery = api.escrow.read.useQuery(
    {
      publicKey: account.toBase58(),
    },
    {
      enabled: !!account.toBase58(),
    }
  );

  const takeMutation = useMutation({
    mutationKey: ["Escrow", "take", { cluster, account }],
    mutationFn: async () => {
      if (!accountQuery.data) {
        throw new Error("No account data");
      }

      const vault = await getAssociatedTokenAddress(
        accountQuery.data?.mintA,
        account,
        true
      );

      const takerAtaA = await getAssociatedTokenAddress(
        accountQuery.data?.mintA,
        provider.publicKey
      );
      const takerAtaB = await getAssociatedTokenAddress(
        accountQuery.data?.mintB,
        provider.publicKey
      );
      const makerAtaB = await getAssociatedTokenAddress(
        accountQuery.data?.mintB,
        accountQuery.data?.maker
      );
      const context = {
        maker: accountQuery.data?.maker,
        taker: provider.publicKey,
        mintA: accountQuery.data?.mintA,
        mintB: accountQuery.data?.mintB,
        takerAtaA,
        takerAtaB,
        makerAtaB,
        vault,
        escrow: account,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };

      Object.entries(context).forEach(([key, value]) => {
        console.log(key, value.toString());
      });

      const tx = await program.methods.take().accounts(context).rpc({
        skipPreflight: true,
      });
      return {
        signature: tx,
      };
    },
    onSuccess: async ({ signature }) => {
      transactionToast(signature);
      await addTaker.mutate(
        {
          publicKey: account.toBase58(),
          taker: provider.publicKey.toBase58(),
        },
        {
          onSuccess: async () => {
            await accountQuery.refetch();
          },
        }
      );
    },
  });

  return {
    accountQuery,
    takeMutation,
    vaultQuery,
    escrowQuery,
  };
}
