import PropTypes from "prop-types";
import clsx from "clsx";
import TopSeller from "@components/top-seller/layout-01";
import { ImageType } from "@utils/types";
import { useState, useEffect } from "react";
import axios from "axios";

const ProductCollection = ({ className, collection }) => {
  const [collectionImage, setCollectionImage] = useState(null);
  useEffect(() => {
    if (collection.data?.logoID) {
      axios
        .get(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/${collection.data?.logoID}`)
        .then((response) => {
          setCollectionImage(response.data);
        });
    }
  }, []);
  return (
    <div className={clsx("collection", className)}>
      <span>Collections</span>
      <TopSeller
        name={collection.data?.name}
        slug={"/collectibles?collection=" + collection.data?.name}
        image={{ src: collectionImage?.url, width: 44, height: 44 }}
      />
    </div>
  );
};
ProductCollection.propTypes = {
  className: PropTypes.string,
  collection: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    image: ImageType
  })
};

export default ProductCollection;
