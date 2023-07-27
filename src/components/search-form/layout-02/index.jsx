import PropTypes from "prop-types";
import clsx from "clsx";
import { useRouter } from "next/router";

const SearchForm = ({ isOpen }) => {

  const router = useRouter();

  const handleSubmitSearch = async (event) => {
    event.preventDefault();
    try {
      // console.log(event.target.search.value);
      if (event.target.search.value) {
        router.push({
          pathname: "/collectibles",
          query: {
            search: event.target.search.value
          },
        });
      } else {
        router.push("/collectibles");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form id="header-search-1" onSubmit={handleSubmitSearch} className={clsx("large-mobile-blog-search", isOpen && "active")}>
      <div className="rn-search-mobile form-group">
        <button type="submit" className="search-button">
          <i className="feather-search" />
        </button>
        <input type="text" id="search" placeholder="Search ..." />
      </div>
    </form>
  )
};

SearchForm.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default SearchForm;
