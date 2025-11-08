import { VersionedTransaction } from "@solana/web3.js";
export async function getSignerAddress(base64Payload) {
    const decoded = JSON.parse(Buffer.from(base64Payload, "base64").toString());
    const txBytes = Buffer.from(decoded.payload.transaction, "base64");
    const versionedTx = VersionedTransaction.deserialize(txBytes);
    const signers = versionedTx.message.staticAccountKeys;
    return signers[1].toString();
}
