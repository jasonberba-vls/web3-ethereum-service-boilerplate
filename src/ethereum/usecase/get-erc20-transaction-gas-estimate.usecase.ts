
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';
import { fromWei, toWei } from '../../common/functions/cryptoFunction';
import { join } from 'path';
import * as fs from 'fs';
import GetGasPriceUseCase from './get-gas-price.usecase';

@Injectable()
export default class GetErc20TransactionGasEstimateUseCase {
private rpcUrl: string;
private web3Object : any;
private tokenDecimalCount: number;
private erc20TokenContractAddress : any;

constructor(private getGasPriceUseCase: GetGasPriceUseCase) {
    this.rpcUrl = process.env.RPC_URL;

    //Initialize RPC connection for Web3 Functions
    this.web3Object = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    // console.log("web3Object", this.web3Object);

    //ERC-20 Token decimal holder 
    this.tokenDecimalCount = Number(process.env.ERC20_DECIMAL_COUNT);

    //Define ERC-20 Token Contract Address.
    this.erc20TokenContractAddress = process.env.ERC20_CONTRACT;
}

  async getErc20TransactionGasEstimate(fromWalletAddress: string, toWalletAddress: string, transferAmount: number): Promise<any> {
    let returnValue : any;
    let getTransactionGasEstimateResult : any;

    //Initialize contract ABI
    let jsonContractAbiFilePath = join(__dirname, '../abi/balance-and-transfer.json');
    let jsonContractAbiData = fs.readFileSync(jsonContractAbiFilePath, 'utf8');
    let contractABI = JSON.parse(jsonContractAbiData);

    //Initialize ERC-20 Token ETH Contract object
    let contractForGasEstimation = new this.web3Object.eth.Contract(contractABI, this.erc20TokenContractAddress);

    //Convert transferAmount to Wei for contract parameter
    var contractTransferValue = toWei(transferAmount, this.tokenDecimalCount);
    //console.log('contractTransferValue', contractTransferValue);

    //Get Estimated Gas via ERC-20 Token Contract
    let contractEstimatedGasInEther: any;
    try {
        //Get Gas Estimate which is returned in Gwei
        const contractEstimatedGasInGwei = await contractForGasEstimation.methods.transfer(toWalletAddress, contractTransferValue).estimateGas({ from: fromWalletAddress });
        console.log('contractEstimatedGasInGwei', contractEstimatedGasInGwei);

        //Convert contractEstimatedGasInGwei into Ether
        contractEstimatedGasInEther = this.web3Object.utils.fromWei(contractEstimatedGasInGwei, "gwei");
        console.log('contractEstimatedGasInEther', contractEstimatedGasInEther);

        Logger.log(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.GetGasEstimateFromContract,
                EthereumGroup.GetTransactionGasEstimate,
                {
                    fromWalletAddress: fromWalletAddress,
                    toWalletAddress: toWalletAddress,
                    transferAmount: transferAmount,
                    contractEstimatedGasInGwei: contractEstimatedGasInGwei,
                    contractEstimatedGasInEther: contractEstimatedGasInEther,
                }
            )
        );
    }
    catch (error) {
        console.log('contractEstimatedGasInGwei Error', error);
        Logger.error(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.GetGasEstimateFromContract,
                EthereumGroup.GetTransactionGasEstimate,
                {
                    fromWalletAddress: fromWalletAddress,
                    toWalletAddress: toWalletAddress,
                    transferAmount: transferAmount,
                    error: error.message
                }
            )
        );
    }

    //Get Gas Price in Ether
    let getGasPriceResult = await this.getGasPriceUseCase.getGasPrice();
    //console.log('getGasPriceResult', getGasPriceResult);

    //Formula : gasPrice * gasEstimate
    getTransactionGasEstimateResult = Number(getGasPriceResult.gasPriceEther * contractEstimatedGasInEther).toFixed(this.tokenDecimalCount);
    console.log('getTransactionGasEstimateResult', getTransactionGasEstimateResult);

    Logger.log(
        new EthereumLog(
            '',
            '',
            '',
            EthereumSteps.GetTransactionGasEstimateResult,
            EthereumGroup.GetTransactionGasEstimate,
            {
                fromWalletAddress: fromWalletAddress,
                toWalletAddress: toWalletAddress,
                transferAmount: transferAmount,
                getTransactionGasEstimateResult: getTransactionGasEstimateResult
            }
        )
    );

    returnValue = {
        fromWalletAddress: fromWalletAddress,
        toWalletAddress: toWalletAddress,
        transferAmount: transferAmount,
        estimateTransactionFee: getTransactionGasEstimateResult
    }

    return returnValue;
  }
}