import PropTypes from "prop-types";

const NewsletterWidget = ({ data }) => (
  <div className="widget-bottom mt--10 pt--0 pb--20">
    <h6 className="title">{data.title}</h6>
    <div className="input-group">
      <input
        type="text"
        className="form-control bg-color--2"
        placeholder=""
        aria-label="Recipient's email"
        style={{ background: "#fff" }}
      />
      <div className="input-group-append">
        <button className="btn btn-primary-alta btn-outline-secondary" type="button" style={{ background: "#e90a63" }}>
          Subscribe
        </button>
      </div>
    </div>
    {/* {data?.note && (
      <div className="newsletter-dsc">
        <p>{data.note}</p>
      </div>
    )} */}
  </div>
);

NewsletterWidget.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    note: PropTypes.string
  })
};
export default NewsletterWidget;
