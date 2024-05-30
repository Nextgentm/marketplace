import { useRouter } from "next/router";

const SearchForm = () => {
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
    <form className="search-form-wrapper" onSubmit={handleSubmitSearch}>
      <input type="search" id="search" placeholder="Search Here" aria-label="Search" />
      <div className="search-icon">
        <button type="button">
          <i className="feather-search" />
        </button>
      </div>
    </form>
  )
};

export default SearchForm;
