import PropTypes from "prop-types";
import clsx from "clsx";
import TopSeller from "@components/top-seller/layout-01";
import { ImageType } from "@utils/types";

const ProductCategory = ({ className, owner, royalty }) => (
    <div className={clsx("catagory", className)}>
        <span>
            Catagory{" "}
            {royalty && (
                <span className="color-body">{royalty}% royalties</span>
            )}
        </span>
        <TopSeller
            name={owner.data?.category}
            slug={owner.data?.slug}
            image={{
                src: "/images/client/client-1.png",
                width: 44,
                height: 44,
            }}
        />
    </div>
);

ProductCategory.propTypes = {
    className: PropTypes.string,
    owner: PropTypes.shape({
        name: PropTypes.string,
        slug: PropTypes.string,
        image: ImageType,
    }),
    royalty: PropTypes.string,
};

export default ProductCategory;
