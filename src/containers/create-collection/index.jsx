import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import CollectionModal from "@components/modals/collection-modal";
import ImageUpload from "@ui/image-upload";
import NiceSelect from "@ui/nice-select";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { isEmpty } from "@utils/methods";
import axios from "axios";

const CreateCollectionArea = () => {
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [category, setCategory] = useState("");
    const [hasCatError, setHasCatError] = useState(false);
    const [previewData, setPreviewData] = useState({});

    const categoryHandler = (item) => {
        setCategory(item.value);
    };
    const notify = () => toast("Your collection has submitted");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        watch,
    } = useForm({
        mode: "onChange",
    });

    watch(["logoImg", "featImg", "bannerImg"]);

    async function updateImage(e) {
        const formData = new FormData();
        formData.append("files", getValues(e)?.[0]);
        const resp =  await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
            method: 'post',
            body: formData
        })
        .then((response) => response.json())
        .then( (data)=>{
            console.log(data[0]?.id);
            if(data[0]?.id){
                const old_id = localStorage.getItem('nft_id');
                if(old_id){
                    const resp =  fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/:`+old_id, {
                        method: 'delete',
                    });    
                }
                localStorage.setItem('nft_id', data[0]?.id);
                localStorage.setItem('nft_url', data[0]?.url);
            }  
        }).catch(()=>{
        //Promise Failed, Do something
        });
                
    }

    async function updateImage2(e) {
        const formData = new FormData();
        formData.append("files", getValues(e)?.[0]);
        const resp =  await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
            method: 'post',
            body: formData
        })
        .then((response) => response.json())
        .then( (data)=>{
            console.log(data[0]?.id);
            if(data[0]?.id){
                const old_id = localStorage.getItem('nft_id_2');
                if(old_id){
                    const resp =  fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/:`+old_id, {
                        method: 'delete',
                    });    
                }
                localStorage.setItem('nft_id_2', data[0]?.id);
                localStorage.setItem('nft_url_2', data[0]?.url);
            }  
        }).catch(()=>{
        //Promise Failed, Do something
        });
                
    }

    async function updateImage3(e) {
        const formData = new FormData();
        formData.append("files", getValues(e)?.[0]);
        const resp =  await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
            method: 'post',
            body: formData
        })
        .then((response) => response.json())
        .then( (data)=>{
            console.log(data[0]?.id);
            if(data[0]?.id){
                const old_id = localStorage.getItem('nft_id_3');
                if(old_id){
                    const resp =  fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload/files/:`+old_id, {
                        method: 'delete',
                    });    
                }
                localStorage.setItem('nft_id_3', data[0]?.id);
                localStorage.setItem('nft_url_3', data[0]?.url);
            }  
        }).catch(()=>{
        //Promise Failed, Do something
        });
                
    }

    async function StoreData(data) {
        console.log(data);
        try {                    
            const nft_id = localStorage.getItem('nft_id');
            const nft_url = localStorage.getItem('nft_url');
            
            const nft_id_2 = localStorage.getItem('nft_id_2');
            const nft_url_2 = localStorage.getItem('nft_url_2');

            const nft_id_3 = localStorage.getItem('nft_id_3');
            const nft_url_3 = localStorage.getItem('nft_url_3');

            const resp = await axios.post(
                `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/collections`,
                {
                    data:{
                        name: data.title ? data.title : null,
                        logo: nft_url ? nft_url : 'Null',
                        logoID: Number(nft_id),
                        cover: nft_url_3 ? nft_url_3 : 'Null',
                        coverID: Number(nft_id_3),
                        featured: nft_url_2 ? nft_url_2 : 'Null',
                        symbol: Number(nft_id_2),
                        url: data.url ? data.url : null,
                        description: data.description ? data.description : null,
                        category: category,
                        slug: data.title.toLowerCase(),                       
                        creatorEarning: data.earning ? Number(data.earning) : null,
                        contractAddress: data.wallet ? data.wallet : null,
                        payoutWalletAddress: data.wallet ? data.wallet : null,
                        explicitAndSensitiveContent: data.themeSwitch,
                    }
                }
            );           
            console.log(resp);    
        } catch (error) {
            console.log(error);
        }
        
    }

    const onSubmit = (data, e) => {
        
        const { target } = e;
        const submitBtn =
            target.localName === "span" ? target.parentElement : target;
        const isPreviewBtn = submitBtn.dataset?.btn;
        setHasCatError(!category);

        if (isPreviewBtn) {
            setPreviewData({ ...data, image: data.logoImg[0] });
            setShowPreviewModal(true);
        }
        if (!isPreviewBtn) {
            StoreData(data);
            notify();
            reset();
        }
    };

    return (
        <>
            <div className="creat-collection-area pt--80">
                <div className="container">
                    <form className="row g-5" encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
                        <div className="col-lg-3 offset-1 ml_md--0 ml_sm--0">
                            <div className="collection-single-wized banner">
                                <label
                                    htmlFor="logoImg"
                                    className="title required"
                                >
                                    Logo image
                                </label>
                               

                                <ImageUpload
                                    className="logo-image"
                                    id="logoImg"
                                    placeholder={{
                                        src: "/images/profile/profile-01.jpg",
                                        width: 277,
                                        height: 277,
                                    }}
                                    preview={getValues("logoImg")?.[0]}
                                    {...register("logoImg", {
                                        required: "Upload logo image",
                                        onChange: (e) => {updateImage('logoImg')},
                                    })}
                                    
                                />

                                {errors.logoImg && (
                                    <ErrorText>
                                        {errors.logoImg?.message}
                                    </ErrorText>
                                )}
                            </div>

                            <div className="collection-single-wized banner">
                                <label htmlFor="featImg" className="title">
                                    Cover Image
                                </label>
                                <ImageUpload
                                    className="feature-image"
                                    id="featImg"
                                    placeholder={{
                                        src: "/images/profile/cover-04.png",
                                        width: 277,
                                        height: 138,
                                    }}
                                    preview={getValues("featImg")?.[0]}
                                    {...register("featImg",{
                                        onChange: (e) => {updateImage2('featImg')}
                                    })}
                                />
                                {errors.featImg && (
                                    <ErrorText>
                                        {errors.featImg?.message}
                                    </ErrorText>
                                )}
                            </div>

                            <div className="collection-single-wized banner">
                                <label htmlFor="bannerImg" className="title">
                                    Featured image
                                </label>
                                <ImageUpload
                                    className="banner-image"
                                    id="bannerImg"
                                    placeholder={{
                                        src: "/images/profile/cover-03.jpg",
                                        width: 277,
                                        height: 60,
                                    }}
                                    preview={getValues("bannerImg")?.[0]}
                                    {...register("bannerImg", {
                                        onChange: (e) => {updateImage3('bannerImg')}
                                    })}
                                />
                                {errors.bannerImg && (
                                    <ErrorText>
                                        {errors.bannerImg?.message}
                                    </ErrorText>
                                )}
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="create-collection-form-wrapper">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="title"
                                                className="title required"
                                            >
                                                Name
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    className="name"
                                                    type="text"
                                                    id="name"
                                                    {...register("title", {
                                                        required:
                                                            "title is required",
                                                    })}
                                                />
                                                {errors.title && (
                                                    <ErrorText>
                                                        {errors.title?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="url"
                                                className="title"
                                            >
                                                URL
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    className="url"
                                                    type="text"
                                                    id="url"
                                                    {...register("url")}
                                                />
                                                {errors.url && (
                                                    <ErrorText>
                                                        {errors.url?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="category"
                                                className="title required"
                                            >
                                                Category
                                            </label>
                                            <div className="create-collection-input">
                                                <NiceSelect
                                                    name="category"
                                                    placeholder="Add Category"
                                                    options={[
                                                        {
                                                            value: "Art",
                                                            text: "Art",
                                                        },
                                                        {
                                                            value: "Domain Names",
                                                            text: "Domain Names",
                                                        },
                                                        {
                                                            value: "Memberships",
                                                            text: "Memberships",
                                                        },
                                                        {
                                                            value: "Music",
                                                            text: "Music",
                                                        },
                                                        {
                                                            value: "PFPs",
                                                            text: "PFPs",
                                                        },
                                                        {
                                                            value: "Photography",
                                                            text: "Photography",
                                                        },
                                                        {
                                                            value: "Sports Collectibles",
                                                            text: "Sports Collectibles",
                                                        },
                                                        {
                                                            value: "Virtual World",
                                                            text: "Virtual World",
                                                        },
                                                        {
                                                            value: "No category",
                                                            text: "No category",
                                                        },
                                                    ]}
                                                    onChange={categoryHandler}
                                                />
                                                {((!category &&
                                                    !isEmpty(errors)) ||
                                                    hasCatError) && (
                                                    <ErrorText>
                                                        Select a category
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="category"
                                                className="title required"
                                            >
                                                Blockchain
                                            </label>
                                            <div className="create-collection-input">
                                                <NiceSelect
                                                    name="blockchain"
                                                    placeholder="Add Blockchain"
                                                    options={[
                                                        {
                                                            value: "Ethereum",
                                                            text: "Ethereum",
                                                        },
                                                        {
                                                            value: "Polygon",
                                                            text: "Polygon",
                                                        }
                                                    ]}
                                                    onChange={categoryHandler}
                                                />
                                                {((!category &&
                                                    !isEmpty(errors)) ||
                                                    hasCatError) && (
                                                    <ErrorText>
                                                        Select a category
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="description"
                                                className="title"
                                            >
                                                Description
                                            </label>
                                            <div className="create-collection-input">
                                                <textarea
                                                    className="text-area"
                                                    {...register("description")}
                                                />
                                                {errors.description && (
                                                    <ErrorText>
                                                        {
                                                            errors.description
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="earning"
                                                className="title"
                                            >
                                                Creator Earnings
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    id="earning"
                                                    className="url"
                                                    type="text"
                                                    {...register("earning")}
                                                />
                                                {errors.earning && (
                                                    <ErrorText>
                                                        {
                                                            errors.earning
                                                                ?.message
                                                        }
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="collection-single-wized">
                                            <label
                                                htmlFor="wallet"
                                                className="title"
                                            >
                                                Your payout wallet address
                                            </label>
                                            <div className="create-collection-input">
                                                <input
                                                    id="wallet"
                                                    className="url"
                                                    type="text"
                                                    {...register("wallet")}
                                                />
                                                {errors.wallet && (
                                                    <ErrorText>
                                                        {errors.wallet?.message}
                                                    </ErrorText>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="nuron-information mb--30">
                                            <div className="single-notice-setting">
                                                <div className="input">
                                                    <input
                                                        type="checkbox"
                                                        id="themeSwitch"
                                                        name="theme-switch"
                                                        className="theme-switch__input"
                                                        {...register(
                                                            "themeSwitch"
                                                        )}
                                                    />
                                                    <label
                                                        htmlFor="themeSwitch"
                                                        className="theme-switch__label"
                                                    >
                                                        <span />
                                                    </label>
                                                </div>
                                                <div className="content-text">
                                                    <p>
                                                        Explicit &amp; sensitive
                                                        content
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="button-wrapper">
                                            <Button
                                                className="mr--30"
                                                type="submit"
                                                data-btn="preview"
                                                //onClick={handleSubmit(onSubmit)}
                                            >
                                                Preview
                                            </Button>
                                            <Button
                                                type="submit"
                                                color="primary-alta"
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {showPreviewModal && (
                <CollectionModal
                    show={showPreviewModal}
                    handleModal={() => setShowPreviewModal(false)}
                    data={previewData}
                />
            )}
        </>
    );
};

export default CreateCollectionArea;
