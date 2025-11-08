import { Connection, PublicKey } from '@solana/web3.js';
import { config } from '../config/env.js';
const SOLANA_RPC = 'https://api.devnet.solana.com';
export async function verifyPayment(signature, expectedAmount, senderWallet) {
    try {
        const connection = new Connection(SOLANA_RPC, 'confirmed');
        const tx = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0
        });
        if (!tx) {
            return {
                transactionHash: signature,
                walletAddress: senderWallet,
                amount: 0,
                verified: false
            };
        }
        const recipientPubkey = new PublicKey(config.address);
        const senderPubkey = new PublicKey(senderWallet);
        let transferAmount = 0;
        let correctRecipient = false;
        let correctSender = false;
        if (tx.meta && tx.meta.postBalances && tx.meta.preBalances) {
            const accountKeys = tx.transaction.message.getAccountKeys();
            for (let i = 0; i < accountKeys.length; i++) {
                const pubkey = accountKeys.get(i);
                if (pubkey?.equals(recipientPubkey)) {
                    const balanceChange = tx.meta.postBalances[i] - tx.meta.preBalances[i];
                    if (balanceChange > 0) {
                        transferAmount = balanceChange;
                        correctRecipient = true;
                    }
                }
                if (pubkey?.equals(senderPubkey)) {
                    correctSender = true;
                }
            }
        }
        const amountMatches = transferAmount >= expectedAmount;
        const verified = correctRecipient && correctSender && amountMatches;
        return {
            transactionHash: signature,
            walletAddress: senderWallet,
            amount: transferAmount,
            verified
        };
    }
    catch (error) {
        console.error('Payment verification error:', error);
        return {
            transactionHash: signature,
            walletAddress: senderWallet,
            amount: 0,
            verified: false
        };
    }
}
export function generatePaymentRequest(amount, requestId) {
    return {
        recipient: config.address,
        amount,
        memo: `AI42-${requestId}`,
        network: config.network
    };
}
