import { NumberSchema } from "joi"

export class CreateWalletDto {
    privateKey?: string
    walletAddress?: string
}

export class TransactionReceiptDto {
    blockNumber?: number
    fromWallet?: string
    toWallet?: string
    transactionAmount?: number
    status?: number
}

export class TransactionRequestDto {
    fromWalletAddress?: string
    toWalletAddress?: string
    transferAmount?: number
}