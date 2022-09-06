import { NotificationProvider } from "web3uikit";
import { MoralisProvider } from "react-moralis";
import ContractContextProvider from "store/contract-context";
import EthPriceContextProvider from "store/price-change-context";
import { Provider } from "urql";
import { marketplaceTheGraphClient } from "store/graphql-context";
import "@styles/globals.css";
import { CourseContextProvider } from "store/course-context";
const { setDbConfig } = require("marketplace-shared/lib/database/harperDbUtils");

function MyApp({ Component, pageProps }) {
    const Layout = Component.Layout;

    setDbConfig(
        process.env.NEXT_PUBLIC_HARPERDB_CLOUD_ENPOINT,
        process.env.NEXT_PUBLIC_HARPERDB_AUTH_KEY
    );
    return (
        <>
            <MoralisProvider initializeOnMount={false}>
                <Provider value={marketplaceTheGraphClient}>
                    <NotificationProvider>
                        <ContractContextProvider.ContractContextProvider>
                            <EthPriceContextProvider.EthPriceContextProvider>
                                <Layout>
                                    <Component {...pageProps} />
                                </Layout>
                            </EthPriceContextProvider.EthPriceContextProvider>
                        </ContractContextProvider.ContractContextProvider>
                    </NotificationProvider>
                </Provider>
            </MoralisProvider>
        </>
    );
}

export default MyApp;
