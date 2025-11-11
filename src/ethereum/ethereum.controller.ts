import { Controller, Post, Body, Req, Get } from "@nestjs/common";
import { Request } from "express";
import { TransactionRequestDto } from "./dto/ethereum.dto";
import CreateWalletUseCase from "./usecase/create-wallet.usecase";
import CreateWalletPrivateKeyUseCase from "./usecase/create-wallet-private-key.usecase";
import GetGasPriceUseCase from "./usecase/get-gas-price.usecase";
import GetTransactionGasEstimateUseCase from "./usecase/get-erc20-transaction-gas-estimate.usecase";
import GetTransactionReceiptUseCase from "./usecase/get-transaction-receipt.usecase";
import GetErc20WalletBalanceUseCase from "./usecase/get-erc20-wallet-balance.usecase";
import SendErc20TransactionUseCase from "./usecase/send-erc20-token-transaction.usecase";
import SendEthereumTransactionUseCase from "./usecase/send-ethereum-transaction.usecase";

@Controller("eth")
export class EthereumController {
  constructor(
    private createWalletUseCase: CreateWalletUseCase,
    private createWalletPrivateKeyUseCase: CreateWalletPrivateKeyUseCase,
    private getGasPriceUseCase: GetGasPriceUseCase,
    private getTransactionGasEstimateUseCase: GetTransactionGasEstimateUseCase,
    private getTransactionReceiptUseCase: GetTransactionReceiptUseCase,
    private getErc20WalletBalanceUseCase: GetErc20WalletBalanceUseCase,
    private sendErc20TransactionUseCase: SendErc20TransactionUseCase,
    private sendEthereumTransactionUseCase: SendEthereumTransactionUseCase
  ) {}

  @Post("create-wallet")
  async createWallet(@Req() req: Request) {
    return await this.createWalletUseCase.createWallet();
  }

  @Post("create-wallet-private")
  async createWalletPrivateKey(@Req() req: Request) {
    return await this.createWalletPrivateKeyUseCase.createWallet();
  }

  @Get("get-gas-price")
  async getGasPrice(@Req() req: Request) {
    return await this.getGasPriceUseCase.getGasPrice();
  }

  @Post("get-erc20-transaction-gas-estimate")
  async getTransactionGasEstimate(@Req() req: Request) {
    let request: TransactionRequestDto = req.body;
    return await this.getTransactionGasEstimateUseCase.getErc20TransactionGasEstimate(
      request.fromWalletAddress,
      request.toWalletAddress,
      request.transferAmount
    );
  }

  @Get("get-transaction-receipt/:transactionHash")
  async getTransactionReceipt(@Req() req: Request) {
    const { transactionHash } = req.params;
    return await this.getTransactionReceiptUseCase.getTransactionReceipt(
      transactionHash
    );
  }

  @Get("get-erc20-wallet-balance/:walletAddress")
  async getWalletBalance(@Req() req: Request) {
    const { walletAddress } = req.params;
    return await this.getErc20WalletBalanceUseCase.getErc20TokenWalletBalance(
      walletAddress
    );
  }

  @Post("send-erc20-transaction")
  async sendErc20Transaction(@Req() req: Request) {
    let request: TransactionRequestDto = req.body;
    return await this.sendErc20TransactionUseCase.sendErc20Transaction(
      request.fromWalletAddress,
      request.toWalletAddress,
      request.transferAmount
    );
  }

  @Post("send-ethereum-transaction")
  async sendEthereumTransaction(@Req() req: Request) {
    let request: TransactionRequestDto = req.body;
    return await this.sendEthereumTransactionUseCase.sendEthereumTransaction(
      request.fromWalletAddress,
      request.toWalletAddress,
      request.transferAmount
    );
  }
}
