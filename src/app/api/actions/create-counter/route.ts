import { Program } from "@coral-xyz/anchor";
import CounterIDL from "anchor/target/idl/counter.json";
import { Counter } from "anchor/target/types/counter";
import {
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
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
  // insert transaction logic here

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
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }

  const keypair = Keypair.generate();

  const program = new Program({
    ...CounterIDL,
    address: CounterIDL.address,
  } as Counter);
  const ix = await program.methods
    .initialize()
    .accounts({ counter: keypair.publicKey })
    .signers([keypair])
    .instruction();

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: sender,
    blockhash,
    lastValidBlockHeight,
  }).add(ix);

  await tx.partialSign(keypair);

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction: tx,
      type: "transaction",
      message: "Create a counter on-chain",
    },
    signers: [keypair],
  });

  return Response.json(payload, {
    headers,
  });
};
