import PropTypes from "prop-types";
import clsx from "clsx";
import SectionTitle from "@components/section-title/layout-02";
import Anchor from "@ui/anchor";
import Collection from "@components/collection";
import { SectionTitleType, CollectionType } from "@utils/types";
import { useEffect, useState } from "react";
import { getCollection } from "src/services/collections/collection";

const TopCollectionArea = ({ className, id, space, data }) => {

  const [collections, setCollections] = useState([]);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    getAllCollections();
  }, [])

  const getAllCollections = async () => {
    const dataCollection = await getCollection({
      filters: {
        collectibles: {
          auction: {
            status: {
              $eq: "Live"
            }
          }
        }
      },
      sort: ["priority:asc"],
      populate: {
        collectibles: {
          fields: "*",
          filters: {
            auction: {
              status: "Live",
              id: { $notNull: true }
            }
          },
          populate: {
            auction: {
              fields: "*",
              filters: {
                status: "Live",
                id: { $notNull: true }
              }
            }
          }
        },
        cover: {
          fields: "*"
        },
        logo: {
          fields: "*"
        }
      },
      pagination: {
        limit: 25,
        start: 0,
        withCount: true
      }
    });
    console.log(dataCollection);
    setCollections(dataCollection.data);
  };

  const viewAllCollections = () => {
    if (viewAll) {
      setViewAll(false);
    } else {
      setViewAll(true);
    }
  };

  return (
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
                <Anchor className="btn-transparent" path="javascript:void(0);" onClick={() => viewAllCollections()}>
                  {viewAll ? "SHOW LESS" : "VIEW ALL"}
                </Anchor>
              )}
            </div>
          </div>
        </div>

        {data?.collections.length > 0 ?
          <div className="row g-5">
            {viewAll ?
              collections.map((collection, index) => (
                <div
                  key={index}
                  data-sal-delay="150"
                  data-sal-duration="800"
                  className="col-lg-4 col-xl-3 col-md-6 col-sm-6 col-12"
                >
                  <Collection
                    title={collection.name}
                    total_item={collection?.collectibles?.data?.length}
                    path={`collection/${collection?.slug}`}
                    image={collection.cover?.data}
                    thumbnails={collection.featured?.data}
                    profile_image={collection.logo?.data}
                  />
                </div>
              ))
              : data?.collections?.length > 5 ?
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
                      path={`collection/${collection?.slug}`}
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
                      path={`collection/${collection?.slug}`}
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
  )
};

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
