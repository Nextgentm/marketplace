import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function useBreadCrumbData(name, slug, productName = "") {
  const [extraCrumb, setExtraCrumb] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const routeArr = router.asPath.split("/");
    const mainPath = routeArr[1];
    const crumbArr = [];
    let collectionName = "";
    if (mainPath === "collectible" && routeArr.length > 2) {
      if (productName) {
        collectionName = productName;
      } else {
        collectionName = routeArr[2];
      }

      let crumbData = {};
      crumbData["name"] = "Collection";
      crumbData["path"] = `/collection`;
      crumbArr.push(crumbData);

      crumbData = {};
      crumbData["name"] = name;
      crumbData["path"] = `/collection/${slug}`;
      crumbArr.push(crumbData);

      crumbData = {};
      crumbData["name"] = collectionName;
      crumbData["path"] = `/collectible/${collectionName}`;
      crumbArr.push(crumbData);
    }

    setExtraCrumb(crumbArr);
  }, []);

  return extraCrumb;
}

export default useBreadCrumbData;
