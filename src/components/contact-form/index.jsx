import { useState } from "react";
import Button from "@ui/button";
import ErrorText from "@ui/error-text";
import axios from "axios";
import { useForm } from "react-hook-form";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: "onChange"
  });
  const [serverState, setServerState] = useState({
    submitting: false,
    status: null
  });
  const handleServerResponse = (ok, msg, form) => {
    setServerState({
      submitting: false,
      status: { ok, msg }
    });
    if (ok) {
      form.reset();
    }
  };
  const onSubmit = (data, e) => {
    const form = e.target;
    setServerState({ submitting: true });
    data.toEmail = "support@lootmogul.com";//"mayureshkhemnar19@gmail.com";
    // console.log(data);
    axios({
      method: "post",
      url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/email-service`,
      data
    })
      .then((_res) => {
        handleServerResponse(true, "Thank you for reaching out to LootMogul!\n Our team will get back to you soon!", form);
      })
      .catch((err) => {
        handleServerResponse(false, err, form);
      });
  };
  return (
    <div className="form-wrapper-one registration-area">
      <h3 className="mb--30">Contact Us</h3>
      <form className="rwt-dynamic-form" id="contact-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="contact-name" className="form-label">
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            {...register("contactName", {
              required: "Name is required"
            })}
          />
          {errors.contactName && <ErrorText>{errors.contactName?.message}</ErrorText>}
        </div>
        <div className="mb-5">
          <label htmlFor="contact-email" className="form-label">
            Email
          </label>
          <input
            name="contact-email"
            type="email"
            {...register("contactEmail", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "invalid email address"
              }
            })}
          />
          {errors.contactEmail && <ErrorText>{errors.contactEmail?.message}</ErrorText>}
        </div>
        <div className="mb-5">
          <label htmlFor="subject" className="form-label">
            Subject
          </label>
          <input
            name="subject"
            type="text"
            {...register("subject", {
              required: "Subject is required"
            })}
          />
          {errors.subject && <ErrorText>{errors.subject?.message}</ErrorText>}
        </div>
        <div className="mb-5">
          <label htmlFor="contact-message" className="form-label">
            Write Message
          </label>
          <textarea
            id="contact-message"
            rows="3"
            {...register("contactMessage", {
              required: "Message is required"
            })}
          />
          {errors.contactMessage && <ErrorText>{errors.contactMessage?.message}</ErrorText>}
        </div>
        <Button type="submit" size="medium">
          Submit
        </Button>
        {serverState.status && (
          <>
            {serverState.status.msg.split("\n").map((i, key) => {
              return <p className={`mt-4 font-14 ${!serverState.status.ok ? "text-danger" : "text-success"}`} key={key}>{i}</p>;
            })}
          </>
        )}
      </form>
    </div>
  );
};
export default ContactForm;
