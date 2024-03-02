import * as MultiBaas from '@curvegrid/multibaas-sdk';
import { Meteor } from 'meteor/meteor';
import { Web3Factory } from 'meteor/majus:web3';

const { url: baseUrl, key: accessToken } = Meteor.settings.public.MultiBaas;

// Configure the SDK using environment variables
const basePath = new URL('/api/v0', baseUrl);
const config = new MultiBaas.Configuration({
  basePath: basePath.toString(),
  accessToken,
});
const chain = 'ethereum';

export const Chains = new MultiBaas.ChainsApi(config);
export const Contracts = new MultiBaas.ContractsApi(config);
export const Events = new MultiBaas.EventsApi(config);

export function convertMultiBaasError(err) {
  return new Meteor.Error(
    err.response?.status ?? 503,
    err.response?.data?.message ?? err.message,
  );
}

export async function getChainId() {
  const { data } = await Chains.getChainStatus('ethereum');
  return data.result.chainID;
}

export async function callContractReadFunction(contract, name, args, extra) {
  const { data } = await Contracts.callContractFunction(
    'ethereum',
    contract.address,
    contract.label,
    name,
    {
      from: Web3Factory.signer().address,
      args,
      ...extra,
    },
  );
  return data.result.output;
}

export async function callContractWriteFunction(contract, name, args, extra) {
  const signer = Web3Factory.signer();
  try {
    const {
      data: {
        result: { tx },
      },
    } = await Contracts.callContractFunction(
      'ethereum',
      contract.address,
      contract.label,
      name,
      {
        from: signer.address,
        args,
        ...extra,
      },
    );
    if (Meteor.isServer) {
      const signed = await signer.signTransaction({
        from: signer.address,
        chainId: await getChainId(),
        to: tx.to,
        data: tx.data,
        value: tx.value,
        nonce: tx.nonce,
        gasLimit: tx.gas,
        maxFeePerGas: Number(tx.gasFeeCap),
        maxPriorityFeePerGas: Number(tx.gasTipCap),
        type: tx.type,
      });
      const { data } = await Chains.submitSignedTransaction('ethereum', {
        signedTx: signed,
      });
      return data.result;
    } else {
      const { hash } = await signer.sendTransaction({
        from: signer.address,
        chainId: await getChainId(),
        to: tx.to,
        data: tx.data,
        value: tx.value,
        nonce: tx.nonce,
        gasLimit: tx.gas,
        maxFeePerGas: Number(tx.gasFeeCap),
        maxPriorityFeePerGas: Number(tx.gasTipCap),
        type: tx.type,
      });
      return hash;
    }
  } catch (err) {
    throw convertMultiBaasError(err);
  }
}

export async function fetchEvents(contract, signature) {
  try {
    const { data } = await Events.listEvents(
      undefined, //blockHash
      undefined, //blockNumber
      undefined, //txIndexInBlock
      undefined, //eventIndexInLog
      undefined, //txHash
      undefined, //fromConstructor
      'ethereum',
      contract.address,
      contract.label,
      signature, //eventSignature
      undefined, //limit
      undefined, //offset
    );
    return data.result;
  } catch (err) {
    throw convertMultiBaasError(err);
  }
}

Meteor.startup(async () => {
  try {
    const { data } = await Chains.getChainStatus(chain);
    const { chainID, blockNumber } = data.result;
    console.log(
      `MultiBaas is connected to #${chainID}, the latest block is #${blockNumber}`,
    );
  } catch (err) {
    throw convertMultiBaasError(err);
  }
});
