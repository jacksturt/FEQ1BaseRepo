import { AnchorProvider } from "@coral-xyz/anchor";
import { getCounterProgram } from "@project/anchor";
import {
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const headers = createActionHeaders({
  chainId: "mainnet", // or chainId: "devnet"
  actionVersion: "2.2.1", // the desired spec version
});

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "Create Counter",
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/",
    description: "Create a counter on-chain",
    label: "Create Counter",
  };

  return Response.json(payload, {
    headers,
  });
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  const body: ActionPostRequest = await req.json();
  const connection = new Connection(clusterApiUrl("devnet"));

  let sender;
  try {
    sender = new PublicKey(body.account);
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          message: "Invalid account",
        },
      }),
      {
        headers: ACTIONS_CORS_HEADERS,
        status: 400,
      }
    );
  }

  const dummyWallet = {
    publicKey: sender,
    signTransaction: () => {
      throw new Error("Not implemented");
    },
    signAllTransactions: () => {
      throw new Error("Not implemented");
    },
  };

  const provider = new AnchorProvider(
    connection,
    dummyWallet as unknown as AnchorWallet,
    { commitment: "confirmed", skipPreflight: true }
  );

  const keypair = Keypair.generate();
  const program = getCounterProgram(provider);

  // Get the instruction
  const ix = await program.methods
    .initialize()
    .accounts({ counter: keypair.publicKey })
    .signers([keypair])
    .instruction();

  // Get latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  // Create transaction
  const transaction = new Transaction({
    feePayer: sender,
    blockhash,
    lastValidBlockHeight,
  }).add(ix);

  // Sign with the keypair
  transaction.partialSign(keypair);
  const serializedTransaction = transaction
    .serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })
    .toString("base64");
  console.log("serializedTransaction\n", serializedTransaction);
  //   console.log("transaction\n", transaction.serialize());
  //   try {
  //     const signature = await connection.sendRawTransaction(
  //       transaction.serialize(),
  //       {
  //         skipPreflight: false,
  //         preflightCommitment: "confirmed",
  //         maxRetries: 5,
  //       }
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }

  // For Solana Actions, we need to serialize the transaction

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      // Send the serialized transaction as a string
      transaction,
      type: "transaction",
      message: "Create a counter on-chain",
    },
    signers: [keypair],
  });

  return Response.json(payload, {
    headers,
  });
};
