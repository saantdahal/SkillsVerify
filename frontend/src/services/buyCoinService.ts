import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";

const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID as string;
const FULLNODE_URL = import.meta.env.VITE_APP_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "testnet";
const CONTENT_REGISTRY = import.meta.env.VITE_APP_CONTENT_REGISTRY as string;
const COIN_OBJECT_ID = import.meta.env.VITE_APP_BEAST_OBJECT_ID as string;
const COIN_TYPE = import.meta.env.VITE_APP_BEAST_COIN_TYPE as string;

export const BuyToken = async (flow: any) => {
  try {
    const suiClient = new SuiClient({ url: FULLNODE_URL });
    const keypair = await flow.getKeypair({ network: NETWORK });
    const tx = new TransactionBlock();
    const creatorTokenName = "BEAST";
    const amountToBuy = 1; // Amount of creator tokens to buy (just 1)

    // Exchange rate is 5 creator coins to 1 SUI
    // To buy 1 creator coin, we need 1/5 = 0.2 SUI
    // Since SUI is measured in MIST (10^9 MIST = 1 SUI), we need 0.2 * 10^9 = 200,000,000 MIST
    const paymentAmount = 200000000; // 0.2 SUI in MIST

    // Split some SUI from the gas payment for the transaction
    const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(paymentAmount)]);
    let returnCoin = tx.moveCall({
      target: `${PACKAGE_ID}::exchange::get_coin`,
      typeArguments: [COIN_TYPE],

      arguments: [
        tx.object(
          "0x973da42891d44a49ba602ce177ef81dfb55f8bce4f763e7102b0fce3d4b0cb92"
        ), //exchange
        payment, // payment in SUI
        tx.pure.u64(amountToBuy), // amount of tokens to buy
      ],
    });

    //   tx.transferObjects([payment], keypair.getPublicKey().toSuiAddress());
    tx.transferObjects([returnCoin], keypair.getPublicKey().toSuiAddress());

    const txnRes = await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
    });
    console.log("txnRes", txnRes);
    console.log("digest", txnRes.digest);
  } catch (error) {
    console.error("Error in content", error);
    throw error;
  }
};
