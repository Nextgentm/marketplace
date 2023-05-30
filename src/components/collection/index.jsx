import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import Image from "next/image";
import dynamic from "next/dynamic";


const CollectionOptionDropdown = dynamic(() => import("@components/collection-option-dropdown"), {
  ssr: false
});

const Collection = ({ title, total_item, image, thumbnails, profile_image, path, dropdownOption, slug }) => (
  <div className="rn-collection-inner-one">
    <div className="collection-wrapper">
      <Anchor target="_self" path={path}>
        {image?.url && (
          <div className="collection-big-thumbnail">
            <Image src={image.url} alt={image?.alt || "Nft_Profile"} width={507} height={339} />
          </div>
        )}

        {thumbnails && (
          <div className="collection-small-thumbnail">
            {thumbnails.data?.map((thumb) => (
              <div key={thumb?.src}>
                <Image src={thumbnails?.url} alt={thumbnails?.alt || "Nft_Profile"} width={164} height={110} />
              </div>
            ))}
          </div>
        )}

        {profile_image?.url && (
          <div className="collection-profile">
            <Image src={profile_image.url} alt={profile_image?.alt || "Nft_Profile"} width={70} height={70} />
          </div>
        )}

        <div className="collection-deg">
          <h6 className="title">{title}</h6>
          <span className="items">{total_item} items</span>
        </div>
      </Anchor>
      {dropdownOption && <CollectionOptionDropdown slug={slug} />}
    </div>
  </div>
);

Collection.propTypes = {
  title: PropTypes.string.isRequired,
  total_item: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  image: PropTypes.shape({
    url: PropTypes.string,
    src: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]),
    alt: PropTypes.string
  }).isRequired,
  thumbnails: PropTypes.shape({
    src: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]),
    alt: PropTypes.string
  }).isRequired,
  // PropTypes.arrayOf( ),
  profile_image: PropTypes.shape({
    src: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string]),
    alt: PropTypes.string
  }).isRequired
};

export default Collection;
