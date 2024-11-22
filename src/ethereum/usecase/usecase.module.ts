import { Module } from "@nestjs/common";
import CreateWalletPrivateKeyUseCase from "./create-wallet-private-key.usecase";
import CreateWalletUseCase from "./create-wallet.usecase";
import GetGasPriceUseCase from "./get-gas-price.usecase";
import GetErc20TransactionGasEstimateUseCase from "./get-erc20-transaction-gas-estimate.usecase";
import GetTransactionReceiptUseCase from "./get-transaction-receipt.usecase";
import GetErc20WalletBalanceUseCase from "./get-erc20-wallet-balance.usecase";
import SendErc20TransactionUseCase from "./send-erc20-token-transaction.usecase";
import SendEthereumTransactionUseCase from "./send-ethereum-transaction.usecase";

@Module({
  providers: [
    CreateWalletPrivateKeyUseCase,
    CreateWalletUseCase,
    GetGasPriceUseCase,
    GetErc20TransactionGasEstimateUseCase,
    GetTransactionReceiptUseCase,
    GetErc20WalletBalanceUseCase,
    SendEthereumTransactionUseCase,
    SendErc20TransactionUseCase
  ],
  exports: [
    CreateWalletPrivateKeyUseCase,
    CreateWalletUseCase,
    GetGasPriceUseCase,
    GetErc20TransactionGasEstimateUseCase,
    GetTransactionReceiptUseCase,
    GetErc20WalletBalanceUseCase,
    SendEthereumTransactionUseCase,
    SendErc20TransactionUseCase
  ],
})
export class UsecasesModule {}