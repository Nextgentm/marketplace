import PropTypes from "prop-types";
import Anchor from "@ui/anchor";
import clsx from "clsx";
import SubMenu from "./submenu";
import MegaMenu from "./megamenu";

const MainMenu = ({ menu, isAdmin }) => (
  <ul className="mainmenu">
    {menu.map((nav) =>
      nav.id != 4 ? (
        <li
          key={nav.id}
          className={clsx(!!nav.submenu && "has-droupdown has-menu-child-item", !!nav.megamenu && "with-megamenu")}
        >
          <Anchor className="its_new" path={nav.path}>
            {nav.text}
          </Anchor>
          {nav?.submenu && <SubMenu menu={nav.submenu} />}
          {nav?.megamenu && <MegaMenu menu={nav.megamenu} />}
        </li>
      ) : isAdmin ? (
        <li
          key={nav.id}
          className={clsx(!!nav.submenu && "has-droupdown has-menu-child-item", !!nav.megamenu && "with-megamenu")}
        >
          <Anchor className="its_new" path={nav.path}>
            {nav.text}
          </Anchor>
          {nav?.submenu && <SubMenu menu={nav.submenu} />}
          {nav?.megamenu && <MegaMenu menu={nav.megamenu} />}
        </li>
      ) : (
        <div key={nav.id}></div>
      )
    )}
  </ul>
);

MainMenu.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.shape({}))
};

export default MainMenu;
