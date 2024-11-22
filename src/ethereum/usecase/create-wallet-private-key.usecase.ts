
import { Injectable, Logger } from '@nestjs/common';
import { EthereumGroup, EthereumLog, EthereumSteps } from '../../common/types/ethereum-log';
import Web3 from 'web3';
import 'dotenv/config';
import { ethereumModels } from '../dto';

@Injectable()
export default class CreateWalletPrivateKeyUseCase {
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
    let privateKey: string = '';

    // Create wallet using own generated PrivateKey.
    try {
        privateKey =  this.web3Object.utils.randomHex(32);
        console.log('Custom PrivateKey to be used:', privateKey);
        Logger.log(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.CreatePrivateKeyResult,
                EthereumGroup.CreateWallet,
                {
                    privateKey: privateKey
                }
            )
        );
    }
    catch (error) {
        console.log('Create Private Key Error', error);
        Logger.error(
            new EthereumLog(
                '',
                '',
                '',
                EthereumSteps.CreatePrivateKeyResult,
                EthereumGroup.CreateWallet,
                {
                    error: error.message
                }
            )
        );
    }

    if (privateKey) {
        try {
            let accountCreationResult = this.web3Object.eth.accounts.privateKeyToAccount(privateKey);
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
    }

    //== INSERT Logic for Generated Wallet and Private Key ==//

    return returnValue;
  }
}