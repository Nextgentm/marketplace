import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function useBreadCrumbData(name, slug) {
  const [extraCrumb, setExtraCrumb] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const routeArr = router.asPath.split("/");
    const mainPath = routeArr[1];
    const crumbArr = [];
    let collectionName = "";
    if (mainPath === "collectible" && routeArr.length > 2) {
      collectionName = routeArr[2];

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
