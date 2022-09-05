import { createContext, useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
const {
    execSQL,
    DB_SCHEMA_NAME,
    TABLE_DEPLOYED_ADDRESSES_ABIS_NAME,
} = require("marketplace-shared/lib/database/harperDbUtils");

const Web3Context = createContext({
    isWeb3Enabled: false,
    contracts: null,
    chain: 1,
    isChainSupported: false,
    isConnectedAccountAdmin: false,
});

function ContractContextProvider(props) {
    const [context, setContext] = useState(null);
    const { Moralis, isWeb3Enabled, chainId, account } = useMoralis();

    const isConnectedAccountAnAdmin = async (multiSigContract) => {
        if (!account) return false;
        try {
            const owners = await multiSigContract.getOwnersAddresses();
            return owners.some((x) => x.toLowerCase() === account.toLowerCase());
        } catch (error) {
            console.error(error.message);
            return false;
        }
    };

    function getContractAt(deployedAddress, abi) {
        if (!deployedAddress || !abi)
            return {
                _contract: null,
                _provider: null,
            };

        const ethers = Moralis.web3Library;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(deployedAddress, abi, signer);

        return {
            _contract: contract,
            _provider: provider,
        };
    }

    const resolveContracts = async (chainIdStr) => {
        const marketplaceContract = await getContractFor("Marketplace", chainIdStr);
        const multiSigContract = await getContractFor("MultiSig", chainIdStr);

        return {
            marketplaceContract: marketplaceContract?._contract,
            multiSigContract: multiSigContract?._contract,
        };
    };

    const getContractFor = async (contractName, chainIdStr) => {
        var result = await getDeploymentsConstants(contractName, chainIdStr);
        if (result == null) return null;

        const _deployedAddressForChain = result.deployedAddressForChain;
        const _deployedAbiForChain = result.deployedAbiForChain;

        const contractResult = getContractAt(
            _deployedAddressForChain,
            _deployedAbiForChain
        );
        return contractResult;
    };

    const getDeploymentsConstants = async (contractName, chainIdStr) => {
        const sql = `SELECT distinct contractAddress, abi
        FROM ${DB_SCHEMA_NAME}.${TABLE_DEPLOYED_ADDRESSES_ABIS_NAME}
        WHERE chainId = "${chainIdStr}" and contractname = "${contractName}"`;
        const response = await execSQL(sql);

        if (response.error) {
            console.error(response.error);
            return null;
        }
        var parsedResponse = JSON.parse(response);
        try {
            return {
                deployedAddressForChain: parsedResponse[0].contractAddress,
                deployedAbiForChain: parsedResponse[0].abi,
            };
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        if (chainId) {
            const chainIdStr = parseInt(chainId).toString();
            resolveContracts(chainIdStr).then((_contracts) => {
                if (
                    !_contracts ||
                    !_contracts.marketplaceContract ||
                    !_contracts.multiSigContract
                ) {
                    setContext({
                        isWeb3Enabled: isWeb3Enabled,
                        contracts: null,
                        chain: "1",
                        isChainSupported: false,
                        isConnectedAccountAdmin: false,
                    });
                    return;
                } else {
                    isConnectedAccountAnAdmin(_contracts.multiSigContract).then(
                        (isAdmin) => {
                            setContext({
                                isWeb3Enabled: isWeb3Enabled,
                                contracts: _contracts,
                                chain: chainIdStr,
                                isChainSupported: _contracts.marketplaceContract != null,
                                isConnectedAccountAdmin: isAdmin,
                            });
                        }
                    );
                }
            });
        }
    }, [chainId, account]);

    return <Web3Context.Provider value={context}>{props.children}</Web3Context.Provider>;
}

export default { ContractContextProvider, Web3Context };
