import { useRouter } from "next/router";

const SearchForm = () => {
  const router = useRouter();

  if (typeof window !== "undefined") {
    if (window?.location?.pathname == "/collectibles") {
      let searchdiv = document.getElementById("searchdiv");
      searchdiv.innerHTML = "";
      const i = document.createElement("i");
      i.classList.add("feather-search");
      searchdiv?.appendChild(i);
    }
  }

  const handleSubmitSearch = async (event) => {
    event.preventDefault();
    let searchdiv = document.getElementById("searchdiv");
    searchdiv.innerHTML = `<div class="spinner-border" role="status"> </div>`;
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
      <div className="search-icon" id="searchdiv">
        <button type="button">
          <i className="feather-search" />
        </button>
      </div>
    </form>
  )
};

export default SearchForm;
