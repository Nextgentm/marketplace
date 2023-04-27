import Button from "@ui/button";
import NiceSelect from "@ui/nice-select";
import { useContext, useState } from "react";
import { AppData } from "src/context/app-context";

const PersonalInformation = () => {
  const { userData, setUserData } = useContext(AppData);
  const [userName, setUserName] = useState(userData?.username || userData?.fullName || "");
  const [email, setEmail] = useState(userData?.email);
  const [about, setAbout] = useState(userData?.about);
  const [gender, setGender] = useState(userData?.gender);
  const [role, setrole] = useState(userData?.role);
  const [currency, setcurrency] = useState(userData?.currency);
  const [mobileNumber, setmobileNumber] = useState(userData?.mobileNumber);
  const [address, setaddress] = useState(userData?.address || "");
  const [location, setlocation] = useState(userData?.location || "");

  return (
    <div className="nuron-information">
      <div className="profile-form-wrapper">
        <div className="input-two-wrapper mb--15">
          {/* <div className="first-name half-wid">
          <label htmlFor="contact-name" className="form-label">
            First Name
          </label>
          <input name="contact-name" id="contact-name" type="text" value="Mr." onChange={(e) => e} />
        </div> */}
          <div className="last-name half-wid">
            <label htmlFor="contact-name-last" className="form-label">
              User Name
            </label>
            <input
              name="contact-name"
              id="contact-name-last"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e?.target?.value)}
            />
          </div>
        </div>
        <div className="email-area">
          <label htmlFor="Email" className="form-label">
            Edit Your Email
          </label>
          <input name="email" id="Email" type="email" value={email} onChange={(e) => setEmail(e?.target?.value)} />
        </div>
      </div>
      <div className="edit-bio-area mt--30">
        <label htmlFor="Discription" className="form-label">
          Edit Your Bio
        </label>
        <textarea
          id="Discription"
          value={about}
          onChange={(e) => setAbout(e?.target?.value)}
          placeholder="Hello, I am Alamin, A Front-end Developer..."
        />
      </div>
      {/* 
      <div className="input-two-wrapper mt--15">
        <div className="half-wid role-area">
          <label htmlFor="Role" className="form-label mb--10">
            Your Role
          </label>
          <input
            name="Role"
            id="Role"
            type="text"
            value={role}
            onChange={(e) => {
              setrole(e?.target?.value);
            }}
          />
        </div>
        <div className="half-wid gender">
          <NiceSelect
            options={[
              { value: "male", text: "male" },
              { value: "female", text: "female" }
            ]}
            placeholder="Select Your Gender"
            className="profile-edit-select"
            onChange={(e) => setGender(e?.target?.value)}
            value={gender}
          />
        </div>
      </div> */}

      <div className="input-two-wrapper mt--15">
        {/* <div className="half-wid currency">
          <NiceSelect
            options={[
              { value: "($)USD", text: "($)USD" },
              { value: "wETH", text: "wETH" },
              { value: "BIT Coin", text: "BIT Coin" }
            ]}
            placeholder="Currency"
            className="profile-edit-select"
            onChange={(e) => setcurrency(e?.target?.value)}
            value={currency}
          />
        </div> */}
        <div className="half-wid phone-number">
          <label htmlFor="PhoneNumber" className="form-label mb--10">
            Phone Number
          </label>
          <input
            name="contact-name"
            id="PhoneNumber"
            type="number"
            value={mobileNumber}
            onChange={(e) => setmobileNumber(e?.target?.value)}
          />
        </div>
      </div>
      {/* <div className="input-two-wrapper mt--15">
        <div className="half-wid currency">
          <NiceSelect
            options={[
              { value: "United State", text: "United State" },
              { value: "Katar", text: "Katar" },
              { value: "Canada", text: "Canada" }
            ]}
            placeholder="Location"
            className="profile-edit-select"
            value={location}
            onChange={(e) => setlocation(e?.target?.value)}
          />
        </div>
        <div className="half-wid phone-number">
          <label htmlFor="PhoneNumber" className="form-label mb--10">
            Address
          </label>
          <input
            name="contact-name"
            id="address"
            type="text"
            value={address}
            onChange={(e) => setaddress(e?.target?.value)}
          />
        </div>
      </div> */}
      <div className="button-area save-btn-edit">
        <Button className="mr--15" color="primary-alta" size="medium">
          Cancel
        </Button>
        <Button size="medium">Save</Button>
      </div>
    </div>
  );
};

export default PersonalInformation;
