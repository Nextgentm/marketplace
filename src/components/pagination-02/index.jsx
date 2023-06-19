/* eslint-disable no-confusing-arrow */
import PropTypes from "prop-types";
import clsx from "clsx";

const Pagination = ({ className, currentPage, numberOfPages, onClick }) => {
  const isFirst = currentPage === 1;
  const isLast = currentPage === numberOfPages;
  const previousPage = currentPage - 1 === 0 ? currentPage : currentPage - 1;
  const nextPage = currentPage + 1;

  const paginationRange = getPaginationRange(currentPage, numberOfPages);

  function getPaginationRange(currentPage, numberOfPages) {
    const range = [];
    const rangeWithDots = [];

    const rangeLength = 5; // Length of the visible range (excluding dots)

    // Calculate the starting and ending page for the visible range
    let start = Math.max(1, currentPage - Math.floor(rangeLength / 2));
    let end = Math.min(numberOfPages, start + rangeLength - 1);

    // Adjust the starting and ending page if the visible range extends beyond the total pages
    start = Math.max(1, end - rangeLength + 1);

    // Generate the range array
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add dots if needed
    if (start > 1) {
      rangeWithDots.push(1);
      if (start > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(...range);
    if (end < numberOfPages) {
      if (end < numberOfPages - 1) {
        rangeWithDots.push("...");
      }
      rangeWithDots.push(numberOfPages);
    }

    return rangeWithDots;
  }

  return (
    <nav className={clsx("pagination-wrapper", className)} aria-label="Page navigation example">
      <ul className="pagination">
        {isFirst ? (
          <li className="page-item">
            <button type="button" className="disabled" onClick={() => onClick(previousPage)}>
              Previous
            </button>
          </li>
        ) : (
          <li className="page-item prev">
            <button type="button" onClick={() => onClick(previousPage)}>
              Previous
            </button>
          </li>
        )}
        {paginationRange.map((ele, i) =>
          "..." === ele ? (
            <li className="page-item" key={`page-number-${i + 1}`}>
              <button type="button" className="disabled">
                {ele}
              </button>
            </li>
          ) :
            currentPage === ele ? (
              <li className="page-item" key={`page-number-${i + 1}`}>
                <button type="button" className="active" onClick={() => onClick(ele)}>
                  {ele}
                </button>
              </li>
            ) : (
              <li className="page-item" key={`page-number-${i + 1}`}>
                <button type="button" onClick={() => onClick(ele)}>
                  {ele}
                </button>
              </li>
            )
        )}

        {isLast ? (
          <li className="page-item">
            <button type="button" className="disabled" onClick={() => onClick(nextPage)}>
              Next
            </button>
          </li>
        ) : (
          <li className="page-item next">
            <button type="button" onClick={() => onClick(nextPage)}>
              Next
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  className: PropTypes.string,
  currentPage: PropTypes.number,
  numberOfPages: PropTypes.number,
  onClick: PropTypes.func
};

export default Pagination;
