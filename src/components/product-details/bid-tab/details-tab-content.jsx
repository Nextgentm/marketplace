import PropTypes from "prop-types";
import TopSeller from "@components/top-seller/layout-01";
import { IDType, ImageType } from "@utils/types";

const getContractAddress = (product) => {
  const contractAddress = product.collection.data.collectionType == "Single" ? product.collection.data.contractAddress : product.collection.data.contractAddress1155;
  let url;
  if (product.collection.data.networkType == "Polygon") {
    url = "https://polygonscan.com/address/" + contractAddress;
  } else if (product.collection.data.networkType == "Ethereum") {
    url = "https://etherscan.io/address/" + contractAddress;
  } else if (product.collection.data.networkType == "Binance") {
    url = "https://bscscan.com/address/" + contractAddress;
  }
  return url;
}

const DetailsTabContent = ({ owner, properties, tags, supply, erc1155MyBalance, product }) => (
  <div className="rn-pd-bd-wrapper mt--20">
    {/* <TopSeller name={owner.name} total_sale={owner.total_sale} slug={owner.slug} image={owner.image} /> */}
    <div className="row">
      <div className="lable">
        Contract Address:
        <span>
          <a href={getContractAddress(product)}>
            {product.collection.data.collectionType == "Single" ? product.collection.data.contractAddress : product.collection.data.contractAddress1155}
          </a>
        </span>
      </div>
      <div className="lable">Token ID <span>{product.nftID}</span></div>
      <div className="lable">Token Standard <span>{product.collection.data.collectionType == "Single" ? "ERC-721" : "ERC-1155"}</span></div>
      <div className="lable">Chain <span>{product.collection.data.networkType}</span></div>
      {supply < 1 && <div className="lable">NFT Owner <span>{owner}</span></div>}
      {erc1155MyBalance > 0 && <div className="lable">Your Balance <span>{erc1155MyBalance}</span></div>}
      <div className="lable">Total Supply <span>{supply}</span></div>
    </div>
    {
      properties && properties?.length > 0 && (
        <div className="rn-pd-sm-property-wrapper">
          <h6 className="pd-property-title">Property</h6>
          <div className="property-wrapper">
            {properties.map((property) => (
              <div key={property.id} className="pd-property-inner">
                <span className="color-body type">{property.name}</span>
                <span className="color-white value">{property.type}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    {
      tags && (
        <div className="rn-pd-sm-property-wrapper">
          <h6 className="pd-property-title">Tags</h6>
          <div className="catagory-wrapper">
            {tags.map((tag) => (
              <div key={tag.id} className="pd-property-inner">
                <span className="color-body type">{tag.type}</span>
                <span className="color-white value">{tag.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  </div >
);

DetailsTabContent.propTypes = {
  owner: PropTypes.string,
  // owner: PropTypes.shape({
  //   name: PropTypes.string,
  //   total_sale: PropTypes.number,
  //   slug: PropTypes.string,
  //   image: ImageType
  // }),
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      id: IDType,
      type: PropTypes.string,
      value: PropTypes.string
    })
  ),
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: IDType,
      type: PropTypes.string,
      value: PropTypes.string
    })
  )
};

export default DetailsTabContent;
