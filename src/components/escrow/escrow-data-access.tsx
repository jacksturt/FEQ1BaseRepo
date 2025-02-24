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
  TOKEN_2022_PROGRAM_ID,
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

export function useEscrowProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const wallet = useWallet();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const createEscrow = api.escrow.create.useMutation();
  // Memoize the program id and program so we don't have to re-create them on every render
  const programId = useMemo(
    () => getEscrowProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getEscrowProgram(provider, programId),
    [provider, programId]
  );
  // Fetch all escrow accounts
  const accounts = useQuery({
    queryKey: ["Escrow", "all", { cluster }],
    queryFn: () => program.account.escrow.all(),
  });

  // Fetch the program account
  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // Create a metaplex asset TODO: Finish implementing this like in class
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

  // Create an escrow
  const make = useMutation({
    mutationKey: ["Escrow", "make", { cluster }],
    mutationFn: async () => {
      // Define the mint for the asset (devnet usdc now)
      const mintX = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      );
      // Get the associated token address for the maker
      const makerAtaX = await getAssociatedTokenAddress(
        mintX,
        provider.publicKey,
        false
      );
      // Generate a random seed for the escrow
      const seed = new BN(Date.now().toString());
      console.log(seed.toString());
      // Get the escrow address
      let escrow = PublicKey.findProgramAddressSync(
        [
          Buffer.from("escrow"),
          provider.publicKey.toBuffer(),
          // See that this is different from test files. In the client side we need to use toArrayLike to convert the number to a buffer
          seed.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      )[0];
      // Get the associated token address for the vault (note the true flag since the vault is owned by the escrow, hence off chain)
      const vault = await getAssociatedTokenAddress(mintX, escrow, true);
      // Define the mint for the other token (random mint I created)
      const mintY = new PublicKey(
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
      );
      // Get the associated token address for the maker
      const makerAtaY = await getAssociatedTokenAddress(
        mintY,
        provider.publicKey,
        false
      );
      const context = {
        maker: provider.publicKey,
        mintX: mintX,
        mintY: mintY,
        makerAtaX,
        makerAtaY,
        escrow,
        vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      };
      // Log the context
      Object.entries(context).forEach(([key, value]) => {
        console.log(key, value.toString());
      });
      // Define the amount to deposit
      const deposit = new BN(500);
      // Define the amount to receive
      const receive = new BN(100);
      // Make the escrow
      const tx = await program.methods
        .make(seed, deposit, receive)
        .accountsStrict(context)
        .rpc({});
      // Return the signature and the escrow address
      return {
        signature: tx,
        escrow,
        vault,
        mintX: mintX,
        mintY: mintY,
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
      mintX,
      mintY,
      deposit,
      receive,
    }) => {
      transactionToast(signature);
      // Create the escrow account in the database
      await createEscrow.mutate({
        publicKey: escrow.toBase58(),
        vaultPublicKey: vault.toBase58(),
        mintA: mintX.toBase58(),
        mintB: mintY.toBase58(),
        amountInVault: deposit.toString(),
        amountToReceive: receive.toString(),
        seed: seed.toString(),
        maker: provider.publicKey.toBase58(),
      });
      // Refetch the accounts
      return accounts.refetch();
    },
    onError: async (e) => {
      toast.error("Failed to initialize account");
      try {
        const logs = await (e as any).getLogs();
        console.log(logs);
      } catch (e) {
        console.log(e);
      }
    },
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
// For using a specific escrow account
export function useEscrowProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program } = useEscrowProgram();
  const provider = useAnchorProvider();
  const { connection } = useConnection();
  const addTaker = api.escrow.addTaker.useMutation();

  // Fetch the escrow account
  const accountQuery = useQuery({
    queryKey: ["Escrow", "fetch", { cluster, account }],
    queryFn: () => program.account.escrow.fetch(account),
  });

  // Fetch the vault account
  const vaultQuery = useQuery({
    queryKey: ["Escrow", "vault", { cluster, account }],
    queryFn: async () => {
      if (!accountQuery.data?.mintX) {
        return;
      }
      // Get the associated token address for the vault (note the true flag)
      const vault = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        account,
        true,
        TOKEN_PROGRAM_ID
      );
      // Get the account info for the vault
      const vaultAccount = (await connection.getParsedAccountInfo(
        vault
      )) as unknown as RpcResponseAndContext<AccountInfo<ParsedAccountData>>;
      console.log(vaultAccount);
      // Return the vault account
      return vaultAccount;
    },
    enabled: !!accountQuery.data?.mintX,
  });

  // Fetch the escrow account
  const escrowQuery = api.escrow.read.useQuery(
    {
      publicKey: account.toBase58(),
    },
    {
      enabled: !!account.toBase58(),
    }
  );

  // Fill the other side of the escrow
  const takeMutation = useMutation({
    mutationKey: ["Escrow", "take", { cluster, account }],
    mutationFn: async () => {
      if (!accountQuery.data) {
        throw new Error("No account data");
      }

      const vault = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        account,
        true
      );
      // Get the associated token address for the taker
      const takerAtaX = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        provider.publicKey
      );
      // Get the associated token address for the taker (note we don't need to initialize since we use init_if_needed in the contract code)
      const takerAtaY = await getAssociatedTokenAddress(
        accountQuery.data?.mintY,
        provider.publicKey
      );
      // Get the associated token address for the maker
      const makerAtaY = await getAssociatedTokenAddress(
        accountQuery.data?.mintY,
        accountQuery.data?.maker
      );
      // Define the context
      const context = {
        maker: accountQuery.data?.maker,
        taker: provider.publicKey,
        mintX: accountQuery.data?.mintX,
        mintY: accountQuery.data?.mintY,
        takerAtaX,
        takerAtaY,
        makerAtaY,
        vault,
        escrow: account,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };
      // Log the context
      Object.entries(context).forEach(([key, value]) => {
        console.log(key, value.toString());
      });
      // Take the escrow
      const tx = await program.methods.take().accountsStrict(context).rpc();
      // Return the signature
      return {
        signature: tx,
      };
    },
    onSuccess: async ({ signature }) => {
      transactionToast(signature);
      // Add the taker to the escrow in the database
      await addTaker.mutate(
        {
          publicKey: account.toBase58(),
          taker: provider.publicKey.toBase58(),
        },
        {
          onSuccess: async () => {
            // Refetch the escrow account
            await accountQuery.refetch();
          },
        }
      );
    },
  });

  const refundMutation = useMutation({
    mutationKey: ["Escrow", "refund", { cluster, account }],
    mutationFn: async () => {
      if (!accountQuery.data) {
        throw new Error("No account data");
      }

      const vault = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        account,
        true
      );
      // Get the associated token address for the taker
      const takerAtaA = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        provider.publicKey
      );
      // Get the associated token address for the taker (note we don't need to initialize since we use init_if_needed in the contract code)
      const takerAtaB = await getAssociatedTokenAddress(
        accountQuery.data?.mintY,
        provider.publicKey
      );
      // Get the associated token address for the maker
      const makerAtaB = await getAssociatedTokenAddress(
        accountQuery.data?.mintY,
        accountQuery.data?.maker
      );
      const makerAtaX = await getAssociatedTokenAddress(
        accountQuery.data?.mintX,
        provider.publicKey,
        false
      );
      // Define the context
      const context = {
        maker: accountQuery.data?.maker,
        taker: provider.publicKey,
        mintX: accountQuery.data?.mintX,
        mintY: accountQuery.data?.mintY,
        makerAtaX,
        vault,
        escrow: account,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      };
      // Log the context
      Object.entries(context).forEach(([key, value]) => {
        console.log(key, value.toString());
      });
      // Take the escrow
      const tx = await program.methods.refund().accountsStrict(context).rpc();
      // Return the signature
      return {
        signature: tx,
      };
    },
    onSuccess: async ({ signature }) => {
      transactionToast(signature);
      // Add the taker to the escrow in the database
      await addTaker.mutate(
        {
          publicKey: account.toBase58(),
          taker: provider.publicKey.toBase58(),
        },
        {
          onSuccess: async () => {
            // Refetch the escrow account
            await accountQuery.refetch();
          },
        }
      );
    },
  });

  return {
    accountQuery,
    takeMutation,
    refundMutation,
    vaultQuery,
    escrowQuery,
  };
}
