import * as MultiBaas from '@curvegrid/multibaas-sdk';
import { Meteor } from 'meteor/meteor';

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

export async function prepateAndSubmitContractWriteFunction(contract, name, args, signer) {
  const { data: { result: { tx } } } = await Contracts.callContractFunction(
    'ethereum',
    contract.address,
    contract.label,
    'agentApprove',
    {
      from: signer.address,
      args,
    },
  );
  const signed = await signer.signTransaction({
    from: signer.address,
    chainId: await getChainId(),
    to: tx.to,
    data: tx.data,
    value: tx.value,
    nonce: tx.nonce,
    gasLimit: tx.gas,
    // maxFeePerGas: Number(tx.gasFeeCap),
    // maxPriorityFeePerGas: Number(tx.gasTipCap),
    type: tx.type,
  });
  try {
    const { data } = await Chains.submitSignedTransaction('ethereum', { signedTx: signed });
    return data.result;
  } catch (err) {
    throw convertMultiBaasError(err);
  }
}

Meteor.startup(async () => {
  const { data } = await Chains.getChainStatus(chain);
  const { chainID, blockNumber } = data.result;
  console.log(`MultiBaas is connected to #${chainID}, the latest block is #${blockNumber}`);
});
