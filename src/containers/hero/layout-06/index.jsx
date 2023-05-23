import PropTypes from "prop-types";
import Button from "@ui/button";
import Slider, { SliderItem } from "@ui/slider";
import Image from "next/image";
import { ButtonType, IDType, ImageType } from "@utils/types";

const SliderOptions = {
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false,
  arrows: true
};

const HeroArea = ({ data }) => (
  <div className="rn-banner-area rn-section-gapTop rn-banner-section-gapTop">
    <div className="rn-slider-area fullscreen-slide">
      {data?.banners && (
        <Slider
          options={SliderOptions}
          className="slider-style-6 no-padding wide-wrapper slick-activation-06 slick-arrow-between desktop-slider"
        >
          <SliderItem key="1">
            <video style={{ "width": "100%" }} controls autoPlay muted loop controlsList="nofullscreen nodownload noremoteplayback noplaybackrate foobar" poster="/images/bg/NFTPosterImage-min.png">
              <source
                src="/images/bg/NftMarketplace_Banner.mp4"
                type="video/mp4"
              />
            </video>
          </SliderItem>

          {/*data.banners.map((banner) => (
            <SliderItem key={banner.id}>
              <div className="slide">
                {banner.image?.src && (
                  <Image
                    src={banner.image.src}
                    alt="Slider BG"
                    quality={100}
                    priority
                    fill
                    sizes="100vw"
                    style={{
                      objectFit: "cover"
                    }}



                <div className="banner-read-thumb-lg">
                  {/* <h4
                                        dangerouslySetInnerHTML={{
                                            __html: banner?.title,
                                        }}
                                    />
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: banner?.description,
                                        }}
                                    /> */}
          {/* banner?.buttons && (
                                        <div className="button-group">
                                            {banner.buttons.map(
                                                (
                                                    { id, content, ...btn },
                                                    i
                                                ) => (
                                                    <Button
                                                        key={id}
                                                        data-sal="slide-up"
                                                        data-sal-delay="300"
                                                        data-sal-duration="800"
                                                        {...btn}
                                                        className={
                                                            i === 0
                                                                ? "mr--15"
                                                                : ""
                                                        }
                                                    >
                                                        {content}
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                                    ) }
                </div>
              </div>
            </SliderItem>
          ))*/}
        </Slider>
      )}
      {data?.banners && (
        <Slider
          options={SliderOptions}
          className="slider-style-6 wide-wrapper slick-activation-06 slick-arrow-between mobile-slider"
        >
          <SliderItem key="1">
            <video style={{ "width": "100%" }} controls autoPlay muted loop controlsList="nofullscreen nodownload noremoteplayback noplaybackrate foobar" poster="/images/bg/NFTPosterImage-min.png">
              <source
                src="/images/bg/NftMarketplace_Banner.mp4"
                type="video/mp4"
              />
            </video>
          </SliderItem>
          {/*data.banners.map((banner) => (
            <SliderItem key={banner.id}>
              <div className="slide">
                {banner.mobile?.src && (
                  <Image
                    src={banner.mobile.src}
                    alt="Slider BG"
                    quality={100}
                    priority
                    width="600"
                    height="700"
                    style={{
                      objectFit: "cover"
                    }}
                  />
                )}
              </div>
            </SliderItem>
                  ))*/}
        </Slider>
      )}
    </div>
  </div >
);

HeroArea.propTypes = {
  data: PropTypes.shape({
    banners: PropTypes.arrayOf(
      PropTypes.shape({
        id: IDType,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        buttons: PropTypes.arrayOf(ButtonType),
        image: ImageType
      })
    )
  })
};

export default HeroArea;
