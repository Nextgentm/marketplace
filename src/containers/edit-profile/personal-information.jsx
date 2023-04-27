import { useMutation } from "@apollo/client";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import { normalize } from "@utils/methods";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AppData } from "src/context/app-context";
import { UPDATE_USER_PROFILE } from "src/graphql/mutation/userProfile/updateUserProfile";

const PersonalInformation = () => {
  const { userData, setUserDataLocal } = useContext(AppData);
  const [updateUserProfile, { data: updatedUserProfile }] = useMutation(UPDATE_USER_PROFILE);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    mode: "onChange"
  });

  useEffect(() => {
    setValue("fullName", userData?.fullName);
    setValue("about", userData?.about);
    setValue("mobileNumber", userData?.mobileNumber);
  }, [userData]);

  useEffect(() => {
    if (updatedUserProfile) {
      setUserDataLocal(normalize(updatedUserProfile).updateUsersPermissionsUser);
      toast.success("Profile data updated successfully");
    }
  }, [updatedUserProfile]);

  const onSubmit = (data) => {
    updateUserProfile({
      variables: {
        updateUsersPermissionsUserId: userData.id,
        data
      }
    });
  };
  return (
    <div className="nuron-information">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="profile-form-wrapper">
          <div className="input-wrapper mb--12">
            <label htmlFor="Email" className="form-label">
              Your Email
            </label>
            <input name="email" id="Email" type="email" value={userData?.email} readOnly />
          </div>

          <div className="last-name half-wid pt--14">
            <label htmlFor="fullName" className="form-label">
              Edit your Full name
            </label>
            <input name="fullName" id="fullName" type="text" {...register("fullName")} />
          </div>
          {errors.fullName && <ErrorText>{errors.fullName?.message}</ErrorText>}
        </div>
        <div className="edit-bio-area mt--30">
          <label htmlFor="about" className="form-label">
            Edit Your Bio
          </label>
          <textarea id="about" {...register("about")} placeholder="Hello, I am Alamin, I love Metamask..." />
        </div>

        <div className="input-two-wrapper mt--15">
          <div className="half-wid phone-number">
            <label htmlFor="mobileNumber" className="form-label mb--10">
              Phone Number
            </label>
            <input name="contact-name" id="mobileNumber" type="number" {...register("mobileNumber")} />
          </div>
        </div>

        <div className="button-area save-btn-edit">
          <Button className="mr--15" color="primary-alta" size="medium">
            Cancel
          </Button>
          <Button type="submit" size="medium">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInformation;
