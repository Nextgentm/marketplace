import PropTypes from "prop-types";
import clsx from "clsx";
import Image from "next/image";
import Button from "@ui/button";
import Link from "next/link";

const UploadVariants = ({ className, space, pageType }) => (
    <div
        className={clsx(
            "rn-upload-variant-area varient",
            space === 1 && "rn-section-gap",
            className
        )}
    >
        <div className="container">
            <div className="row">
                <div className="upload-variant-title-wrapper">
                    <h3 className="title text-center">
                        Upload {pageType === "create" ? "NFT" : "Collection"}{" "}
                        Variants
                    </h3>
                    <p className="text-center">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit. Ducimus inventore, officiis. Alias aspernatur
                        laboriosam ratione! Doloremque ipsa nesciunt sed!
                    </p>
                </div>
            </div>
            <div className="row g-5 mt--40">
                <div className="offset-lg-1 col-lg-3 col-md-6 col-12">
                    <div className="upload-variant-wrapper">
                        <div className="variant-preview">
                            <Image
                                src="/images/upload-variants/Single.png"
                                alt="nuron-single"
                                width={495}
                                height={417}
                                priority
                            />
                        </div>
                        <Link href={`${pageType}?type=single`}>
                            <Button
                                size="medium"
                                fullwidth
                                className="mt--20"
                                target=""
                            >
                                Create Single
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6 col-12">
                    <div className="upload-variant-wrapper">
                        <div className="variant-preview">
                            <Image
                                src="/images/upload-variants/Multiple.png"
                                alt="nuron-single"
                                width={495}
                                height={417}
                                priority
                            />
                        </div>
                        <Link href={`${pageType}?type=multiple`}>
                            <Button
                                size="medium"
                                fullwidth
                                className="mt--20"
                                target=""
                            >
                                Create Multiple
                            </Button>
                        </Link>
                    </div>
                </div>
                {pageType !== "create" && (
                    <div className="col-lg-3 col-md-6 col-12">
                        <div className="upload-variant-wrapper">
                            <div className="variant-preview">
                                <Image
                                    src="/images/upload-variants/Hybrid.png"
                                    alt="nuron-single"
                                    width={495}
                                    height={417}
                                    priority
                                />
                            </div>
                            <Link href={`${pageType}?type=hybrid`}>
                                <Button
                                    size="medium"
                                    fullwidth
                                    className="mt--20"
                                    target=""
                                >
                                    Create Hybrid
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

UploadVariants.propTypes = {
    className: PropTypes.string,
    space: PropTypes.oneOf([1]),
    pageType: PropTypes.string,
};

UploadVariants.defaultProps = {
    space: 1,
};

export default UploadVariants;
