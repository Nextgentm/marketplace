import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import { useRouter } from "next/router";

const SubMenu = ({ menu }) => {
  const router = useRouter();
  const isActiveLink = (path, queryPath) => {
    //TODO: need to check what condition is this and remove the proper statements    
    return path.split("/")[1] == router.pathname.split("/")[1];
  };
  return (
    <ul className="submenu">
      {menu.map((nav) => (
        <li key={nav.id} className={isActiveLink(nav.path, "") && "isActiveLink"}>
          <Anchor path={nav.path} className={nav.isLive ? "live-expo" : ""}>
            {nav.text}
            {nav?.icon && <i className={`feather ${nav.icon}`} />}
          </Anchor>
        </li>
      ))}
    </ul>
  )
};

SubMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.shape({}))
};

export default SubMenu;
