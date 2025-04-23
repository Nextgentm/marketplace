import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import clsx from "clsx";
import SubMenu from "./submenu";
import MegaMenu from "./megamenu";
import { useRouter } from "next/router";

const MainMenu = ({ menu, isAdmin }) => {
  const router = useRouter();
  const isActiveLink = (path, queryPath) => {
    return path.split("/")[2] != "metaverse.lootmogul.com" && path.split("/")[1] == router.pathname.split("/")[1];
  };
  return (
    <ul className="mainmenu">
      {menu.map((nav) => (
        <li
          key={nav.id}
          className={clsx(
            !!nav.submenu && "has-droupdown has-menu-child-item",
            !!nav.megamenu && "with-megamenu",
            isActiveLink(nav.path, "") && "isActiveLink"
          )}
        >
          <Anchor
            className="its_new"
            path={nav.path}
            target={nav.id == 1 ? "_self" : "_blank"}
          >
            {nav.text}
          </Anchor>
          {nav?.submenu && <SubMenu menu={nav.submenu} />}
          {nav?.megamenu && <MegaMenu menu={nav.megamenu} />}
        </li>
      ))}















    </ul>
  );
};

MainMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.shape({})),
  isAdmin: PropTypes.bool
};

export default MainMenu;
