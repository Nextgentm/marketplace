import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import {
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  SOMNIA_NETWORK_CHAIN_ID,
  DEFAULT_NETWORK,
  NETWORKS_CHAINS,
  BINANCE_NETWORK_CHAIN_ID
} from "../lib/constants";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Home = () => {
  // Safely get network name or return empty string if not available
  const getNetworkName = (chainId) => {
    try {
      return NETWORKS_CHAINS?.[chainId]?.chainName || "Not Available";
    } catch (error) {
      console.error("Error getting network name:", error);
      return "Error";
    }
  };

  return (
    <Wrapper>
      <SEO pageTitle="Upload Variants" />
      <Header />
      <main id="main-content">
        <div className="container">
          <table>
            <tbody>
              <tr>
                <td colSpan={2}>DEFAULT_NETWORK</td>
                <td>{DEFAULT_NETWORK}</td>
              </tr>
              <tr>
                <td>ETHEREUM_NETWORK_CHAIN_ID</td>
                <td>{ETHEREUM_NETWORK_CHAIN_ID}</td>
                <td>{getNetworkName(ETHEREUM_NETWORK_CHAIN_ID)}</td>
              </tr>
              <tr>
                <td>SOMNIA_NETWORK_CHAIN_ID</td>
                <td>{SOMNIA_NETWORK_CHAIN_ID}</td>
                <td>{getNetworkName(SOMNIA_NETWORK_CHAIN_ID)}</td>
              </tr>
              <tr>
                <td>BINANCE_NETWORK_CHAIN_ID</td>
                <td>{BINANCE_NETWORK_CHAIN_ID}</td>
                <td>{getNetworkName(BINANCE_NETWORK_CHAIN_ID)}</td>
              </tr>

              <tr>
                <td colSpan={3}><br /></td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_POLYGON_STAKING_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_POLYGON_STAKING_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>

              <tr>
                <td colSpan={3}><br /></td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>

              <tr>
                <td colSpan={3}><br />Contracts is on gorli, so this contracts is not Sepolia Test Netwok</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>

              <tr>
                <td colSpan={3}><br /></td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_SOMNIA_FACTORY721_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_SOMNIA_FACTORY721_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_SOMNIA_FACTORY1155_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_SOMNIA_FACTORY1155_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_SOMNIA_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_SOMNIA_TRANSFER_PROXY_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_SOMNIA_TRADE_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_SOMNIA_TRADE_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
              <tr>
                <td colSpan={2}>NEXT_PUBLIC_SOMNIA_STAKING_CONTRACT_ADDRESS</td>
                <td>{process.env.NEXT_PUBLIC_SOMNIA_STAKING_CONTRACT_ADDRESS || "Not Set"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </Wrapper>
  );
};

export default Home;
