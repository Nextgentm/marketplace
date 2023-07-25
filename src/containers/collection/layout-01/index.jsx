import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-02";
import Anchor from "@ui/anchor";
import Collection from "@components/collection";
import { SectionTitleType, CollectionType } from "@utils/types";

const TopCollectionArea = ({ className, id, space, data }) => (
  <div className={clsx("rn-collection-area", space === 1 && "rn-section-gapTop", className)} id={id}>
    <div className="container">
      <div className="row mb--50 align-items-center">
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          {data?.section_title && <SectionTitle className="mb--0" disableAnimation={true} {...data.section_title} />}
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt_mobile--15">
          <div
            className="view-more-btn text-start text-sm-end"
            data-sal-delay="150"
            data-sal="slide-up"
            data-sal-duration="800"
          >
            {data.collections?.length > 4 && (
              <Anchor className="btn-transparent" path="/collection">
                VIEW ALL
                <i className="feather feather-arrow-right" />
              </Anchor>
            )}
          </div>
        </div>
      </div>

      {data?.collections.length > 0 ?
        <div className="row g-5">
          {data?.collections?.length > 5 ?
            data.collections?.slice(0, 4).map((collection, index) => (
              <div
                key={index}
                data-sal-delay="150"
                data-sal-duration="800"
                className="col-lg-4 col-xl-3 col-md-6 col-sm-6 col-12"
              >
                <Collection
                  title={collection.name}
                  total_item={collection?.collectibles?.data?.length}
                  path={`collectibles?collection=${collection?.slug}`}
                  image={collection.cover?.data}
                  thumbnails={collection.featured?.data}
                  profile_image={collection.logo?.data}
                />
              </div>
            ))
            :
            data.collections.map((collection, index) => (
              <div
                key={index}
                data-sal-delay="150"
                data-sal-duration="800"
                className="col-lg-4 col-xl-3 col-md-6 col-sm-6 col-12"
              >
                <Collection
                  title={collection.name}
                  total_item={collection?.collectibles?.data?.length}
                  path={`collectibles?collection=${collection?.slug}`}
                  image={collection.cover?.data}
                  thumbnails={collection.featured?.data}
                  profile_image={collection.logo?.data}
                />
              </div>
            ))
          }
        </div>
        : <p>No collections to show</p>}
    </div>
  </div>
);

TopCollectionArea.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  space: PropTypes.oneOf([1, 2]),
  data: PropTypes.shape({
    section_title: SectionTitleType,
    collections: PropTypes.arrayOf(
      PropTypes.shape({
        __typename: PropTypes.string,
        attributes: CollectionType
      })
    ).isRequired
  })
};
TopCollectionArea.defaultProps = {
  space: 1
};

export default TopCollectionArea;
