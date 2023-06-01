import SEO from "@components/seo";
import Wrapper from "@layout/wrapper";
import Header from "@layout/header/header";
import Footer from "@layout/footer/footer-01";
import {
  ETHEREUM_NETWORK_CHAIN_ID,
  POLYGON_NETWORK_CHAIN_ID,
  DEFAULT_NETWORK,
  NETWORKS_CHAINS,
  BINANCE_NETWORK_CHAIN_ID
} from "../lib/constants";

export async function getStaticProps() {
  return { props: { className: "template-color-1" } };
}

const Home = () => (
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
              <td>{NETWORKS_CHAINS[ETHEREUM_NETWORK_CHAIN_ID].chainName}</td>
            </tr>
            <tr>
              <td>POLYGON_NETWORK_CHAIN_ID</td>
              <td>{POLYGON_NETWORK_CHAIN_ID}</td>
              <td>{NETWORKS_CHAINS[POLYGON_NETWORK_CHAIN_ID].chainName}</td>
            </tr>
            <tr>
              <td>BINANCE_NETWORK_CHAIN_ID</td>
              <td>{BINANCE_NETWORK_CHAIN_ID}</td>
              <td>{NETWORKS_CHAINS[BINANCE_NETWORK_CHAIN_ID].chainName}</td>
            </tr>

            <tr>
              <td colSpan={3}><br /></td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_POLYGON_FACTORY721_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_POLYGON_FACTORY1155_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_POLYGON_TRANSFER_PROXY_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_POLYGON_TRADE_CONTRACT_ADDRESS}</td>
            </tr>

            <tr>
              <td colSpan={3}><br /></td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_BINANCE_FACTORY721_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_BINANCE_FACTORY1155_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_BINANCE_TRANSFER_PROXY_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_BINANCE_TRADE_CONTRACT_ADDRESS}</td>
            </tr>

            <tr>
              <td colSpan={3}><br /></td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_ETHEREUM_FACTORY721_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_ETHEREUM_FACTORY1155_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_ETHEREUM_TRANSFER_PROXY_CONTRACT_ADDRESS}</td>
            </tr>
            <tr>
              <td colSpan={2}>NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS</td>
              <td>{process.env.NEXT_PUBLIC_ETHEREUM_TRADE_CONTRACT_ADDRESS}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    <Footer />
  </Wrapper>
);

export default Home;
