
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';

@Injectable()
export default class CreateWalletUseCase {
private rpcUrl: string;
private web3Object : any;

constructor() {
    this.rpcUrl = process.env.RPC_URL;

    //Initialize RPC connection for Web3 Functions
    this.web3Object = new Web3(new Web3.providers.HttpProvider(this.rpcUrl));
    // console.log("web3Object", this.web3Object);
}

  async createWallet(): Promise<any> {
    let returnValue: ethereumModels.CreateWalletDto = {};

    // Create wallet without providing PrivateKey. PrivateKey is auto-generated
    try {
        
        let accountCreationResult = this.web3Object.eth.accounts.create();
        console.log('accountCreationResult', accountCreationResult);

        Logger.log(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.CreateWalletResult,
                EthereumGroup.CreateWallet,
                {
                    privateKey: accountCreationResult.privateKey,
                    walletAddress: accountCreationResult.address
                }
            )
        );

        returnValue.privateKey = accountCreationResult.privateKey;
        returnValue.walletAddress = accountCreationResult.address;
        
    }
    catch (error) {
        console.log('accountCreationResult Error', error);
        Logger.error(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.CreateWalletResult,
                EthereumGroup.CreateWallet,
                {
                    error: error.message
                }
            )
        );
    }

    //== INSERT Logic for Generated Wallet and Private Key ==//

    return returnValue;
  }
}